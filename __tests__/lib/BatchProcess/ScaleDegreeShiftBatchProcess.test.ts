import { beforeEach, describe, expect, it } from "vitest";
import { ScaleDegreeShiftBatchProcess } from "../../../src/lib/BatchProcess/ScaleDegreeShiftBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();

  notes.push(new Note());
  notes[0].index = 0;
  notes[0].lyric = "R";
  notes[0].notenum = 60;

  notes.push(new Note());
  notes[1].index = 1;
  notes[1].lyric = "あ";
  notes[1].notenum = 60; // C4

  notes.push(new Note());
  notes[2].index = 2;
  notes[2].lyric = "い";
  notes[2].notenum = 67; // G4

  notes.push(new Note());
  notes[3].index = 3;
  notes[3].lyric = "う";
  notes[3].notenum = 71; // B4

  return notes;
};

describe("ScaleDegreeShiftBatchProcess", () => {
  let bp: ScaleDegreeShiftBatchProcess;

  beforeEach(() => {
    undoManager.clear();
    bp = new ScaleDegreeShiftBatchProcess();
    const store = useMusicProjectStore.getState();
    store.setTone(0); // C
    store.setIsMinor(false); // Major
  });

  it("C Majorで指定度数分だけ上下する", () => {
    const notes = createTestNotes();

    const up = bp.process(notes, { degreeValue: 2 });
    expect(up[0].notenum).toBe(60); // 休符は維持
    expect(up[1].notenum).toBe(62); // C -> D

    const down = bp.process(notes, { degreeValue: -3 });
    expect(down[2].notenum).toBe(64); // G -> E
  });

  it("7度移動でオクターブを跨ぐ", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { degreeValue: 7 });

    expect(result[3].notenum).toBe(81); // B4 -> A5
  });

  it("スケール外ノートは最寄りスケール音に寄せてから移動する", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].lyric = "あ";
    notes[0].notenum = 61; // C#4 (C Major外)

    const result = bp.process(notes, { degreeValue: 2 });
    // C#はC/Dが同距離のため上方向優先でDに寄せ、2度上なのでE
    expect(result[0].notenum).toBe(64);
  });

  it("A Minorでもスケールに従って移動する", () => {
    const store = useMusicProjectStore.getState();
    store.setTone(9); // A
    store.setIsMinor(true); // Minor

    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].lyric = "あ";
    notes[0].notenum = 69; // A4

    const result = bp.process(notes, { degreeValue: 3 });
    expect(result[0].notenum).toBe(72); // A -> C
  });

  it("process、undo、redoが正しく動作する", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, { degreeValue: 2 });

    expect(undoManager.undoSummary).toBe("notenum:指定度数上下する");
    expect(result[1].notenum).toBe(62);

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("notenum:指定度数上下する");
    expect(undo[1].notenum).toBe(60);

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("notenum:指定度数上下する");
    expect(redo[1].notenum).toBe(62);
  });
});
