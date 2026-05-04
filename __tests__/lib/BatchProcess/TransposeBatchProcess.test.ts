import { beforeEach, describe, expect, it } from "vitest";
import { TransposeBatchProcess } from "../../../src/lib/BatchProcess/TransposeBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();

  notes.push(new Note());
  notes[0].index = 0;
  notes[0].lyric = "あ";
  notes[0].notenum = 60; // C4

  notes.push(new Note());
  notes[1].index = 1;
  notes[1].lyric = "い";
  notes[1].notenum = 64; // E4

  return notes;
};

describe("TransposeBatchProcess", () => {
  let bp: TransposeBatchProcess;

  beforeEach(() => {
    undoManager.clear();
    bp = new TransposeBatchProcess();
  });

  it("指定したセミトーン数だけ音階を上げる", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { semitones: 3 });

    expect(result[0].notenum).toBe(63);
    expect(result[1].notenum).toBe(67);

    expect(notes[0].notenum).toBe(60);
    expect(notes[1].notenum).toBe(64);
  });

  it("指定したセミトーン数だけ音階を下げる", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { semitones: -5 });

    expect(result[0].notenum).toBe(55);
    expect(result[1].notenum).toBe(59);
  });

  it("semitones が 0 の場合はno-op", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { semitones: 0 });

    expect(result[0].notenum).toBe(60);
    expect(result[1].notenum).toBe(64);
  });

  it("process、undo、redoが正しく動作する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { semitones: 7 });

    expect(undoManager.undoSummary).toBe("notenum:音階を移調する");
    expect(result[0].notenum).toBe(67);
    expect(result[1].notenum).toBe(71);

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("notenum:音階を移調する");
    expect(undo[0].notenum).toBe(60);
    expect(undo[1].notenum).toBe(64);

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("notenum:音階を移調する");
    expect(redo[0].notenum).toBe(67);
    expect(redo[1].notenum).toBe(71);
  });
});
