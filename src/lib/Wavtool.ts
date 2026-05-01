import type { Wave } from "utauwav";
import { GenerateWave, WaveProcessing } from "utauwav";
import { renderingConfig } from "../config/rendering";
import type { AppendRequest } from "../types/request";

export class Wavtool {
  /** 波形データ（Lch） */
  private _data: Array<number>;
  /** 波形データ（Rch）。ステレオ出力時のみ設定される */
  private _rData: Array<number> | null;

  /**
   * resampが出力したwavを結合して1つのwavにして返す。
   */
  constructor() {
    this._data = new Array();
    this._rData = null;
  }

  get data(): Array<number> {
    return this._data;
  }

  append(request: AppendRequest): void {
    const stpFrames = (renderingConfig.frameRate * request.stp) / 1000;
    const lengthFrames = (renderingConfig.frameRate * request.length) / 1000;
    const overlapFrames = (renderingConfig.frameRate * request.overlap) / 1000;
    const inputData = request.inputData.slice(
      stpFrames,
      stpFrames + lengthFrames,
    );
    const frameEnvelope = this.getEnvelope(request.length, request.envelope);
    const applyedData = this.applyEnvelope(inputData, frameEnvelope);
    this.concat(overlapFrames, applyedData);
  }

  /**
   * エンベロープ値をソートしてwavの頭からのframe位置に直して返す。
   * @param length 出力する波形の長さ(ms)
   * @param envelope point(ms)はp1,p2,p5,p3,p4の順にソートする。
   * @returns
   */
  getEnvelope(
    length: number,
    envelope: { point: Array<number>; value: Array<number> },
  ): { framePoint: Array<number>; value: Array<number> } {
    const sortedPoint = new Array<number>();
    if (envelope.point[0] !== 0) {
      sortedPoint.push(0);
    }
    sortedPoint.push(envelope.point[0]);
    sortedPoint.push(envelope.point[0] + envelope.point[1]);
    if (envelope.point.length === 5) {
      sortedPoint.push(
        envelope.point[0] + envelope.point[1] + envelope.point[4],
      );
    }
    if (envelope.point.length >= 4) {
      sortedPoint.push(length - envelope.point[2] - envelope.point[3]);
      sortedPoint.push(length - envelope.point[3]);
      if (envelope.point[3] !== 0) {
        sortedPoint.push(length);
      }
    } else if (envelope.point.length === 3) {
      sortedPoint.push(length - envelope.point[2]);
      sortedPoint.push(length);
    }
    const framePoint = sortedPoint.map((p) =>
      Math.floor((renderingConfig.frameRate * p) / 1000),
    );
    const sortedValue = [];
    if (envelope.value.length >= 3) {
      if (envelope.point[0] !== 0) {
        sortedValue.push(0);
      }
      sortedValue.push(envelope.value[0]);
      sortedValue.push(envelope.value[1]);
      if (envelope.value.length === 5) {
        sortedValue.push(envelope.value[4]);
      }
      sortedValue.push(envelope.value[2]);
      if (envelope.value.length >= 4) {
        sortedValue.push(envelope.value[3]);
      }
    }
    while (sortedValue.length < framePoint.length) {
      sortedValue.push(0);
    }
    return { framePoint: framePoint, value: sortedValue };
  }

  /**
   * wav波形にエンベロープを適用する
   * @param inputData 入力波形
   * @param envelope GetEnvelopeの戻り値の形のエンベロープ
   * @returns エンベロープ適用済みの波形
   */
  applyEnvelope(
    inputData: Array<number>,
    envelope: { framePoint: Array<number>; value: Array<number> },
  ): Array<number> {
    const outputData = new Array<number>();
    if (envelope.framePoint.length === 2) {
      return new Array(inputData.length).fill(0);
    }
    let j = 1;
    inputData.forEach((v, i) => {
      while (i === envelope.framePoint[j]) {
        j++;
      }
      const valueDif = envelope.value[j] - envelope.value[j - 1];
      const range = envelope.framePoint[j] - envelope.framePoint[j - 1];
      const rate =
        ((i - envelope.framePoint[j]) * valueDif) / range + envelope.value[j];
      outputData.push(Number.isNaN(rate) ? 0 : (v * rate) / 100);
    });
    return outputData;
  }

