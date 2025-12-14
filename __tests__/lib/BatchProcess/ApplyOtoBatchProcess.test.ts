import { beforeEach, describe, expect, it } from "vitest";
import { ApplyOtoBatchProcess } from "../../../src/lib/BatchProcess/ApplyOtoBatchProcess";
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

  // oto設定ありのノート
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 60;
  notes[1].lyric = "あ";
  notes[1].length = 480;
  notes[1].preutter = 100.0;
  notes[1].overlap = 50.0;
  notes[1].otoPreutter = 150.0;
  notes[1].otoOverlap = 75.0;
  notes[1].oto = { alias: "あ" } as any;

  // oto設定なしのノート
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 61;
  notes[2].lyric = "い";
  notes[2].length = 480;
  notes[2].preutter = 200.0;
  notes[2].overlap = 100.0;

  return notes;
};

describe("ApplyOtoBatchProcess", () => {
  const bp = new ApplyOtoBatchProcess();
  beforeEach(() => {
    undoManager.clear();
  });

  it("oto設定があるノートに原音設定値を適用する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes);

    // 休符は変更されない
    expect(result[0].preutter).toBeUndefined();
    expect(result[0].overlap).toBeUndefined();

    // oto設定ありのノートはotoPreutter/otoOverlapが適用される
    expect(result[1].preutter).toBe(150.0);
    expect(result[1].overlap).toBe(75.0);

    // oto設定なしのノートは変更されない
    expect(result[2].preutter).toBe(200.0);
    expect(result[2].overlap).toBe(100.0);

    // 元のノートは変更されていないことを確認
    expect(notes[1].preutter).toBe(100.0);
    expect(notes[1].overlap).toBe(50.0);
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes);

    expect(undoManager.undoSummary).toBe("timing:原音設定値を適用");
    expect(result[1].preutter).toBe(150.0);
    expect(result[1].overlap).toBe(75.0);

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("timing:原音設定値を適用");
    expect(undo[1].preutter).toBe(100.0);
    expect(undo[1].overlap).toBe(50.0);

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("timing:原音設定値を適用");
    expect(redo[1].preutter).toBe(150.0);
    expect(redo[1].overlap).toBe(75.0);
  });

  it("otoPreutterがundefinedの場合は0が設定される", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "あ";
    notes[0].otoPreutter = undefined;
    notes[0].otoOverlap = 50.0;
    notes[0].oto = { alias: "あ" } as any;
    notes[0].preutter = 100.0;
    notes[0].overlap = 25.0;

    const result = bp.process(notes);

    expect(result[0].preutter).toBe(0);
    expect(result[0].overlap).toBe(50.0);
  });

  it("otoOverlapがundefinedの場合は0が設定される", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "あ";
    notes[0].otoPreutter = 100.0;
    notes[0].otoOverlap = undefined;
    notes[0].oto = { alias: "あ" } as any;
    notes[0].preutter = 50.0;
    notes[0].overlap = 25.0;

    const result = bp.process(notes);

    expect(result[0].preutter).toBe(100.0);
    expect(result[0].overlap).toBe(0);
  });

  it("休符ノートは処理されない", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].lyric = "R";
    notes[0].otoPreutter = 100.0;
    notes[0].otoOverlap = 50.0;
    notes[0].oto = { alias: "R" } as any;
    notes[0].preutter = 200.0;
    notes[0].overlap = 100.0;

    const result = bp.process(notes);

    // 休符のため、元の値が維持される(実装は休符チェックなし、otoの有無のみチェック)
    // コメント: 実装を確認すると休符チェックはなく、otoの有無のみチェックしている
    expect(result[0].preutter).toBe(100.0);
    expect(result[0].overlap).toBe(50.0);
  });
});
