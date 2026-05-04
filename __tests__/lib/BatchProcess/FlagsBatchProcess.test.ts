import { beforeEach, describe, expect, it } from "vitest";
import { FlagsBatchProcess } from "../../../src/lib/BatchProcess/FlagsBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();

  notes.push(new Note());
  notes[0].index = 0;
  notes[0].lyric = "R";
  notes[0].flags = "g+5";

  notes.push(new Note());
  notes[1].index = 1;
  notes[1].lyric = "あ";
  notes[1].flags = "B20";

  notes.push(new Note());
  notes[2].index = 2;
  notes[2].lyric = "い";
  notes[2].flags = "P86";

  return notes;
};

describe("FlagsBatchProcess", () => {
  const bp = new FlagsBatchProcess();

  beforeEach(() => {
    undoManager.clear();
  });

  it("休符以外のフラグを一括変更する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { flagsValue: "g-20Mt30" });

    expect(result[0].flags).toBe("g+5");
    expect(result[1].flags).toBe("g-20Mt30");
    expect(result[2].flags).toBe("g-20Mt30");

    expect(notes[1].flags).toBe("B20");
    expect(notes[2].flags).toBe("P86");
  });

  it("process、undo、redoが正しく動作する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { flagsValue: "Y99" });

    expect(undoManager.undoSummary).toBe("flags:フラグを一括設定");
    expect(result[1].flags).toBe("Y99");
    expect(result[2].flags).toBe("Y99");

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("flags:フラグを一括設定");
    expect(undo[1].flags).toBe("B20");
    expect(undo[2].flags).toBe("P86");

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("flags:フラグを一括設定");
    expect(redo[1].flags).toBe("Y99");
    expect(redo[2].flags).toBe("Y99");
  });
});
