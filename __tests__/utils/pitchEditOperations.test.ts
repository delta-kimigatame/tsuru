import { describe, expect, it } from "vitest";
import { applyPitchChange } from "../../src/utils/pitchEditOperations";
import { createTestNote } from "../testHelpers/noteTestHelper";

describe("applyPitchChange", () => {
  it("中間ポルタメントのピッチ値を更新する", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    // notenum=60(C4)の位置から+100cent(=+1半音)上の位置をクリック
    // targetPitch = 61になるような座標を計算
    // targetPitch = 107 - (y - KEY_HEIGHT/2) / KEY_HEIGHT
    // 61 = 107 - (y - 22) / 44 → (y - 22) / 44 = 46 → y = 2046
    const svgPoint = { x: 100, y: 2046 };
    const verticalZoom = 1;

    const result = applyPitchChange(note, 1, svgPoint, verticalZoom);

    // (targetPitch - note.notenum) * 10 = (61 - 60) * 10 = 10
    expect(result.pby[0]).toBe(10);
    // 元のnoteは変更されていない
    expect(note.pby[0]).toBe(10);
  });

  it("最初のポルタメント（pbs.height）を更新する", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 5 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    // notenum=60の位置から-0.5半音下の位置をクリック
    // 59.5 = 107 - (y - 22) / 44 → (y - 22) / 44 = 47.5 → y = 2112
    const svgPoint = { x: 100, y: 2112 }; // targetPitch = 59.5
    const verticalZoom = 1;

    const result = applyPitchChange(note, 0, svgPoint, verticalZoom);

    // (59.5 - 60) * 10 = -5
    expect(result.pbs.height).toBe(-5);
    // 元のnoteは変更されていない
    expect(note.pbs.height).toBe(5);
  });

  it("垂直ズームが2倍の場合でも正しく計算される", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50, 50],
      pby: [10, 20],
    });

    // 垂直ズーム=2の場合、KEY_HEIGHT*2=88で計算
    // targetPitch = 68.5 (+8.5半音)になるような座標
    // 68.5 = 107 - (y - 44) / 88 → (y - 44) / 88 = 38.5 → y = 3432
    const svgPoint = { x: 100, y: 3432 };
    const verticalZoom = 2;

    const result = applyPitchChange(note, 1, svgPoint, verticalZoom);

    // targetPitch = 107 - (3432 - 44) / 88 = 107 - 38.5 = 68.5
    // (68.5 - 60) * 10 = 85
    expect(result.pby[0]).toBe(85);
  });

  it("複数のポルタメントがある場合、指定されたインデックスのみ更新", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [30, 30, 40],
      pby: [5, 10, 15],
    });

    // targetPitch = 62 (+2半音)になるような座標
    // 62 = 107 - (y - 22) / 44 → (y - 22) / 44 = 45 → y = 2002
    const svgPoint = { x: 100, y: 2002 }; // targetPitch = 62
    const verticalZoom = 1;

    const result = applyPitchChange(note, 2, svgPoint, verticalZoom);

    // (62 - 60) * 10 = 20
    expect(result.pby[1]).toBe(20); // targetPoltament=2 → pby[1]を更新
    expect(result.pby[0]).toBe(5); // 他は変更されていない
    expect(result.pby[2]).toBe(15);
  });

  it("ピッチベンドが大きな値でも正しく処理される", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50],
      pby: [0],
    });

    // notenum=60から+12半音上（オクターブ上）
    // 72 = 107 - (y - 22) / 44 → (y - 22) / 44 = 35 → y = 1562
    const svgPoint = { x: 100, y: 1562 }; // targetPitch = 72
    const verticalZoom = 1;

    const result = applyPitchChange(note, 1, svgPoint, verticalZoom);

    // (72 - 60) * 10 = 120
    expect(result.pby[0]).toBe(120);
  });

  it("deepCopy()が呼ばれ、元のノートが変更されない", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      msLength: 1000,
      pbs: { time: -20, height: 0 },
      pbw: [50],
      pby: [10],
    });

    const originalPby = [...note.pby];
    const svgPoint = { x: 100, y: 1560 };
    const verticalZoom = 1;

    applyPitchChange(note, 1, svgPoint, verticalZoom);

    // 元のノートは変更されていない
    expect(note.pby).toEqual(originalPby);
  });
});
