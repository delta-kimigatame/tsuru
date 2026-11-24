import { renderingConfig } from "../config/rendering";
import type { ResampWorkerRequest } from "../types/request";
import type { BaseVoiceBank } from "./VoiceBanks/BaseVoiceBank";

export type FrqDataResult = {
  frq: Array<number>;
  amp: Array<number>;
  timeAxis: Array<number>;
  frqAverage: number;
};

export abstract class ResampBase {
  vb: BaseVoiceBank;

  constructor(vb: BaseVoiceBank = null) {
    this.vb = vb;
  }

  abstract initialize(): Promise<void>;

  abstract resampWorker(request: ResampWorkerRequest): Float64Array;

  /**
   * wavデータを読み込みLogicalNormalizeして返す
   * @param inputWav 音源ルートからwavファイルへの相対パス
   * @param offsetMs 原音設定の左ブランク
   * @param cutoffMs 原音設定の右ブランク
   */
  async getWaveData(
    inputWav: string,
    offsetMs: number,
    cutoffMs: number,
  ): Promise<Array<number>> {
    const wavData = await this.vb.getWave(inputWav);
    const offsetFrame = Math.floor(
      (renderingConfig.frameRate * offsetMs) / 1000,
    );
    const cutoff =
      cutoffMs < 0
        ? offsetMs - cutoffMs
        : (wavData.data.length / wavData.sampleRate) * 1000 - cutoffMs;
    const cutoffFrame = Math.floor((renderingConfig.frameRate * cutoff) / 1000);
    return wavData.LogicalNormalize(1).slice(offsetFrame, cutoffFrame);
  }

  /**
   * frqデータを読み込み、エンジンが解釈できる形式で返す
   * @param inputWav 音源ルートからwavファイルへの相対パス
   * @param offsetMs 原音設定の左ブランク
   * @param wavMs 読み込んだwavの長さ
   */
  abstract getFrqData(
    inputWav: string,
    offsetMs: number,
    wavMs: number,
  ): Promise<FrqDataResult>;
}
