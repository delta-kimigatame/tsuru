/**
 * ustにおけるNoteを扱う。
 * 極力本家UTAUに沿った実装とするが、Voice Colorを活用するための拡張を行う。
 */

import type { VoiceBank } from "./VoiceBanks/VoiceBank";

export class Note {
  /** 楽譜の先頭からみたnoteのindex */
  index: number;
  /** tick値で与えられるノートの長さ */
  private _length: number;
  /** 入力された歌詞 */
  private _lyric: string;
  /** 音高。C4が60、B7が107 */
  private _notenum: number;
  /** bpm */
  private _tempo: number;
  hasTempo: boolean;
  /** 先行発声 */
  private _preutter: number;
  /** オーバーラップ */
  private _overlap: number;
  /** 原音設定から読み込んだ先行発声 */
  private otoPreutter: number;
  /** 原音設定から読み込んだオーバーラップ */
  private otoOverlap: number;
  /** stp */
  private _stp: number;
  /** 自動調整適用後の先行発声 */
  private _atPreutter: number;
  /** 自動調整適用後のオーバーラップ */
  private _atOverlap: number;
  /** 自動調整適用後のstp */
  private _atStp: number;
  /** 自動調整適用後のエイリアス */
  private _atAlias: string;
  /** ファイル名 */
  private _atFilename: string;
  /** 子音速度 */
  private _velocity: number;
  /** 音量 */
  private _intensity: number;
  /** モジュレーション */
  private _modulation: number;
  /** mode1ピッチ列。5tickに1つの間隔で与えられる */
  private _pitches: Array<number>;
  /** ノート頭からみてmode1ピッチが何msから始まるか */
  pbStart: number;
  /** mode2ピッチの始点 */
  private _pbs: {
    /** ms */
    time: number;
    /** cent */
    height: number;
  };
  /** mode2ピッチ制御点の音高列。制御点の数-2個(最初と最後を除く)与えられる。単位はcent */
  private _pby: Array<number>;
  /** mode2のピッチの制御点どおしの間隔を表す時間列。制御点の数-1個与えられる。単位はms */
  private _pbw: Array<number>;
  /** mode2のピッチの制御点どおしをどのように補完するかを表す値列。制御点の数-1個与えられる。*/
  private _pbm: Array<"" | "s" | "r" | "j">;
  /** エンベロープ */
  private _envelope: { point: Array<number>; value: Array<number> };
  /** ビブラート */
  private _vibrato: {
    /** ノート長に対するビブラートの割合 */
    length: number;
    /** ビブラートにおけるsin派1周にかかる時間(ms) */
    cycle: number;
    /** ビブラートのsin派の高さ(cent) */
    depth: number;
    /** ビブラートの波の大きさが最大になるまでの時間をビブラート全体の長さに対する割合で指定 */
    fadeInTime: number;
    /** ビブラートの波の大きさが0になるまでの時間をビブラート全体の長さに対する割合で指定 */
    fadeOutTime: number;
    /** sin派の位相が一周の何%ずれているか */
    phase: number;
    /** 0のとき波の中心が、-100のとき波の頂点が0に、100のとき波の底が0となるような割合 */
    height: number;
  };
  /** ラベル */
  label: string;
  /** resamplerを経由せず直接wavtoolを使用する */
  direct: boolean;
  /** 「選択範囲に名前を付ける」でつけた名前の開始位置 */
  region: string;
  /** 「選択範囲に名前を付ける」でつけた名前の終了位置*/
  regionEnd: string;
  /** このノートに適用されるフラグ */
  flags: string;
  /** 本家UTAUにはない拡張。OpenUtauのVoiceColor値 */
  voiceColor: string;
  /** 1つ前のノートへの参照 */
  prev: Note;
  /** 1つ次のノートへの参照 */
  next: Note;

  /** tick値で与えられるノートの長さ */
  get length(): number {
    return this._length;
  }

  /**
   * tick値で与えられるノートの長さ。正の整数
   */
  set length(value: number) {
    this._length = Math.max(Math.floor(value), 0);
  }

  get lyric(): string {
    return this._lyric;
  }

  set lyric(value: string) {
    this._lyric = value;
    if (
      this.next !== undefined &&
      this.tempo !== undefined &&
      this.length !== undefined
    ) {
      this.next.AutoFitParam();
    }
  }

  /** 音高。C4が60、B7が107 */
  get notenum(): number {
    return this._notenum;
  }

  /** 音高。24(C1)～107(B7)までの整数 */
  set notenum(value: number) {
    this._notenum = Math.max(Math.min(Math.floor(value), 107), 24);
  }