  /**
   * オーバーラップ値を考慮してwavを結合する
   * @param overlapFrames オーバーラップするフレーム数
   * @param inputData 入力データ
   */
  concat(overlapFrames: number, inputData: Array<number>): void {
    const checkedOverlapFrames =
      overlapFrames > inputData.length ? inputData.length : overlapFrames;
    if (checkedOverlapFrames > this._data.length) {
      const fillArray = new Array(
        Math.ceil(checkedOverlapFrames - this._data.length),
      ).fill(0);
      this._data = fillArray.concat(this._data);
    } else if (overlapFrames < 0) {
      const fillArray = new Array(Math.ceil(checkedOverlapFrames * -1)).fill(0);
      this._data = this._data.concat(fillArray.fill(0));
    }
    const overlapValue =
      checkedOverlapFrames === 0
        ? []
        : this._data
            .slice(-1 * checkedOverlapFrames)
            .map((v, i) => v + inputData[i]);
    this._data =
      checkedOverlapFrames <= 0
        ? this._data.concat(inputData)
        : this._data
            .slice(0, -1 * checkedOverlapFrames)
            .concat(overlapValue, inputData.slice(checkedOverlapFrames));
  }

  /**
   * ここまでのappendの結果を踏まえてwavを出力する。
   * @returns wavデータ
   */
  output(): ArrayBuffer {
    const wp = new WaveProcessing();
    const wav: Wave = GenerateWave(
      renderingConfig.frameRate,
      renderingConfig.depth,
      wp.InverseLogicalNormalize(this._data, renderingConfig.depth),
      this._rData
        ? wp.InverseLogicalNormalize(this._rData, renderingConfig.depth)
        : null,
    );
    return wav.Output();
  }

  /** 伴奏データをmixする */
  mixBackgroundAudio(
    backgroundWav: Wave,
    offsetMs: number,
    volume: number,
  ): void {
    const wp = new WaveProcessing();

    const offsetFrames = Math.floor(
      (offsetMs / 1000) * renderingConfig.frameRate,
    );

    /** 伴奏wavの読み込み開始位置（正の場合は0に補正） */
    const backgroundStartFrame = Math.max(0, offsetFrames);
    /** this._dataへの書き込み開始位置（正の場合は0に補正） */
    const dataStartFrame = Math.max(0, -offsetFrames);
    /** 合成する長さ */
    const mixLength = Math.min(
      this._data.length - dataStartFrame,
      backgroundWav.data.length - backgroundStartFrame,
    );

    if (mixLength <= 0) return;

    /** 伴奏データのLchの正規化。必要範囲のみ */
    const backgroundData = wp.LogicalNormalize(
      backgroundWav.data.slice(
        backgroundStartFrame,
        backgroundStartFrame + mixLength,
      ),
      backgroundWav.bitDepth,
    );
    /** 伴奏データのRchがある場合、正規化しLchと平均を取る形でモノラルにする */
    if (backgroundWav.rData) {
      const rData = wp.LogicalNormalize(
        backgroundWav.rData.slice(
          backgroundStartFrame,
          backgroundStartFrame + mixLength,
        ),
        backgroundWav.bitDepth,
      );
      backgroundData.forEach(
        (v, i) => (backgroundData[i] = (v + rData[i]) / 2),
      );
    }

    /** 音量を考慮しながらmixダウンする。 */
    for (let i = 0; i < mixLength; i++) {
      this._data[dataStartFrame + i] += backgroundData[i] * volume;
    }
  }

