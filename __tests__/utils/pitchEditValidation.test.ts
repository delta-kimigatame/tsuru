import { describe, expect, it } from "vitest";
import { validatePitchEditability } from "../../src/utils/pitchEditValidation";
import { createTestNote } from "../testHelpers/noteTestHelper";

describe("validatePitchEditability", () => {
  it("最後のポルタメントではピッチ変更不可", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    const result = validatePitchEditability(2, note); // pbw.length === 2
    expect(result.canEditPitch).toBe(false);
    expect(result.canEditTime).toBe(true);
  });

  it("最初のポルタメントで前のノートがない場合、ピッチ変更可能", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
      prev: null,
    });

    const result = validatePitchEditability(0, note);
    expect(result.canEditPitch).toBe(true);
    expect(result.canEditTime).toBe(true);
  });

  it("最初のポルタメントで前のノートが休符の場合、ピッチ変更可能", () => {
    const prevNote = createTestNote({
      notenum: 60,
      lyric: "R",
      msLength: 1000,
    });
    const note = createTestNote({
      notenum: 62,
      lyric: "い",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });
    note.prev = prevNote;
    prevNote.next = note;

    const result = validatePitchEditability(0, note);
    expect(result.canEditPitch).toBe(true);
    expect(result.canEditTime).toBe(true);
  });

  it("最初のポルタメントで前のノートが通常ノートの場合、ピッチ変更不可", () => {
    const prevNote = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
    });
    const note = createTestNote({
      notenum: 62,
      lyric: "い",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });
    note.prev = prevNote;
    prevNote.next = note;

    const result = validatePitchEditability(0, note);
    expect(result.canEditPitch).toBe(false);
    expect(result.canEditTime).toBe(true);
  });

  it("中間のポルタメントではピッチ変更・時間変更ともに可能", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    const result = validatePitchEditability(1, note);
    expect(result.canEditPitch).toBe(true);
    expect(result.canEditTime).toBe(true);
  });

  it("pbwが1つの場合、targetPoltament=1は最後のポルタメント", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50],
      pby: [10],
      prev: null,
    });

    const result = validatePitchEditability(1, note);
    expect(result.canEditPitch).toBe(false); // 最後なのでピッチ変更不可
    expect(result.canEditTime).toBe(true);
  });
});
