import { describe, expect, it } from "vitest";
import { convertSvgXToTimeMs } from "../../../src/utils/PianorollTouch/svgToTimeConverter";
import { createTestNote } from "../../testHelpers/noteTestHelper";

// NOTES_WIDTH_RATE = (375 - 50) / 1920 = 325 / 1920
const NOTES_WIDTH_RATE = 325 / 1920;

describe("convertSvgXToTimeMs", () => {
  it("ノートの右側（relativeX >= 0）では選択ノートのtempoを使用", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
    });

    const svgPoint = { x: 200, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 90;
    const horizontalZoom = 1;

    const result = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note,
      ustTempo,
      horizontalZoom
    );

    // relativeX = 200 - 100 = 100
    // relativeXTick = 100 / (325/1920) / 1 = 100 * 1920 / 325 ≈ 590.769
    // time = (590.769 * 60000 / 120) / 480 = (590.769 * 500) / 480 ≈ 615.385
    expect(result).toBeCloseTo(615.385, 2);
  });

  it("ノートの左側（relativeX < 0）では前のノートのtempoを使用", () => {
    const prevNote = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 100,
      length: 480,
    });
    const note = createTestNote({
      notenum: 62,
      lyric: "い",
      tempo: 120,
      length: 960,
    });
    note.prev = prevNote;
    prevNote.next = note;

    const svgPoint = { x: 50, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 90;
    const horizontalZoom = 1;

    const result = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note,
      ustTempo,
      horizontalZoom
    );

    // relativeX = 50 - 100 = -50
    // relativeXTick = -50 / (325/1920) / 1 = -50 * 1920 / 325 ≈ -295.385
    // time = (-295.385 * 60000 / 100) / 480 = (-295.385 * 600) / 480 ≈ -369.231
    expect(result).toBeCloseTo(-369.231, 2);
  });

  it("前のノートがない場合はustTempoを使用", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
      prev: null,
    });

    const svgPoint = { x: 50, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 90;
    const horizontalZoom = 1;

    const result = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note,
      ustTempo,
      horizontalZoom
    );

    // relativeX = -50
    // relativeXTick = -50 / (325/1920) / 1 = -50 * 1920 / 325 ≈ -295.385
    // time = (-295.385 * 60000 / 90) / 480 = (-295.385 * 666.666...) / 480 ≈ -410.256
    expect(result).toBeCloseTo(-410.256, 2);
  });

  it("horizontalZoomが2倍の場合、時間は半分になる", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
    });

    const svgPoint = { x: 200, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 90;
    const horizontalZoom = 2;

    const result = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note,
      ustTempo,
      horizontalZoom
    );

    // relativeX = 100
    // relativeXTick = 100 / (325/1920) / 2 = 100 * 1920 / 325 / 2 ≈ 295.385
    // time = (295.385 * 60000 / 120) / 480 = (295.385 * 500) / 480 ≈ 307.692
    expect(result).toBeCloseTo(307.692, 2);
  });

  it("horizontalZoomが0.5倍の場合、時間は2倍になる", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
    });

    const svgPoint = { x: 200, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 90;
    const horizontalZoom = 0.5;

    const result = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note,
      ustTempo,
      horizontalZoom
    );

    // relativeX = 100
    // relativeXTick = 100 / (325/1920) / 0.5 = 100 * 1920 / 325 * 2 ≈ 1181.538
    // time = (1181.538 * 60000 / 120) / 480 = (1181.538 * 500) / 480 ≈ 1230.769
    expect(result).toBeCloseTo(1230.769, 2);
  });

  it("relativeX=0の場合、ノートの開始位置なので0msを返す", () => {
    const note = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 120,
      length: 960,
    });

    const svgPoint = { x: 100, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 90;
    const horizontalZoom = 1;

    const result = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note,
      ustTempo,
      horizontalZoom
    );

    expect(result).toBe(0);
  });

  it("テンポが異なる場合、計算結果が変わる", () => {
    const note1 = createTestNote({
      notenum: 60,
      lyric: "あ",
      tempo: 60, // 遅いテンポ
      length: 960,
    });

    const note2 = createTestNote({
      notenum: 60,
      lyric: "い",
      tempo: 240, // 速いテンポ
      length: 960,
    });

    const svgPoint = { x: 200, y: 100 };
    const selectedNoteStartX = 100;
    const ustTempo = 120;
    const horizontalZoom = 1;

    const result1 = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note1,
      ustTempo,
      horizontalZoom
    );

    const result2 = convertSvgXToTimeMs(
      svgPoint,
      selectedNoteStartX,
      note2,
      ustTempo,
      horizontalZoom
    );

    // テンポが遅いほど、同じ距離でより長い時間になる
    expect(result1).toBeGreaterThan(result2);
    // tempo=60: relativeXTick ≈ 590.769, time = (590.769 * 60000 / 60) / 480 ≈ 1230.769
    expect(result1).toBeCloseTo(1230.769, 2);
    // tempo=240: relativeXTick ≈ 590.769, time = (590.769 * 60000 / 240) / 480 ≈ 307.692
    expect(result2).toBeCloseTo(307.692, 2);
  });
});