  /**
   * 伴奏データとボーカルデータを自動ボリューム調整やエフェクトの適用を含めてミックス・マスタリングする。
   * このアプリケーションはそもそも音声合成アプリであり、ミキシングやマスタリングは責任の範囲外であるが、
   * ライトユーザが簡単な成功体験を得るために破綻が少なくそれなりに聞こえるmix/マスタリングを提供する。
   *
   * ## 考え方
   * ### 伴奏データ
   * - 伴奏データはinstのみでマスタリングされているケースと、2mixのケースが考えられる。
   * - 本アプリケーションが音声合成ソフトであることを考えれば、ある程度ボーカルが明瞭に聞こえることはユーザー満足度が高い。
   * - そこで、最終的な出力ターゲット(-1dB)の半分(-7dB)より少し小さい値-8dBをターゲットにノーマライズする。
   *
   * ### ボーカルデータ
   * - ボーカルデータは、音量が100、エンベロープが100の時概ね-6dB程度で出力されるため、この音量を想定する。
   * - イコライジングとして、人間の声より低音域に当たる100Hz以下を弱め、声の明瞭さを上げるために2kHz付近を少しブーストする。
   * - 音声合成ソフトでありある程度音量が揃った出力が期待されることから、コンプレッサーは組み込まない。
   * - 空間系処理として適当なリバーブを設定する。初期バージョンでは仮の値を採用し、聴感上調整して正式な値を決定する。
   *
   * ### マスタリング
   * - 短時間RMSを基準にダイナミックゲイン処理を行い、自然なラウドネス整合を行う
   * - ピーク正規化で音割れを補正し -1.0 dBFS に収める
   *
   * ### 引数関係
   * - 設定パラメータとしてのvolumeは無視し、offsetMsは伴奏の開始位置を調整するために使用する。
   */
  /**
   * @param extendToBackground true の場合、ボーカル終端以降の伴奏のみ区間も出力に含める。
   *                            false の場合はボーカル長までに制限する（部分選択再生時）。
   */
  mixAndMaster(
    backgroundWav: Wave,
    offsetMs: number,
    volume: number,
    extendToBackground: boolean = false,
  ): void {
    const fs = renderingConfig.frameRate;
    const wp = new WaveProcessing();

    // ---- ボーカルデータ処理 ----
    // EQ: 100Hz以下をハイパスフィルタで弱める
    let vocalData = this.applyBiquadHighPass(
      this._data.slice(),
      100,
      0.707,
      fs,
    );
    // EQ: 2kHz付近を+3dBブースト
    vocalData = this.applyBiquadPeakingEQ(vocalData, 2000, 1.0, 3.0, fs);
    // リバーブ
    vocalData = this.applySimpleReverb(vocalData, fs);

    // ---- 伴奏データ処理 ----
    const offsetFrames = Math.floor((offsetMs / 1000) * fs);
    const backgroundStartFrame = Math.max(0, offsetFrames);
    const dataStartFrame = Math.max(0, -offsetFrames);
    const mixLength = Math.min(
      vocalData.length - dataStartFrame,
      backgroundWav.data.length - backgroundStartFrame,
    );

    // ミックスバッファ初期化（ボーカルデータをL/R両チャンネルにコピー）
    const mixedL = vocalData.slice();
    const mixedR = vocalData.slice();
    if (mixLength > 0) {
      // 伴奏を全区間まとめて正規化（ゲインの一貫性のため：ミックス区間と延長区間で同一ゲインを使用）
      const bgLData = wp.LogicalNormalize(
        backgroundWav.data.slice(backgroundStartFrame),
        backgroundWav.bitDepth,
      );
      // Rchがあれば正規化、なければLchを複製（モノラル伴奏）
      const bgRData = backgroundWav.rData
        ? wp.LogicalNormalize(
            backgroundWav.rData.slice(backgroundStartFrame),
            backgroundWav.bitDepth,
          )
        : bgLData.slice();
      // 伴奏をvolumeに応じたターゲットdBにノーマライズ（L/R合算ピークで統一ゲインを算出）
      // volume = 0     → 無音
      // 0 < volume < 0.5 → 振幅で 0 〜 -6 dBへ線形補間
      // volume >= 0.5  → -6 dB 〜 -2 dB へ線形補間 (targetDb = 8 * volume - 10)
      const target6dBLinear = 10 ** (-6 / 20);
      const targetLinear =
        volume <= 0
          ? 0
          : volume < 0.5
            ? (volume / 0.5) * target6dBLinear
            : 10 ** ((8 * volume - 10) / 20);
      const bgPeak = Math.max(
        bgLData.reduce((max, v) => Math.max(max, Math.abs(v)), 0),
        bgRData.reduce((max, v) => Math.max(max, Math.abs(v)), 0),
      );
      const bgGain = bgPeak > 0 ? targetLinear / bgPeak : 0;

      // ゲインを適用しながらL/Rそれぞれにミックス（既存処理）
      for (let i = 0; i < mixLength; i++) {
        mixedL[dataStartFrame + i] += bgLData[i] * bgGain;
        mixedR[dataStartFrame + i] += bgRData[i] * bgGain;
      }

      // ボーカル終端以降の伴奏のみ区間を追記
      if (extendToBackground) {
        for (let i = mixLength; i < bgLData.length; i++) {
          mixedL.push(bgLData[i] * bgGain);
          mixedR.push(bgRData[i] * bgGain);
        }
      }
    }

    // ---- ダイナミックゲイン処理 + ピーク正規化 ----
    // 短時間RMSを基準にゲインを動的に制御し、自然なラウドネス整合を行う。
    // 最後にピーク正規化で音割れを補正する。
    const [masteredL, masteredR] = this.applyDynamicMastering(
      mixedL,
      mixedR,
      -14,
      -1.0,
      fs,
    );

    // ---- this._data / _rData を更新 ----
    this._data = masteredL;
    this._rData = masteredR;
  }

