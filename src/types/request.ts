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
export type WithFrq = {
  /** frqDataの有無 */
  withFrq: true;
  /** 入力wavの基準周波数データ */
  frqData: Float64Array;
  /** 入力wavの音量列データ */
  ampData: Float64Array;
  /** 平均周波数 */
  frqAverage: number;
};

export type WithoutFrq = {
  /** frqDataの有無 */
  withFrq: false;
};
export type ResampWorkerRequest = {
  /** 入力wavデータ */
  inputWavData: Float64Array;
  /** 入力wavの基準周波数データ */
  frqData: Float64Array;
  /** 入力wavの音量列データ */
  ampData: Float64Array;
  /** 平均周波数 */
  frqAverage: number;
} & ResampRequest &
  (WithFrq | WithoutFrq);

export type AppendRequestBase = {
  /** 音源ルートから入力wavまでの相対パス */
  inputWav?: string;
  /** stp値(ms) */
  stp: number;
  /** 出力長(ms) */
  length: number;
  /** エンベロープ値 */
  envelope: { point: Array<number>; value: Array<number> };
  /** オーバーラップ値 */
  overlap: number;
};

export type AppendRequest = {
  /** 入力するwav波形データ */
  inputData: Array<number>;
} & AppendRequestBase;
