import { beforeEach, describe, expect, it } from "vitest";
import { AddSuffixBatchProcess } from "../../../src/lib/BatchProcess/AddSuffixBatchProcess";
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
  notes[2].lyric = "い";
  notes[2].length = 480;
  return notes;
};

describe("AddSuffixBatchProcess", () => {
  const bp = new AddSuffixBatchProcess();
  beforeEach(() => {
    undoManager.clear();
  });

  it("歌詞末尾にサフィックスを追加する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { suffixValue: "↑" });

    // 休符は変更されない
    expect(result[0].lyric).toBe("R");

    // 通常ノートにはサフィックスが追加される
    expect(result[1].lyric).toBe("あ↑");
    expect(result[2].lyric).toBe("い↑");

    // 元のノートは変更されていないことを確認
    expect(notes[1].lyric).toBe("あ");
    expect(notes[2].lyric).toBe("い");
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { suffixValue: "↓" });

    expect(undoManager.undoSummary).toBe(
      "lyric:歌詞末尾にサフィックスを一括追加"
    );
    expect(result[1].lyric).toBe("あ↓");
    expect(result[2].lyric).toBe("い↓");

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe(
      "lyric:歌詞末尾にサフィックスを一括追加"
    );
    expect(undo[1].lyric).toBe("あ");
    expect(undo[2].lyric).toBe("い");

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe(
      "lyric:歌詞末尾にサフィックスを一括追加"
    );
    expect(redo[1].lyric).toBe("あ↓");
    expect(redo[2].lyric).toBe("い↓");
  });

  it("空文字列のサフィックスを追加する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { suffixValue: "" });

    // 空文字列でも処理は実行されるが、歌詞は変わらない
    expect(result[0].lyric).toBe("R");
    expect(result[1].lyric).toBe("あ");
    expect(result[2].lyric).toBe("い");
  });

  it("複数文字のサフィックスを追加する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { suffixValue: " C4" });

    expect(result[0].lyric).toBe("R");
    expect(result[1].lyric).toBe("あ C4");
    expect(result[2].lyric).toBe("い C4");
  });

  it("既にサフィックスがある歌詞にも追加される", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "あ↑";
    notes.push(new Note());
    notes[1].lyric = "い↓";

    const result = bp.process(notes, { suffixValue: "!" });

    expect(result[0].lyric).toBe("あ↑!");
    expect(result[1].lyric).toBe("い↓!");
  });
});
