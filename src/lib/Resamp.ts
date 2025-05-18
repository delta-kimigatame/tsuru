import { World } from "tsworld";
import { renderingConfig } from "../config/rendering";
import type { ResampRequest, ResampWorkerRequest } from "../types/request";
import { range } from "../utils/array";
import { interp1d, makeTimeAxis } from "../utils/interp";
import { toneToNoteNum } from "../utils/Notenum";
import { FlagKeys, parseFlags } from "../utils/parseFlags";
import { decodePitch, getFrqFromNotenum } from "../utils/pitch";
import type { BaseVoiceBank } from "./VoiceBanks/BaseVoiceBank";
import { Frq } from "./VoiceBanks/UtauFrq";

/**
 * 原音をNoteとotoに従って伸縮・音高変更したwavとして返す
 */
export class Resamp {
  /**
   *合成するUTAU音源
   */
  vb: BaseVoiceBank;
  /**
   * 音声分析合成システムworld
   */
  world: World;

  /**
   * フラグ定義
   */
  flagKeys: FlagKeys[] = [
    { name: "G", type: "bool", default: undefined },
    { name: "g", type: "number", min: -100, max: 100, default: 0 },
    { name: "B", type: "number", min: 0, max: 100, default: 50 },
    { name: "t", type: "number", min: -100, max: 100, default: 0 },
    { name: "P", type: "number", min: 0, max: 100, default: 86 },
    { name: "e", type: "bool", default: undefined },
  ];

  /**
   * 原音をNoteとotoに従って伸縮・音高変更したwavとして返す
   * @param vb 合成するUTAU音源
   */
  constructor(vb: BaseVoiceBank = null) {
    this.vb = vb;
  }

  async initialize(): Promise<void> {
    return new Promise(async (resolve) => {
      this.world = new World();
      await this.world.Initialize();
      resolve();
    });
  }

  async resamp(request: ResampRequest): Promise<Array<number>> {
    return new Promise(async (resolve) => {
      console.log(`スタート:${Date.now()}`);
      const nData = await this.getWaveData(
        request.inputWav,
        request.offsetMs,
        request.cutoffMs
      );
      console.log(`wav読込:${Date.now()}`); // プロファイリングの結果：wav読込は17ms
      const frqData = await this.getFrqData(
        request.inputWav,
        request.offsetMs,
        (nData.length / renderingConfig.frameRate) * 1000
      );
      console.log(`frq読込:${Date.now()}`); // プロファイリングの結果：frq読込は5ms

      const sp = this.world.CheapTrick(
        Float64Array.from(nData),
        Float64Array.from(frqData.frq),
        Float64Array.from(frqData.timeAxis),
        renderingConfig.frameRate
      );
      console.log(`sp解析:${Date.now()}`); // プロファイリングの結果：sp解析は52ms
      const ap = this.world.D4C(
        Float64Array.from(nData),
        Float64Array.from(frqData.frq),
        Float64Array.from(frqData.timeAxis),
        sp.fft_size,
        renderingConfig.frameRate,
        0.85
      );

      console.log(`ap解析:${Date.now()}`); // プロファイリングの結果：ap解析は451ms
      const stretchParams = this.stretch(
        frqData.frq,
        sp.spectral,
        ap,
        frqData.amp,
        request.targetMs,
        request.fixedMs,
        request.velocity
      );
      console.log(`パラメータ伸縮:${Date.now()}`); // プロファイリングの結果：パラメータ伸縮は0ms
      const shiftF0 = this.pitchShift(
        stretchParams.f0,
        frqData.frqAverage,
        request.targetTone,
        request.modulation
      );
      console.log(`音高適用:${Date.now()}`); // プロファイリングの結果：音高適用は0ms
      const applyPitchF0 = this.applyPitch(
        shiftF0,
        stretchParams.timeAxis,
        request.pitches,
        request.tempo
      );
      console.log(`ピッチ適用:${Date.now()}`); // プロファイリングの結果：ピッチ適用は0ms
      const synthedData = this.world.Synthesis(
        Float64Array.from(applyPitchF0),
        stretchParams.sp,
        stretchParams.ap,
        sp.fft_size,
        renderingConfig.frameRate,
        renderingConfig.worldPeriod * 1000
      );
      console.log(`合成:${Date.now()}`); // プロファイリングの結果：合成は254ms
      const outputData = this.adjustVolume(
        Array.from(synthedData),
        request.intensity,
        stretchParams.amp
      );
      console.log(`音量適用:${Date.now()}`); // プロファイリングの結果：音量適用は3ms
      resolve(outputData);
    });
  }

