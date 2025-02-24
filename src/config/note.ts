import { defaultParam } from "../types/note";

export const defaultNote: defaultParam = {
  /** 子音速度 */
  velocity: 100,
  /** 音量 */
  intensity: 100,
  /** モジュレーション */
  modulation: 0,
  /** エンベロープ */
  envelope: { point: [0, 5, 35], value: [0, 100, 100, 0] },
};