  /** bpm */
  get tempo(): number {
    return this._tempo;
  }

  /** bpm 10～512の浮動小数*/
  set tempo(value: number) {
    this._tempo = Math.max(Math.min(value, 512), 10);
  }

  /** 先行発声の入力値 */
  get preutter(): number {
    return this._preutter;
  }

  /** 先行発声の入力値 */
  set preutter(value: number) {
    this._preutter = Math.max(value, 0);
    this.AutoFitParam();
  }
  /** オーバーラップの入力値 */
  get overlap(): number {
    return this._overlap;
  }

  /** オーバーラップの入力値 */
  set overlap(value: number) {
    this._overlap = value;
    this.AutoFitParam();
  }

  /** stpの入力値 */
  get stp(): number {
    return this._stp;
  }

  /** stpの入力値。正の数 */
  set stp(value: number) {
    this._stp = Math.max(value, 0);
    this.AutoFitParam();
  }

  /** 自動調整や子音速度適用後の実際の先行発声 */
  get atPreutter(): number {
    return this._atPreutter;
  }

  /** 自動調整や子音速度適用後の実際のオーバーラップ */
  get atOverlap(): number {
    return this._atOverlap;
  }

  /** 自動調整や子音速度適用後の実際のstp */
  get atStp(): number {
    return this._atStp;
  }

  /** prefix.map適用後のエイリアス */
  get atAlias(): string {
    return this._atAlias;
  }

  /** ファイル名 */
  get atFilename(): string {
    return this._atFilename;
  }

  /** 子音速度 */
  get velocity(): number {
    return this._velocity;
  }

  /** 子音速度。0～200の整数 */
  set velocity(value: number) {
    this._velocity = Math.max(Math.min(Math.floor(value), 200), 0);
    this.AutoFitParam();
  }

  /** 音量 */
  get intensity(): number {
    return this._intensity;
  }

  /** 音量。0～200の整数 */
  set intensity(value: number) {
    this._intensity = Math.max(Math.min(Math.floor(value), 200), 0);
  }

  /** モジュレーション */
  get modulation(): number {
    return this._modulation;
  }

  /** モジュレーション。-200～200の整数 */
  set modulation(value: number) {
    this._modulation = Math.max(Math.min(Math.floor(value), 200), -200);
  }
  /** mode1ピッチ列。5tickに1つの間隔で与えられる */
  get pitches(): Array<number> {
    return this._pitches;
  }

  /**
   * mode1ピッチ列。,で繋げた文字列をとる
   */
  set pitches(value: string) {
    this._pitches = value
      .split(",")
      .map((v) => Math.max(Math.min(parseInt(v), 2047), -2048));
  }

  /**
   * 配列を与えてmode1ピッチを更新する
   * @param value
   */
  SetPitches(value: Array<number>):void {
    this._pitches = value.map((v) =>
      Math.max(Math.min(Math.floor(v), 2047), -2048),
    );
  }

  /**
   * mode2ピッチの始点
   */
  get pbs(): { time: number; height: number } {
    return this._pbs;
  }

  /**
   * mode2ピッチの始点。`time`|`time,height`|`time,height`のいずれかの形式をとる
   */
  set pbs(value: string) {
    const v = value.replace(",", ";");
    if (v.includes(";")) {
      const [time, height] = value.replace(",", ";").split(";");
      this._pbs = {
        time: parseFloat(time),
        height: Math.min(Math.max(parseFloat(height), -200), 200),
      };
    } else {
      this._pbs = { time: parseFloat(value), height: 0 };
    }
  }

  /**
   * mode2ピッチ始点の長さ(ms)
   */
  set pbsTime(value: number) {
    if (this.pbs === undefined) {
      this._pbs = { time: value, height: 0 };
    } else {
      this._pbs.time = value;
    }
  }

  /**
   * mode2ピッチ始点の音高(cent)
   */
  set pbsHeight(value: number) {
    if (this.pbs === undefined) {
      this._pbs = { time: 0, height: Math.min(Math.max(value, -200), 200) };
    } else {
      this._pbs.height = Math.min(Math.max(value, -200), 200);
    }
  }

  /**
   * mode2ピッチの音高列
   */
  get pby(): Array<number> {
    return this._pby;
  }

  /**
   * mode2ピッチの音高列。,でつなげた文字列を与える
   */
  set pby(value: string) {
    this._pby = value
      .split(",")
      .map((v) => Math.min(Math.max(parseFloat(v), -200), 200));
  }

