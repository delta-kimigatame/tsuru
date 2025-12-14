import { beforeEach, describe, expect, it } from "vitest";
import { LengthQuantizeBatchProcess } from "../../../src/lib/BatchProcess/LengthQuantizeBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "あ";
  notes[0].length = 125;
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 62;
  notes[1].lyric = "い";
  notes[1].length = 95;
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 64;
  notes[2].lyric = "う";
  notes[2].length = 15;
  notes.push(new Note());
  notes[3].index = 3;
  notes[3].notenum = 65;
  notes[3].lyric = "え";
  notes[3].length = 240;
  return notes;
};

describe("LengthQuantizeBatchProcess", () => {
  beforeEach(() => {
    undoManager.clear();
  });

  it("ノート長を指定の値に丸める", () => {
    const notes = createTestNotes();
    const batchProcess = new LengthQuantizeBatchProcess();
    const result = batchProcess.process(notes, {
      quantizeValue: 60,
      isDeleteZero: false,
    });

    // 125 -> 120, 95 -> 120, 15 -> 0 -> 60(切り上げ), 240 -> 240
    expect(result.length).toBe(4);
    expect(result[0].length).toBe(120);
    expect(result[1].length).toBe(120);
    expect(result[2].length).toBe(60); // isDeleteZero: falseなので切り上げ
    expect(result[3].length).toBe(240);
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const batchProcess = new LengthQuantizeBatchProcess();

    // process
    const result1 = batchProcess.process(notes, {
      quantizeValue: 80,
      isDeleteZero: false,
    });
    // 125 -> 160, 95 -> 80, 15 -> 0 -> 80(切り上げ), 240 -> 240
    expect(result1.length).toBe(4);
    expect(result1[0].length).toBe(160);
    expect(result1[1].length).toBe(80);
    expect(result1[2].length).toBe(80);
    expect(result1[3].length).toBe(240);

    // undo
    const result2 = undoManager.undo(notes);
    expect(result2.length).toBe(4);
    expect(result2[0].length).toBe(125); // 元の値に戻る
    expect(result2[1].length).toBe(95);
    expect(result2[2].length).toBe(15);
    expect(result2[3].length).toBe(240);

    // redo
    const result3 = undoManager.redo(notes);
    expect(result3.length).toBe(4);
    expect(result3[0].length).toBe(160);
    expect(result3[1].length).toBe(80);
    expect(result3[2].length).toBe(80);
    expect(result3[3].length).toBe(240);
  });

  it("isDeleteZero: trueの場合、丸めて0になったノートを削除する", () => {
    const notes = createTestNotes();
    const batchProcess = new LengthQuantizeBatchProcess();

    const result = batchProcess.process(notes, {
      quantizeValue: 60,
      isDeleteZero: true,
    });

    // 125 -> 120, 95 -> 120, 15 -> 0 (削除), 240 -> 240
    expect(result.length).toBe(3);
    expect(result[0].lyric).toBe("あ");
    expect(result[0].length).toBe(120);
    expect(result[1].lyric).toBe("い");
    expect(result[1].length).toBe(120);
    expect(result[2].lyric).toBe("え"); // "う"は削除
    expect(result[2].length).toBe(240);
  });

  it("quantizeValue: 30の場合", () => {
    const notes = createTestNotes();
    const batchProcess = new LengthQuantizeBatchProcess();

    const result = batchProcess.process(notes, {
      quantizeValue: 30,
      isDeleteZero: false,
    });

    // 125 -> 120, 95 -> 90, 15 -> 30, 240 -> 240
    expect(result.length).toBe(4);
    expect(result[0].length).toBe(120);
    expect(result[1].length).toBe(90);
    expect(result[2].length).toBe(30);
    expect(result[3].length).toBe(240);
  });

  it("quantizeValue: 240の場合", () => {
    const notes = createTestNotes();
    const batchProcess = new LengthQuantizeBatchProcess();

    const result = batchProcess.process(notes, {
      quantizeValue: 240,
      isDeleteZero: false,
    });

    // 125 -> 0 -> 240, 95 -> 0 -> 240, 15 -> 0 -> 240, 240 -> 240
    expect(result.length).toBe(4);
    expect(result[0].length).toBe(240);
    expect(result[1].length).toBe(240);
    expect(result[2].length).toBe(240);
    expect(result[3].length).toBe(240);
  });

  it("ちょうど丸め値で割り切れる長さは変化しない", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60;
    notes[0].lyric = "あ";
    notes[0].length = 120;
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].notenum = 62;
    notes[1].lyric = "い";
    notes[1].length = 180;
    notes.push(new Note());
    notes[2].index = 2;
    notes[2].notenum = 64;
    notes[2].lyric = "う";
    notes[2].length = 240;

    const batchProcess = new LengthQuantizeBatchProcess();
    const result = batchProcess.process(notes, {
      quantizeValue: 60,
      isDeleteZero: false,
    });

    expect(result.length).toBe(3);
    expect(result[0].length).toBe(120);
    expect(result[1].length).toBe(180);
    expect(result[2].length).toBe(240);
  });

  it("丸め境界値のテスト: 四捨五入の挙動", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60;
    notes[0].lyric = "あ";
    notes[0].length = 44; // 44 / 60 = 0.733... -> 0 -> 60
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].notenum = 62;
    notes[1].lyric = "い";
    notes[1].length = 45; // 45 / 60 = 0.75 -> 60
    notes.push(new Note());
    notes[2].index = 2;
    notes[2].notenum = 64;
    notes[2].lyric = "う";
    notes[2].length = 89; // 89 / 60 = 1.483... -> 60
    notes.push(new Note());
    notes[3].index = 3;
    notes[3].notenum = 65;
    notes[3].lyric = "え";
    notes[3].length = 90; // 90 / 60 = 1.5 -> 120

    const batchProcess = new LengthQuantizeBatchProcess();
    const result = batchProcess.process(notes, {
      quantizeValue: 60,
      isDeleteZero: false,
    });

    expect(result.length).toBe(4);
    expect(result[0].length).toBe(60); // 0 -> 60に切り上げ
    expect(result[1].length).toBe(60);
    expect(result[2].length).toBe(60);
    expect(result[3].length).toBe(120);
  });
});
