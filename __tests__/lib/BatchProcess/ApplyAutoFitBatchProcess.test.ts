import { beforeEach, describe, expect, it } from "vitest";
import { ApplyAutoFitBatchProcess } from "../../../src/lib/BatchProcess/ApplyAutoFitBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();

  // 休符ノート
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "R";
  notes[0].length = 480;
  notes[0].preutter = 100.0;
  notes[0].overlap = 50.0;
  notes[0].stp = 25.0;

  // 通常ノート
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 60;
  notes[1].lyric = "あ";
  notes[1].length = 480;
  notes[1].preutter = 100.0;
  notes[1].overlap = 50.0;
  notes[1].stp = 25.0;

  // 通常ノート
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 61;
  notes[2].lyric = "い";
  notes[2].length = 480;
  notes[2].preutter = 200.0;
  notes[2].overlap = 100.0;
  notes[2].stp = 50.0;

  return notes;
};

describe("ApplyAutoFitBatchProcess", () => {
  const bp = new ApplyAutoFitBatchProcess();
  beforeEach(() => {
    undoManager.clear();
  });

  it("自動調整結果をpreutter/overlap/stpに適用する", () => {
    const notes = createTestNotes();
    // 処理前のat系パラメータを記録
    const beforeAtStp1 = notes[1].atStp;
    const beforeAtPreutter1 = notes[1].atPreutter;
    const beforeAtOverlap1 = notes[1].atOverlap;

    const result = bp.process(notes);

    // 休符は変更されない
    expect(result[0].preutter).toBe(100.0);
    expect(result[0].overlap).toBe(50.0);
    expect(result[0].stp).toBe(25.0);

    // at系パラメータがpreutter/overlap/stpに適用される
    expect(result[1].stp).toBe(beforeAtStp1);
    expect(result[1].preutter).toBe(beforeAtPreutter1);
    expect(result[1].overlap).toBe(beforeAtOverlap1);

    // at系パラメータが未定義の場合は0が設定される
    const beforeAtStp2 = notes[2].atStp ?? 0;
    const beforeAtPreutter2 = notes[2].atPreutter ?? 0;
    const beforeAtOverlap2 = notes[2].atOverlap ?? 0;
    expect(result[2].stp).toBe(beforeAtStp2);
    expect(result[2].preutter).toBe(beforeAtPreutter2);
    expect(result[2].overlap).toBe(beforeAtOverlap2);
  });
  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const beforeAtStp = notes[1].atStp;
    const beforeAtPreutter = notes[1].atPreutter;
    const beforeAtOverlap = notes[1].atOverlap;

    const result = bp.process(notes);

    expect(undoManager.undoSummary).toBe("timing:自動調整結果を適用");
    expect(result[1].stp).toBe(beforeAtStp);
    expect(result[1].preutter).toBe(beforeAtPreutter);
    expect(result[1].overlap).toBe(beforeAtOverlap);

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("timing:自動調整結果を適用");
    expect(undo[1].preutter).toBe(100.0);
    expect(undo[1].overlap).toBe(50.0);
    expect(undo[1].stp).toBe(25.0);

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("timing:自動調整結果を適用");
    expect(redo[1].stp).toBe(beforeAtStp);
    expect(redo[1].preutter).toBe(beforeAtPreutter);
    expect(redo[1].overlap).toBe(beforeAtOverlap);
  });

  it("at系パラメータがundefinedの場合は0が設定される", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "あ";
    notes[0].stp = 100.0;
    notes[0].preutter = 50.0;
    notes[0].overlap = 25.0;

    const result = bp.process(notes);

    // at系パラメータが自動計算されていない場合、??演算子により0が適用される
    expect(result[0].stp).toBe(notes[0].atStp ?? 0);
    expect(result[0].preutter).toBe(notes[0].atPreutter ?? 0);
    expect(result[0].overlap).toBe(notes[0].atOverlap ?? 0);
  });

  it("休符ノートは処理対象外", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "R";
    notes[0].stp = 100.0;
    notes[0].preutter = 50.0;
    notes[0].overlap = 25.0;

    const result = bp.process(notes);

    // 休符は変更されない
    expect(result[0].stp).toBe(100.0);
    expect(result[0].preutter).toBe(50.0);
    expect(result[0].overlap).toBe(25.0);
  });
});
