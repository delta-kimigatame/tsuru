import { describe, expect, it } from "vitest";
import { applyTimeChange } from "../../src/utils/pitchTimeOperations";
import { createTestNote } from "../testHelpers/noteTestHelper";

describe("applyTimeChange", () => {
  it("最初のポルタメント（pbs.time）の時間を変更", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    const result = applyTimeChange(note, 0, -30);

    expect(result.pbs.time).toBe(-30);
    // pbs.timeの変更分（-20 - (-30) = 10）をpbw[0]に加算
    expect(result.pbw[0]).toBe(60); // 50 + 10
    expect(result.pbw[1]).toBe(50); // 変更なし
  });

  it("最初のポルタメントで時間を増やす場合、pbw[0]は減少", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    const result = applyTimeChange(note, 0, -10);

    expect(result.pbs.time).toBe(-10);
    // pbs.timeの変更分（-20 - (-10) = -10）をpbw[0]に加算
    expect(result.pbw[0]).toBe(40); // 50 + (-10)
  });

  it("中間のポルタメント（pbw）の時間を変更", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50, 40],
      pby: [10, 20, 15],
    });

    // clampedTime=50は、pbs.time + pbw[0] + pbw[1]の位置
    // 期待値：pbw[1] = 50 - (-20) - 50 = 20
    // 元のpbw[1]=50なので、差分=-30
    // pbw[2]には+30される → 70
    const result = applyTimeChange(note, 2, 50);

    expect(result.pbw[1]).toBe(20); // 50 → 20
    expect(result.pbw[2]).toBe(70); // 40 + 30
  });

  it("中間のポルタメントで時間を増やす場合、次のpbwは減少", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50, 40],
      pby: [10, 20, 15],
    });

    // clampedTime=100は、pbs.time + pbw[0] + pbw[1]の位置
    // 期待値：pbw[1] = 100 - (-20) - 50 = 70
    // 元のpbw[1]=50なので、差分=+20
    // pbw[2]には-20される → 20
    const result = applyTimeChange(note, 2, 100);

    expect(result.pbw[1]).toBe(70); // 50 → 70
    expect(result.pbw[2]).toBe(20); // 40 - 20
  });

  it("最後のポルタメントの時間を変更", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    // clampedTime=100は、pbs.time + pbw[0] + pbw[1]の位置
    // 期待値：pbw[1] = 100 - (-20) - 50 = 70
    const result = applyTimeChange(note, 2, 100);

    expect(result.pbw[1]).toBe(70); // 50 → 70
    // 最後のポルタメントなので、次のpbwはない
  });

  it("最後のポルタメントの時間を減らす", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    // clampedTime=50は、pbs.time + pbw[0] + pbw[1]の位置
    // 期待値：pbw[1] = 50 - (-20) - 50 = 20 (50から20に減少)
    const result = applyTimeChange(note, 2, 50);

    expect(result.pbw[0]).toBe(50); // 変更なし
    expect(result.pbw[1]).toBe(20); // 50 → 20
    // 最後のポルタメントなので、次のpbwはない
  });

  it("pbwが負にならないようクランプされる", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50, 40],
      pby: [10, 20, 15],
    });

    // clampedTime=0だと、pbw[1] = 0 - (-20) - 50 = -30 → 0にクランプ
    const result = applyTimeChange(note, 2, 0);

    expect(result.pbw[1]).toBe(0);
    // 元のpbw[1]=50なので、差分=-50
    // pbw[2]には+50される → 90
    expect(result.pbw[2]).toBe(90);
  });

  it("次のpbwも負にならないようクランプされる", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 20, 40],
      pby: [10, 20, 15],
    });

    // clampedTime=60にすると、pbw[1] = 60 - (-20) - 50 = 30
    // 元のpbw[1]=20なので、差分=+10
    // pbw[2]には-10される → 30
    const result = applyTimeChange(note, 2, 60);

    expect(result.pbw[1]).toBe(30);
    expect(result.pbw[2]).toBe(30);

    // さらに大きくして、pbw[2]が負になるケース
    // clampedTime=100にすると、pbw[1] = 100 - (-20) - 50 = 70
    // 元のpbw[1]=20なので、差分=+50
    // pbw[2]には-50される → 20 - 50 = -30 → 0にクランプ
    const result2 = applyTimeChange(note, 2, 100);
    expect(result2.pbw[1]).toBe(70);
    expect(result2.pbw[2]).toBe(0);
  });

  it("deepCopy()が呼ばれ、元のノートが変更されない", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    const originalPbsTime = note.pbs.time;
    const originalPbw = [...note.pbw];

    applyTimeChange(note, 0, -30);

    expect(note.pbs.time).toBe(originalPbsTime);
    expect(note.pbw).toEqual(originalPbw);
  });
});