  resampWorker(request: ResampWorkerRequest): Float64Array {
    const timeAxis = Float64Array.from(
      makeTimeAxis(
        renderingConfig.worldPeriod,
        0,
        request.inputWavData.length / renderingConfig.frameRate
      )
    );
    const flags = parseFlags(request.flags, this.flagKeys);
    if (!request.withFrq || flags["G"] !== undefined) {
      const f0 = this.Harvest(request.inputWavData, timeAxis);
      request.frqData = f0.frq;
      request.ampData = f0.amp;
      request.frqAverage = f0.frqAverage;
    }
    const sp = this.world.CheapTrick(
      request.inputWavData,
      request.frqData,
      timeAxis,
      renderingConfig.frameRate
    );
    const applyGenderSp = this.applyGender(sp.spectral, flags["g"]);
    const ap =
      flags["B"] === 0
        ? sp.spectral.map((arr) => new Float64Array(arr.length))
        : flags["B"] === 100
        ? sp.spectral.map((arr) => new Float64Array(arr.length).fill(1))
        : this.world.D4C(
            request.inputWavData,
            request.frqData,
            timeAxis,
            sp.fft_size,
            renderingConfig.frameRate,
            0
          );
    const breasedAp = this.applyBreath(ap, flags["B"]);
    const stretchParams = this.stretch(
      Array.from(request.frqData),
      applyGenderSp,
      breasedAp,
      Array.from(request.ampData),
      request.targetMs,
      request.fixedMs,
      request.velocity,
      flags["e"] !== undefined
    );
    const shiftF0 = this.pitchShift(
      stretchParams.f0,
      request.frqAverage,
      request.targetTone,
      request.modulation,
      flags["t"]
    );
    const applyPitchF0 = this.applyPitch(
      shiftF0,
      stretchParams.timeAxis,
      request.pitches,
      request.tempo
    );
    const synthedData = this.world.Synthesis(
      Float64Array.from(applyPitchF0),
      stretchParams.sp,
      stretchParams.ap,
      sp.fft_size,
      renderingConfig.frameRate,
      renderingConfig.worldPeriod * 1000
    );
    const outputData = this.adjustVolume(
      Array.from(synthedData),
      request.intensity,
      stretchParams.amp,
      flags["P"]
    );
    return Float64Array.from(outputData);
  }

  /**
   * wavデータを読み込みLogicalNormalaizeして返す
   * @param inputWav 音源ルートからwavファイルへの相対パス
   * @param offsetMs 原音設定の左ブランク
   * @param cutoffMs 原音設定の右ブランク
   * @returns
   */
  async getWaveData(
    inputWav: string,
    offsetMs: number,
    cutoffMs: number
  ): Promise<Array<number>> {
    return new Promise(async (resolve) => {
      const wavData = await this.vb.getWave(inputWav);
      const offsetFrame = Math.floor(
        (renderingConfig.frameRate * offsetMs) / 1000
      );
      const cutoff =
        cutoffMs < 0
          ? offsetMs - cutoffMs
          : (wavData.data.length / wavData.sampleRate) * 1000 - cutoffMs;
      const cutoffFrame = Math.floor(
        (renderingConfig.frameRate * cutoff) / 1000
      );
      resolve(wavData.LogicalNormalize(1).slice(offsetFrame, cutoffFrame));
    });
  }

