import { describe, expect, it } from "vitest";
import { calculateTimeConstraints } from "../../../src/utils/PianorollTouch/pitchTimeConstraints";
import { createTestNote } from "../../testHelpers/noteTestHelper";

describe("calculateTimeConstraints", () => {
  it("最初のポルタメントの時間制約を計算", () => {
    const prevNote = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 480,
    });
    const note = createTestNote({
      notenum: 62,
      lyric: "い",
      tempo: 120,
      length: 960,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });
    note.prev = prevNote;
    prevNote.next = note;

    const result = calculateTimeConstraints(0, note);

    // tempo=120, length=480: msLength = (60/120 * 480) / 480 * 1000 = 500ms
    expect(result.minTime).toBe(-500); // -prev.msLength
    expect(result.maxTime).toBe(50); // pbw[0]
  });

  it("最初のポルタメントで前のノートがない場合", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
      prev: null,
    });

    const result = calculateTimeConstraints(0, note);

    expect(result.minTime).toBe(Number.NEGATIVE_INFINITY);
    expect(result.maxTime).toBe(50);
  });

  it("中間のポルタメントの時間制約を計算", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50, 40],
      pby: [10, 20, 15],
    });

    const result = calculateTimeConstraints(2, note);

    // minTime = pbs.time + pbw[0] = -20 + 50 = 30
    expect(result.minTime).toBe(30);
    // maxTime = |pbs.time| + pbw[0] + pbw[1] = 20 + 50 + 50 = 120
    expect(result.maxTime).toBe(120);
  });

  it("最後のポルタメントの時間制約を計算", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    const result = calculateTimeConstraints(2, note); // pbw.length === 2

    // minTime = pbs.time + pbw[0] (最後から1つ前まで) = -20 + 50 = 30
    expect(result.minTime).toBe(30);
    // tempo=120, length=960: msLength = (60/120 * 960) / 480 * 1000 = 1000ms
    expect(result.maxTime).toBe(1000);
  });

  it("ポルタメントが1つだけの場合、targetPoltament=1は最後", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 480,
      pbs: { time: -10, height: 0 },
      pbw: [50],
      pby: [10],
    });

    const result = calculateTimeConstraints(1, note);

    // minTime = pbs.time (pbw.slice(0, -1) = [] なので合計0) = -10
    expect(result.minTime).toBe(-10);
    // tempo=120, length=480: msLength = (60/120 * 480) / 480 * 1000 = 500ms
    expect(result.maxTime).toBe(500);
  });

  it("pbs.timeが正の値の場合でも正しく計算", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: 30, height: 0 },
      pbw: [40, 50],
      pby: [10, 20],
    });

    const result = calculateTimeConstraints(1, note);

    // minTime = pbs.time = 30
    expect(result.minTime).toBe(30);
    // maxTime = |pbs.time| + pbw[0] = 30 + 40 = 70
    expect(result.maxTime).toBe(70);
  });

  it("pbwの値が大きい場合でも正しく計算", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 2000,
      pbs: { time: -100, height: 0 },
      pbw: [200, 300, 400],
      pby: [10, 20, 30],
    });

    const result = calculateTimeConstraints(2, note);

    // minTime = pbs.time + pbw[0] = -100 + 200 = 100
    expect(result.minTime).toBe(100);
    // maxTime = |pbs.time| + pbw[0] + pbw[1] = 100 + 200 + 300 = 600
    expect(result.maxTime).toBe(600);
  });
});
