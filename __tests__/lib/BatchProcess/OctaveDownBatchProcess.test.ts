import { beforeEach, describe, expect, it } from "vitest";
import { OctaveDownBatchProcess } from "../../../src/lib/BatchProcess/OctaveDownBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "R";
  notes[0].length = 480;
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 60;
  notes[1].lyric = "あ";
  notes[1].length = 480;
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 61;
  notes[2].lyric = "あ";
  notes[2].length = 480;
  return notes;
};

describe("OctaveDownBatchProcess", () => {
  beforeEach(() => {
    /** 各テスト実行前にundoManagerを初期化しておく */
    undoManager.clear();
  });
  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const bp = new OctaveDownBatchProcess();
    /** 実行前の確認 */
    expect(undoManager.undoSummary).toBeUndefined();
    const results = bp.process(notes);
    /** 実行結果の確認 */
    expect(results[0].notenum).toBe(48);
    expect(results[1].notenum).toBe(48);
    expect(results[2].notenum).toBe(49);
    expect(undoManager.undoSummary).toBe("1オクターブ下げる");
    const undoNotes = undoManager.undo();
    expect(undoNotes[0].notenum).toBe(60);
    expect(undoNotes[1].notenum).toBe(60);
    expect(undoNotes[2].notenum).toBe(61);
    expect(undoManager.undoSummary).toBeUndefined();
    expect(undoManager.redoSummary).toBe("1オクターブ下げる");
    const redoNotes = undoManager.redo();
    expect(redoNotes[0].notenum).toBe(48);
    expect(redoNotes[1].notenum).toBe(48);
    expect(redoNotes[2].notenum).toBe(49);
    expect(undoManager.undoSummary).toBe("1オクターブ下げる");
  });
});
