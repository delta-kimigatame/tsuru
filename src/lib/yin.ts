/**
 * frqファイルが存在しない場合に、44.1kHz波形からf0列・amp列・平均f0を推定する。
 *
 * 方針:
 * 1. 44.1kHz波形をアンチエイリアシング後に1/4間引きし、11.025kHz解析波形を作る。
 * 2. 第1パスでYIN/CMNDFにより粗いf0を推定する。
 * 3. 系列補正でオクターブ誤りや孤立外れ値を抑える。
 * 4. 第2パスで通常差分を粗周期近傍だけ再探索し、f0を精密化する。
 * 5. ampと平均f0は既存frq運用と互換の形で返す。
 */

import { renderingConfig } from "../config/rendering";

/** 44.1kHz入力を1/4に間引く比率 */
const DECIMATION_FACTOR = 4;
/** 解析サンプリングレート(Hz) */
const ANALYSIS_RATE = renderingConfig.frameRate / DECIMATION_FACTOR;
/** frq保存間隔(サンプル) */
const PER_SAMPLES = 256;
/** 解析波形上の保存間隔(サンプル) */
const ANALYSIS_HOP = PER_SAMPLES / DECIMATION_FACTOR;
/** 想定最小f0(Hz) */
const MIN_F0 = 55;
/** 想定最大f0(Hz) */
const MAX_F0 = 880;
/** 第1パスCMNDFの閾値 */
const CMNDF_THRESHOLD = 0.1;
/** 第2パス比較長の下限(サンプル) */
const SECOND_PASS_MIN_WINDOW = 48;
/** 第2パス比較長の上限(サンプル) */
const SECOND_PASS_MAX_WINDOW = 800;
/** フィルタ長。奇数にして線形位相の中心を作る */
const DOWNSAMPLE_FILTER_TAPS = 63;

/** YIN解析の戻り値 */
export interface YinFrqResult {
  /** 周波数列(Hz)。無声は0 */
  frq: Float64Array;
  /** 音量列。1を最大とする線形スケール */
  amp: Float64Array;
  /** frq列に対応する時間軸(秒) */
  timeAxis: Float64Array;
  /** 0Hzを除外した平均f0(Hz)。有声がない場合は0 */
  frqAverage: number;
}

/** 第1パスで保持するフレームごとの中間情報 */
interface FirstPassFrame {
  /** 第1パスf0(Hz) */
  f0: number;
  /** 信頼度(0..1)。1ほど信頼が高い */
  confidence: number;
  /** 最小CMNDF値 */
  cmndfMin: number;
}

/**
 * 44.1kHz波形からfrq互換データを推定する。
 * @param wavData 1を最大とする入力波形
 */
export const analyzeFrqByYin = (wavData: Float64Array): YinFrqResult => {
  /** 入力が空のときは空列を返す */
  if (wavData.length === 0) {
    return {
      frq: new Float64Array(0),
      amp: new Float64Array(0),
      timeAxis: new Float64Array(0),
      frqAverage: 0,
    };
  }

  /** 44.1kHz入力から11.025kHz解析波形を作る */
  const analysisWave = downsampleTo11025(wavData);
  /** frq保存フレーム数。既存運用と同じ256サンプル格子を維持する */
  const frameCount = Math.ceil(wavData.length / PER_SAMPLES) + 1;

  /** 第1パス粗推定結果 */
  const firstPass = runFirstPass(analysisWave, frameCount);
  /** 第1パス系列補正結果 */
  const corrected = correctF0Series(
    firstPass.map((v) => v.f0),
    firstPass,
  );
  /** 第2パス精密化結果 */
  const refined = runSecondPass(analysisWave, corrected);
  /** amp列を既存frqと同じ256サンプル区間で算出する */
  const amp = calcAmpSeries(wavData, frameCount);

  /** 時間軸と平均f0を作る */
  const timeAxis = new Float64Array(frameCount);
  let f0Sum = 0;
  let voicedCount = 0;
  for (let i = 0; i < frameCount; i++) {
    timeAxis[i] = (i * PER_SAMPLES) / renderingConfig.frameRate;
    const f0 = refined[i];
    if (f0 > 0 && Number.isFinite(f0)) {
      f0Sum += f0;
      voicedCount++;
    }
  }

  return {
    frq: Float64Array.from(refined),
    amp: Float64Array.from(amp),
    timeAxis,
    frqAverage: voicedCount > 0 ? f0Sum / voicedCount : 0,
  };
};