  /**
   * バイクアッドハイパスフィルタを適用する。
   * @param data 入力データ（論理正規化済み）
   * @param fc カットオフ周波数(Hz)
   * @param Q Qファクタ（0.707でButterworth特性）
   * @param fs サンプリングレート(Hz)
   */
  private applyBiquadHighPass(
    data: number[],
    fc: number,
    Q: number,
    fs: number,
  ): number[] {
    const ω0 = (2 * Math.PI * fc) / fs;
    const α = Math.sin(ω0) / (2 * Q);
    const cosω0 = Math.cos(ω0);
    const a0 = 1 + α;
    return this.applyBiquad(
      data,
      (1 + cosω0) / 2 / a0,
      -(1 + cosω0) / a0,
      (1 + cosω0) / 2 / a0,
      (-2 * cosω0) / a0,
      (1 - α) / a0,
    );
  }

  /**
   * バイクアッドピーキングEQを適用する。
   * @param data 入力データ（論理正規化済み）
   * @param fc 中心周波数(Hz)
   * @param Q Qファクタ
   * @param gainDB ゲイン(dB)
   * @param fs サンプリングレート(Hz)
   */
  private applyBiquadPeakingEQ(
    data: number[],
    fc: number,
    Q: number,
    gainDB: number,
    fs: number,
  ): number[] {
    const A = 10 ** (gainDB / 40);
    const ω0 = (2 * Math.PI * fc) / fs;
    const α = Math.sin(ω0) / (2 * Q);
    const cosω0 = Math.cos(ω0);
    const a0 = 1 + α / A;
    return this.applyBiquad(
      data,
      (1 + α * A) / a0,
      (-2 * cosω0) / a0,
      (1 - α * A) / a0,
      (-2 * cosω0) / a0,
      (1 - α / A) / a0,
    );
  }

  /**
   * 2次IIRフィルタ（バイクアッドフィルタ）を直接形Iで適用する。
   * H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)
   */
  private applyBiquad(
    data: number[],
    b0: number,
    b1: number,
    b2: number,
    a1: number,
    a2: number,
  ): number[] {
    const output = new Array<number>(data.length);
    let x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;
    for (let i = 0; i < data.length; i++) {
      const x0 = data[i];
      const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      output[i] = y0;
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }
    return output;
  }

