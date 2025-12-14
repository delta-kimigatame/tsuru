import { beforeEach, describe, expect, it } from "vitest";
import { LyricTorestBatchProcess } from "../../../src/lib/BatchProcess/LyricToRestBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "あ";
  notes[0].length = 480;
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 61;
  notes[1].lyric = "い";
  notes[1].length = 480;
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 62;
  notes[2].lyric = "う";
  notes[2].length = 480;
  return notes;
};

describe("LyricTorestBatchProcess", () => {
  const bp = new LyricTorestBatchProcess();
  beforeEach(() => {
    undoManager.clear();
  });

  it("全ての歌詞を休符に変更する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes);

    expect(result[0].lyric).toBe("R");
    expect(result[1].lyric).toBe("R");
    expect(result[2].lyric).toBe("R");

    // 元のノートは変更されていないことを確認
    expect(notes[0].lyric).toBe("あ");
    expect(notes[1].lyric).toBe("い");
    expect(notes[2].lyric).toBe("う");
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes);

    expect(undoManager.undoSummary).toBe("lyric:歌詞を休符に一括変更");
    expect(result.every((n) => n.lyric === "R")).toBe(true);

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("lyric:歌詞を休符に一括変更");
    expect(undo[0].lyric).toBe("あ");
    expect(undo[1].lyric).toBe("い");
    expect(undo[2].lyric).toBe("う");

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("lyric:歌詞を休符に一括変更");
    expect(redo.every((n) => n.lyric === "R")).toBe(true);
  });

  it("既に休符のノートも処理される", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "R";
    notes.push(new Note());
    notes[1].lyric = "あ";

    const result = bp.process(notes);

    expect(result[0].lyric).toBe("R");
    expect(result[1].lyric).toBe("R");
  });
});
