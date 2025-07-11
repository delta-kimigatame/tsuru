/**
 * ustにおけるNoteを扱う。
 * 極力本家UTAUに沿った実装とするが、Voice Colorを活用するための拡張を行う。
 */

import type OtoRecord from "utauoto/dist/OtoRecord";
import type { defaultParam } from "../types/note";
import type { AppendRequestBase, ResampRequest } from "../types/request";
import { makeTimeAxis } from "../utils/interp";
import { BasePhonemizer } from "./BasePhonemizer";
import { DefaultPhonemizer } from "./Phonemizer/DefaultPhonemizer";
import type { BaseVoiceBank } from "./VoiceBanks/BaseVoiceBank";

export class Note {
  /** 楽譜の先頭からみたnoteのindex */
  index: number;
  /** tick値で与えられるノートの長さ */
  private _length: number;
  /** 入力された歌詞 */
  private _lyric: string;
  /** 入力されたエイリアスに基づいた原音設定データ */
  private _oto: OtoRecord;
  /** 音高。C4が60、B7が107 */
  private _notenum: number;
  /** bpm */
  private _tempo: number;
  /** tempoのパラメータをこのノートが持っているかを表す。 */
  hasTempo: boolean;
  /** 先行発声 */
  private _preutter: number;
  /** オーバーラップ */
  private _overlap: number;
  /** 原音設定から読み込んだ先行発声 */
  private _otoPreutter: number;
  /** 原音設定から読み込んだオーバーラップ */
  private _otoOverlap: number;
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

  private _phonemizer: BasePhonemizer;

  set phonemizer(phonemizer: BasePhonemizer) {
    this._phonemizer = phonemizer;
  }

