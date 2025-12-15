import { describe, expect, it } from "vitest";
import { PIANOROLL_CONFIG } from "../../src/config/pianoroll";
import { Note } from "../../src/lib/Note";
import {
  getTargetNoteIndex,
  getTargetNoteIndexFromX,
  getTargetPpltamentIndex,
} from "../../src/utils/pianorollCoordinates";

describe("pianorollCoordinates", () => {
  const createNote = (notenum: number) => {
    const n = new Note();
    n.length = 480;
    n.notenum = notenum;
    return n;
  };
  const notes = new Array();
  notes.push(createNote(60));
  notes.push(createNote(107));
  notes.push(createNote(24));
  const notesLeft = [0, 480, 960];

  describe("getTargetNoteIndexFromX", () => {
    it("x座標に応じたindexを返す", () => {
      expect(getTargetNoteIndexFromX(0, notes, notesLeft, 1)).toBe(0);
      // 479 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで0が返るはず
      expect(
        getTargetNoteIndexFromX(
          479 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          notes,
          notesLeft,
          1
        )
      ).toBe(0);
      // 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで1が返るはず
      expect(
        getTargetNoteIndexFromX(
          480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          notes,
          notesLeft,
          1
        )
      ).toBe(1);
      // 960 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで2が返るはず
      expect(
        getTargetNoteIndexFromX(
          960 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          notes,
          notesLeft,
          1
        )
      ).toBe(2);
      // 1439 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで2が返るはず
      expect(
        getTargetNoteIndexFromX(
          1439 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          notes,
          notesLeft,
          1
        )
      ).toBe(2);
      // 1440 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomでundefinedが返るはず
      expect(
        getTargetNoteIndexFromX(
          1440 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          notes,
          notesLeft,
          1
        )
      ).toBe(undefined);
      // 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで2が返るはず
      expect(
        getTargetNoteIndexFromX(
          480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          notes,
          notesLeft,
          0.5
        )
      ).toBe(2);
    });

    it("空配列の場合は-1を返す", () => {
      const result = getTargetNoteIndexFromX(0, [], [], 1);
      expect(result).toBe(-1);
    });

    it("負のX座標の場合は最後のノートより前のインデックスを返す", () => {
      const result = getTargetNoteIndexFromX(-100, notes, notesLeft, 1);
      // 負のX座標の場合、findIndexが0を返し、0-1=-1となり、notes.length-1が返される
      expect(result).toBe(notes.length - 1);
    });
  });

  describe("getTargetNoteIndex", () => {
    it("x座標とy座標を換算してノート上であればindexを返す", () => {
      expect(
        getTargetNoteIndex(
          { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(0);
      expect(
        getTargetNoteIndex(
          {
            x: 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
            y: (107 - 107) * PIANOROLL_CONFIG.KEY_HEIGHT,
          },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(1);
      expect(
        getTargetNoteIndex(
          {
            x: 960 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
            y: (107 - 24) * PIANOROLL_CONFIG.KEY_HEIGHT,
          },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(2);
      // verticalZoomの影響確認
      expect(
        getTargetNoteIndex(
          { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT * 2 },
          notes,
          notesLeft,
          1,
          2
        )
      ).toBe(0);
    });

    it("x座標とy座標が一致しなければundefinedを返す", () => {
      // これが上側境界になるはず
      expect(
        getTargetNoteIndex(
          { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(0);
      // これが下側境界になるはず
      expect(
        getTargetNoteIndex(
          { x: 0, y: (107 - 59) * PIANOROLL_CONFIG.KEY_HEIGHT - 1 },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(0);
      // これが下側境界より1pixel下になるはず
      expect(
        getTargetNoteIndex(
          { x: 0, y: (107 - 59) * PIANOROLL_CONFIG.KEY_HEIGHT },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(undefined);
      // これが上側境界より1pixel上になるはず
      expect(
        getTargetNoteIndex(
          { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT - 1 },
          notes,
          notesLeft,
          1,
          1
        )
      ).toBe(undefined);
    });

    it("範囲外のnotenumの場合はundefinedを返す", () => {
      const result = getTargetNoteIndex(
        {
          x: 0,
          y: -100, // 範囲外のY座標
        } as DOMPoint,
        notes,
        notesLeft,
        1,
        1
      );
      expect(result).toBe(undefined);
    });
  });

  describe("getTargetPpltamentIndex", () => {
    it("ポルタメント領域内をクリックした場合はインデックスを返す", () => {
      const poltaments = [
        { x: 100, y: 200 },
        { x: 300, y: 400 },
      ];
      const result = getTargetPpltamentIndex({ x: 105, y: 205 }, poltaments);
      expect(result).toBe(0);
    });

    it("複数のポルタメントがある場合は最も近いものを返す", () => {
      const poltaments = [
        { x: 100, y: 200 },
        { x: 200, y: 300 },
        { x: 300, y: 400 },
      ];
      const result = getTargetPpltamentIndex({ x: 205, y: 305 }, poltaments);
      expect(result).toBe(1);
    });

    it("閾値より遠い場合はundefinedを返す", () => {
      const poltaments = [{ x: 100, y: 200 }];
      const result = getTargetPpltamentIndex({ x: 1000, y: 1000 }, poltaments);
      expect(result).toBe(undefined);
    });

    it("空配列の場合はundefinedを返す", () => {
      const result = getTargetPpltamentIndex({ x: 100, y: 200 }, []);
      expect(result).toBe(undefined);
    });
  });
});