  /**
   * mode2ピッチの音高列
   */
  SetPby(value: Array<number>):void {
    this._pby = value.map((v) => Math.min(Math.max(v, -200), 200));
  }

  /**
   * mode2ピッチの間隔
   */
  get pbw(): Array<number> {
    return this._pbw;
  }

  /**
   * mode2ピッチの間隔。,で繋げた文字列
   */
  set pbw(value: string) {
    this._pbw = value.split(",").map((v) => Math.max(parseFloat(v), 0));
  }

  /**
   * mode2ピッチの間隔
   */
  SetPbw(value: Array<number>):void {
    this._pbw = value.map((v) => Math.max(v, 0));
  }

  /**
   * mode2ピッチの補間方法
   */
  get pbm(): Array<"" | "s" | "r" | "j"> {
    return this._pbm;
  }

  /**
   * mode2ピッチの補間方法を,で繋げた文字列
   */
  set pbm(value: string) {
    this._pbm = value
      .split(",")
      .map((s) => (["", "s", "r", "j"].includes(s) ? s : "")) as Array<
      "" | "s" | "r" | "j"
    >;
  }

  /**
   * mode2ピッチの補間方法
   */
  SetPbm(value: Array<"" | "s" | "r" | "j">):void {
    this._pbm = value;
  }

  /**
   * エンベロープ
   */
  get envelope(): { point: Array<number>; value: Array<number> } {
    return this._envelope;
  }

  /**
   * エンベロープ。`p1,p2,[p3,v1,v2,v3,[v4,[ove,[p4,[p5,v5]]]]]`の形で与える。
   */
  set envelope(value: string) {
    const tmp = value.split(",");
    const p = new Array<number>();
    const v = new Array<number>();
    tmp.forEach((s, i) => {
      if ([0, 1, 2, 8, 9].includes(i)) {
        p.push(Math.max(parseFloat(s), 0));
      } else if ([3, 4, 5, 6, 10].includes(i)) {
        v.push(Math.min(Math.max(parseInt(s), 0), 200));
      }
    });
    this._envelope = { point: p, value: v };
  }

  /**
   * エンベロープ。
   */
  SetEnvelope(value: { point: Array<number>; value: Array<number> }):void {
    this._envelope = {
      point: value.point.map((v) => Math.max(v, 0)),
      value: value.value.map((v) => Math.min(Math.max(v, 0), 200)),
    };
  }

  /**
   * ビブラート
   */
  get vibrato(): {
    /** ノート長に対するビブラートの割合 */
    length: number;
    /** ビブラートにおけるsin派1周にかかる時間(ms) */
    cycle: number;
    /** ビブラートのsin派の高さ(cent) */
    depth: number;
    /** ビブラートの波の大きさが最大になるまでの時間をビブラート全体の長さに対する割合で指定 */
    fadeInTime: number;
    /** ビブラートの波の大きさが0になるまでの時間をビブラート全体の長さに対する割合で指定 */
    fadeOutTime: number;
    /** sin派の位相が一周の何%ずれているか */
    phase: number;
    /** 0のとき波の中心が、-100のとき波の頂点が0に、100のとき波の底が0となるような割合 */
    height: number;
    } {
    return this._vibrato;
  }

  /**
   * ビブラートを`length,cycle,depth,fadeInTime,fadeOutTime,phase,height,amp`の文字列で与える。
   */
  set vibrato(value: string) {
    const [length, cycle, depth, fadeInTime, fadeOutTime, phase, height] =
      value.split(",").map((v) => parseFloat(v));
    this._vibrato = {
      length: Math.min(Math.max(length, 0), 100),
      cycle: Math.min(Math.max(cycle, 64), 512),
      depth: Math.min(Math.max(depth, 5), 200),
      fadeInTime: Math.min(Math.max(fadeInTime, 0), 100),
      fadeOutTime: Math.min(Math.max(fadeOutTime, 0), 100),
      phase: Math.min(Math.max(phase, -100), 100),
      height: Math.min(Math.max(height, -100), 100),
    };
  }

  /** ノート長に対するビブラートの割合 */
  set vibratoLength(value: number) {
    this._vibrato.length = Math.min(Math.max(value, 0), 100);
  }
  /** ビブラートにおけるsin派1周にかかる時間(ms) */
  set vibratoCycle(value: number) {
    this.vibrato.cycle = Math.min(Math.max(value, 64), 512);
  }
  /** ビブラートのsin派の高さ(cent) */
  set vibratoDepth(value: number) {
    this.vibrato.depth = Math.min(Math.max(value, 5), 200);
  }
  /** ビブラートの波の大きさが最大になるまでの時間をビブラート全体の長さに対する割合で指定 */
  set vibratoFadeInTime(value: number) {
    this._vibrato.fadeInTime = Math.min(Math.max(value, 0), 100);
  }
  /** ビブラートの波の大きさが0になるまでの時間をビブラート全体の長さに対する割合で指定 */
  set vibratoFadeOutTime(value: number) {
    this._vibrato.fadeOutTime = Math.min(Math.max(value, 0), 100);
  }

