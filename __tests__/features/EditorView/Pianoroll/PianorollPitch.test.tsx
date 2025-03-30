import { describe, expect, it } from "vitest";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import {
  deciToneToPoint,
  msToPoint,
  notenumToPoint,
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
});
