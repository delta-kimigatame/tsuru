/**
 * UTAU用のピッチパターン生成ユーティリティ
 *
 * 各関数は指定されたNoteに対して音楽的に適切なピッチカーブを設定します。
 * スケール理論に基づき、自然な音の遷移を生成します。
 */

import { Note } from "../lib/Note";
import { isNoteInScale } from "./scale";

/**
 * 16分音符の長さ(ms)を計算
 * 仕様: (60 / note.tempo / 480) * 120 * 1000 (ms)
 * @param noteTempo Note.tempo値
 * @returns 16分音符の長さ (ms)
 */
const getSixteenthNoteMs = (noteTempo: number): number => {
  return (60 / noteTempo / 480) * 120 * 1000;
};

/**
 * 32分音符の長さ(ms)を計算
 * 仕様: (60 / note.tempo / 480) * 60 * 1000 (ms)
 * @param noteTempo Note.tempo値
 * @returns 32分音符の長さ (ms)
 */
const getThirtySecondNoteMs = (noteTempo: number): number => {
  return (60 / noteTempo / 480) * 60 * 1000;
};

/**
 * pbsTimeを計算
 * @param note 対象のNote
 * @param sixteenthMs 16分音符の長さ (ms)
 * @returns pbsTime値（負の値）
 */
const calculatePbsTime = (note: Note, sixteenthMs: number): number => {
  if (note.prev === undefined || note.prev.lyric === "R") {
    return -note.atPreutter;
  }
  return -Math.min(sixteenthMs, note.prev.msLength / 2);
};

/**
 * belowPitch: 3度下から始まり、ターゲット音高で終わるピッチパターン
 *
 * @param note 対象のNote
 * @param tone スケールのトーン (0-11, 0=C, 1=C#, ..., 11=B)
 * @param isMinor マイナースケールかどうか
 */
export const belowPitch = (
  note: Note,
  tone: number,
  isMinor: boolean
): void => {
  // 休符の場合は何もしない
  if (note.lyric === "R") {
    return;
  }

  const sixteenthMs = getSixteenthNoteMs(note.tempo);
  const pbsTime = calculatePbsTime(note, sixteenthMs);

  // pby[0]: 3度下（notenum-4がオンスケールなら-40、notenum-3がオンスケールなら-30）
  let pbyValue: number;
  if (isNoteInScale(note.notenum - 4, tone, isMinor)) {
    pbyValue = -40;
  } else if (isNoteInScale(note.notenum - 3, tone, isMinor)) {
    pbyValue = -30;
  } else {
    // フォールバック: どちらもスケール外なら-30
    pbyValue = -30;
  }

  // pbsHeight: prev===undefined || prev.lyric==="R" の場合はpby[0]と同じ、それ以外は0
  let pbsHeight: number;
  if (note.prev === undefined || note.prev.lyric === "R") {
    pbsHeight = pbyValue;
  } else {
    pbsHeight = 0;
  }

  // pbs: 開始点
  note.pbsTime = pbsTime;
  note.pbsHeight = pbsHeight;

  // pby: [ターゲット音高]
  note.setPby([pbyValue]);

  // pbw: [Math.abs(pbsTime), Math.min(16分音符, note.msLength/2)]
  note.setPbw([Math.abs(pbsTime), Math.min(sixteenthMs, note.msLength / 2)]);

  // pbm: ["", ""]
  note.setPbm(["", ""]);
};

/**
 * abovePitch: 3度上から始まり、ターゲット音高で終わるピッチパターン
 *
 * @param note 対象のNote
 * @param tone スケールのトーン (0-11, 0=C, 1=C#, ..., 11=B)
 * @param isMinor マイナースケールかどうか
 */
export const abovePitch = (
  note: Note,
  tone: number,
  isMinor: boolean
): void => {
  // 休符の場合は何もしない
  if (note.lyric === "R") {
    return;
  }

  const sixteenthMs = getSixteenthNoteMs(note.tempo);
  const pbsTime = calculatePbsTime(note, sixteenthMs);

  // pby[0]: 3度上（notenum+4がオンスケールなら+40、notenum+3がオンスケールなら+30）
  let pbyValue: number;
  if (isNoteInScale(note.notenum + 4, tone, isMinor)) {
    pbyValue = 40;
  } else if (isNoteInScale(note.notenum + 3, tone, isMinor)) {
    pbyValue = 30;
  } else {
    // フォールバック: どちらもスケール外なら+30
    pbyValue = 30;
  }

  // pbsHeight: prev===undefined || prev.lyric==="R" の場合はpby[0]と同じ、それ以外は0
  let pbsHeight: number;
  if (note.prev === undefined || note.prev.lyric === "R") {
    pbsHeight = pbyValue;
  } else {
    pbsHeight = 0;
  }

  // pbs: 開始点
  note.pbsTime = pbsTime;
  note.pbsHeight = pbsHeight;

  // pby: [ターゲット音高]
  note.setPby([pbyValue]);

  // pbw: [Math.abs(pbsTime), Math.min(16分音符, note.msLength/2)]
  note.setPbw([Math.abs(pbsTime), Math.min(sixteenthMs, note.msLength / 2)]);

  // pbm: ["", ""]
  note.setPbm(["", ""]);
};

