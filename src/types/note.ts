export type defaultParam = {
  /** 子音速度 */
  velocity: number;
  /** 音量 */
  intensity: number;
  /** モジュレーション */
  modulation: number;
  /** エンベロープ */
  envelope: { point: Array<number>; value: Array<number> };
};