  /**
   * frqが存在しない際にf0列を生成するための処理
   * @params wavData 今回の合成に使用する範囲のwavの波形データ。1が最大のArray
   * @params timeAxis worldデータ共通時間軸
   */
  Harvest(
    wavData: Float64Array,
    timeAxis: Float64Array
  ): {
    frq: Float64Array;
    amp: Float64Array;
    timeAxis: Float64Array;
    frqAverage: number;
  } {
    const wavMs = wavData.length / renderingConfig.frameRate;
    const f0 = this.world.Harvest(
      wavData,
      renderingConfig.frameRate,
      (256 / renderingConfig.frameRate) * 1000
    );
    const frq = new Frq({
      frq: f0.f0,
      data: wavData,
      perSamples: 256,
    });
    const frqTimeAxis = makeTimeAxis(
      (1 / renderingConfig.frqFrameRate) * frq.perSamples,
      0,
      wavMs
    );

    frq.calcAverageFrq();
    return {
      frq: Float64Array.from(
        interp1d(Array.from(frq.frq), frqTimeAxis, Array.from(timeAxis))
      ),
      amp: Float64Array.from(
        interp1d(Array.from(frq.amp), frqTimeAxis, Array.from(timeAxis))
      ),
      timeAxis: f0.time_axis,
      frqAverage: frq.frqAverage,
    };
  }

  /**
   * frqデータを読み込み、必要な範囲をworld時間軸に変換して返す
   * @param inputWav 音源ルートからwavファイルへの相対パス
   * @param offsetMs 原音設定の左ブランク
   * @param wavMs 読み込んだwavの長さ
   * @returns
   */
  async getFrqData(
    inputWav: string,
    offsetMs: number,
    wavMs: number
  ): Promise<{
    frq: Array<number>;
    amp: Array<number>;
    timeAxis: Array<number>;
    frqAverage: number;
  }> {
    const timeAxis = makeTimeAxis(renderingConfig.worldPeriod, 0, wavMs / 1000);
    return new Promise(async (resolve) => {
      const frqData = await this.vb.getFrq(inputWav);
      const frqTimeAxis = makeTimeAxis(
        (1 / renderingConfig.frqFrameRate) * frqData.perSamples,
        0,
        wavMs / 1000
      );
      const offsetFrame = Math.floor(
        (renderingConfig.frameRate * offsetMs) / frqData.perSamples / 1000
      );
      const cutoffFrame =
        Math.ceil(
          (renderingConfig.frameRate * wavMs) / frqData.perSamples / 1000
        ) + 1;
      const frq = interp1d(
        Array.from(frqData.frq).slice(offsetFrame, offsetFrame + cutoffFrame),
        frqTimeAxis,
        timeAxis
      );
      const amp = interp1d(
        Array.from(frqData.amp).slice(offsetFrame, offsetFrame + cutoffFrame),
        frqTimeAxis,
        timeAxis
      );
      resolve({
        frq: frq,
        amp: amp,
        timeAxis: timeAxis,
        frqAverage: frqData.frqAverage,
      });
    });
  }

