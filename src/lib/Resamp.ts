import { World } from "tsworld";
import { renderingConfig } from "../config/rendering";
import type { ResampRequest, ResampWorkerRequest } from "../types/request";
import { interp1d, makeTimeAxis } from "../utils/interp";
import { decodePitch, getFrqFromTone } from "../utils/pitch";
import { Frq } from "./VoiceBanks/UtauFrq";
import type { VoiceBank } from "./VoiceBanks/VoiceBank";

/**
 * 原音をNoteとotoに従って伸縮・音高変更したwavとして返す
 */
export class Resamp {
  /**
   *合成するUTAU音源
   */
  vb: VoiceBank;
  /**
   * 音声分析合成システムworld
   */
  world: World;
  /**
   * 原音をNoteとotoに従って伸縮・音高変更したwavとして返す
   * @param vb 合成するUTAU音源
   */
  constructor(vb: VoiceBank = null) {
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
        request.intensity
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
    if (!request.withFrq) {
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
    const ap = this.world.D4C(
      request.inputWavData,
      request.frqData,
      timeAxis,
      sp.fft_size,
      renderingConfig.frameRate,
      0
    );
    const stretchParams = this.stretch(
      Array.from(request.frqData),
      sp.spectral,
      ap,
      Array.from(request.ampData),
      request.targetMs,
      request.fixedMs,
      request.velocity
    );
    const shiftF0 = this.pitchShift(
      stretchParams.f0,
      request.frqAverage,
      request.targetTone,
      request.modulation
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
      request.intensity
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
   * @returns
   */
  stretch(
    f0: Array<number>,
    sp: Array<Float64Array>,
    ap: Array<Float64Array>,
    amp: Array<number>,
    targetMs: number,
    fixedMs: number,
    velocity: number
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
            amp.slice(0, inputFixedFrames)
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
      amp.slice(inputFixedFrames)
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
   * @returns
   */
  worldStretch(
    targetFrames: number,
    f0: Array<number>,
    sp: Array<Float64Array>,
    ap: Array<Float64Array>,
    amp: Array<number>
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
    modulation: number
  ): Array<number> {
    const targetFrq = getFrqFromTone(targetTone);
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
   * @returns 音量を適用したwavデータ
   */
  adjustVolume(data: Array<number>, intensity: number): Array<number> {
    const maxAmp = data.reduce(
      (m, current) =>
        Math.max(m, Number.isNaN(current) ? 0 : Math.abs(current)),
      -1
    );
    return data.map(
      (v) => ((Number.isNaN(v) ? 0 : v / maxAmp) * 0.5 * intensity) / 100
    );
  }
}