  get phonemizer(): BasePhonemizer {
    return this._phonemizer;
  }

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
    this._oto = undefined;
    if (
      this.next !== undefined &&
      this.tempo !== undefined &&
      this.length !== undefined
    ) {
      this.next.autoFitParam();
    }
  }

  /** 音高。C4が60、B7が107 */
  get notenum(): number {
    return this._notenum;
  }

  /** 音高。24(C1)～107(B7)までの整数 */
  set notenum(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
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
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
    this._preutter = Math.max(value, 0);
    this.autoFitParam();
  }
  /** オーバーラップの入力値 */
  get overlap(): number {
    return this._overlap;
  }

  /** オーバーラップの入力値 */
  set overlap(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
    this._overlap = value;
    this.autoFitParam();
  }

  /** stpの入力値 */
  get stp(): number {
    return this._stp;
  }

  /** stpの入力値。正の数 */
  set stp(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
    this._stp = Math.max(value, 0);
    this.autoFitParam();
  }

  /** 自動調整や子音速度適用後の実際の先行発声 */
  get atPreutter(): number {
    return this._atPreutter;
  }
  set atPreutter(atPreutter: number) {
    this._atPreutter = atPreutter;
  }

  /** 自動調整や子音速度適用後の実際のオーバーラップ */
  get atOverlap(): number {
    return this._atOverlap;
  }
  set atOverlap(atOverlap: number) {
    this._atOverlap = atOverlap;
  }

  /** 自動調整や子音速度適用後の実際のstp */
  get atStp(): number {
    return this._atStp;
  }

  set atStp(atStp: number) {
    this._atStp = atStp;
  }

  /** prefix.map適用後のエイリアス */
  get atAlias(): string {
    return this._atAlias;
  }

  set atAlias(atAlias: string) {
    this._atAlias = atAlias;
  }

  /** ファイル名 */
  get atFilename(): string {
    return this._atFilename;
  }

  set atFilename(atFilename: string) {
    this._atFilename = atFilename;
  }

  /** 子音速度 */
  get velocity(): number {
    return this._velocity;
  }

  /** 子音速度。0～200の整数 */
  set velocity(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
    this._velocity = Math.max(Math.min(Math.floor(value), 200), 0);
    this.autoFitParam();
  }

  /** 音量 */
  get intensity(): number {
    return this._intensity;
  }

  /** 音量。0～200の整数 */
  set intensity(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
    this._intensity = Math.max(Math.min(Math.floor(value), 200), 0);
  }

  /** モジュレーション */
  get modulation(): number {
    return this._modulation;
  }

  /** モジュレーション。-200～200の整数 */
  set modulation(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      // 異常値の場合は何もしない
      return;
    }
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
  setPitches(value: Array<number>): void {
    this._pitches = value.map((v) =>
      Math.max(Math.min(Math.floor(v), 2047), -2048)
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
        time: Number.isNaN(time) ? 0 : parseFloat(time),
        height: Math.min(Math.max(parseFloat(height), -200), 200),
      };
    } else {
      this._pbs = {
        time: Number.isNaN(parseFloat(value)) ? 0 : parseFloat(value),
        height: 0,
      };
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
  setPby(value: Array<number>): void {
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
  setPbw(value: Array<number>): void {
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
  setPbm(value: Array<"" | "s" | "r" | "j">): void {
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
  setEnvelope(
    value: { point: Array<number>; value: Array<number> } | undefined
  ): void {
    if (value === undefined) {
      this._envelope = undefined;
      return;
    }
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
  set vibrato(value: string | undefined) {
    if (value === undefined) {
      this._vibrato = undefined;
      return;
    }
    const [length, cycle, depth, fadeInTime, fadeOutTime, phase, height] = value
      .split(",")
      .map((v) => parseFloat(v));
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
  constructor() {
    this.phonemizer = new DefaultPhonemizer();
  }

  /**
   * 原音設定値を読み込んでatPre,atOve,atStp,atAlias,atFileNameを更新する。
   * @param vb UTAU音源
   * @throws lyricもしくはnotenumが初期化されていない場合
   */
  applyOto(vb: BaseVoiceBank): void {
    this.phonemizer.applyOto(this, vb);
    this.autoFitParam();
  }

  get oto(): OtoRecord {
    return this._oto;
  }

  set oto(oto: OtoRecord) {
    this._oto = oto;
  }

  set otoPreutter(otoPreutter: number) {
    this._otoPreutter = otoPreutter;
  }

  get otoPreutter(): number {
    return this._otoPreutter;
  }

  set otoOverlap(otoOverlap: number) {
    this._otoOverlap = otoOverlap;
  }

  get otoOverlap(): number {
    return this._otoOverlap;
  }

  /**
   * pre,ove,stp,velocity,prev.length,prev.tempoを勘案して、atpre,atove,atstpを更新します。
   * @throws prev.length,prev.lyric,prev.tempoのいずれかが未定義の場合
   */
  autoFitParam(): void {
    this.phonemizer.autoFitParam(this);
  }

  /**
   * wavtoolが出力する際のノートの長さ
   */
  get outputMs(): number {
    if (this.next === undefined || this.next.lyric === "R") {
      return this.msLength + (this.atPreutter ? this.atPreutter : 0);
    } else {
      return (
        this.msLength +
        (this.atPreutter ? this.atPreutter : 0) -
        (this.next.atPreutter ? this.next.atPreutter : 0) +
        (this.next.atOverlap ? this.next.atOverlap : 0)
      );
    }
  }
  /**
   * resamplerが出力するノートの長さ
   */
  get targetLength(): number {
    return (
      (Math.round((this.outputMs + (this.atStp ? this.atStp : 0)) / 50) + 1) *
      50
    );
  }

  /**
   * ピッチ間隔。5tick分の長さ(s)
   */
  get pitchSpan(): number {
    return (60 / this.tempo / 480) * 5;
  }

  getRenderPitch(): Array<number> {
    const offset =
      (this.atPreutter ? this.atPreutter : 0) + (this.atStp ? this.atStp : 0);
    const timeAxis = makeTimeAxis(this.pitchSpan, 0, this.targetLength / 1000);
    const basePitches = this.getBasePitch(timeAxis);
    const prevInterpPitch =
      this.prev !== undefined && this.prev.lyric !== "R"
        ? this.getInterpPitch(this.prev, timeAxis, offset - this.prev.msLength)
        : new Array(timeAxis.length).fill(0);
    const prevVbrPitch =
      this.prev !== undefined && this.prev.lyric !== "R"
        ? this.getVibratoPitches(
            this.prev,
            timeAxis,
            offset - this.prev.msLength
          )
        : new Array(timeAxis.length).fill(0);
    const interpPitch = this.getInterpPitch(this, timeAxis, offset);
    const vbrPitch = this.getVibratoPitches(this, timeAxis, offset);
    const nextInterpPitch =
      this.next !== undefined && this.next.lyric !== "R"
        ? this.getInterpPitch(this.next, timeAxis, offset + this.msLength)
        : new Array(timeAxis.length).fill(0);
    return basePitches.map(
      (v, i) =>
        v +
        prevInterpPitch[i] +
        prevVbrPitch[i] +
        interpPitch[i] +
        vbrPitch[i] +
        nextInterpPitch[i]
    );
  }

  /**
   * 前後のノートのnotenumの差に基づいた基準ピッチを返す
   * @param timeAxis ピッチ列の時間
   * @returns
   */
  getBasePitch(timeAxis: Array<number>): Array<number> {
    const basePitches = new Array(timeAxis.length).fill(0);
    const offset =
      (this.atPreutter ? this.atPreutter : 0) + (this.atStp ? this.atStp : 0);
    let start: number = 0;
    let end: number = 0;
    /**
     * 1つ前のノートの音高に基づいた基準ピッチの補正
     * 1つ前のノートの音高によって影響される範囲は、this.prev.pbs.time ～ this.pbs.timeの間
     */
    if (this.prev !== undefined && this.prev.lyric !== "R") {
      const prevOffset = offset - this.prev.msLength;
      const prevPbs = this.prev.pbs ? this.prev.pbs.time : 0;
      const pbs = this.pbs ? this.pbs.time : 0;
      if (prevPbs + prevOffset < 0) {
        start = 0;
      } else {
        start = timeAxis.findIndex((v) => v >= (prevPbs + prevOffset) / 1000);
      }
      if (timeAxis[0] <= (pbs + offset) / 1000) {
        end = timeAxis.findIndex((v) => v >= (pbs + offset) / 1000) - 1;
      } else {
        end = 0;
      }
      if (start < end) {
        for (let i = start; i < end; i++) {
          basePitches[i] = (this.prev.notenum - this.notenum) * 100;
        }
      }
    }
    /**
     * 1つ後のノートの音高に基づいた基準ピッチの補正
     * 1つ後のノートの音高によって影響される範囲は、this.next.pbs.timeより後
     */
    if (this.next !== undefined && this.next.lyric !== "R") {
      const nextOffset = offset + this.msLength;
      const nextPbs = this.next.pbs ? this.next.pbs.time : 0;
      if (timeAxis.slice(-1)[0] >= (nextPbs + nextOffset) / 1000) {
        start = timeAxis.findIndex((v) => v >= (nextPbs + nextOffset) / 1000);
        for (let i = start; i < basePitches.length; i++) {
          basePitches[i] = (this.next.notenum - this.notenum) * 100;
        }
      }
    }
    return basePitches;
  }

  /**
   * pbs,pby,pbw,pbmを解釈しinterpPitchを行うための諸元を得る
   * @param offset resamplerが出力するwavの頭からnoteの頭までの時間(ms)
   * @returns xが時間軸(ms)、yが音高(cent)、modeが補間方法
   */
  getPitchInterpBase(
    note: Note,
    offset: number
  ): {
    x: Array<number>;
    y: Array<number>;
    mode: Array<"" | "s" | "r" | "j">;
  } {
    const x = [note.pbs.time + offset];
    note.pbw.forEach((v, i) => {
      x.push(x[i] + v);
    });
    const pby = note.pby === undefined ? [] : note.pby;
    const y = pby.map((v) => v * 10);
    if (note.prev !== undefined && note.prev.lyric !== "R") {
      y.unshift((note.prev.notenum - note.notenum) * 100);
    } else {
      y.unshift(note.pbs.height * 10);
    }
    const mode = note.pbm === undefined ? [] : note.pbm;
    while (mode.length < x.length - 1) {
      mode.push("");
    }
    return { x: x, y: y, mode: mode };
  }

  /**
   * pbs,pby,pbw,pbmを解釈して`timeAxis`に沿ったピッチ列を返す
   * @param timeAxis
   * @param offset
   * @returns
   */
  getInterpPitch(
    note: Note,
    timeAxis: Array<number>,
    offset: number
  ): Array<number> {
    const result = new Array(timeAxis.length).fill(0);
    if (note.pbs === undefined || note.pbw === undefined) {
      return result;
    }
    const { x, y, mode } = note.getPitchInterpBase(note, offset);
    x.forEach((t, i) => {
      if (i === 0) {
        return;
      }
      if (timeAxis.slice(-1)[0] < t / 1000) {
        return;
      }
      const start = timeAxis.findIndex((v) => v >= x[i - 1] / 1000);
      const end = timeAxis.findIndex((v) => v >= t / 1000);
      const cycle = (t - x[i - 1]) / 1000;
      const height = (y[i] === undefined ? 0 : y[i]) - y[i - 1];
      if (end <= start) {
        return;
      }
      for (let j = start; j <= end; j++) {
        const phase = timeAxis[j] - x[i - 1] / 1000;
        if (mode[i - 1] === "") {
          result[j] =
            ((Math.cos((Math.PI / cycle) * phase - Math.PI) + 1) * height) / 2 +
            y[i - 1];
        } else if (mode[i - 1] === "s") {
          result[j] = (height / cycle) * phase + y[i - 1];
        } else if (mode[i - 1] === "r") {
          result[j] =
            Math.sin((Math.PI / cycle / 2) * phase) * height + y[i - 1];
        } else if (mode[i - 1] === "j") {
          result[j] =
            (-Math.cos((Math.PI / cycle / 2) * phase) + 1) * height + y[i - 1];
        }
      }
    });
    return result;
  }

  getVibratoPitches(
    note: Note,
    timeAxis: Array<number>,
    offset: number
  ): Array<number> {
    const result = new Array(timeAxis.length).fill(0);
    if (note.vibrato === undefined) {
      return result;
    }
    const startMs =
      offset + (note.msLength * (100 - note.vibrato.length)) / 100;
    const endMs = offset + note.msLength;
    const start = timeAxis.findIndex((v) => v >= startMs / 1000);
    const end =
      timeAxis[0] < endMs ? timeAxis.findIndex((v) => v >= endMs / 1000) : 0;
    if (start >= end) {
      return result;
    }
    const vibratoFrames = end - start;
    const fadeIn = Math.floor((vibratoFrames * note.vibrato.fadeInTime) / 100);
    const fadeOut = Math.floor(
      (vibratoFrames * note.vibrato.fadeOutTime) / 100
    );
    const phaseOffset = (2 * Math.PI * note.vibrato.phase) / 100;
    for (let i = start; i < end; i++) {
      const depth = this.getVibratoDepth(
        note.vibrato.depth,
        i,
        start,
        end,
        fadeIn,
        fadeOut
      );
      const phase = timeAxis[i] - startMs / 1000;
      result[i] = Math.round(
        (Math.sin(
          ((2 * Math.PI) / (note.vibrato.cycle / 1000)) * phase + phaseOffset
        ) +
          note.vibrato.height / 100) *
          depth
      );
    }
    return result;
  }

  /**
   * フレーム情報を与えてビブラートのフェードを適用したdepthを取得する
   * @param depth ビブラートの深さ
   * @param i note全体での現在の参照フレーム
   * @param start ビブラート開始フレーム
   * @param end ビブラート終了フレーム
   * @param fadeIn フェードインフレーム数
   * @param fadeOut フェードアウトフレーム数
   * @returns フェードを適用したdepth
   */
  getVibratoDepth(
    depth: number,
    i: number,
    start: number,
    end: number,
    fadeIn: number,
    fadeOut: number
  ): number {
    return i <= start + fadeIn && fadeIn !== 0
      ? (depth * (i - start)) / fadeIn
      : i >= end - fadeOut && fadeOut !== 0
      ? depth * (1 - (i - end + fadeOut) / fadeOut)
      : depth;
  }

  /**
   * ノートを解釈し、エンジンに渡すための値を取得する
   * @param vb UTAU音源
   * @param flags プロジェクトのフラグ設定
   * @returns エンジンに渡すための値
   */
  getRequestParam(
    vb: BaseVoiceBank,
    flags: string,
    defaultValue: defaultParam
  ): {
    resamp: ResampRequest | undefined;
    append: AppendRequestBase;
  }[] {
    return this.phonemizer.getRequestParam(vb, this, flags, defaultValue);
  }

  /**
   * Noteを複製し新しいNoteを返す
   */
  deepCopy(): Note {
    const copiedNote = new Note();
    copiedNote.index = this.index;
    copiedNote._length = this._length;
    copiedNote._lyric = this._lyric;
    copiedNote._notenum = this._notenum;
    copiedNote._tempo = this._tempo;
    copiedNote.hasTempo = this.hasTempo;
    copiedNote._preutter = this._preutter;
    copiedNote._overlap = this._overlap;
    copiedNote._otoPreutter = this._otoPreutter;
    copiedNote._otoOverlap = this._otoOverlap;
    copiedNote._stp = this._stp;
    copiedNote._atPreutter = this._atPreutter;
    copiedNote._atOverlap = this._atOverlap;
    copiedNote._atStp = this._atStp;
    copiedNote._atAlias = this._atAlias;
    copiedNote._atFilename = this._atFilename;
    copiedNote._velocity = this._velocity;
    copiedNote._intensity = this._intensity;
    copiedNote._modulation = this._modulation;
    copiedNote._pitches =
      this._pitches !== undefined ? [...this._pitches] : undefined;
    copiedNote.pbStart = this.pbStart;
    copiedNote._pbs = this.pbs !== undefined ? { ...this._pbs } : undefined;
    copiedNote._pby = this.pby !== undefined ? [...this._pby] : undefined;
    copiedNote._pbw = this.pbw !== undefined ? [...this._pbw] : undefined;
    copiedNote._pbm = this.pbm !== undefined ? [...this._pbm] : undefined;
    copiedNote._envelope =
      this.envelope !== undefined
        ? {
            point: [...this._envelope.point],
            value: [...this._envelope.value],
          }
        : undefined;
    copiedNote._vibrato =
      this.vibrato !== undefined ? { ...this._vibrato } : undefined;
    copiedNote.label = this.label;
    copiedNote.direct = this.direct;
    copiedNote.region = this.region;
    copiedNote.regionEnd = this.regionEnd;
    copiedNote.flags = this.flags;
    copiedNote.voiceColor = this.voiceColor;

    // アドレスコピー
    copiedNote._oto = this._oto;
    copiedNote.prev = this.prev;
    copiedNote.next = this.next;

    return copiedNote;
  }

  dump(): string {
    let noteText = `[#${this.index.toString().padStart(4, "0")}]\r\nLyric=${
      this.lyric
    }\r\nLength=${this.length}\r\nNoteNum=${this.notenum}\r\n`;
    if (this.hasTempo) {
      //tempoは必ずfloatで、hasTempoがtrueの時だけ書出し
      noteText += `Tempo=${this.tempo.toFixed(2)}\r\n`;
    }
    if (this.preutter !== undefined) {
      //floatかundefined
      noteText += `PreUtterance=${this.preutter.toFixed(2)}\r\n`;
    }
    if (this.overlap !== undefined) {
      //floatかundefined
      noteText += `VoiceOverlap=${this.overlap.toFixed(2)}\r\n`;
    }
    if (this.stp !== undefined) {
      //floatかundefined
      noteText += `StartPoint=${this.stp.toFixed(2)}\r\n`;
    }
    if (this.velocity !== undefined) {
      //intかundefined
      noteText += `Velocity=${this.velocity.toString()}\r\n`;
    }
    if (this.intensity !== undefined) {
      //intかundefined
      noteText += `Intensity=${this.intensity.toString()}\r\n`;
    }
    if (this.pitches) {
      //int列かundefined
      noteText += `PitchBend=${this.pitches.join(",")}\r\n`;
    }
    if (this.pbStart !== undefined) {
      //floatかundefined
      noteText += `PBStart=${this.pbStart.toFixed(2)}\r\n`;
    }
    if (this.pbs) {
      noteText += `PBS=${this.pbs.time.toFixed(1)}`;
      if (this.pbs.height !== undefined) {
        noteText += `;${this.pbs.height.toFixed(1)}`;
      }
      noteText += "\r\n";
    }
    if (this.pby) {
      //float列かundefined
      noteText += `PBY=${this.pby.map((y) => y.toFixed(1)).join(",")}\r\n`;
    }
    if (this.pbw) {
      //float列かundefined
      noteText += `PBW=${this.pbw.map((w) => w.toFixed(1)).join(",")}\r\n`;
    }
    if (this.pbm) {
      //string列かundefined
      noteText += `PBM=${this.pbm.join(",")}\r\n`;
    }
    if (this.flags !== undefined) {
      //stringかundefined
      noteText += `Flags=${this.flags}\r\n`;
    }
    if (this.vibrato) {
      //オブジェクトかundefined
      noteText += `VBR=${this.vibrato.length.toFixed(
        0
      )},${this.vibrato.cycle.toFixed(0)},${this.vibrato.depth.toFixed(
        0
      )},${this.vibrato.fadeInTime.toFixed(
        0
      )},${this.vibrato.fadeOutTime.toFixed(0)},${this.vibrato.phase.toFixed(
        0
      )},${this.vibrato.height.toFixed(0)},0\r\n`;
    }
    if (this.envelope) {
      //オブジェクトかundefined
      noteText += `Envelope=${dumpEnvelope(this.envelope)}\r\n`;
    }
    if (this.label !== undefined) {
      //stringかundefined
      noteText += `Label=${this.label}\r\n`;
    }
    if (this.direct) {
      //booleanかundefinedだが、出力はtrueのときのみ
      noteText += `$direct=True\r\n`;
    }
    if (this.region !== undefined) {
      //stringかundefined
      noteText += `$region=${this.region}\r\n`;
    }
    if (this.regionEnd !== undefined) {
      //stringかundefined
      noteText += `$region_end=${this.regionEnd}\r\n`;
    }
    return noteText;
  }
}
export const dumpEnvelope = (envelope: {
  point: Array<number>;
  value: Array<number>;
}): string => {
  let output = `${envelope.point[0].toFixed(2)},${envelope.point[1].toFixed(
    2
  )}`;
  if (envelope.point.length >= 3) {
    output += `,${envelope.point[2].toFixed(2)},${envelope.value[0].toFixed(
      0
    )},${envelope.value[1].toFixed(0)},${envelope.value[2].toFixed(0)}`;
    if (envelope.value.length >= 4) {
      output += `,${envelope.value[3].toFixed(0)}`;
      if (envelope.point.length >= 4) {
        output += `,%,${envelope.point[3].toFixed(2)}`;
        if (envelope.point.length === 5 && envelope.value.length === 5) {
          output += `,${envelope.point[4].toFixed(
            2
          )},${envelope.value[4].toFixed(0)}`;
        }
      }
    }
  }
  return output;
};

export const dumpNotes = (notes: Note[], tempo: number, flags: string) => {
  let output = `[#SETTING]\r\nCharset=UTF-8\r\nTempo=${tempo}\r\nFlags=${flags}\r\nMode2=True\r\n`;
  notes.forEach((n) => {
    output += n.dump();
  });
  output += "[#TRACKEND]";
  return output;
};