  /**
   * targetMs,fixedMs,velocityに基づいて、f0,sp,apを伸縮し、timeAxisを付して返す
   * @param f0 基準ピッチ
   * @param sp スペクトル
   * @param ap 非周期性指標
   * @param targetMs 出力するwavの長さ
   * @param fixedMs 入力における前方固定範囲
   * @param velocity 子音速度
   * @param eFlag 伸縮方法に関するフラグ
   * @returns
   */
  stretch(
    f0: Array<number>,
    sp: Array<Float64Array>,
    ap: Array<Float64Array>,
    amp: Array<number>,
    targetMs: number,
    fixedMs: number,
    velocity: number,
    eFlag: boolean = false
  ): {
    f0: Array<number>;
    sp: Array<Float64Array>;
    ap: Array<Float64Array>;
    amp: Array<number>;
    timeAxis: Array<number>;
  } {
    const targetFrames = Math.ceil(
      targetMs / renderingConfig.worldPeriod / 1000
    );
    const inputFixedFrames = Math.floor(
      fixedMs / renderingConfig.worldPeriod / 1000
    );
    const velocityRate = 2 ** ((100 - velocity) / 100);
    const fixedFrames = Math.floor(inputFixedFrames * velocityRate);
    const velocityPart =
      velocity !== 100
        ? this.worldStretch(
            fixedFrames,
            f0.slice(0, inputFixedFrames),
            sp.slice(0, inputFixedFrames),
            ap.slice(0, inputFixedFrames),
            amp.slice(0, inputFixedFrames),
            false
          )
        : {
            f0: f0.slice(0, inputFixedFrames),
            sp: sp.slice(0, inputFixedFrames),
            ap: ap.slice(0, inputFixedFrames),
            amp: amp.slice(0, inputFixedFrames),
          };
    const stretchPart = this.worldStretch(
      Math.max(targetFrames - fixedFrames, 0),
      f0.slice(inputFixedFrames),
      sp.slice(inputFixedFrames),
      ap.slice(inputFixedFrames),
      amp.slice(inputFixedFrames),
      eFlag
    );
    const timeAxis = makeTimeAxis(
      renderingConfig.worldPeriod,
      0,
      renderingConfig.worldPeriod * targetFrames
    );
    return {
      f0: velocityPart.f0.concat(stretchPart.f0),
      sp: velocityPart.sp.concat(stretchPart.sp),
      ap: velocityPart.ap.concat(stretchPart.ap),
      amp: velocityPart.amp.concat(stretchPart.amp),
      timeAxis: timeAxis,
    };
  }

  /**
   * worldの各パラメータを目標フレーム数まで伸縮する
   * @param targetFrames 目標フレーム数
   * @param f0 基準ピッチ
   * @param sp スペクトラム
   * @param ap 非周期性指標
   * @param eFlag 伸縮方法に関するフラグ
   * @returns
   */
  worldStretch(
    targetFrames: number,
    f0: Array<number>,
    sp: Array<Float64Array>,
    ap: Array<Float64Array>,
    amp: Array<number>,
    eFlag: boolean = false
  ): {
    f0: Array<number>;
    sp: Array<Float64Array>;
    ap: Array<Float64Array>;
    amp: Array<number>;
  } {
    const newF0 = new Array<number>(targetFrames);
    const newSp = new Array<Float64Array>(targetFrames);
    const newAp = new Array<Float64Array>(targetFrames);
    const newAmp = new Array<number>(targetFrames);
    if (targetFrames > f0.length) {
      /**伸ばす処理 */
      if (eFlag) {
        const indexes = [];
        //末尾フレームが入っているとフェードアウトしてしまう場合がある。
        const length = f0.length - 2;
        const multinum = Math.ceil(targetFrames / length);
        f0.forEach((f, i) => {
          if (i >= length) return;
          for (let j = 0; j < multinum; j++) {
            const index =
              j % 2 === 0 ? i + j * length : (j + 1) * length - i - 1;
            if (index < targetFrames) {
              newF0[index] = f;
              newSp[index] = sp[i];
              newAp[index] = ap[i];
              newAmp[index] = amp[i];
              indexes.push(index);
            }
          }
        });
      } else {
        const multinum = Math.ceil(targetFrames / f0.length);
        const border = f0.length - (multinum * f0.length - targetFrames);
        f0.forEach((f, i) => {
          const start =
            i <= border
              ? i * multinum
              : border * multinum + (i - border) * (multinum - 1);
          const end =
            i <= border
              ? (i + 1) * multinum
              : border * multinum + (i - border + 1) * (multinum - 1);
          for (let j = start; j < end; j++) {
            newF0[j] = f;
            newSp[j] = sp[i];
            newAp[j] = ap[i];
            newAmp[j] = amp[i];
          }
        });
      }
    } else {
      /** 縮める処理 */
      const leaveReat = 1 - targetFrames / f0.length;
      let threshold = 0;
      let leaveCount = 0;
      f0.forEach((f, i) => {
        threshold += leaveReat;
        if (threshold >= 1) {
          threshold--;
          leaveCount++;
        } else if (i - leaveCount < targetFrames) {
          newF0[i - leaveCount] = f;
          newSp[i - leaveCount] = sp[i];
          newAp[i - leaveCount] = ap[i];
          newAmp[i - leaveCount] = amp[i];
        }
      });
    }
    return {
      f0: newF0.slice(0, targetFrames),
      sp: newSp.slice(0, targetFrames),
      ap: newAp.slice(0, targetFrames),
      amp: newAmp.slice(0, targetFrames),
    };
  }

