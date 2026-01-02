import { beforeEach, describe, expect, it } from "vitest";
import { PitchSnapBatchProcess } from "../../../src/lib/BatchProcess/PitchSnapBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();
  // 休符
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "R";
  notes[0].length = 480;
  notes[0].setPby([10, 20, 30]); // 休符なので無視されるべき

  // C4、スケール内のピッチ（D = +20）
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 60; // C4
  notes[1].lyric = "あ";
  notes[1].length = 480;
  notes[1].setPby([0, 20, 0]); // C->C, C->D, C->C (すべてスケール内)

  // C4、スケール外のピッチ（C# = +10）
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 60; // C4
  notes[2].lyric = "い";
  notes[2].length = 480;
  notes[2].setPby([10, 15, 20]); // C->C# (+10), C->C#+5 (+15), C->D (+20)

  // E4、スケール外のピッチ（F# = +20）
  notes.push(new Note());
  notes[3].index = 3;
  notes[3].notenum = 64; // E4
  notes[3].lyric = "う";
  notes[3].length = 480;
  notes[3].setPby([20, 10, -10]); // E->F# (+20), E->F (+10), E->D# (-10)

  // pbyがnullのノート
  notes.push(new Note());
  notes[4].index = 4;
  notes[4].notenum = 67; // G4
  notes[4].lyric = "え";
  notes[4].length = 480;
  // pbyは設定しない（null）

  return notes;
};

describe("PitchSnapBatchProcess", () => {
  beforeEach(() => {
    /** 各テスト実行前にundoManagerを初期化しておく */
    undoManager.clear();
    /** ストアの設定：C Major */
    const store = useMusicProjectStore.getState();
    store.setTone(0); // C
    store.setIsMinor(false); // Major
  });

  it("process、undo、redoの一連の動作を確認する", () => {
    const notes = createTestNotes();
    const bp = new PitchSnapBatchProcess();
    /** 実行前の確認 */
    expect(undoManager.undoSummary).toBeUndefined();
    const results = bp.process(notes);

    /** 実行結果の確認 */
    // 休符は無視される
    expect(results[0].pby).toEqual([10, 20, 30]);

    // スケール内の音はそのまま
    expect(results[1].pby).toEqual([0, 20, 0]);

    // スケール外の音がスナップされる
    // C->C# (+10, diffPitch=1, 短2度) → 長2度にスナップ (+20)
    // C->C#+5 (+15 → 20に丸められる) → スケール内なのでそのまま (+20)
    // C->D (+20) → スケール内なのでそのまま (+20)
    expect(results[2].pby).toEqual([20, 20, 20]);

    // E->F# (+20, diffPitch=2, 長2度) → 短2度にスナップ (+10)
    // E->F (+10, diffPitch=1, 短2度) → スケール内(F=5)なのでそのまま (+10)
    // E->D# (-10, diffPitch=11, 長7度) → 短7度にスナップ (-20)
    expect(results[3].pby).toEqual([10, 10, -20]);

    // pbyがnullのノートはそのまま
    expect(results[4].pby).toBeUndefined();

    /** undoManagerの確認 */
    expect(undoManager.undoSummary).toBe("pitch:ピッチをスケールにスナップ");

    /** undoの確認 */
    const undoNotes = undoManager.undo();
    expect(undoNotes[0].pby).toEqual([10, 20, 30]);
    expect(undoNotes[1].pby).toEqual([0, 20, 0]);
    expect(undoNotes[2].pby).toEqual([10, 15, 20]);
    expect(undoNotes[3].pby).toEqual([20, 10, -10]);
    expect(undoNotes[4].pby).toBeUndefined();
    expect(undoManager.undoSummary).toBeUndefined();
    expect(undoManager.redoSummary).toBe("pitch:ピッチをスケールにスナップ");

    /** redoの確認 */
    const redoNotes = undoManager.redo();
    expect(redoNotes[0].pby).toEqual([10, 20, 30]);
    expect(redoNotes[1].pby).toEqual([0, 20, 0]);
    expect(redoNotes[2].pby).toEqual([20, 20, 20]);
    expect(redoNotes[3].pby).toEqual([10, 10, -20]);
    expect(redoNotes[4].pby).toBeUndefined();
    expect(undoManager.undoSummary).toBe("pitch:ピッチをスケールにスナップ");
  });

  it("A Minorスケールでの動作を確認する", () => {
    const store = useMusicProjectStore.getState();
    store.setTone(9); // A
    store.setIsMinor(true); // Minor

    const notes = new Array<Note>();
    // A4 (notenum=69)、スケール外のピッチ（A# = +10）
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 69; // A4
    notes[0].lyric = "あ";
    notes[0].length = 480;
    notes[0].setPby([10, 20, 30]); // A->A# (+10), A->B (+20), A->C (+30)

    const bp = new PitchSnapBatchProcess();
    const results = bp.process(notes);

    // A Minor: A, B, C, D, E, F, G (9, 11, 0, 2, 4, 5, 7)
    // A->A# (+10, diffPitch=1, 短2度) → 長2度にスナップ (+20=B)
    // A->B (+20, diffPitch=2, 長2度) → スケール内なのでそのまま (+20)
    // A->C (+30, diffPitch=3, 短3度) → スケール内なのでそのまま (+30)
    expect(results[0].pby).toEqual([20, 20, 30]);
  });

  it("pbyが0の時はスナップされない", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60; // C4
    notes[0].lyric = "あ";
    notes[0].length = 480;
    notes[0].setPby([0, 0, 0]);

    const bp = new PitchSnapBatchProcess();
    const results = bp.process(notes);

    // 0の音はそのまま返される
    expect(results[0].pby).toEqual([0, 0, 0]);
  });

  it("負のpbyでスケール外の時にスナップされる", () => {
    const notes = new Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].notenum = 60; // C4
    notes[0].lyric = "あ";
    notes[0].length = 480;
    notes[0].setPby([-10, -20, -30]); // C->B (-10), C->Bb (-20), C->A (-30)

    const bp = new PitchSnapBatchProcess();
    const results = bp.process(notes);

    // C Major: C, D, E, F, G, A, B (0, 2, 4, 5, 7, 9, 11)
    // C->B (-10, diffPitch=11, 長7度) → スケール内なのでそのまま (-10)
    // C->Bb (-20, diffPitch=10, 短7度) → 長7度にスナップ (-10=B)
    // C->A (-30, diffPitch=9, 長6度) → スケール内なのでそのまま (-30)
    expect(results[0].pby).toEqual([-10, -10, -30]);
  });
});
