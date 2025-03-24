import { describe, expect, it } from "vitest";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import {
  getTargetNoteIndex,
  getTargetNoteIndexFromX,
} from "../../../../src/features/EditorView/Pianoroll/PianorollTouch";
import { Note } from "../../../../src/lib/Note";

describe("PianorollToutchUtilty", () => {
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
  it("getTargetNoteIndexFromX:x座標に応じたindexを返す", () => {
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
  it("getTargetNoteIndex:x座標とy座標を換算してノート上であればindexを返す", () => {
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
  it("getTargetNoteIndex:x座標とy座標が一致しなければundefinedを返す", () => {
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
});