  /**
   * f0,modulation,targetTone,frqAverageに基づいてf0列を返す
   * @param f0 入力データのf0列
   * @param frqAverage 入力データの平均f0
   * @param targetTone 目標音高
   * @param modulation 入力データの反映率
   * @returns f0
   */
  pitchShift(
    f0: Array<number>,
    frqAverage: number,
    targetTone: string,
    modulation: number,
    tFlag: number = 0
  ): Array<number> {
    const targetFrq = getFrqFromNotenum(
      toneToNoteNum(targetTone) + tFlag / 100
    );
    if (modulation === 0) {
      return [...Array(f0.length)].fill(targetFrq);
    } else {
      return f0.map((v) => (v / frqAverage) ** (modulation / 100) * targetFrq);
    }
  }

  /**
   * ピッチ列を適用する
   * @param f0 ピッチ適用前のf0列
   * @param timeAxis f0列の時間軸
   * @param pitch base64エンコードしてランレングス圧縮されたピッチ列
   * @param _tempo !で始まる、!を除去すればfloatに変換できるBPM文字列
   * @returns ピッチ適用後のf0
   */
  applyPitch(
    f0: Array<number>,
    timeAxis: Array<number>,
    pitch: string,
    _tempo: string
  ): Array<number> {
    const decodedPitch = decodePitch(pitch);
    const tempo: number = parseFloat(_tempo.replace("!", ""));
    const utauPeriod = (60 / tempo / 480) * 5 * 1000;
    const utauTimeAxis = makeTimeAxis(
      utauPeriod / 1000,
      0,
      (utauPeriod * decodedPitch.length) / 1000
    );
    // utauTimeAxis の長さに足りない場合、末尾に0を補完
    if (decodedPitch.length < utauTimeAxis.length) {
      const padding = new Array(utauTimeAxis.length - decodedPitch.length).fill(
        0
      );
      decodedPitch.push(...padding);
    }
    const interpPitch = interp1d(decodedPitch, utauTimeAxis, timeAxis);
    return f0.map((f, i) => f * 2 ** (interpPitch[i] / 1200));
  }

  /**
   * worldが出力したwavにintensityを適用する
   * @param data worldが出力したwavデータ
   * @param intensity 音量
   * @param PFlag pフラグ値。0～100でデフォルトは86
   * @returns 音量を適用したwavデータ
   */
  adjustVolume(
    data: Array<number>,
    intensity: number,
    amp: Array<number>,
    PFlag: number = 86
  ): Array<number> {
    const maxData = data.reduce(
      (m, current) =>
        Math.max(m, Number.isNaN(current) ? 0 : Math.abs(current)),
      -1
    );
    const maxAmp = amp.reduce(
      (m, current) =>
        Math.max(m, Number.isNaN(current) ? 0 : Math.abs(current)),
      -1
    );
    const ampTimeAxis = makeTimeAxis(
      renderingConfig.worldPeriod,
      0,
      amp.length * renderingConfig.worldPeriod
    );
    const dataTimeAxis = makeTimeAxis(
      1 / renderingConfig.frameRate,
      0,
      data.length / renderingConfig.frameRate
    );
    const interpAmp = interp1d(amp, ampTimeAxis, dataTimeAxis);
    const rate = PFlag / 100;
    return data.map((v, i) => {
      const value = Number.isNaN(v) ? 0 : v;
      const inputAmp = (value / maxAmp) * interpAmp[i] * (1 - rate);
      const outputAmp = (value / maxData) * 0.5 * rate;
      return ((inputAmp + outputAmp) * intensity) / 100;
    });
  }

