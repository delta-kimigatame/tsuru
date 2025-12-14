import { beforeEach, describe, expect, it } from "vitest";
import { LyricBatchProcess } from "../../../src/lib/BatchProcess/LyricBatchProcess";
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
  notes[1].notenum = 62;
  notes[1].lyric = "い";
  notes[1].length = 480;
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 64;
  notes[2].lyric = "う";
  notes[2].length = 480;
  notes.push(new Note());
  notes[3].index = 3;
  notes[3].notenum = 65;
  notes[3].lyric = "え";
  notes[3].length = 480;
  return notes;
};

describe("LyricBatchProcess", () => {
  beforeEach(() => {
    undoManager.clear();
  });

  it("ひらがな歌詞を音節ごとにノートに割り当てる", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "かきくけ",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("か");
    expect(result[1].lyric).toBe("き");
    expect(result[2].lyric).toBe("く");
    expect(result[3].lyric).toBe("け");
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();

    // process
    const result1 = batchProcess.process(notes, {
      lyricsValue: "さしすせ",
    });
    expect(result1[0].lyric).toBe("さ");
    expect(result1[1].lyric).toBe("し");
    expect(result1[2].lyric).toBe("す");
    expect(result1[3].lyric).toBe("せ");

    // undo
    const result2 = undoManager.undo(notes);
    expect(result2[0].lyric).toBe("あ");
    expect(result2[1].lyric).toBe("い");
    expect(result2[2].lyric).toBe("う");
    expect(result2[3].lyric).toBe("え");

    // redo
    const result3 = undoManager.redo(notes);
    expect(result3[0].lyric).toBe("さ");
    expect(result3[1].lyric).toBe("し");
    expect(result3[2].lyric).toBe("す");
    expect(result3[3].lyric).toBe("せ");
  });

  it("拗音を含むひらがな歌詞を正しく分割する", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "きゃきゅきょか",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("きゃ");
    expect(result[1].lyric).toBe("きゅ");
    expect(result[2].lyric).toBe("きょ");
    expect(result[3].lyric).toBe("か");
  });

  it("休符Rを含むひらがな歌詞を正しく分割する", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "あRいR",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("あ");
    expect(result[1].lyric).toBe("R");
    expect(result[2].lyric).toBe("い");
    expect(result[3].lyric).toBe("R");
  });

  it("英数字の場合は半角スペースで分割する", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "a b c d",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("a");
    expect(result[1].lyric).toBe("b");
    expect(result[2].lyric).toBe("c");
    expect(result[3].lyric).toBe("d");
  });

  it("英数字の連続した文字列を半角スペースで分割する", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "do re mi fa",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("do");
    expect(result[1].lyric).toBe("re");
    expect(result[2].lyric).toBe("mi");
    expect(result[3].lyric).toBe("fa");
  });

  it("音節数がノート数より少ない場合、短い方まで割り当てる", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "たち",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("た");
    expect(result[1].lyric).toBe("ち");
    expect(result[2].lyric).toBe("う"); // 元のまま
    expect(result[3].lyric).toBe("え"); // 元のまま
  });

  it("音節数がノート数より多い場合、ノート数まで割り当てる", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "なにぬねのは",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("な");
    expect(result[1].lyric).toBe("に");
    expect(result[2].lyric).toBe("ぬ");
    expect(result[3].lyric).toBe("ね");
    // "の"と"は"は割り当てられない
  });

  it("空文字列の場合、歌詞は変更されない", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("あ");
    expect(result[1].lyric).toBe("い");
    expect(result[2].lyric).toBe("う");
    expect(result[3].lyric).toBe("え");
  });

  it("半角スペースのみの英数字入力の場合、歌詞は変更されない", () => {
    const notes = createTestNotes();
    const batchProcess = new LyricBatchProcess();
    const result = batchProcess.process(notes, {
      lyricsValue: "   ",
    });

    expect(result.length).toBe(4);
    expect(result[0].lyric).toBe("あ");
    expect(result[1].lyric).toBe("い");
    expect(result[2].lyric).toBe("う");
    expect(result[3].lyric).toBe("え");
  });
});
