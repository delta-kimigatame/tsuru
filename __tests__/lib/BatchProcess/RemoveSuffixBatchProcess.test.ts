import { beforeEach, describe, expect, it } from "vitest";
import { RemoveSuffixBatchProcess } from "../../../src/lib/BatchProcess/RemoveSuffixBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "- あ↑";
  notes[0].length = 480;
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 62;
  notes[1].lyric = "a い_2";
  notes[1].length = 480;
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 64;
  notes[2].lyric = "う123";
  notes[2].length = 480;
  notes.push(new Note());
  notes[3].index = 3;
  notes[3].notenum = 65;
  notes[3].lyric = "R";
  notes[3].length = 480;
  return notes;
};

describe("RemoveSuffixBatchProcess", () => {
  beforeEach(() => {
    undoManager.clear();
  });

  it("suffixRemoveMode: all で接尾辞を全て削除する", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "all",
      prefixRemoveMode: "none",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("- あ");
    expect(result[1].lyric).toBe("a い");
    expect(result[2].lyric).toBe("う");
    expect(result[3].lyric).toBe("R"); // 休符は変更されない
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();

    // process
    const result1 = batchProcess.process(notes, {
      suffixRemoveMode: "all",
      prefixRemoveMode: "all",
    });
    expect(result1[0].lyric).toBe("あ");
    expect(result1[1].lyric).toBe("い");
    expect(result1[2].lyric).toBe("う");
    expect(result1[3].lyric).toBe("R");

    // undo
    const result2 = undoManager.undo(notes);
    expect(result2[0].lyric).toBe("- あ↑");
    expect(result2[1].lyric).toBe("a い_2");
    expect(result2[2].lyric).toBe("う123");
    expect(result2[3].lyric).toBe("R");

    // redo
    const result3 = undoManager.redo(notes);
    expect(result3[0].lyric).toBe("あ");
    expect(result3[1].lyric).toBe("い");
    expect(result3[2].lyric).toBe("う");
    expect(result3[3].lyric).toBe("R");
  });

  it("suffixRemoveMode: underbar でアンダーバー以降を削除する", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "underbar",
      prefixRemoveMode: "none",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("- あ↑"); // アンダーバーなし
    expect(result[1].lyric).toBe("a い"); // "_2"が削除
    expect(result[2].lyric).toBe("う123"); // アンダーバーなし
    expect(result[3].lyric).toBe("R");
  });

  it("suffixRemoveMode: number で数字のみ削除する", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "number",
      prefixRemoveMode: "none",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("- あ↑"); // 数字なし
    expect(result[1].lyric).toBe("a い_"); // "2"のみ削除、"_"は残る
    expect(result[2].lyric).toBe("う"); // "123"が削除
    expect(result[3].lyric).toBe("R");
  });

  it("suffixRemoveMode: none で接尾辞は削除されない", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "none",
      prefixRemoveMode: "none",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("- あ↑");
    expect(result[1].lyric).toBe("a い_2");
    expect(result[2].lyric).toBe("う123");
    expect(result[3].lyric).toBe("R");
  });

  it("prefixRemoveMode: all でひらがなより前を全て削除する", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "none",
      prefixRemoveMode: "all",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("あ↑"); // "- "が削除
    expect(result[1].lyric).toBe("い_2"); // "a "が削除
    expect(result[2].lyric).toBe("う123"); // 接頭辞なし
    expect(result[3].lyric).toBe("R");
  });

  it("prefixRemoveMode: blank で半角スペース以前を削除する", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60;
    notes[0].lyric = "prefix あ";
    notes[0].length = 480;
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].notenum = 62;
    notes[1].lyric = "abc い";
    notes[1].length = 480;
    notes.push(new Note());
    notes[2].index = 2;
    notes[2].notenum = 64;
    notes[2].lyric = "う";
    notes[2].length = 480;

    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "none",
      prefixRemoveMode: "blank",
    });

    expect(result.length).toBe(3);
    expect(result[0].lyric).toBe("あ"); // "prefix "が削除
    expect(result[1].lyric).toBe("い"); // "abc "が削除
    expect(result[2].lyric).toBe("う"); // 半角スペースなし
  });

  it("prefixRemoveMode: none で接頭辞は削除されない", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "none",
      prefixRemoveMode: "none",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("- あ↑");
    expect(result[1].lyric).toBe("a い_2");
    expect(result[2].lyric).toBe("う123");
    expect(result[3].lyric).toBe("R");
  });

  it("prefix と suffix を同時に削除する", () => {
    const notes = createTestNotes();
    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "all",
      prefixRemoveMode: "all",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("あ"); // "- "と"↑"が削除
    expect(result[1].lyric).toBe("い"); // "a "と"_2"が削除
    expect(result[2].lyric).toBe("う"); // "123"が削除
    expect(result[3].lyric).toBe("R");
  });

  it("カタカナを含む歌詞の処理", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60;
    notes[0].lyric = "- ア↑";
    notes[0].length = 480;
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].notenum = 62;
    notes[1].lyric = "b イ_2";
    notes[1].length = 480;

    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "all",
      prefixRemoveMode: "all",
    });

    expect(result.length).toBe(2);
    expect(result[0].lyric).toBe("ア");
    expect(result[1].lyric).toBe("イ");
  });

  it("ひらがなが含まれない歌詞の場合、マッチしない", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60;
    notes[0].lyric = "abc123";
    notes[0].length = 480;
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].notenum = 62;
    notes[1].lyric = "xyz_456";
    notes[1].length = 480;

    const batchProcess = new RemoveSuffixBatchProcess();
    const result = batchProcess.process(notes, {
      suffixRemoveMode: "all",
      prefixRemoveMode: "all",
    });

    expect(result.length).toBe(2);
    expect(result[0].lyric).toBe("abc123"); // マッチしないので変更なし
    expect(result[1].lyric).toBe("xyz_456"); // マッチしないので変更なし
  });

  it("複雑な組み合わせのテスト", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60;
    notes[0].lyric = "pre あ_suf123";
    notes[0].length = 480;

    const batchProcess = new RemoveSuffixBatchProcess();

    // underbar + blank
    const result1 = batchProcess.process(notes, {
      suffixRemoveMode: "underbar",
      prefixRemoveMode: "blank",
    });
    expect(result1[0].lyric).toBe("あ");

    // number + all
    undoManager.clear();
    const result2 = batchProcess.process(notes, {
      suffixRemoveMode: "number",
      prefixRemoveMode: "all",
    });
    expect(result2[0].lyric).toBe("あ_suf");
  });
});
