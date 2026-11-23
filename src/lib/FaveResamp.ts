/** Favorite Acient Voices, echoing
 * Faveは飴屋Pが過去に講演で使用した初期UTAU仕様に関する講演資料(http://udn.utau-synth.com/documents/kouen/20120325/utau_kouen.pdf)
 * を読み解いて作成した、伸縮機です。
 *
 * 高精度高品質な現代の音声合成とは異なり、素朴で懐かしい音がしますが、近代的な処理に比べて高速です。
 */

import { irfft_complex, rfft_complex } from "@delta_kimigatame/fft-wasm-lib";
import { WaveAnalyse } from "utauwav";
import { renderingConfig } from "../config/rendering";
import { ResampWorkerRequest } from "../types/request";
import { CubicSplineInterpolator } from "../utils/interp";
import { toneToNoteNum } from "../utils/Notenum";
import { FlagKeys, parseFlags } from "../utils/parseFlags";
import { decodePitch, getFrqFromNotenum } from "../utils/pitch";
import { ResampBase } from "./ResampBase";

const SPAN_SIZE = 256;

const INPUT_F0_SPAN = 256;
const FALBACK_F0 = 55;
const AMP_STEP = 256;
const INT16_NORMALIZE_SCALE = 32768;

const FFT_STRIDE = 512;
const FFT_SIZE = 1024;

export class Fave extends ResampBase {
  /**
   * フラグ定義
   */
  flagKeys: FlagKeys[] = [
    { name: "G", type: "bool", default: undefined }, // Generateフラグ、周波数表を強制的に再生成
    { name: "g", type: "number", min: -100, max: 100, default: 0 }, //genderフラグ、スペクトル包絡全体をワープ
    { name: "B", type: "number", min: 0, max: 100, default: 50 }, //Breath、現在の実装では簡易的に非周期性指標の増減
    { name: "O", type: "number", min: -100, max: 100, default: 0 }, //Openingフラグ。低域側の包絡を中心に増減
    { name: "T", type: "number", min: -100, max: 100, default: 0 }, //Tensionフラグ。中域(F2付近)の包絡を中心に増減
    { name: "S", type: "number", min: -100, max: 100, default: 0 }, //Sharpフラグ。高域寄りの明瞭感を増減
    { name: "b", type: "number", min: -100, max: 100, default: 0 }, //Brightnessフラグ。スペクトルティルトで明るさを増減
    { name: "t", type: "number", min: -100, max: 100, default: 0 }, //toneフラグ、音高をcent単位で調整
    { name: "P", type: "number", min: 0, max: 100, default: 86 }, //ピークコンプレッサーの強さ。0で無し、100で-6dBに正規化
    { name: "w", type: "number", min: 0, max: 100, default: 0 }, //グロウルの強さ。
    { name: "N", type: "bool", default: undefined }, // NoFormantFilter、フォルマントフィルタを無視する
    { name: "s", type: "number", min: 0, max: 100, default: 20 }, //エンベロープのガウスぼかしにおけるシグマ値。20で1σ。0でぼかしなし
    { name: "Mo", type: "number", min: -100, max: 100, default: 0, alias: "O" }, //moresampler互換性のためのOフラグのエイリアス。OがなくMoがあれば、MoをOとして扱う。
    { name: "Mt", type: "number", min: -100, max: 100, default: 0, alias: "T" }, //moresampler互換性のためのTフラグのエイリアス。TがなくMtがあれば、MtをTとして扱う。
    { name: "MG", type: "number", min: -100, max: 100, default: 0, alias: "w" }, //moresampler互換性のためのwフラグのエイリアス。wがなくMGがあれば、MGをwとして扱う。
    { name: "ME", type: "number", min: -100, max: 100, default: 0, alias: "S" }, //moresampler互換性のためのSフラグのエイリアス。SがなくMEがあれば、MEをSとして扱う。
  ];
  /** 互換性のためにinitializeを持つが即解決する */
  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * UTAUのresampler相当の処理を行う。
   * 処理順序は、f0値の取得→OLA伸縮→フォルマントフィルタ→振幅エンベロープの適用→ピークコンプレッサーの順である
   * @param request
   */
  resampWorker(request: ResampWorkerRequest): Float64Array {
    const flags = parseFlags(request.flags, this.flagKeys);
    if (!request.withFrq || flags["G"] !== undefined) {
      /** TODO 当面はfrqが与えられていることを想定する */
    }
    if (request.targetMs < 0) {
      throw new Error(
        `resampler処理に失敗しました: targetMsが負の値です (${request.targetMs})。`,
      );
    }
    const tempo = parseFloat(request.tempo);
    const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 120.0;
    /** resamplerからの出力フレーム数 */
    const targetFrames = (request.targetMs / 1000) * renderingConfig.frameRate;
    /** ピッチ点の間隔 */
    const f0Steps = this.CalcF0Step(safeTempo);
    /** 固定範囲の伸縮率 */
    const velocityRate = 2 ** ((100 - request.velocity) / 100);
    /** 固定範囲の入力長さ(元値) */
    const rawInputFixedFrames =
      (request.fixedMs / 1000) * renderingConfig.frameRate;
    /** 固定範囲の区間数はroundで決め、固定範囲は256サンプル境界へ量子化する */
    const inputFixedSections = Math.max(
      0,
      Math.round(rawInputFixedFrames / SPAN_SIZE),
    );
    /** 固定範囲の入力長さ(256サンプル境界に合わせた実効値) */
    const inputFixedFrames = Math.min(
      request.inputWavData.length,
      inputFixedSections * SPAN_SIZE,
    );
    /** 固定範囲の出力長さ */
    const outputFixedFrames = Math.ceil(inputFixedFrames * velocityRate);
    const { inputStretchFrames, outputStretchFrames, stretchRate } =
      this.CalcStretchParams(
        request.inputWavData.length,
        inputFixedFrames,
        targetFrames,
        outputFixedFrames,
      );
    /** 出力ピッチ列 */
    const outputF0 = this.CalcTargetPitch(
      request.targetTone,
      flags["t"] ?? 0,
      flags["w"] ?? 0,
      request.pitches,
      f0Steps,
      targetFrames,
    );
    /** 伸縮後波形 */
    const stretchedData = this.UtauOverlapAddStretch(
      request.inputWavData,
      request.frqData,
      request.frqAverage,
      outputF0,
      f0Steps,
      targetFrames,
      inputFixedFrames,
      outputFixedFrames,
      velocityRate,
      stretchRate,
      request.modulation,
    );
    const formantFilteredData = flags["N"]
      ? stretchedData
      : this.ApplyFormantFilter(
          request.inputWavData,
          stretchedData,
          request.frqData,
          request.frqAverage,
          outputF0,
          f0Steps,
          inputFixedFrames,
          outputFixedFrames,
          velocityRate,
          stretchRate,
          flags["B"] ?? 50,
          flags["O"] ?? 0,
          flags["T"] ?? 0,
          flags["S"] ?? 0,
          flags["b"] ?? 0,
          flags["g"] ?? 0,
          flags["s"] ?? 20,
        );
    const correctedData = this.CorrectedAmplitudeEnvelope(
      formantFilteredData,
      request.ampData,
      inputFixedFrames,
      outputFixedFrames,
      velocityRate,
      stretchRate,
    );
    const normalizedData = this.ApplyPeakCompressor(
      correctedData,
      flags["P"] ?? 86,
    );
    return normalizedData;
  }