/**
 * 第1パス: YIN/CMNDFで粗いf0列を求める。
 * @param wave 11.025kHz解析波形
 * @param frameCount 256サンプル格子に対応するフレーム数
 */
const runFirstPass = (
  wave: Float64Array,
  frameCount: number,
): Array<FirstPassFrame> => {
  /** 探索する周期範囲(サンプル) */
  const tauMin = Math.floor(ANALYSIS_RATE / MAX_F0);
  const tauMax = Math.ceil(ANALYSIS_RATE / MIN_F0) + 1;
  /** 比較長は55Hzで約4周期を基準に固定する */
  const windowSize = Math.max(16, Math.round((ANALYSIS_RATE / MIN_F0) * 4));

  const results: Array<FirstPassFrame> = new Array(frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    /** 44.1kHzの256サンプル格子を11.025kHzの64サンプルへ対応づける */
    const center = frame * ANALYSIS_HOP;
    const start = Math.round(center);
    const diff = calcDiffRange(wave, start, tauMax, windowSize);
    const cmndf = calcCmndf(diff);

    let bestTau = pickTauByCmndf(cmndf, tauMin, tauMax, CMNDF_THRESHOLD);
    if (!Number.isFinite(bestTau) || bestTau <= 0) {
      bestTau = tauMax;
    }

    const refinedTau = refineTauParabolic(cmndf, bestTau);
    const cmndfMin = cmndf[bestTau] ?? 1;
    const rawF0 = refinedTau > 0 ? ANALYSIS_RATE / refinedTau : 0;
    const inRange = rawF0 >= MIN_F0 && rawF0 <= MAX_F0;
    const confidence = Math.max(0, Math.min(1, 1 - cmndfMin));

    results[frame] = {
      f0: inRange ? rawF0 : 0,
      confidence,
      cmndfMin,
    };
  }
  return results;
};

/**
 * 第2パス: 補正済み粗f0近傍のみ通常差分で局所探索して精密化する。
 * @param wave 11.025kHz解析波形
 * @param corrected 補正済み粗f0列。無声は0
 */
const runSecondPass = (
  wave: Float64Array,
  corrected: Array<number>,
): Array<number> => {
  const tauMin = Math.floor(ANALYSIS_RATE / MAX_F0);
  const tauMax = Math.ceil(ANALYSIS_RATE / MIN_F0) + 1;
  const refined = corrected.slice();

  for (let frame = 0; frame < corrected.length; frame++) {
    const coarseF0 = corrected[frame];
    if (!(coarseF0 > 0) || !Number.isFinite(coarseF0)) {
      refined[frame] = 0;
      continue;
    }

    const tauR = ANALYSIS_RATE / coarseF0;
    const tauCenter = Math.round(tauR);
    const searchRadius = clamp(Math.round(tauR * 0.2), 2, 24);
    const startTau = clamp(tauCenter - searchRadius, tauMin, tauMax);
    const endTau = clamp(tauCenter + searchRadius, tauMin, tauMax);

    /** 第2パス窓長は4周期基準にし、過短・過長をクランプする */
    const windowSize = clamp(
      Math.round(4 * tauR),
      SECOND_PASS_MIN_WINDOW,
      SECOND_PASS_MAX_WINDOW,
    );

    /** 比較全体中心を保存時刻近傍に置く。局所探索中は開始位置を固定する */
    const center = frame * ANALYSIS_HOP;
    const start = Math.round(center - (windowSize - 1 + tauR) / 2);
    const diff = calcDiffRange(wave, start, endTau, windowSize);

    let bestTau = startTau;
    let bestValue = Number.POSITIVE_INFINITY;
    let sum = 0;
    let count = 0;
    for (let tau = startTau; tau <= endTau; tau++) {
      const value = diff[tau];
      if (!Number.isFinite(value)) {
        continue;
      }
      if (value < bestValue) {
        bestValue = value;
        bestTau = tau;
      }
      sum += value;
      count++;
    }

    /** 最小値が平坦すぎる場合は第1パス補正値を維持する */
    const mean = count > 0 ? sum / count : Number.POSITIVE_INFINITY;
    if (
      !Number.isFinite(bestValue) ||
      !Number.isFinite(mean) ||
      bestValue / mean > 0.985
    ) {
      refined[frame] = coarseF0;
      continue;
    }

    const refinedTau = refineTauParabolic(diff, bestTau);
    const f0 = refinedTau > 0 ? ANALYSIS_RATE / refinedTau : coarseF0;
    refined[frame] =
      f0 >= MIN_F0 && f0 <= MAX_F0 && Number.isFinite(f0) ? f0 : coarseF0;
  }

  return refined;
};

