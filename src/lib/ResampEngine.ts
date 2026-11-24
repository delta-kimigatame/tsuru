/**
 * @module ResampEngine
 * @description
 * resampエンジンを名前から生成するモジュール。
 * worker側とservice側はここ経由でエンジンを生成する。
 * 各エンジンは動的importで必要なときに読み込む。
 */

import type { ResampBase } from "./ResampBase";
import type { BaseVoiceBank } from "./VoiceBanks/BaseVoiceBank";

export type ResampEngineName = "resamp" | "fave";

/** 既定のresampエンジン */
export const DEFAULT_RESAMP_ENGINE: ResampEngineName = "fave";

/**
 * 指定したエンジンのインスタンスを生成する。
 * @param name エンジン名
 * @param vb 音源
 */
export const createResampEngine = async (
  name: ResampEngineName,
  vb: BaseVoiceBank = null,
): Promise<ResampBase> => {
  switch (name) {
    case "resamp": {
      const { Resamp } = await import("./Resamp");
      return new Resamp(vb);
    }
    case "fave": {
      const { Fave } = await import("./FaveResamp");
      return new Fave(vb);
    }
    default:
      throw new Error(`未知のresampエンジンです: ${String(name)}`);
  }
};