  /**
   * Bフラグに応じた周波数依存ゲインを返す
   * 50は中立、0は高域をより抑えて息っぽさを低減、100は低域をより抑えて息っぽさを増幅する
   */
  CalcBreathGain(binIndex: number, fftSize: number, BFlag: number): number {
    const safeB = Number.isFinite(BFlag)
      ? Math.min(100, Math.max(0, BFlag))
      : 50;
    if (safeB === 50) {
      return 1;
    }

    const rate = (safeB - 50) / 50;
    const freq = (binIndex / fftSize) * renderingConfig.frameRate;
    const lowWeight = Math.exp(-freq / 500);
    let gainDb = 0;

    if (rate > 0) {
      // 息っぽさ増幅: 低域を強めに抑え、高域は緩めに抑える
      gainDb = -(3 + 9 * lowWeight) * rate;
    } else {
      // 息っぽさ低減: 高域を強めに抑え、低域は緩めに抑える
      const amount = -rate;
      gainDb = -(3 + 9 * (1 - lowWeight)) * amount;
    }

    const gain = Math.pow(10, gainDb / 20);
    return Number.isFinite(gain) ? gain : 1;
  }

  /**
   * B>50で付与する加算ノイズ量の比率を返す
   * 低域は控えめ、高域ほど増やす
   */
  CalcBreathNoiseRatio(
    binIndex: number,
    fftSize: number,
    BFlag: number,
  ): number {
    const safeB = Number.isFinite(BFlag)
      ? Math.min(100, Math.max(0, BFlag))
      : 50;
    if (safeB <= 50) {
      return 0;
    }
    const rate = (safeB - 50) / 50;
    const freq = (binIndex / fftSize) * renderingConfig.frameRate;
    const highWeight = 1 - Math.exp(-freq / 1200);
    const highWeight2 = highWeight * highWeight;
    // 低域ノイズは抑えつつ、高域で息感を強める
    return rate * (0.005 + 0.22 * highWeight2);
  }

  /** B>50時に有声音成分を段階的に弱める係数を返す */
  CalcBreathToneAttenuation(
    binIndex: number,
    fftSize: number,
    BFlag: number,
  ): number {
    const safeB = Number.isFinite(BFlag)
      ? Math.min(100, Math.max(0, BFlag))
      : 50;
    if (safeB <= 50) {
      return 1;
    }
    const rate = (safeB - 50) / 50;
    const freq = (binIndex / fftSize) * renderingConfig.frameRate;
    const lowWeight = Math.exp(-freq / 1800);
    // B100では低域をほぼ無声化に近いレベルまで抑え、高域はわずかに残す
    const ratePow = Math.pow(rate, 1.35);
    const lowBandAttenuation = 1 - 0.95 * ratePow;
    const highBandAttenuation = 1 - 0.88 * ratePow;
    const attenuation =
      highBandAttenuation +
      (lowBandAttenuation - highBandAttenuation) * lowWeight;
    return Math.max(0.02, Math.min(1, attenuation));
  }

  /**
   * Oフラグに応じた独立ゲインを返す
   * +で開き方向(低域寄りを持ち上げ)、-で閉じ方向
   */
  CalcOpeningGain(binIndex: number, fftSize: number, OFlag: number): number {
    const safeO = Number.isFinite(OFlag)
      ? Math.min(100, Math.max(-100, OFlag))
      : 0;
    if (safeO === 0) {
      return 1;
    }
    const freq = (binIndex / fftSize) * renderingConfig.frameRate;
    const lowWeight = Math.exp(-freq / 1000);
    const gainDb = 6 * (safeO / 100) * lowWeight;
    const gain = Math.pow(10, gainDb / 20);
    return Number.isFinite(gain) ? gain : 1;
  }

  /**
   * Tフラグに応じた独立ゲインを返す
   * +で中域(F2付近)を持ち上げ、-で抑える
   */
  CalcTensionGain(binIndex: number, fftSize: number, TFlag: number): number {
    const safeT = Number.isFinite(TFlag)
      ? Math.min(100, Math.max(-100, TFlag))
      : 0;
    if (safeT === 0) {
      return 1;
    }
    const freq = (binIndex / fftSize) * renderingConfig.frameRate;
    const centerHz = 1500;
    const sigmaHz = 500;
    const bandWeight = Math.exp(
      -((freq - centerHz) * (freq - centerHz)) / (2 * sigmaHz * sigmaHz),
    );
    const gainDb = 5 * (safeT / 100) * bandWeight;
    const gain = Math.pow(10, gainDb / 20);
    return Number.isFinite(gain) ? gain : 1;
  }

  /**
   * bフラグに応じた独立ゲインを返す
   * 正の値で高域を持ち上げ、負の値で高域を抑える
   */
  CalcBrightnessGain(binIndex: number, fftSize: number, bFlag: number): number {
    const safeB = Number.isFinite(bFlag)
      ? Math.min(100, Math.max(-100, bFlag))
      : 0;
    if (safeB === 0) {
      return 1;
    }
    const fs = renderingConfig.frameRate;
    const f = Math.max((binIndex / fftSize) * fs, 50);
    const logLow = Math.log2(50);
    const logHigh = Math.log2(fs / 2);
    const norm = (Math.log2(f) - logLow) / (logHigh - logLow);
    const gainDb = 12 * (safeB / 100) * (2 * norm - 1);
    const gain = Math.pow(10, gainDb / 20);
    return Number.isFinite(gain) ? gain : 1;
  }