  applyGender(sp: Array<Float64Array>, gFlag: number): Array<Float64Array> {
    if (gFlag === 0) {
      return sp;
    }
    const ratio = 1 - gFlag / 100;
    const fft_size = sp[0].length;
    const half_fft = Math.floor(fft_size / 2);
    const freq_axis1 = range(0, half_fft).map(
      (i) => ((ratio * i) / fft_size) * 44100
    );
    const freq_axis2 = range(0, half_fft).map((i) => (i / fft_size) * 44100);
    const new_sp: Array<Float64Array> = sp.map((arr) => new Float64Array(arr));
    sp.forEach((s, i) => {
      const spectrum1 = s.map((v) => Math.log(v));
      const spectrum2 = this.gFlagInterp(
        freq_axis1,
        spectrum1,
        half_fft + 1,
        freq_axis2,
        half_fft + 1,
        new Array(half_fft + 1).fill(0)
      );
      for (let j = 0; j < half_fft; j++) {
        new_sp[i][j] = Math.exp(spectrum2[j]);
      }
      if (ratio >= 1.0) {
        return;
      }
      let j = Math.floor((fft_size / 2) * ratio);
      while (j <= fft_size / 2) {
        new_sp[i][j] = sp[i][Math.floor((fft_size / 2) * ratio) - 1];
        j = j + 1;
      }
    });
    return new_sp;
  }

  gFlagInterp(x, y, x_length, xi, xi_length, yi) {
    const h = new Array(x_length).fill(0);
    const k = new Int32Array(xi_length).fill(0);
    for (let i = 0; i < x_length - 1; i++) {
      h[i] = x[i + 1] - x[i];
    }
    //kの値が変更される。
    this.gFlagHitsc(x, x_length, xi, xi_length, k);
    for (let i = 0; i < xi_length; i++) {
      const s = (xi[i] - x[k[i] - 1]) / h[k[i] - 1];
      yi[i] = y[k[i] - 1] + s * (y[k[i]] - y[k[i] - 1]);
    }
    return yi;
  }

  gFlagHitsc(x, x_length, edges, edges_length, index) {
    let count = 1;
    let i = 0;
    for (i = 0; i < edges_length; i++) {
      index[i] = 1;
      if (edges[i] >= x[0]) {
        break;
      }
    }
    while (i < edges_length) {
      if (edges[i] < x[count]) {
        index[i] = count;
      } else {
        i = i - 1;
        index[i] = count;
        count = count + 1;
      }
      if (count == x_length) {
        break;
      }
      i = i + 1;
    }
    count = count - 1;
    i = i + 1;
    while (i < edges_length) {
      index[i] = count;
      i = i + 1;
    }
    return index;
  }

  /**
   * Bフラグを非周期性指標に反映する
   * @param ap 非周期性指標
   * @param BFlag Bフラグ値。0～100の整数
   * @returns 反映後の非周期性指標。BFlagが0,5,100のときそのまま返す。0～50の時は、0の時全ての値が0になるように減算する。50～100のときは100ですべての値が1となるように増加する。
   */
  applyBreath(ap: Array<Float64Array>, BFlag: number): Array<Float64Array> {
    if (BFlag === 0 || BFlag === 100 || BFlag === 50) return ap;
    else if (BFlag < 50) {
      return ap.map((arr) => arr.map((value) => (value * BFlag * 2) / 100));
    } else if (BFlag > 50) {
      return ap.map((arr) =>
        arr.map((value) => {
          const rate = (BFlag * 2 - 100) / 100;
          return value * (1 - rate) + rate;
        })
      );
    }
  }
}
