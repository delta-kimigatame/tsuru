import type { ResampEngineName } from "../lib/ResampEngine";
import type { FlagKeys } from "../utils/parseFlags";

/**
 * ヘルプ表示用の、各resampエンジンが解釈するフラグ一覧。
 * エンジン本体(Resamp.flagKeys / Fave.flagKeys)と同じ内容を保つこと。
 * エンジン本体をimportするとWORLD等がメインバンドルに含まれるため、ここに静的に持つ。
 * 一致は __tests__/config/resamplerFlags.test.ts で検証する。
 */
export const RESAMPLER_FLAGS: Record<ResampEngineName, FlagKeys[]> = {
  resamp: [
    { name: "G", type: "bool", default: undefined },
    { name: "g", type: "number", min: -100, max: 100, default: 0 },
    { name: "B", type: "number", min: 0, max: 100, default: 50 },
    { name: "t", type: "number", min: -100, max: 100, default: 0 },
    { name: "P", type: "number", min: 0, max: 100, default: 86 },
    { name: "e", type: "bool", default: undefined },
    { name: "w", type: "number", min: 0, max: 100, default: 0 },
    { name: "O", type: "number", min: -100, max: 100, default: 0 },
    { name: "T", type: "number", min: -100, max: 100, default: 0 },
    { name: "S", type: "number", min: -100, max: 100, default: 0 },
    { name: "b", type: "number", min: -100, max: 100, default: 0 },
    { name: "Mo", type: "number", min: -100, max: 100, default: 0, alias: "O" },
    { name: "Mt", type: "number", min: -100, max: 100, default: 0, alias: "T" },
    { name: "MG", type: "number", min: -100, max: 100, default: 0, alias: "w" },
    { name: "ME", type: "number", min: -100, max: 100, default: 0, alias: "S" },
  ],
  fave: [
    { name: "G", type: "bool", default: undefined },
    { name: "g", type: "number", min: -100, max: 100, default: 0 },
    { name: "B", type: "number", min: 0, max: 100, default: 50 },
    { name: "O", type: "number", min: -100, max: 100, default: 0 },
    { name: "T", type: "number", min: -100, max: 100, default: 0 },
    { name: "S", type: "number", min: -100, max: 100, default: 0 },
    { name: "b", type: "number", min: -100, max: 100, default: 0 },
    { name: "H", type: "number", min: 0, max: 100, default: 0 },
    { name: "t", type: "number", min: -100, max: 100, default: 0 },
    { name: "P", type: "number", min: 0, max: 100, default: 86 },
    { name: "w", type: "number", min: 0, max: 100, default: 0 },
    { name: "N", type: "bool", default: undefined },
    { name: "s", type: "number", min: 0, max: 100, default: 20 },
    { name: "Mo", type: "number", min: -100, max: 100, default: 0, alias: "O" },
    { name: "Mt", type: "number", min: -100, max: 100, default: 0, alias: "T" },
    { name: "MG", type: "number", min: -100, max: 100, default: 0, alias: "w" },
    { name: "ME", type: "number", min: -100, max: 100, default: 0, alias: "S" },
  ],
};