  /**
   * Sフラグに応じた独立ゲインを返す
   * 正の値で高域寄りの明瞭感を強め、負の値で柔らかくする
   */
  CalcSharpGain(binIndex: number, fftSize: number, SFlag: number): number {
    const safeS = Number.isFinite(SFlag)
      ? Math.min(100, Math.max(-100, SFlag))
      : 0;
    if (safeS === 0) {
      return 1;
    }
    const freq = (binIndex / fftSize) * renderingConfig.frameRate;
    const highWeight = 1 - Math.exp(-freq / 1800);
    const gainDb = 8 * (safeS / 100) * highWeight;
    const gain = Math.pow(10, gainDb / 20);
    return Number.isFinite(gain) ? gain : 1;
  }

  /**
   * gフラグからフォルマント包絡のワープ比率を求める
   * g<0で高域側へ(女性化)、g>0で低域側へ(男性化)
   */
  CalcGenderWarpRatio(gFlag: number): number {
    const safeG = Number.isFinite(gFlag)
      ? Math.min(100, Math.max(-100, gFlag))
      : 0;
    // g=+-100でおよそ+-0.5octのワープ
    const ratio = Math.pow(2, (-safeG / 100) * 0.5);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  }

  /**
   * スペクトル包絡を周波数軸方向にワープする
   * warped[i] = envelope[i / ratio] を線形補間で算定する
   */
  WarpEnvelopeByRatio(envelope: Array<number>, ratio: number): Array<number> {
    if (envelope.length === 0) {
      return [];
    }
    const safeRatio =
      Number.isFinite(ratio) && ratio > 0
        ? Math.max(0.25, Math.min(4, ratio))
        : 1;
    if (Math.abs(safeRatio - 1) < 1e-8) {
      return envelope.slice();
    }

    const warped = new Array<number>(envelope.length);
    const maxIndex = envelope.length - 1;
    for (let i = 0; i < envelope.length; i++) {
      const src = i / safeRatio;
      const clampedSrc = Math.max(0, Math.min(maxIndex, src));
      const left = Math.floor(clampedSrc);
      const right = Math.min(maxIndex, left + 1);
      const t = clampedSrc - left;
      const leftValue = Number.isFinite(envelope[left]) ? envelope[left] : 0;
      const rightValue = Number.isFinite(envelope[right]) ? envelope[right] : 0;
      warped[i] = leftValue * (1 - t) + rightValue * t;
    }
    return warped;
  }