  /**
   * シュローダーリバーブを適用する。
   * 並列フィードバックコムフィルタ + 直列オールパスフィルタの構成。
   * @param data 入力データ（論理正規化済み）
   * @param fs サンプリングレート(Hz)
   */
  private applySimpleReverb(data: number[], fs: number): number[] {
    const wetGain = 0.25;

    // 並列フィードバックコムフィルタ（シュローダー定数をベースにした遅延時間）
    const combDelaysMs = [29.7, 37.1, 41.1, 43.7];
    const combFeedback = 0.6;
    const reverbSignal = new Array<number>(data.length).fill(0);
    for (const delayMs of combDelaysMs) {
      const delayFrames = Math.round((delayMs / 1000) * fs);
      const combOut = this.applyCombFilter(data, delayFrames, combFeedback);
      for (let i = 0; i < data.length; i++) {
        reverbSignal[i] += combOut[i] / combDelaysMs.length;
      }
    }

    // 直列オールパスフィルタで拡散
    const apDelaysMs = [7.0, 11.0];
    const apFeedback = 0.7;
    let diffused = reverbSignal;
    for (const delayMs of apDelaysMs) {
      const delayFrames = Math.round((delayMs / 1000) * fs);
      diffused = this.applyAllPassFilter(diffused, delayFrames, apFeedback);
    }

    return data.map((v, i) => v + wetGain * diffused[i]);
  }

  /**
   * フィードバックコムフィルタ: y[n] = x[n] + g * y[n-D]
   * @param data 入力データ
   * @param delayFrames 遅延サンプル数
   * @param feedback フィードバックゲイン
   */
  private applyCombFilter(
    data: number[],
    delayFrames: number,
    feedback: number,
  ): number[] {
    const output = new Array<number>(data.length).fill(0);
    const buf = new Array<number>(delayFrames).fill(0);
    for (let i = 0; i < data.length; i++) {
      const idx = i % delayFrames;
      output[i] = data[i] + feedback * buf[idx];
      buf[idx] = output[i];
    }
    return output;
  }

  /**
   * シュローダーオールパスフィルタ: y[n] = -g*x[n] + x[n-D] + g*y[n-D]
   * w[n] = x[n] + g*w[n-D] とおくことで単一バッファで実装。
   * @param data 入力データ
   * @param delayFrames 遅延サンプル数
   * @param feedback フィードバックゲイン
   */
  private applyAllPassFilter(
    data: number[],
    delayFrames: number,
    feedback: number,
  ): number[] {
    const output = new Array<number>(data.length);
    const wBuf = new Array<number>(delayFrames).fill(0);
    for (let i = 0; i < data.length; i++) {
      const idx = i % delayFrames;
      const wDelayed = wBuf[idx];
      const w = data[i] + feedback * wDelayed;
      output[i] = -feedback * w + wDelayed;
      wBuf[idx] = w;
    }
    return output;
  }

