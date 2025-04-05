import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import {
  getTargetNoteIndex,
  getTargetNoteIndexFromX,
  handleAddModeTap,
  handlePitchModeTap,
  handleRangeModeTap,
  handleToggleModeTap,
} from "../../../../src/features/EditorView/Pianoroll/PianorollTouch";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";

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
  beforeEach(() => {
    undoManager.clear();
  });
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

  it("handleToggleModeTap:未選択の場合、ソートして追加される", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    handleToggleModeTap([1], 0, setSelectedNotesIndexSpy);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0, 1]);
  });

  it("handleToggleModeTap:選択済みの場合、除外される", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    handleToggleModeTap([0, 1], 0, setSelectedNotesIndexSpy);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([1]);
  });

  it("handleRangeModeTap:startIndexがundefinedの場合、startIndexが更新され、スナックバーが表示される", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    const setStartIndexSpy = vi.fn();
    const setSeveritySpy = vi.fn();
    const setValueSpy = vi.fn();
    const setOpenSpy = vi.fn();
    handleRangeModeTap(
      undefined,
      0,
      setStartIndexSpy,
      setSelectedNotesIndexSpy,
      setSeveritySpy,
      setValueSpy,
      setOpenSpy,
      "test"
    );
    expect(setSelectedNotesIndexSpy).not.toHaveBeenCalled();
    expect(setStartIndexSpy).toHaveBeenCalledWith(0);
    expect(setSeveritySpy).toHaveBeenCalledWith("info");
    expect(setValueSpy).toHaveBeenCalledWith("test");
    expect(setOpenSpy).toHaveBeenCalledWith(true);
  });

  it("handleRangeModeTap:startIndexが非undefinedの場合、startIndex～targetIndexがselectされる", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    const setStartIndexSpy = vi.fn();
    const setSeveritySpy = vi.fn();
    const setValueSpy = vi.fn();
    const setOpenSpy = vi.fn();
    handleRangeModeTap(
      0,
      5,
      setStartIndexSpy,
      setSelectedNotesIndexSpy,
      setSeveritySpy,
      setValueSpy,
      setOpenSpy,
      "test"
    );
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0, 1, 2, 3, 4, 5]);
    expect(setStartIndexSpy).not.toHaveBeenCalled();
    expect(setSeveritySpy).not.toHaveBeenCalled();
    expect(setValueSpy).not.toHaveBeenCalled();
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("handlePitchModeTap:poltamentをタップした場合、選択ポルタメントを切り替える", () => {
    const setTargetPoltamentSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    handlePitchModeTap(
      notes,
      [0],
      1,
      undefined,
      setTargetPoltamentSpy,
      setSelectedNotesIndexSpy
    );
    expect(setTargetPoltamentSpy).toHaveBeenCalledWith(1);
  });

  it("handlePitchModeTap:ノートをタップした場合で、そのノートのlyricが非Rの場合、ノートを切り替える", () => {
    const setTargetPoltamentSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    handlePitchModeTap(
      notes,
      [0],
      undefined,
      1,
      setTargetPoltamentSpy,
      setSelectedNotesIndexSpy
    );
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([1]);
  });

  it("handlePitchModeTap:ノートをタップした場合で、そのノートのlyricがRの場合、ノートを切り替えない", () => {
    const setTargetPoltamentSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    notes[2].lyric = "R";
    handlePitchModeTap(
      notes,
      [0],
      undefined,
      2,
      setTargetPoltamentSpy,
      setSelectedNotesIndexSpy
    );
    expect(setSelectedNotesIndexSpy).not.toHaveBeenCalled();
  });

  it("handleAddModeTap:ノート末尾より右側をタップした場合、末尾にノートを追加する", () => {
    const setNotesSpy = vi.fn();
    handleAddModeTap(
      {
        x: 1440 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT,
      } as DOMPoint,
      notes,
      notesLeft,
      120,
      480,
      "new",
      1,
      1,
      setNotesSpy
    );
    const resultNotes = setNotesSpy.mock.calls[0][0];
    expect(resultNotes.length).toBe(4);
    expect(resultNotes.slice(0, 3)).toEqual(notes);
    expect(resultNotes[3].lyric).toBe("new");
    expect(resultNotes[3].length).toBe(480);
    expect(resultNotes[3].notenum).toBe(60);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual(notes);
    expect(redoResult).toEqual(resultNotes);
  });
  it("handleAddModeTap:ノート末尾より左側をタップした場合、タップしたノートの左側にノートを追加する", () => {
    const setNotesSpy = vi.fn();
    handleAddModeTap(
      {
        x: 0,
        y: (107 - 61) * PIANOROLL_CONFIG.KEY_HEIGHT,
      } as DOMPoint,
      notes,
      notesLeft,
      120,
      240,
      "new2",
      1,
      1,
      setNotesSpy
    );
    const resultNotes = setNotesSpy.mock.calls[0][0];
    expect(resultNotes.length).toBe(4);
    expect(resultNotes.slice(1, 4)).toEqual(notes);
    expect(resultNotes[0].lyric).toBe("new2");
    expect(resultNotes[0].length).toBe(240);
    expect(resultNotes[0].notenum).toBe(61);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual(notes);
    expect(redoResult).toEqual(resultNotes);
  });
});
