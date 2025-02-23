export type ResampRequest = {
  /** 音源ルートから入力wavまでの相対パス */
  inputWav: string;
  /** 音高 */
  targetTone: string;
  /** 子音速度 */
  velocity: number;
  /** フラグ */
  flags: string;
  /** 原音設定における左ブランク */
  offsetMs: number;
  /** resampが出力するwavの長さ */
  targetMs: number;
  /** 原音設定における固定範囲 */
  fixedMs: number;
  /** 原音設定における右ブランク */
  cutoffMs: number;
  /** 音量 */
  intensity: number;
  /** モジュレーション */
  modulation: number;
  /** BPM。!から始まる文字列 */
  tempo: string;
  /** -2048 ～ 2047のピッチの値列をBas64エンコードしてランレングス圧縮したもの */
  pitches: string;
};

export type AppendRequest = {
  /** 入力するwav波形データ */
  inputData: Array<number>;
  /** stp値(ms) */
  stp: number;
  /** 出力長(ms) */
  length: number;
  /** エンベロープ値 */
  envelope: { point: Array<number>; value: Array<number> };
  /** オーバーラップ値 */
  overlap: number;
};