  /**
   * 短時間RMSベースのダイナミックゲイン処理とピーク正規化を適用する。
   * 1. 200ms分析窓・50msホップで各時間位置の短時間RMSを算出
   * 2. RMSターゲットに対する差分ゲインを算出（無音区間はゲイン1.0にクランプ）
   * 3. ゲインカーブを指数移動平均で平滑化（時定数500ms）
   * 4. 平滑化済みゲインを各サンプルに適用（ホップ間で線形補間）
   * 5. ピークが ceiling を超える場合は均一ゲイン削減で補正
   * @param dataL Lチャンネル（論理正規化済み）
   * @param dataR Rチャンネル（論理正規化済み）
   * @param targetRMSdB 目標RMSレベル（dBFS）
   * @param ceilingDB ピーク上限 dBFS（例: -1.0）
   * @param fs サンプリングレート（Hz）
   */
  private applyDynamicMastering(
    dataL: number[],
    dataR: number[],
    targetRMSdB: number,
    ceilingDB: number,
    fs: number,
  ): [number[], number[]] {
    const length = dataL.length;
    if (length === 0) return [[], []];

    const rmsWindowFrames = Math.round(0.2 * fs); // 200ms 分析窓
    const hopFrames = Math.round(0.05 * fs); // 50ms ホップ
    const numHops = Math.ceil(length / hopFrames);
    const targetRMSLinear = 10 ** (targetRMSdB / 20);
    const maxGainLinear = 10 ** (20 / 20); // 最大ブースト +20 dB

    // Step 1: プレフィックス二乗和で短時間RMSを効率的に算出
    const prefixSq = new Array<number>(length + 1).fill(0);
    for (let i = 0; i < length; i++) {
      prefixSq[i + 1] = prefixSq[i] + dataL[i] * dataL[i] + dataR[i] * dataR[i];
    }
    const rmsAtHop = new Array<number>(numHops);
    for (let f = 0; f < numHops; f++) {
      const center = f * hopFrames;
      const start = Math.max(0, center - Math.floor(rmsWindowFrames / 2));
      const end = Math.min(length, center + Math.ceil(rmsWindowFrames / 2));
      const sumSq = prefixSq[end] - prefixSq[start];
      rmsAtHop[f] = Math.sqrt(sumSq / (2 * (end - start)));
    }

    // Step 2: 差分ゲインの算出（無音区間は仮に 1.0 を設定）
    const rawGain = rmsAtHop.map((rms) =>
      rms < 1e-10 ? 1.0 : Math.min(maxGainLinear, targetRMSLinear / rms),
    );

    // Step 2b: 無音区間のゲインを後続の有音区間のゲインで上書き
    // 冒頭に無音がある場合、無音→有音の境界ホップでRMSが過小評価されて
    // 大きなゲインが算出されアタックが突出するのを防ぐ。
    let nextValidGain = rawGain[numHops - 1];
    for (let f = numHops - 1; f >= 0; f--) {
      if (rmsAtHop[f] < 1e-10) {
        rawGain[f] = nextValidGain;
      } else {
        nextValidGain = rawGain[f];
      }
    }

    // Step 3: 指数移動平均によるゲインカーブの平滑化（時定数 500ms）
    // 冒頭・末尾は状態0から開始し、相応の長さの0との移動平均として扱う。
    // 前方パス（冒頭側）と後方パス（末尾側）をそれぞれ0から発散させ、
    // 最小値を採ることで冒頭と末尾が自然にゲイン0へ収束する。
    const smoothAlpha = 1 - Math.exp(-hopFrames / (0.5 * fs));

    // 前方パス: 状態0から開始（冒頭を0との移動平均として扱う）
    const forwardGain = new Array<number>(numHops);
    let fState = 0;
    for (let f = 0; f < numHops; f++) {
      fState += smoothAlpha * (rawGain[f] - fState);
      forwardGain[f] = fState;
    }

    // 後方パス: 状態0から逆方向に開始（末尾を0との移動平均として扱う）
    const backwardGain = new Array<number>(numHops);
    let bState = 0;
    for (let f = numHops - 1; f >= 0; f--) {
      bState += smoothAlpha * (rawGain[f] - bState);
      backwardGain[f] = bState;
    }

    // 前方・後方の最小値を採用
    const smoothedGain = forwardGain.map((v, i) =>
      Math.min(v, backwardGain[i]),
    );

    // Step 4: 平滑化済みゲインを適用（ホップ間は線形補間）
    const outL = new Array<number>(length);
    const outR = new Array<number>(length);
    for (let i = 0; i < length; i++) {
      const frac = i / hopFrames;
      const f0 = Math.floor(frac);
      const f1 = Math.min(f0 + 1, numHops - 1);
      const t = frac - f0;
      const gain = smoothedGain[f0] * (1 - t) + smoothedGain[f1] * t;
      outL[i] = dataL[i] * gain;
      outR[i] = dataR[i] * gain;
    }

    // Step 5: ピーク正規化（ceiling に揃える）
    // ピークが ceiling を超える場合は削減、下回る場合はブーストして常に -1.0 dBFS 付近に収める。
    const ceiling = 10 ** (ceilingDB / 20);
    let peak = 0;
    for (let i = 0; i < length; i++) {
      if (Math.abs(outL[i]) > peak) peak = Math.abs(outL[i]);
      if (Math.abs(outR[i]) > peak) peak = Math.abs(outR[i]);
    }
    if (peak < 1e-10) return [outL, outR];
    const normGain = ceiling / peak;
    return [outL.map((v) => v * normGain), outR.map((v) => v * normGain)];
  }
}
