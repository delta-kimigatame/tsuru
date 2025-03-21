import { beforeEach, describe, expect, it } from "vitest";
import { BaseBatchProcess } from "../../src/lib/BaseBatchProcess";
import { Note } from "../../src/lib/Note";
import { undoManager } from "../../src/lib/UndoManager";

class DummyBatchProcess extends BaseBatchProcess<number> {
  title = "batchProcess.dummy";
  summary = "BaseBatchProcessにおける共通機能を検証するためのdummy";
  protected _process(notes: Note[], options: number = 1): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => (n.notenum = n.notenum + options));
    return newNotes;
  }
}

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

describe("BaseBarchProcess", () => {
  beforeEach(() => {
    /** 書くテスト実行前にundoManagerを初期化しておく */
    undoManager.clear();
  });
  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const bp = new DummyBatchProcess();
    /** 実行前の確認 */
    expect(undoManager.undoSummary).toBeUndefined();
    const results = bp.process(notes);
    /** 実行結果の確認 */
    expect(results[0].notenum).toBe(61);
    expect(results[1].notenum).toBe(61);
    expect(results[2].notenum).toBe(62);
    expect(undoManager.undoSummary).toBe(
      "BaseBatchProcessにおける共通機能を検証するためのdummy"
    );
    const undoNotes = undoManager.undo();
    expect(undoNotes[0].notenum).toBe(60);
    expect(undoNotes[1].notenum).toBe(60);
    expect(undoNotes[2].notenum).toBe(61);
    expect(undoManager.undoSummary).toBeUndefined();
    expect(undoManager.redoSummary).toBe(
      "BaseBatchProcessにおける共通機能を検証するためのdummy"
    );
    const redoNotes = undoManager.redo();
    expect(redoNotes[0].notenum).toBe(61);
    expect(redoNotes[1].notenum).toBe(61);
    expect(redoNotes[2].notenum).toBe(62);
    expect(undoManager.undoSummary).toBe(
      "BaseBatchProcessにおける共通機能を検証するためのdummy"
    );
  });
  it("optionsの動作を確認する", () => {
    const notes = createTestNotes();
    const bp = new DummyBatchProcess();
    /** 実行前の確認 */
    expect(undoManager.undoSummary).toBeUndefined();
    const results = bp.process(notes, 3);
    /** 実行結果の確認 */
    expect(results[0].notenum).toBe(63);
    expect(results[1].notenum).toBe(63);
    expect(results[2].notenum).toBe(64);
    expect(undoManager.undoSummary).toBe(
      "BaseBatchProcessにおける共通機能を検証するためのdummy"
    );
    const undoNotes = undoManager.undo();
    expect(undoNotes[0].notenum).toBe(60);
    expect(undoNotes[1].notenum).toBe(60);
    expect(undoNotes[2].notenum).toBe(61);
    expect(undoManager.undoSummary).toBeUndefined();
    expect(undoManager.redoSummary).toBe(
      "BaseBatchProcessにおける共通機能を検証するためのdummy"
    );
    const redoNotes = undoManager.redo();
    expect(redoNotes[0].notenum).toBe(63);
    expect(redoNotes[1].notenum).toBe(63);
    expect(redoNotes[2].notenum).toBe(64);
    expect(undoManager.undoSummary).toBe(
      "BaseBatchProcessにおける共通機能を検証するためのdummy"
    );
  });
  it("空のnotesを渡したときの動作", () => {
    const bp = new DummyBatchProcess();
    expect(undoManager.undoSummary).toBeUndefined();
    const results = bp.process([]);
    expect(results.length).toBe(0);
    /** 空のnotesを渡したときにはundoを更新しない */
    expect(undoManager.undoSummary).toBeUndefined();
  });
});