/**
 * 第1パス系列を補正し、オクターブ誤りと孤立外れ値を抑える。
 * @param f0s 第1パスf0列
 * @param frames 第1パス補助情報
 */
const correctF0Series = (
  f0s: Array<number>,
  frames: Array<FirstPassFrame>,
): Array<number> => {
  const corrected = f0s.slice();

  for (let i = 0; i < corrected.length; i++) {
    const f0 = corrected[i];
    const info = frames[i];
    const unvoicedByConfidence = info.confidence < 0.08 || info.cmndfMin > 0.45;
    if (unvoicedByConfidence || !(f0 > 0) || !Number.isFinite(f0)) {
      corrected[i] = 0;
      continue;
    }

    const prev = nearestVoiced(corrected, i, -1);
    const next = nearestVoiced(corrected, i, 1);

    /** 前後の有声がある場合はオクターブ誤りを補正する */
    if (prev > 0 && next > 0) {
      const medianLike = Math.sqrt(prev * next);
      const ratio = f0 / medianLike;

      if (ratio > 1.8 && ratio < 2.2) {
        corrected[i] = f0 / 2;
      } else if (ratio > 0.45 && ratio < 0.55) {
        corrected[i] = f0 * 2;
      }

      const updated = corrected[i];
      const mismatch = Math.abs(Math.log(updated / medianLike));
      if (mismatch > 0.35 && info.confidence < 0.45) {
        corrected[i] = medianLike;
      }
    }
  }

  return corrected.map((f0) => {
    if (!Number.isFinite(f0) || f0 < MIN_F0 || f0 > MAX_F0) {
      return 0;
    }
    return f0;
  });
};

/**
 * 差分関数 d(τ) を指定範囲で計算する。
 * d(τ) = Σ (x[j] - x[j+τ])^2
 * @param wave 解析波形
 * @param start 比較区間Aの開始位置
 * @param tauMax 計算する最大τ
 * @param windowSize 比較長W
 */
const calcDiffRange = (
  wave: Float64Array,
  start: number,
  tauMax: number,
  windowSize: number,
): Float64Array => {
  const diff = new Float64Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      const a = readWaveSafe(wave, start + j);
      const b = readWaveSafe(wave, start + j + tau);
      const d = a - b;
      sum += d * d;
    }
    diff[tau] = sum;
  }
  return diff;
};

/**
 * 差分関数からCMNDFを計算する。
 * @param diff 差分関数配列
 */
const calcCmndf = (diff: Float64Array): Float64Array => {
  const cmndf = new Float64Array(diff.length);
  cmndf[0] = 1;
  let cumulative = 0;
  for (let tau = 1; tau < diff.length; tau++) {
    cumulative += diff[tau];
    cmndf[tau] = cumulative > 0 ? (diff[tau] * tau) / cumulative : 1;
  }
  return cmndf;
};

/**
 * CMNDF閾値に基づいて候補τを選ぶ。
 * 閾値未満の最初の谷を優先し、なければ最小値を使う。
 */
const pickTauByCmndf = (
  cmndf: Float64Array,
  tauMin: number,
  tauMax: number,
  threshold: number,
): number => {
  let globalBestTau = tauMin;
  let globalBestValue = Number.POSITIVE_INFINITY;

  for (let tau = tauMin; tau <= tauMax; tau++) {
    const value = cmndf[tau];
    if (!Number.isFinite(value)) {
      continue;
    }
    if (value < globalBestValue) {
      globalBestValue = value;
      globalBestTau = tau;
    }

    if (value < threshold) {
      const prev = cmndf[tau - 1] ?? Number.POSITIVE_INFINITY;
      const next = cmndf[tau + 1] ?? Number.POSITIVE_INFINITY;
      if (value <= prev && value <= next) {
        return tau;
      }
    }
  }

  return globalBestTau;
};

/**
 * 離散点の谷を3点放物線補間して小数τを返す。
 * 境界・分母極小時は元の整数τを返す。
 */
