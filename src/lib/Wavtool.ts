import type { Wave } from "utauwav";
import { GenerateWave, WaveProcessing } from "utauwav";
import { renderingConfig } from "../config/rendering";
import type { AppendRequest } from "../types/request";

export class Wavtool {
  /** 波形データ */
  private _data: Array<number>;

  /**
   * resampが出力したwavを結合して1つのwavにして返す。
   */
  constructor() {
    this._data = new Array();
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
      stpFrames + lengthFrames
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
    envelope: { point: Array<number>; value: Array<number> }
  ): { framePoint: Array<number>; value: Array<number> } {
    const sortedPoint = new Array<number>();
    if (envelope.point[0] !== 0) {
      sortedPoint.push(0);
    }
    sortedPoint.push(envelope.point[0]);
    sortedPoint.push(envelope.point[0] + envelope.point[1]);
    if (envelope.point.length === 5) {
      sortedPoint.push(
        envelope.point[0] + envelope.point[1] + envelope.point[4]
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
      Math.floor((renderingConfig.frameRate * p) / 1000)
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
    envelope: { framePoint: Array<number>; value: Array<number> }
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
        Math.ceil(checkedOverlapFrames - this._data.length)
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
      wp.InverseLogicalNormalize(this._data, renderingConfig.depth)
    );
    return wav.Output();
  }

  /** 伴奏データをmixする */
  mixBackgroundAudio(
    backgroundWav: Wave,
    offsetMs: number,
    volume: number
  ): void {
    const wp = new WaveProcessing();

    const offsetFrames = Math.floor(
      (offsetMs / 1000) * renderingConfig.frameRate
    );

    /** 伴奏wavの読み込み開始位置（正の場合は0に補正） */
    const backgroundStartFrame = Math.max(0, offsetFrames);
    /** this._dataへの書き込み開始位置（正の場合は0に補正） */
    const dataStartFrame = Math.max(0, -offsetFrames);
    /** 合成する長さ */
    const mixLength = Math.min(
      this._data.length - dataStartFrame,
      backgroundWav.data.length - backgroundStartFrame
    );

    if (mixLength <= 0) return;

    /** 伴奏データのLchの正規化。必要範囲のみ */
    const backgroundData = wp.LogicalNormalize(
      backgroundWav.data.slice(
        backgroundStartFrame,
        backgroundStartFrame + mixLength
      ),
      backgroundWav.bitDepth
    );
    /** 伴奏データのRchがある場合、正規化しLchと平均を取る形でモノラルにする */
    if (backgroundWav.rData) {
      const rData = wp.LogicalNormalize(
        backgroundWav.rData.slice(
          backgroundStartFrame,
          backgroundStartFrame + mixLength
        ),
        backgroundWav.bitDepth
      );
      backgroundData.forEach(
        (v, i) => (backgroundData[i] = (v + rData[i]) / 2)
      );
    }

    /** 音量を考慮しながらmixダウンする。 */
    for (let i = 0; i < mixLength; i++) {
      this._data[dataStartFrame + i] += backgroundData[i] * volume;
    }
  }
}