/**
 * accentPitch: 3度上→2度下→ターゲット音高のアクセントパターン
 *
 * @param note 対象のNote
 * @param tone スケールのトーン (0-11, 0=C, 1=C#, ..., 11=B)
 * @param isMinor マイナースケールかどうか
 */
export const accentPitch = (
  note: Note,
  tone: number,
  isMinor: boolean
): void => {
  // 休符の場合は何もしない
  if (note.lyric === "R") {
    return;
  }

  const sixteenthMs = getSixteenthNoteMs(note.tempo);
  const thirtySecondMs = getThirtySecondNoteMs(note.tempo);
  const pbsTime = calculatePbsTime(note, sixteenthMs);

  // pby[0]: 3度上（notenum+4がオンスケールなら+40、notenum+3がオンスケールなら+30）
  let pby0: number;
  if (isNoteInScale(note.notenum + 4, tone, isMinor)) {
    pby0 = 40;
  } else if (isNoteInScale(note.notenum + 3, tone, isMinor)) {
    pby0 = 30;
  } else {
    pby0 = 30;
  }

  // pby[1]: 2度下（notenum-2がオンスケールなら-20、notenum-1がオンスケールなら-10）
  let pby1: number;
  if (isNoteInScale(note.notenum - 2, tone, isMinor)) {
    pby1 = -20;
  } else if (isNoteInScale(note.notenum - 1, tone, isMinor)) {
    pby1 = -10;
  } else {
    pby1 = -10;
  }

  // pbsHeight: prev===undefined || prev.lyric==="R" の場合はpby[0]と同じ、それ以外は0
  let pbsHeight: number;
  if (note.prev === undefined || note.prev.lyric === "R") {
    pbsHeight = pby0;
  } else {
    pbsHeight = 0;
  }

  // pbs: 開始点
  note.pbsTime = pbsTime;
  note.pbsHeight = pbsHeight;

  // pby: [3度上, 2度下]
  note.setPby([pby0, pby1]);

  // pbw: [Math.abs(pbsTime), 32分音符, Math.min(16分音符, note.msLength/2 - 32分音符)]
  const pbw2 = Math.min(sixteenthMs, note.msLength / 2 - thirtySecondMs);
  note.setPbw([Math.abs(pbsTime), thirtySecondMs, pbw2]);

  // pbm: ["", "", ""]
  note.setPbm(["", "", ""]);
};

/**
 * reservePitch: 3度下→ターゲット→2度下→ターゲットのリザーブパターン
 *
 * @param note 対象のNote
 * @param tone スケールのトーン (0-11, 0=C, 1=C#, ..., 11=B)
 * @param isMinor マイナースケールかどうか
 */
export const reservePitch = (
  note: Note,
  tone: number,
  isMinor: boolean
): void => {
  // 休符の場合は何もしない
  if (note.lyric === "R") {
    return;
  }

  const sixteenthMs = getSixteenthNoteMs(note.tempo);
  const thirtySecondMs = getThirtySecondNoteMs(note.tempo);
  const pbsTime = calculatePbsTime(note, sixteenthMs);

  // pby[0]: 3度下（notenum-4がオンスケールなら-40、notenum-3がオンスケールなら-30）
  let pby0: number;
  if (isNoteInScale(note.notenum - 4, tone, isMinor)) {
    pby0 = -40;
  } else if (isNoteInScale(note.notenum - 3, tone, isMinor)) {
    pby0 = -30;
  } else {
    pby0 = -30;
  }

  // pby[2]: 2度下（notenum-2がオンスケールなら-20、notenum-1がオンスケールなら-10）
  let pby2: number;
  if (isNoteInScale(note.notenum - 2, tone, isMinor)) {
    pby2 = -20;
  } else if (isNoteInScale(note.notenum - 1, tone, isMinor)) {
    pby2 = -10;
  } else {
    pby2 = -10;
  }

  // pbsHeight: prev===undefined || prev.lyric==="R" の場合はpby[0]と同じ、それ以外は0
  let pbsHeight: number;
  if (note.prev === undefined || note.prev.lyric === "R") {
    pbsHeight = pby0;
  } else {
    pbsHeight = 0;
  }

  // pbs: 開始点
  note.pbsTime = pbsTime;
  note.pbsHeight = pbsHeight;

  // pby: [3度下, 0(ターゲット), 2度下]
  note.setPby([pby0, 0, pby2]);

  // pbw: [Math.abs(pbsTime), 32分音符, 32分音符, Math.min(16分音符, note.msLength/2 - 32*2)]
  const pbw3 = Math.min(sixteenthMs, note.msLength / 2 - thirtySecondMs * 2);
  note.setPbw([Math.abs(pbsTime), thirtySecondMs, thirtySecondMs, pbw3]);

  // pbm: ["", "", "", ""]
  note.setPbm(["", "", "", ""]);
};