const refineTauParabolic = (values: Float64Array, tau: number): number => {
  if (tau <= 1 || tau >= values.length - 1) {
    return tau;
  }
  const v1 = values[tau - 1];
  const v2 = values[tau];
  const v3 = values[tau + 1];
  if (!Number.isFinite(v1) || !Number.isFinite(v2) || !Number.isFinite(v3)) {
    return tau;
  }

  const denom = 2 * (v1 - 2 * v2 + v3);
  if (!Number.isFinite(denom) || Math.abs(denom) < 1e-12) {
    return tau;
  }

  const delta = (v1 - v3) / denom;
  if (!Number.isFinite(delta) || Math.abs(delta) > 1) {
    return tau;
  }

  return tau + delta;
};

/**
 * 44.1kHz波形をアンチエイリアシング後に1/4間引きし、11.025kHzへ変換する。
 * 線形位相FIRを使い、中心タップ基準でサンプリングする。
 */
const downsampleTo11025 = (wavData: Float64Array): Float64Array => {
  const kernel = makeLowPassKernel(DOWNSAMPLE_FILTER_TAPS, 0.23);
  const half = Math.floor(kernel.length / 2);
  const outputLength = Math.ceil(wavData.length / DECIMATION_FACTOR);
  const output = new Float64Array(outputLength);

  for (let n = 0; n < outputLength; n++) {
    const center = n * DECIMATION_FACTOR;
    let sum = 0;
    for (let k = 0; k < kernel.length; k++) {
      const src = center + k - half;
      sum += readWaveSafe(wavData, src) * kernel[k];
    }
    output[n] = sum;
  }

  return output;
};

/**
 * FIRローパスカーネルを窓付きsincで作る。
 * @param taps タップ数(奇数)
 * @param cutoffNyquist Nyquist=1基準の遮断比
 */
const makeLowPassKernel = (
  taps: number,
  cutoffNyquist: number,
): Float64Array => {
  const safeTaps = taps % 2 === 0 ? taps + 1 : taps;
  const kernel = new Float64Array(safeTaps);
  const half = Math.floor(safeTaps / 2);
  const cutoff = Math.max(1e-4, Math.min(0.499, cutoffNyquist));

  let sum = 0;
  for (let i = 0; i < safeTaps; i++) {
    const n = i - half;
    const sinc =
      n === 0 ? 2 * cutoff : Math.sin(2 * Math.PI * cutoff * n) / (Math.PI * n);
    const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (safeTaps - 1));
    const value = sinc * window;
    kernel[i] = value;
    sum += value;
  }

  if (sum !== 0) {
    for (let i = 0; i < safeTaps; i++) {
      kernel[i] /= sum;
    }
  }

  return kernel;
};

/**
 * 指定区間(256サンプル)の絶対値平均をampとして返す。
 * @param wavData 44.1kHz入力波形
 * @param frameCount 算出フレーム数
 */
const calcAmpSeries = (
  wavData: Float64Array,
  frameCount: number,
): Array<number> => {
  const amp = new Array<number>(frameCount).fill(0);
  for (let i = 0; i < frameCount; i++) {
    const start = i * PER_SAMPLES;
    if (start >= wavData.length) {
      amp[i] = 0;
      continue;
    }
    const end = Math.min(start + PER_SAMPLES, wavData.length);
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += Math.abs(wavData[j]);
    }
    amp[i] = sum / Math.max(1, end - start);
  }
  return amp;
};

/**
 * 近傍の有声f0を探索する。見つからない場合は0を返す。
 * @param values f0列
 * @param index 基準位置
 * @param direction -1で前方、1で後方
 */
const nearestVoiced = (
  values: Array<number>,
  index: number,
  direction: -1 | 1,
): number => {
  for (let i = index + direction; i >= 0 && i < values.length; i += direction) {
    if (values[i] > 0 && Number.isFinite(values[i])) {
      return values[i];
    }
  }
  return 0;
};

/**
 * 配列境界外は0として読む。
 * @param wave 波形配列
 * @param index 読み出し位置
 */
const readWaveSafe = (wave: Float64Array, index: number): number => {
  if (index < 0 || index >= wave.length) {
    return 0;
  }
  const value = wave[index];
  return Number.isFinite(value) ? value : 0;
};

/**
 * 数値を指定範囲へ収める。
 * @param value 入力値
 * @param min 最小値
 * @param max 最大値
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};