  /** 決定的な0..1の疑似乱数を返す */
  HashUnit(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  /**
   * tempoから出力f0列の間隔をフレーム単位で計算する
   * 出力f0間隔は、bpmに依存し5tickにつき1点となる。
   * @param bpm
   * @returns 出力f0列の間隔(フレーム数)
   */
  CalcF0Step(bpm: number): number {
    /** 現在のbpmにおける5tickの長さ(秒)。1拍=480tick */
    const fiveTickLengthInSeconds = (60 / bpm / 480) * 5;
    /** 5tickの長さをフレーム単位へ変換 */
    return fiveTickLengthInSeconds * renderingConfig.frameRate;
  }
  /**
   * 音高情報(targetTone)、cent単位の音高の補正値(tflag)、ピッチ列(pitches)、テンポ(tempo)から、周波数単位の出力f0列を計算する。
   * 出力f0列の間隔は、tempoに依存し5tickにつき1点となる。
   * @param targetTone 音高名
   * @param tFlag cent単位の音高の補正値
   * @param wFlag グロウルの強さ
   * @param pitches ピッチ列。-2048 ～ 2047のピッチの値列をBase64エンコードしてランレングス圧縮したもの
   * @param f0Steps 出力f0列の間隔(フレーム数)
   * @param targetFrames resampler処理後の出力フレーム数
   */
  CalcTargetPitch(
    targetTone: string,
    tFlag: number,
    wFlag: number,
    pitches: string,
    f0Steps: number,
    targetFrames: number,
  ) {
    /** ピッチ列を数値列に変換したもの */
    const decodedPitch = decodePitch(pitches);
    /** 出力f0を格納する配列 */
    const outputF0: Float64Array = new Float64Array(
      Math.ceil(targetFrames / f0Steps),
    );
    const f0StepMs = (f0Steps / renderingConfig.frameRate) * 1000;
    for (let i = 0; i < outputF0.length; i++) {
      outputF0[i] = getFrqFromNotenum(
        toneToNoteNum(targetTone) +
          tFlag / 100 +
          (i < decodedPitch.length ? decodedPitch[i] / 100 : 0),
      );
      if (wFlag > 0) {
        outputF0[i] *= 1 + Math.sin(i * 3 * f0StepMs) * (wFlag / 100);
      }
    }
    return outputF0;
  }

  /**
   * 固定範囲を除いた伸縮区間の長さと伸縮率を計算する
   */
  CalcStretchParams(
    inputFrames: number,
    inputFixedFrames: number,
    targetFrames: number,
    outputFixedFrames: number,
  ): {
    inputStretchFrames: number;
    outputStretchFrames: number;
    stretchRate: number;
  } {
    const inputStretchFrames = inputFrames - inputFixedFrames;
    const outputStretchFrames = targetFrames - outputFixedFrames;
    const stretchRate = outputStretchFrames / inputStretchFrames;
    return { inputStretchFrames, outputStretchFrames, stretchRate };
  }

  /**
   * UTAU初期resampler式のOLA伸縮を行う。伸縮範囲はfixedMsで指定する。
   * @param data 入力wavのデータ部
   * @param inputF0 入力f0列。wav256サンプルごとに1点のf0があることを想定する。
   * @param frqAverage 入力f0の平均値
   * @param outputF0 出力f0列。f0列の間隔はf0Stepsで指定する。
   * @param f0Steps 出力f0列の間隔(フレーム数)
   * @param targetFrames 出力フレーム数
   * @param inputFixedFrames 固定範囲の入力長さ(フレーム数)
   * @param outputFixedFrames 固定範囲の出力長さ(フレーム数)
   * @param velocityRate 固定範囲の伸縮率。2^(100-velocity)/100で計算される。
   * @param stretchRate 伸縮範囲の伸縮率
   * @param modulation モジュレーション
   * @returns OLA伸縮後のwavデータ
   */
  UtauOverlapAddStretch(
    data: Float64Array,
    inputF0: Float64Array,
    frqAverage: number,
    outputF0: Float64Array,
    f0Steps: number,
    targetFrames: number,
    inputFixedFrames: number,
    outputFixedFrames: number,
    velocityRate: number,
    stretchRate: number,
    modulation: number,
  ) {
    /** 入力フレーム数 */
    const inputFrames = data.length;
    if (inputFrames <= 0) {
      throw new Error("OLA処理に失敗しました: 入力波形が空です。");
    }

    const csi = new CubicSplineInterpolator(Array.from(data));
    const newData = new Float64Array(targetFrames);

    /**
     * 固定範囲部分の諸元算定。
     * 固定範囲部分の入力はdataの前半からfixedMsに対応するフレーム数
     * 出力はこれをvelocityを使って補正したフレーム数となる
     */
    /** 固定範囲のみで出力が埋まる場合のモード */
    const fixedOnlyMode = outputFixedFrames >= targetFrames;
    /**
     * 1区間を256サンプルとしたときの固定範囲の入力区間数。
     */
    const inputFixedSections = Math.max(
      0,
      Math.ceil(inputFixedFrames / SPAN_SIZE),
    );

    /** 固定範囲区間のOLA処理 */
    /** 次の区間へ引き継ぐ入力波形上の参照位置 */
    let nextSpanStartIndex = 0;
    /** 区間ループ */
    for (let nowSpan = 0; nowSpan < inputFixedSections; nowSpan++) {
      const spanStartInputFrame = Math.min(
        inputFixedFrames,
        nowSpan * SPAN_SIZE,
      );
      const spanEndInputFrame = Math.min(
        inputFixedFrames,
        (nowSpan + 1) * SPAN_SIZE,
      );
      /** 出力データにおけるこの区間の最初のフレーム */
      const startFrame = Math.ceil(spanStartInputFrame * velocityRate);
      if (startFrame >= targetFrames) {
        break;
      }
      /** 出力データにおけるこの区間の最後のフレーム */
      const lastFrame = Math.min(
        targetFrames,
        outputFixedFrames,
        Math.ceil(spanEndInputFrame * velocityRate),
      );
      if (lastFrame <= startFrame) {
        continue;
      }
      const spanLastInputFrame = Math.min(inputFrames, spanEndInputFrame);
      nextSpanStartIndex = this.UtauOverlapAddStretchCore(
        data,
        newData,
        true,
        velocityRate,
        nextSpanStartIndex,
        startFrame,
        lastFrame,
        0,
        0,
        spanLastInputFrame,
        inputF0,
        frqAverage,
        outputF0,
        f0Steps,
        modulation,
        csi,
      );
    }
    if (fixedOnlyMode) {
      return newData;
    }

    /**
     * 伸縮範囲部分の諸元算定
     * 伸縮範囲の入力はdataからfixedMsに対応するフレーム数を除いた残りの部分
     * 出力はtargetFramesから固定範囲の出力長さを除いた残りの部分
     */
    const inputStretchFrames = inputFrames - inputFixedFrames;
    const outputStretchFrames = targetFrames - outputFixedFrames;
    if (!Number.isFinite(stretchRate) || stretchRate <= 0) {
      throw new Error(
        `伸縮に失敗しました: 伸縮率が不正です (${stretchRate})。outputStretchFrames=${outputStretchFrames}, inputStretchFrames=${inputStretchFrames}`,
      );
    }
    /** 1区間を256サンプルとしたときの伸縮範囲の入力区間数 */
    const inputStretchSections = Math.ceil(inputStretchFrames / SPAN_SIZE);
    if (inputStretchSections <= 0) {
      throw new Error(
        `伸縮に失敗しました: 伸縮区間数が不正です (${inputStretchSections})。targetFrames=${targetFrames}, outputFixedFrames=${outputFixedFrames}, inputFrames=${inputFrames}, inputFixedFrames=${inputFixedFrames}`,
      );
    }
    /** 伸縮範囲区間のOLA処理 */
    /** nextSpanStartIndexは固定範囲の処理終了地点をそのまま用いる */
    /** 区間ループ */
    for (let nowSpan = 0; nowSpan < inputStretchSections; nowSpan++) {
      const spanStartInputFrame = Math.min(
        inputStretchFrames,
        nowSpan * SPAN_SIZE,
      );
      const spanEndInputFrame = Math.min(
        inputStretchFrames,
        (nowSpan + 1) * SPAN_SIZE,
      );
      /** 出力データにおけるこの区間の最初のフレーム。固定範囲の後に連結して書き込む */
      const startFrame =
        outputFixedFrames + Math.ceil(spanStartInputFrame * stretchRate);
      /** 出力データにおけるこの区間の最後のフレーム */
      const lastFrame = Math.min(
        targetFrames,
        outputFixedFrames + Math.ceil(spanEndInputFrame * stretchRate),
      );
      if (lastFrame <= startFrame) {
        continue;
      }
      const spanLastInputFrame = Math.min(
        inputFrames,
        inputFixedFrames + spanEndInputFrame,
      );
      nextSpanStartIndex = this.UtauOverlapAddStretchCore(
        data,
        newData,
        false,
        stretchRate,
        nextSpanStartIndex,
        startFrame,
        lastFrame,
        inputFixedFrames,
        outputFixedFrames,
        spanLastInputFrame,
        inputF0,
        frqAverage,
        outputF0,
        f0Steps,
        modulation,
        csi,
      );
    }
    return newData;
  }

  /**
   * UTAU初期resampler式のOLA伸縮のうち、固定範囲と伸縮範囲で共通するフレーム毎ループを扱う
   * @param data 入力wavのデータ部
   * @param newData 出力wavのデータ部
   * @param isFixedSection 固定範囲の処理かどうか。固定範囲かつ入力f0<=0ではピッチシフトを無効化する。
   * @param stretchRate 伸縮率
   * @param nextSpanStartIndex 次の区間へ引き継ぐ入力波形上の参照位置
   * @param startFrame この区間の出力wavにおける最初のフレーム番号
   * @param lastFrame この区間の出力wavにおける最後のフレーム番号
   * @param inputFrameOffset 入力側の基準オフセット。固定範囲は0、伸縮範囲はinputFixedFrames。
   * @param outputFrameOffset 出力側の基準オフセット。固定範囲は0、伸縮範囲はoutputFixedFrames。
   * @param lastInputFrame この区間で参照可能な入力の終端フレーム
   * @param inputF0 入力f0列。wav256サンプルごとに1点のf0があることを想定する。
   * @param frqAverage 入力f0の平均値
   * @param outputF0 出力f0列。f0列の間隔はf0Stepsで指定する。
   * @param f0Steps 出力f0列の間隔(フレーム数)
   * @param modulation モジュレーション
   * @param csi CubicSplineInterpolator
   * @returns 次の区間へ引き継ぐ入力波形上の参照位置
   */
  UtauOverlapAddStretchCore(
    data: Float64Array,
    newData: Float64Array,
    isFixedSection: boolean,
    stretchRate: number,
    nextSpanStartIndex: number,
    startFrame: number,
    lastFrame: number,
    inputFrameOffset: number,
    outputFrameOffset: number,
    lastInputFrame: number,
    inputF0: Float64Array,
    frqAverage: number,
    outputF0: Float64Array,
    f0Steps: number,
    modulation: number,
    csi: CubicSplineInterpolator,
  ): number {
    /** この区間での読み出し位置 */
    let sourcePosition = nextSpanStartIndex;
    /** この区間の入力側の開始フレーム。非連続点側のOLA点が区間外かの判定に使う */
    const spanStartInputFrame =
      inputFrameOffset + (startFrame - outputFrameOffset) / stretchRate;
    /** 入力波形上の位置が無声(入力f0が0以下または非有限)か判定する。f0が未定義の場合は無声扱いしない */
    const isUnvoicedInputPosition = (position: number): boolean => {
      const f0 = inputF0[Math.floor(position / INPUT_F0_SPAN)];
      return f0 !== undefined && !(Number.isFinite(f0) && f0 > 0);
    };
    /** 区間内ループ */
    for (let nowFrame = startFrame; nowFrame < lastFrame; nowFrame++) {
      /** 伸縮率に応じたフレームのインデックス。OLAの重みづけに用いる。 */
      const rateBaseIndex =
        inputFrameOffset + (nowFrame - outputFrameOffset) / stretchRate;
      /** inputF0からF0値を取得するためのインデックス */
      const inputF0Index = Math.floor(rateBaseIndex / INPUT_F0_SPAN);
      /** 入力f0、0や異常値の場合平均値で上書きする。 */
      const rawInputF0Value = inputF0[inputF0Index];
      const inputF0Value =
        Number.isFinite(rawInputF0Value) && rawInputF0Value > 0
          ? rawInputF0Value
          : Number.isFinite(frqAverage) && frqAverage > 0
            ? frqAverage
            : FALBACK_F0;
      /** F0値から求められるフレーム数 */
      const f0Frames = renderingConfig.frameRate / inputF0Value;
      /**
       * 入出力F0比率によるOLAのソースとなるフレームの移動ステップ数。
       * 固定範囲かつ入力f0<=0（無声子音を想定）の場合は、ピッチシフトとmodulationを無効化する。
       */
      let sourceStep: number;
      const isUnvoicedAtFixedSection =
        isFixedSection &&
        (!Number.isFinite(rawInputF0Value) || rawInputF0Value <= 0);
      if (isUnvoicedAtFixedSection) {
        sourceStep = 1;
      } else {
        /** outputF0からF0値を取得するためのインデックス。仮に要求長に長さが満たない場合、最後のF0値を採用する */
        const outputF0Index = Math.min(
          Math.floor(nowFrame / f0Steps),
          outputF0.length - 1,
        );
        /** このフレームのターゲットF0。modulationが非0の場合のみ混入する */
        const outputF0Value =
          modulation === 0
            ? outputF0[outputF0Index]
            : outputF0[outputF0Index] * (1 - modulation / 100) +
              (inputF0Value - frqAverage) * (modulation / 100);
        sourceStep = outputF0Value / inputF0Value;
      }
      /** 最初のサンプルでは現在位置を使用し、2サンプル目以降では位置を進める */
      if (nowFrame > startFrame) {
        sourcePosition += sourceStep;
      }
      const sourceBaseIndex = sourcePosition;
      /** OLAするポイント1点目。pdf資料で言うところの赤丸。
       *  i<lastInputFrameの場合i
       *  (i-f0Frames)<rateBaseIndexの場合(橙丸が黒丸より左)i-f0Frames(橙丸と同値)
       *  (i-f0Frames)<lastInputFrameの場合(i-f0Frames*2)
       *  一定以上の条件はあとで補正
       */
      const olaIndex1 =
        sourceBaseIndex < lastInputFrame
          ? sourceBaseIndex
          : sourceBaseIndex - f0Frames < rateBaseIndex
            ? sourceBaseIndex - f0Frames
            : sourceBaseIndex - f0Frames < lastInputFrame
              ? sourceBaseIndex - f0Frames * 2
              : sourceBaseIndex - f0Frames * 2; //仮の値
      /** OLAするポイント2点目。pdf資料で言うところの橙丸。
       *  (i-f0Frames)<lastInputFrameの場合(i-f0Frames)
       *  (i-f0Frames)>=lastInputFrameの場合olaIndex1-f0Frames
       *  一定以上の条件はあとで補正
       */
      const olaIndex2 =
        sourceBaseIndex - f0Frames < lastInputFrame - 1
          ? sourceBaseIndex - f0Frames
          : olaIndex1 - f0Frames;
      /**最終的なolaIndex1とolaIndex2がlastInputFrameを超過している場合を補正する。
       * olaIndex1がlastInputFrameを超えなくなるまでf0Framesを引けばいいはず
       */

      const olaIndexOverFrames = olaIndex1 - (lastInputFrame - 1);
      /** olaIndex1,2の両方が入力データより長ければ、olaIndexOverFramesを使って補正する。
       * olaIndex1のみが入力データより長いケースは、olaIndex2の点のみで計算するので、同値とする
       * それ以外はolaIndex1を採用する。
       */
      const correctOlaIndex1 =
        olaIndex1 >= lastInputFrame - 1 && olaIndex2 >= lastInputFrame - 1
          ? olaIndex1 - Math.ceil(olaIndexOverFrames / f0Frames) * f0Frames
          : olaIndex1 >= lastInputFrame - 1
            ? olaIndex2
            : olaIndex1;
      const correctOlaIndex2 =
        olaIndex1 >= lastInputFrame - 1 && olaIndex2 >= lastInputFrame - 1
          ? correctOlaIndex1 - f0Frames
          : olaIndex2;
      /** 区間の最後に、実際の参照位置を記録 */
      if (nowFrame === lastFrame - 1) {
        nextSpanStartIndex = correctOlaIndex1 + sourceStep;
      }
      const olaValue1 = csi.Interpolate(correctOlaIndex1);
      /** 前区間との連続性を持たない側(correctOlaIndex2)が、区間の入力側開始フレームより前かつ無声区間を指す場合はOLAに使わない。
       * 無声→有声の境界で、無声区間の波形(破裂音など)が有声区間に混入することを防ぐ。 */
      const skipOla2 =
        correctOlaIndex2 < spanStartInputFrame &&
        isUnvoicedInputPosition(correctOlaIndex2);
      if (
        correctOlaIndex2 >= 0 &&
        correctOlaIndex1 != correctOlaIndex2 &&
        !skipOla2
      ) {
        const olaValue2 = csi.Interpolate(correctOlaIndex2);

        const olaDiff1 = Math.abs(rateBaseIndex - olaIndex1);
        const olaDiff2 = Math.abs(rateBaseIndex - olaIndex2);

        const olaWait1 = olaDiff2 / (olaDiff1 + olaDiff2);
        const olaWait2 = 1 - olaWait1;

        newData[nowFrame] = olaValue1 * olaWait1 + olaValue2 * olaWait2;
      } else {
        newData[nowFrame] = olaValue1;
      }
    }
    return nextSpanStartIndex;
  }

  /**
   * OLAした後のデータをUTAU式フォルマントフィルタで補正する
   * @param inputData 入力wavのデータ部
   * @param olaedData OLA後のwavのデータ部
   * @param inputF0 入力f0列。wav256サンプルごとに1点のf0があることを想定する。
   * @param frqAverage 入力f0の平均値
   * @param olaedF0 OLA後のf0列。f0列の間隔はOLAedF0Stepsで指定する。
   * @param olaedF0Steps OLA後のf0列の間隔(フレーム数)
   * @param inputFixedFrames 固定範囲の入力長さ(フレーム数)
   * @param outputFixedFrames 固定範囲の出力長さ(フレーム数)
   * @param velocityRate 固定範囲の伸縮率。2^(100-velocity)/100で計算される。
   * @param stretchRate 伸縮範囲の伸縮率
   * @param BFlag Breathフラグ。Breathの強さを0～100で指定する。
   * @param OFlag Openingフラグ。低域側の包絡を中心に増減させる強さを-100～100で指定する。
   * @param TFlag Tensionフラグ。中域(F2付近)の包絡を中心に増減させる強さを-100～100で指定する。
   * @param SFlag Sharpフラグ。高域寄りの明瞭感を増減させる強さを-100～100で指定する。
   * @param bFlag Brightnessフラグ。スペクトルティルトで明るさを増減させる強さを-100～100で指定する。
   * @param gFlag genderフラグ。スペクトル包絡全体をワープする強さを-100～100で指定する。
   * @param sFlag エンベロープのガウスぼかしにおけるシグマ値。20で1σ。0でぼかしなし
   * @returns フォルマントフィルタ適用後のwavデータ
   */
  ApplyFormantFilter(
    inputData: Float64Array,
    olaedData: Float64Array,
    inputF0: Float64Array,
    frqAverage: number,
    olaedF0: Float64Array,
    olaedF0Steps: number,
    inputFixedFrames: number,
    outputFixedFrames: number,
    velocityRate: number,
    stretchRate: number,
    BFlag: number,
    OFlag: number,
    TFlag: number,
    SFlag: number,
    bFlag: number,
    gFlag: number,
    sFlag: number,
  ): Float64Array {
    /** 返り値用のデータ */
    const newData = new Float64Array(olaedData.length).fill(0);
    /** フレームごとの窓関数の影響値の合計が微妙に1にならないことが考えられるため補正に使う */
    const windowSum = new Array<number>(olaedData.length).fill(0);
    const wa = new WaveAnalyse();
    /** hanning窓 */
    const window = wa.MakeWindow("hanning", FFT_SIZE);
    const genderWarpRatio = this.CalcGenderWarpRatio(gFlag);
    let frameIndex = 0;
    for (
      let olaedStartFrame = -FFT_STRIDE;
      olaedStartFrame < olaedData.length;
      olaedStartFrame += FFT_STRIDE
    ) {
      /** OLA後分のfft区間の中心フレーム */
      const olaedCenter = olaedStartFrame + FFT_SIZE / 2;
      /** OLA後分のf0インデックス。範囲外の場合は末尾に丸める */
      const olaedF0Index = Math.min(
        Math.max(Math.floor(olaedCenter / olaedF0Steps), 0),
        olaedF0.length - 1,
      );
      /** olaedCenterがoutputFixedFrames未満ならvelocityRate、そうでなければstretchRate */
      const rate = olaedCenter < outputFixedFrames ? velocityRate : stretchRate;

      /**
       * 入力分のfft区間の中心フレーム
       * olaedCenterがoutputFixedFrames未満ならolaedCenter/rate、そうでなければ、InputFixedFrames+(olaedCenter-outputFixedFrames)/rate
       */
      const inputCenter =
        olaedCenter < outputFixedFrames
          ? olaedCenter / rate
          : inputFixedFrames + (olaedCenter - outputFixedFrames) / rate;
      /** 入力分のf0インデックス */
      const inputF0Index = Math.floor(inputCenter / INPUT_F0_SPAN);
      /** 入力データのFFT開始フレーム。分離済みのinputCenterを基準に窓中心を一致させる。 */
      const inputStartFrame = Math.floor(inputCenter - FFT_SIZE / 2);
      /** 入力データを切り出す。最初や最後など値が足りない部分は0埋め */
      const inputValues = Array.from(
        { length: FFT_SIZE },
        (_, i) => inputData[inputStartFrame + i] ?? 0,
      );
      /** 入力データに窓関数を適用したもの */
      const windowedInputValues = Float32Array.from(
        inputValues.map((v, i) => v * window[i]),
      );
      const inputSpec = rfft_complex(FFT_SIZE, windowedInputValues);
      /** 入力f0、0や異常値の場合平均値、さらに不正なら55Hzで上書きする。 */
      const rawInputF0Value = inputF0[inputF0Index];
      const inputF0Value =
        Number.isFinite(rawInputF0Value) && rawInputF0Value > 0
          ? rawInputF0Value
          : Number.isFinite(frqAverage) && frqAverage > 0
            ? frqAverage
            : FALBACK_F0;
      const inputEnvelope = this.ClacSpecEnveloveGauss(
        inputSpec,
        FFT_SIZE,
        renderingConfig.frameRate,
        inputF0Value,
        sFlag,
      );
      const warpedInputEnvelope = this.WarpEnvelopeByRatio(
        inputEnvelope,
        genderWarpRatio,
      );
      /** 出力データを切り出す。最初や最後など値が足りない部分は0埋め */
      const olaedValues = Array.from(
        { length: FFT_SIZE },
        (_, i) => olaedData[olaedStartFrame + i] ?? 0,
      );
      /** 出力データに窓関数を適用したもの */
      const windowedOlaedValues = Float32Array.from(
        olaedValues.map((v, i) => v * window[i]),
      );
      const olaedSpec = rfft_complex(FFT_SIZE, windowedOlaedValues);
      const rawOlaedF0Value = olaedF0[olaedF0Index];
      const olaedF0Value =
        Number.isFinite(rawOlaedF0Value) && rawOlaedF0Value > 0
          ? rawOlaedF0Value
          : Number.isFinite(frqAverage) && frqAverage > 0
            ? frqAverage
            : FALBACK_F0;
      const olaedEnvelope = this.ClacSpecEnveloveGauss(
        olaedSpec,
        FFT_SIZE,
        renderingConfig.frameRate,
        olaedF0Value,
        sFlag,
      );
      /** 入出力のスペクトル包絡を適用したspecデータ、re0,im0,re1,im1...の順に並ぶ */
      const apllyedSpec = new Float32Array(olaedSpec.length);
      const envelopeLength = Math.min(
        inputEnvelope.length,
        olaedEnvelope.length,
        Math.floor(olaedSpec.length / 2),
      );
      for (let i = 0; i < envelopeLength; i++) {
        const warpedInputAmp = Number.isFinite(warpedInputEnvelope[i])
          ? warpedInputEnvelope[i]
          : 0;
        const rawInputAmp = Number.isFinite(inputEnvelope[i])
          ? inputEnvelope[i]
          : 0;
        const outputAmp =
          Number.isFinite(olaedEnvelope[i]) && olaedEnvelope[i] > 0
            ? olaedEnvelope[i]
            : 0;
        const baseGain = outputAmp > 0 ? warpedInputAmp / outputAmp : 1;
        const openingGain = this.CalcOpeningGain(i, FFT_SIZE, OFlag);
        const tensionGain = this.CalcTensionGain(i, FFT_SIZE, TFlag);
        const sharpGain = this.CalcSharpGain(i, FFT_SIZE, SFlag);
        const brightnessGain = this.CalcBrightnessGain(i, FFT_SIZE, bFlag);
        const gain =
          baseGain * openingGain * tensionGain * sharpGain * brightnessGain;
        const breathGain = this.CalcBreathGain(i, FFT_SIZE, BFlag);
        const toneAttenuation = this.CalcBreathToneAttenuation(
          i,
          FFT_SIZE,
          BFlag,
        );
        const finalGain = gain * breathGain * toneAttenuation;
        const breathNoiseRatio = this.CalcBreathNoiseRatio(i, FFT_SIZE, BFlag);
        /** 実部 */
        apllyedSpec[i * 2] = olaedSpec[i * 2] * finalGain;
        /** 虚部 */
        apllyedSpec[i * 2 + 1] = olaedSpec[i * 2 + 1] * finalGain;

        const isEndpointBin = i === 0 || i === FFT_SIZE / 2;
        if (breathNoiseRatio > 0 && !isEndpointBin) {
          // Bノイズ量はgワープ後包絡を参照しないようにし、フラグ独立性を保つ
          const baseMag = Math.max(rawInputAmp, outputAmp, 1e-9);
          const noiseMag = baseMag * breathNoiseRatio;
          const phase =
            2 * Math.PI * this.HashUnit((frameIndex + 1) * 4099 + i * 131);
          apllyedSpec[i * 2] += noiseMag * Math.cos(phase);
          apllyedSpec[i * 2 + 1] += noiseMag * Math.sin(phase);
        }
      }
      // 実数信号のirfft入力としてDC/Nyquistの虚部を0に固定する
      apllyedSpec[1] = 0;
      const nyquistImagIndex = FFT_SIZE + 1;
      if (nyquistImagIndex < apllyedSpec.length) {
        apllyedSpec[nyquistImagIndex] = 0;
      }
      // wasm側でのtrapを避けるため、非有限値を除去して極端な値を抑える
      for (let i = 0; i < apllyedSpec.length; i++) {
        if (!Number.isFinite(apllyedSpec[i])) {
          apllyedSpec[i] = 0;
          continue;
        }
        if (apllyedSpec[i] > 1e6) {
          apllyedSpec[i] = 1e6;
        } else if (apllyedSpec[i] < -1e6) {
          apllyedSpec[i] = -1e6;
        }
      }
      const applyedData = irfft_complex(FFT_SIZE, apllyedSpec);
      for (let i = 0; i < applyedData.length; i++) {
        if (i + olaedStartFrame >= 0 && i + olaedStartFrame < newData.length) {
          newData[i + olaedStartFrame] += applyedData[i];
          windowSum[i + olaedStartFrame] += window[i];
        }
      }
      frameIndex++;
    }
    /** 返却前にデータを窓関数で補正 */
    return newData.map((v, i) => (windowSum[i] > 0 ? v / windowSum[i] : 0));
  }
  /**
   * FFTデータを受け取り、振幅エンベロープを返す。
   * 振幅エンベロープは中心ビンごとにf0値に基づいて算定されるビン数と引数のσを用いたガウス平均とする。
   * @param spec re0,im0,re1,im1...の順で並んだFFTデータ
   * @param fftSize fftsize
   * @param framerate wavのサンプリングレート
   * @param f0 fft区間のf0値
   * @param sFlag ガウス平均のσ値。20で1σ。0でぼかしなし
   * @returns amp0,amp1,amp2...の順で並んだ平滑化済み振幅エンベロープ
   */
  ClacSpecEnveloveGauss(
    spec: Float32Array,
    fftSize: number,
    framerate: number,
    f0: number,
    sFlag: number = 20,
  ): Array<number> {
    const amp = new Array<number>();
    const harmonicSpacing = f0 / (framerate / fftSize);
    // 倍音間隔の約1.7倍を平滑化幅にする
    const width = Math.max(3, Math.round(harmonicSpacing * 1.7));
    for (let i = 0; i < spec.length; i += 2) {
      amp.push(Math.hypot(spec[i], spec[i + 1]));
    }
    // s=0は「ぼかしなし」なので振幅列をそのまま返す
    if (sFlag <= 0) {
      return amp;
    }
    // widthに対応する標準偏差
    // 同じ幅の単純移動平均と分散をおおむね揃える
    const sigmaBins = (width / Math.sqrt(12)) * (sFlag / 20);
    if (!Number.isFinite(sigmaBins) || sigmaBins <= 0) {
      return amp;
    }
    /** 平滑化幅の半分 */
    const halfRange = Math.ceil(3 * sigmaBins);
    const envelope = new Array<number>(amp.length);
    for (let i = 0; i < amp.length; i++) {
      let sum = 0;
      let weightSum = 0;

      for (let d = -halfRange; d <= halfRange; d++) {
        const index = i + d;
        if (index < 0 || index >= amp.length) continue;

        const weight = Math.exp(-(d * d) / (2 * sigmaBins * sigmaBins));

        sum += amp[index] * weight;
        weightSum += weight;
      }

      envelope[i] = weightSum > 0 ? sum / weightSum : amp[i];
    }
    return envelope;
  }

  /**
   * フォルマントフィルタ適用後の振幅を元の振幅エンベロープで補正する
   * @param outputData フォルマントフィルタ補正後のwav波形のデータ部分
   * @param inputAmp 入力amp列(16bit整数スケール)
   * @param inputFixedFrames 固定範囲の入力長さ(フレーム数)
   * @param outputFixedFrames 固定範囲の出力長さ(フレーム数)
   * @param velocityRate 固定範囲の伸縮率
   * @param stretchRate 伸縮範囲の伸縮率
   * @returns
   */
  CorrectedAmplitudeEnvelope(
    outputData: Float64Array,
    inputAmp: ArrayLike<number>,
    inputFixedFrames: number,
    outputFixedFrames: number,
    velocityRate: number,
    stretchRate: number,
  ): Float64Array {
    const safeVelocityRate =
      Number.isFinite(velocityRate) && velocityRate > 0 ? velocityRate : 1;
    const safeStretchRate =
      Number.isFinite(stretchRate) && stretchRate > 0 ? stretchRate : 1;
    const normalizedInputAmp = Array.from(inputAmp, (v) =>
      Number.isFinite(v) ? v / INT16_NORMALIZE_SCALE : 0,
    );

    /** 半端なindex値を線形補間してamp値を求める */
    const interpAmp = (values: Array<number>, position: number): number => {
      if (values.length === 0) {
        return 0;
      }
      const clampedPosition = Math.max(0, position);
      const left = Math.min(Math.floor(clampedPosition), values.length - 1);
      const right = Math.min(left + 1, values.length - 1);
      const fraction = clampedPosition - Math.floor(clampedPosition);

      return values[left] * (1 - fraction) + values[right] * fraction;
    };

    /** ampStep分のdataを受け取ってampを返す */
    const calcAmp = (data: Float64Array) => {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        if (!Number.isFinite(data[i])) {
          continue;
        } else {
          sum += Math.abs(data[i]);
          count++;
        }
      }
      if (count === 0) {
        return 0;
      } else {
        return sum / count;
      }
    };
    /** AMP_STEP毎の補正対象のamp列 */
    const outputAmps = new Array<number>();
    for (let i = 0; i < outputData.length; i += AMP_STEP) {
      outputAmps.push(calcAmp(outputData.slice(i, i + AMP_STEP)));
    }

    const correctedData = new Float64Array(outputData.length);
    for (let i = 0; i < outputData.length; i++) {
      const inputFrame =
        i < outputFixedFrames
          ? i / safeVelocityRate
          : inputFixedFrames + (i - outputFixedFrames) / safeStretchRate;
      const inputPosition = inputFrame / AMP_STEP;
      const outputPosition = i / AMP_STEP;
      const targetAmp = interpAmp(normalizedInputAmp, inputPosition);
      const currentAmp = interpAmp(outputAmps, outputPosition);

      const gain = currentAmp > 1e-8 ? targetAmp / currentAmp : 1;
      correctedData[i] = outputData[i] * gain;
    }
    return correctedData;
  }
  /**
   * Pフラグで効き具合をコントロールしながら、ノーマライズする
   * @param data wavのデータ部
   * @param P フラグ値。閾値は0～100
   * @returns ノーマライズ後のwavのデータ部
   */
  ApplyPeakCompressor(data: Float64Array, P: number = 86): Float64Array {
    const peak = data.reduce(
      (max, value) =>
        Number.isFinite(value) ? Math.max(max, Math.abs(value)) : max,
      0,
    );
    const normalizeGain = peak > 0 ? 0.5 / peak : 1;
    const p = P / 100;
    const gain = 1 - p + p * normalizeGain;

    const normalizedData = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const value = Number.isFinite(data[i]) ? data[i] : 0;
      normalizedData[i] = value * gain;
    }
    return normalizedData;
  }
}
