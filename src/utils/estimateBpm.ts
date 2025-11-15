import { Wave, WaveAnalyse } from "utauwav";

export const estimateBpm = (wave: Wave): number => {
  const wa = new WaveAnalyse();
  const frameSize = 2048; // FFT窓サイズ
  const hopSize = 512; // フレームのステップ（小さくすると時間分解能が上がる）
  const minBpm = 80;
  const maxBpm = 240;
  const minPeriodSec = 60 / maxBpm;
  const maxPeriodSec = 60 / minBpm;
  const hopTime = hopSize / wave.sampleRate;
  const minLag = Math.max(1, Math.floor(minPeriodSec / hopTime));
  const maxLag = Math.max(minLag + 1, Math.ceil(maxPeriodSec / hopTime));
  //**波形データの最大振幅 */
  const denom = Math.pow(2, wave.bitDepth - 1);
  //** ステレオの場合モノラルに変換し、正規化した波形データ */
  const samples = wave.data.map((f, i) => {
    const value = f + (wave.rData ? wave.rData[i] : 0) / 2;
    return value / denom;
  });
  const spectrogram = wa.Spectrogram(samples, frameSize, "hanning", hopSize);
  /** 各フレームの総パワー（線形値での合計） */
  const framesMagnitude = new Float32Array(spectrogram.length);
  for (let frameIndex = 0; frameIndex < spectrogram.length; frameIndex++) {
    const frame = spectrogram[frameIndex];
    // 対数パワーを線形パワーに戻してから合計
    let sumLinearPower = 0;
    for (let i = 0; i < frame.length; i++) {
      // 5 * log10(power) -> power = 10^(value/5)
      sumLinearPower += Math.pow(10, frame[i] / 5);
    }
    // 平均
    framesMagnitude[frameIndex] = sumLinearPower / frame.length;
  }

  /** スペクトルフラックス */
  const odf = new Float32Array(framesMagnitude.length);
  for (let index = 1; index < framesMagnitude.length; index++) {
    const diff = framesMagnitude[index] - framesMagnitude[index - 1];
    odf[index] = diff > 0 ? diff : 0;
  }

  /** スペクトルフラックスの移動平均 */
  const maOdf = new Float32Array(odf.length);
  for (let index = 4; index < odf.length; index++) {
    let sum = 0;
    for (let i = index - 4; i <= index; i++) {
      sum += odf[i];
    }
    maOdf[index] = sum / 5;
  }
  /** 自己相関によるテンポ推定 */
  const lag = findBestLagByAutocorr(maOdf, minLag, maxLag);

  /** 放物線補間による精密化 */
  const refinedLag = refineLagParabolic(maOdf, lag);

  /** BPM計算 */
  const bpm = refinedLag > 0 ? 60 / (refinedLag * hopTime) : 120;

  return Math.round(bpm);
};

/**
 * 指定ラグ範囲について自己相関を計算し、最大点を返す（粗い探索）
 */
const findBestLagByAutocorr = (
  odf: Float32Array,
  minLag: number,
  maxLag: number
): number => {
  const N = odf.length;

  /** 平均値計算 */
  let mean = 0;
  for (let i = 0; i < N; i++) {
    mean += odf[i];
  }
  mean /= N;

  /** 中心化（平均除去） */
  const centered = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    centered[i] = odf[i] - mean;
  }

  /** 全エネルギー（自己相関0） */
  let energy = 0;
  for (let i = 0; i < N; i++) {
    energy += centered[i] * centered[i];
  }

  if (energy <= 0.0000001) {
    return minLag;
  }

  let bestLag = minLag;
  let bestScore = -Infinity;

  /** 自己相関計算 */
  for (let lag = minLag; lag <= Math.min(maxLag, N - 1); lag++) {
    let correlationSum = 0;
    // 自己相関 r[lag] = sum_{i=0}^{N-lag-1} x[i]*x[i+lag]
    for (let i = 0; i < N - lag; i++) {
      correlationSum += centered[i] * centered[i + lag];
    }

    if (correlationSum > bestScore) {
      bestScore = correlationSum;
      bestLag = lag;
    }
  }

  return bestLag;
};

/**
 * 放物線補間でラグを精密化（y[l-1], y[l], y[l+1] を使う）
 */
const refineLagParabolic = (odf: Float32Array, lag: number): number => {
  const center = lag;

  /** 境界チェック */
  if (center < 1 || center >= odf.length - 1) {
    return center;
  }

  /** 前後の値を取得 */
  const y0 = odf[center];
  const ym1 = odf[center - 1];
  const yp1 = odf[center + 1];

  /** 分母計算（放物線の曲率） */
  const denominator = ym1 - 2 * y0 + yp1;

  if (Math.abs(denominator) < 0.0000001) {
    return center;
  }

  /** 放物線補間による精密化 */
  const delta = (0.5 * (ym1 - yp1)) / denominator;

  return center + delta;
};
