import { describe, expect, it } from "vitest";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import {
  deciToneToPoint,
  getPathD,
  msToPoint,
  notenumToPoint,
  svgCInterp,
  svgCInterpJ,
  svgCInterpR,
  svgCInterpS,
  UtauPitchToPoints,
} from "../../../../src/features/EditorView/Pianoroll/PianorollPitch";
import { Note } from "../../../../src/lib/Note";

const createTestNote = (): Note => {
  const n = new Note();
  n.notenum = 107; // 最上部のキー（例）
  n.pbsTime = -500; // ms 単位の開始時間（例）
  n.pbsHeight = -10; // deciTone 単位（例）
  n.tempo = 120;
  n.setPbw([125, 125, 125, 125]);
  n.setPby([10, -5, 5]); // pbw.length - 1 = 3
  // pbm は、例えば初期値として ["", "s", "r"] とする（後で while で長さが拡張される）
  n.setPbm(["", "s", "r"]);
  return n;
};

describe("PianorollPitchにおけるヘルパ関数", () => {
  it("msToPoint", () => {
    /** bpm120の時500msはノート長480と等しいはず */
    expect(msToPoint(500, 120, 1)).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * 480
    );
    /** bpm120の時1000msはノート長960と等しいはず */
    expect(msToPoint(1000, 120, 1)).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * 960
    );
    /** bpm240の時600msはノート長480と等しいはず */
    expect(msToPoint(500, 240, 1)).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * 960
    );
    /** horizontalZoomが2なら、帰る値も2倍のはず */
    expect(msToPoint(500, 120, 2)).toBe(msToPoint(500, 120, 1) * 2);
    /** pbsTimeはほとんどが負の数のはずなのでそれも確認しておく */
    expect(msToPoint(-500, 120, 1)).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480
    );
  });

  it("notenumToPoint", () => {
    /** 一番上の時はキー幅の半分のはず */
    expect(notenumToPoint(107, 1)).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
    /** 以降はキー幅ずつ増えるはず */
    expect(notenumToPoint(106, 1)).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT
    );
    /** 最後(C1)はTotal_heightからキー幅の半分だけ小さいはず */
    expect(notenumToPoint(24, 1)).toBe(
      -PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.TOTAL_HEIGHT
    );
    /** verticalZoomが2なら帰ってくる値も2倍のはず */
    expect(notenumToPoint(106, 2)).toBe(notenumToPoint(106, 1) * 2);
  });

  it("deciToneToPoint", () => {
    /** 10でキー1個分のはず */
    expect(deciToneToPoint(10, 1)).toBe(PIANOROLL_CONFIG.KEY_HEIGHT);
    /** verticalzoomが2なら返り値も2倍のはず */
    expect(deciToneToPoint(10, 2)).toBe(deciToneToPoint(10, 1) * 2);
    /** pbyは小数第一位まで与えられるので一応 */
    expect(deciToneToPoint(0.1, 1)).toBeCloseTo(
      PIANOROLL_CONFIG.KEY_HEIGHT / 100
    );
  });

  it("UtauPitchToPoints:pbyが空配列のパターン", () => {
    /** 最小構成 */
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.tempo = 120;
    n.setPbw([500]);
    const points = UtauPitchToPoints(n, [], 0, 1, 1);
    expect(points.length).toBe(2);
    expect(points[0].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480);
    expect(points[0].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
    expect(points[1].x).toBe(0);
    expect(points[1].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
  });
  it("UtauPitchToPoints:pbyが空配列のパターン_pbsHeightあり", () => {
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.pbsHeight = -10;
    n.tempo = 120;
    n.setPbw([500]);
    const points = UtauPitchToPoints(n, [], 0, 1, 1);
    expect(points.length).toBe(2);
    expect(points[0].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480);
    expect(points[0].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[1].x).toBe(0);
    expect(points[1].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
  });
  it("UtauPitchToPoints:pby有", () => {
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.pbsHeight = -10;
    n.tempo = 120;
    n.setPbw([125, 125, 125, 125]);
    n.setPby([10, -5, 5]);
    const points = UtauPitchToPoints(n, n.pby, 0, 1, 1);
    expect(points.length).toBe(5);
    expect(points[0].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480);
    expect(points[0].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[1].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -360);
    expect(points[1].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[2].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -240);
    expect(points[2].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[3].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -120);
    expect(points[3].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[4].x).toBe(0);
    expect(points[4].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
  });
  it("UtauPitchToPoints:leftOffsetの確認", () => {
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.pbsHeight = -10;
    n.tempo = 120;
    n.setPbw([125, 125, 125, 125]);
    n.setPby([10, -5, 5]);
    const leftOffset = 1000;
    const points = UtauPitchToPoints(n, n.pby, leftOffset, 1, 1);
    expect(points.length).toBe(5);
    expect(points[0].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480 + leftOffset
    );
    expect(points[0].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[1].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -360 + leftOffset
    );
    expect(points[1].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[2].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -240 + leftOffset
    );
    expect(points[2].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[3].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -120 + leftOffset
    );
    expect(points[3].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[4].x).toBe(leftOffset);
    expect(points[4].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
  });
  it("UtauPitchToPoints:verticalZoomの確認", () => {
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.pbsHeight = -10;
    n.tempo = 120;
    n.setPbw([125, 125, 125, 125]);
    n.setPby([10, -5, 5]);
    const points = UtauPitchToPoints(n, n.pby, 0, 2, 1);
    expect(points.length).toBe(5);
    expect(points[0].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480);
    expect(points[0].y).toBe(
      (PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT) * 2
    );
    expect(points[1].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -360);
    expect(points[1].y).toBe(
      (PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT) * 2
    );
    expect(points[2].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -240);
    expect(points[2].y).toBe(
      (PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT / 2) * 2
    );
    expect(points[3].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -120);
    expect(points[3].y).toBe(
      (PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT / 2) * 2
    );
    expect(points[4].x).toBe(0);
    expect(points[4].y).toBe((PIANOROLL_CONFIG.KEY_HEIGHT / 2) * 2);
  });
  it("UtauPitchToPoints:horizontalZoomの確認", () => {
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.pbsHeight = -10;
    n.tempo = 120;
    n.setPbw([125, 125, 125, 125]);
    n.setPby([10, -5, 5]);
    const points = UtauPitchToPoints(n, n.pby, 0, 1, 2);
    expect(points.length).toBe(5);
    expect(points[0].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480 * 2);
    expect(points[0].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[1].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -360 * 2);
    expect(points[1].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[2].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -240 * 2);
    expect(points[2].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[3].x).toBe(PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -120 * 2);
    expect(points[3].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[4].x).toBe(0);
    expect(points[4].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
  });
  it("UtauPitchToPoints:horizontalZoomとleftOffset", () => {
    /** leftoffsetは算定時にhorizontalZoomが織り込まれているため、horizontalzoomに関わらず定数として加算されるはず */
    const n = new Note();
    n.notenum = 107;
    n.pbsTime = -500;
    n.pbsHeight = -10;
    n.tempo = 120;
    n.setPbw([125, 125, 125, 125]);
    n.setPby([10, -5, 5]);
    const leftOffset = 1000;
    const points = UtauPitchToPoints(n, n.pby, leftOffset, 1, 2);
    expect(points.length).toBe(5);
    expect(points[0].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -480 * 2 + leftOffset
    );
    expect(points[0].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[1].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -360 * 2 + leftOffset
    );
    expect(points[1].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT
    );
    expect(points[2].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -240 * 2 + leftOffset
    );
    expect(points[2].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 + PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[3].x).toBe(
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE * -120 * 2 + leftOffset
    );
    expect(points[3].y).toBe(
      PIANOROLL_CONFIG.KEY_HEIGHT / 2 - PIANOROLL_CONFIG.KEY_HEIGHT / 2
    );
    expect(points[4].x).toBe(leftOffset);
    expect(points[4].y).toBe(PIANOROLL_CONFIG.KEY_HEIGHT / 2);
  });

  it("svgCInterp", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(svgCInterp(points, 100, 100, 0)).toBe(
      `C ${100 / 6},${100 / 8} ${100 / 3},${(100 / 8) * 2} 50,50 C ${
        (100 / 3) * 2
      },${(100 / 8) * 6} ${(100 / 6) * 5},${(100 / 8) * 7} 100,100`
    );
    expect(svgCInterpS(points, 100, 100, 0)).toBe(
      `C ${100 / 3},${100 / 3} ${(100 / 3) * 2},${(100 / 3) * 2} 100,100`
    );
    expect(svgCInterpR(points, 100, 100, 0)).toBe(
      `C ${100 / 3},50 ${(100 / 3) * 2},${(100 / 2) * Math.sqrt(3)} 100,100`
    );
    expect(svgCInterpJ(points, 100, 100, 0)).toBe(
      `C ${100 / 3},${100 * (1 - Math.sqrt(3) / 2)} ${(100 / 3) * 2},50 100,100`
    );
  });

  it("getPathD:正常系", () => {
    /** 細かい変換は各処理の単体テストで正しさを担保するものとし、期待した文字列構造となっているか正規表現で確認する。 */
    const n = createTestNote();
    const leftOffset = 0;
    const d = getPathD(n, 0, leftOffset, 1, 1);
    // 期待されるパス文字列は "M..." で始まり、各区間の "C ..." が連結される
    expect(d).toMatch(/^M[\d\.\-, ]+ C[\d\.\-, ]+( C[\d\.\-, ]+){5}$/);
    // 上記は pbm の長さが最終的に4になることを前提としている。ただし、Cはpbm""の場合2回出る
  });
  it("getPathD:異常系、pbsが未定義", () => {
    const n = new Note();
    // pbs が未定義の場合は、getPathD は空文字を返す
    expect(getPathD(n, 0, 0, 1, 1)).toBe("");
  });
  it("getPathD:異常系、pbwが未定義", () => {
    const n = new Note();
    n.pbsTime = -500;
    // pbs が未定義の場合は、getPathD は空文字を返す
    expect(getPathD(n, 0, 0, 1, 1)).toBe("");
  });
  it("getPathD:異常系、pbyが未定義", () => {
    const n = new Note();
    n.pbsTime = -500;
    n.setPbw([125, 125, 125, 125]);
    // pbs が未定義の場合は、getPathD は空文字を返す
    expect(getPathD(n, 0, 0, 1, 1)).toBe("");
  });
  it("getPathD:異常系、pby長が不足", () => {
    const n = new Note();
    n.pbsTime = -500;
    n.setPbw([125, 125, 125, 125]);
    n.setPby([10]);
    // pbs が未定義の場合は、getPathD は空文字を返す
    expect(getPathD(n, 0, 0, 1, 1)).toBe("");
  });
});