  /** sin派の位相が一周の何%ずれているか */
  set vibratoPhase(value: number) {
    this._vibrato.phase = Math.min(Math.max(value, -100), 100);
  }

  /** 0のとき波の中心が、-100のとき波の頂点が0に、100のとき波の底が0となるような割合 */
  set vibratoHeight(value: number) {
    this._vibrato.height = Math.min(Math.max(value, -100), 100);
  }

  /**
   * ノート長をmsで返す。
   * @throws ノート長かテンポが設定されていない場合
   */
  get msLength(): number {
    if (this._length === undefined) {
      throw new Error("length is not initial.");
    } else if (this._tempo === undefined) {
      throw new Error("tempo is not initial.");
    }
    return (((60 / this._tempo) * this._length) / 480) * 1000;
  }

  /**
   * 子音速度による固定範囲の伸縮率
   */
  get velocityRate(): number {
    if (this._velocity === undefined) {
      return 1;
    } else {
      return 2 ** ((100 - this._velocity) / 100);
    }
  }

  /**
   * ustにおけるNoteを扱う。
   * 極力本家UTAUに沿った実装とするが、Voice Colorを活用するための拡張を行う。
   */
  constructor() {}

  /**
   * 原音設定値を読み込んでatPre,atOve,atStp,atAlias,atFileNameを更新する。
   * @param vb UTAU音源
   * @throws lyricもしくはnotenumが初期化されていない場合
   */
  ApplyOto(vb: VoiceBank): void {
    if (this._lyric === undefined) {
      throw new Error("lyric is not initial.");
    } else if (this._notenum === undefined) {
      throw new Error("notenum is not initial.");
    }
    const record = vb.GetOtoRecord(
      this._lyric,
      this.notenum,
      this.voiceColor ? this.voiceColor : "",
    );
    if (record === null) {
      this.otoPreutter = 0;
      this.otoOverlap = 0;
      this._atAlias = "R";
      this._atFilename = "";
    } else {
      this.otoPreutter = record.pre;
      this.otoOverlap = record.overlap;
      this._atAlias = record.alias;
      this._atFilename =
        record.dirpath + (record.dirpath !== "" ? "/" : "") + record.filename;
    }
    this.AutoFitParam();
  }

  /**
   * pre,ove,stp,velocity,prev.length,prev.tempoを勘案して、atpre,atove,atstpを更新します。
   * @throws prev.length,prev.lyric,prev.tempoのいずれかが未定義の場合
   */
  AutoFitParam(): void {
    const rate = this.velocityRate;
    if (this.prev === undefined) {
      this._atPreutter =
        this._preutter !== undefined
          ? this._preutter * rate
          : this.otoPreutter * rate;
      this._atOverlap =
        this._overlap !== undefined
          ? this._overlap * rate
          : this.otoOverlap * rate;
      this._atStp = this.stp !== undefined ? this.stp : 0;
      return;
    }
    if (this.prev.length === undefined) {
      throw new Error("prev length is not initial.");
    } else if (this.prev.tempo === undefined) {
      throw new Error("prev tempo is not initial.");
    } else if (this.prev._lyric === undefined) {
      throw new Error("prev lyric is not initial.");
    }
    const prevMsLength =
      this.prev.msLength * (this.prev._lyric === "R" ? 1 : 0.5);
    const realPreutter =
      (this._preutter !== undefined ? this._preutter : this.otoPreutter) * rate;
    const realOverlap =
      (this._overlap !== undefined ? this._overlap : this.otoOverlap) * rate;
    const realStp = this.stp !== undefined ? this.stp : 0;

    if (prevMsLength < realPreutter - realOverlap) {
      this._atPreutter =
        (realPreutter / (realPreutter - realOverlap)) * prevMsLength;
      this._atOverlap =
        (realOverlap / (realPreutter - realOverlap)) * prevMsLength;
      this._atStp = realPreutter - this._atPreutter + realStp;
    } else {
      this._atPreutter = realPreutter;
      this._atOverlap = realOverlap;
      this._atStp = realStp;
    }
  }
}
