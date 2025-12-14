import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import {
  AddNote,
  getTargetNoteIndex,
  getTargetNoteIndexFromX,
  getTargetPpltamentIndex,
  handleAddModeTap,
  handlePitchModeTap,
  handleRangeModeTap,
  handleToggleModeTap,
} from "../../../../src/features/EditorView/Pianoroll/PianorollTouch";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";

// AudioContextのモック
class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      connect: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      type: "sine",
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn() },
    };
  }
}

(global as any).window = {
  ...global.window,
  AudioContext: MockAudioContext,
};

describe("PianorollToutchUtilty", () => {
  const createNote = (notenum: number) => {
    const n = new Note();
    n.length = 480;
    n.notenum = notenum;
    return n;
  };
  const notes = new Array();
  notes.push(createNote(60));
  notes.push(createNote(107));
  notes.push(createNote(24));
  const notesLeft = [0, 480, 960];
  beforeEach(() => {
    undoManager.clear();
  });
  it("getTargetNoteIndexFromX:x座標に応じたindexを返す", () => {
    expect(getTargetNoteIndexFromX(0, notes, notesLeft, 1)).toBe(0);
    // 479 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで0が返るはず
    expect(
      getTargetNoteIndexFromX(
        479 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        notes,
        notesLeft,
        1
      )
    ).toBe(0);
    // 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで1が返るはず
    expect(
      getTargetNoteIndexFromX(
        480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        notes,
        notesLeft,
        1
      )
    ).toBe(1);
    // 960 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで2が返るはず
    expect(
      getTargetNoteIndexFromX(
        960 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        notes,
        notesLeft,
        1
      )
    ).toBe(2);
    // 1439 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで2が返るはず
    expect(
      getTargetNoteIndexFromX(
        1439 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        notes,
        notesLeft,
        1
      )
    ).toBe(2);
    // 1440 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomでundefinedが返るはず
    expect(
      getTargetNoteIndexFromX(
        1440 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        notes,
        notesLeft,
        1
      )
    ).toBe(undefined);
    // 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoomで2が返るはず
    expect(
      getTargetNoteIndexFromX(
        480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        notes,
        notesLeft,
        0.5
      )
    ).toBe(2);
  });
  it("getTargetNoteIndex:x座標とy座標を換算してノート上であればindexを返す", () => {
    expect(
      getTargetNoteIndex(
        { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(0);
    expect(
      getTargetNoteIndex(
        {
          x: 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          y: (107 - 107) * PIANOROLL_CONFIG.KEY_HEIGHT,
        },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(1);
    expect(
      getTargetNoteIndex(
        {
          x: 960 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
          y: (107 - 24) * PIANOROLL_CONFIG.KEY_HEIGHT,
        },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(2);
    // verticalZoomの影響確認
    expect(
      getTargetNoteIndex(
        { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT * 2 },
        notes,
        notesLeft,
        1,
        2
      )
    ).toBe(0);
  });
  it("getTargetNoteIndex:x座標とy座標が一致しなければundefinedを返す", () => {
    // これが上側境界になるはず
    expect(
      getTargetNoteIndex(
        { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(0);
    // これが下側境界になるはず
    expect(
      getTargetNoteIndex(
        { x: 0, y: (107 - 59) * PIANOROLL_CONFIG.KEY_HEIGHT - 1 },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(0);
    // これが下側境界より1pixel下になるはず
    expect(
      getTargetNoteIndex(
        { x: 0, y: (107 - 59) * PIANOROLL_CONFIG.KEY_HEIGHT },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(undefined);
    // これが上側境界より1pixel上になるはず
    expect(
      getTargetNoteIndex(
        { x: 0, y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT - 1 },
        notes,
        notesLeft,
        1,
        1
      )
    ).toBe(undefined);
  });

  it("handleToggleModeTap:未選択の場合、ソートして追加される", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    handleToggleModeTap([1], 0, setSelectedNotesIndexSpy);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0, 1]);
  });

  it("handleToggleModeTap:選択済みの場合、除外される", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    handleToggleModeTap([0, 1], 0, setSelectedNotesIndexSpy);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([1]);
  });

  it("handleRangeModeTap:startIndexがundefinedの場合、startIndexが更新され、スナックバーが表示される", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    const setStartIndexSpy = vi.fn();
    const setSeveritySpy = vi.fn();
    const setValueSpy = vi.fn();
    const setOpenSpy = vi.fn();
    handleRangeModeTap(
      undefined,
      0,
      setStartIndexSpy,
      setSelectedNotesIndexSpy,
      setSeveritySpy,
      setValueSpy,
      setOpenSpy,
      "test"
    );
    expect(setSelectedNotesIndexSpy).not.toHaveBeenCalled();
    expect(setStartIndexSpy).toHaveBeenCalledWith(0);
    expect(setSeveritySpy).toHaveBeenCalledWith("info");
    expect(setValueSpy).toHaveBeenCalledWith("test");
    expect(setOpenSpy).toHaveBeenCalledWith(true);
  });

  it("handleRangeModeTap:startIndexが非undefinedの場合、startIndex～targetIndexがselectされる", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    const setStartIndexSpy = vi.fn();
    const setSeveritySpy = vi.fn();
    const setValueSpy = vi.fn();
    const setOpenSpy = vi.fn();
    handleRangeModeTap(
      0,
      5,
      setStartIndexSpy,
      setSelectedNotesIndexSpy,
      setSeveritySpy,
      setValueSpy,
      setOpenSpy,
      "test"
    );
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0, 1, 2, 3, 4, 5]);
    expect(setStartIndexSpy).not.toHaveBeenCalled();
    expect(setSeveritySpy).not.toHaveBeenCalled();
    expect(setValueSpy).not.toHaveBeenCalled();
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("handlePitchModeTap:poltamentをタップした場合、選択ポルタメントを切り替える", () => {
    const setTargetPoltamentSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    handlePitchModeTap(
      notes,
      [0],
      1,
      undefined,
      setTargetPoltamentSpy,
      setSelectedNotesIndexSpy
    );
    expect(setTargetPoltamentSpy).toHaveBeenCalledWith(1);
  });

  it("handlePitchModeTap:ノートをタップした場合で、そのノートのlyricが非Rの場合、ノートを切り替える", () => {
    const setTargetPoltamentSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    handlePitchModeTap(
      notes,
      [0],
      undefined,
      1,
      setTargetPoltamentSpy,
      setSelectedNotesIndexSpy
    );
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([1]);
  });

  it("handlePitchModeTap:ノートをタップした場合で、そのノートのlyricがRの場合、ノートを切り替えない", () => {
    const setTargetPoltamentSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    notes[2].lyric = "R";
    handlePitchModeTap(
      notes,
      [0],
      undefined,
      2,
      setTargetPoltamentSpy,
      setSelectedNotesIndexSpy
    );
    expect(setSelectedNotesIndexSpy).not.toHaveBeenCalled();
  });

  it("handleAddModeTap:ノート末尾より右側をタップした場合、末尾にノートを追加する", () => {
    const setNotesSpy = vi.fn();
    handleAddModeTap(
      {
        x: 1440 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        y: (107 - 60) * PIANOROLL_CONFIG.KEY_HEIGHT,
      } as DOMPoint,
      notes,
      notesLeft,
      120,
      480,
      "new",
      1,
      1,
      setNotesSpy
    );
    const resultNotes = setNotesSpy.mock.calls[0][0];
    expect(resultNotes.length).toBe(4);
    expect(resultNotes.slice(0, 3)).toEqual(notes);
    expect(resultNotes[3].lyric).toBe("new");
    expect(resultNotes[3].length).toBe(480);
    expect(resultNotes[3].notenum).toBe(60);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual(notes);
    expect(redoResult).toEqual(resultNotes);
  });
  it("handleAddModeTap:ノート末尾より左側をタップした場合、タップしたノートの左側にノートを追加する", () => {
    const setNotesSpy = vi.fn();
    handleAddModeTap(
      {
        x: 0,
        y: (107 - 61) * PIANOROLL_CONFIG.KEY_HEIGHT,
      } as DOMPoint,
      notes,
      notesLeft,
      120,
      240,
      "new2",
      1,
      1,
      setNotesSpy
    );
    const resultNotes = setNotesSpy.mock.calls[0][0];
    expect(resultNotes.length).toBe(4);
    expect(resultNotes.slice(1, 4)).toEqual(notes);
    expect(resultNotes[0].lyric).toBe("new2");
    expect(resultNotes[0].length).toBe(240);
    expect(resultNotes[0].notenum).toBe(61);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual(notes);
    expect(redoResult).toEqual(resultNotes);
  });

  // AddNote関数の直接テスト
  it("AddNote: 空配列にノートを追加した場合は1つのノートを含む配列になる", () => {
    const result = AddNote([], undefined, 60, "あ", 480, 120);
    expect(result.length).toBe(1);
    expect(result[0].notenum).toBe(60);
    expect(result[0].lyric).toBe("あ");
    expect(result[0].length).toBe(480);
    expect(result[0].tempo).toBe(120);
  });

  it("AddNote: indexがundefinedの場合は末尾にノートを追加する", () => {
    const result = AddNote(notes, undefined, 72, "い", 240, 120);
    expect(result.length).toBe(4);
    expect(result.slice(0, 3)).toEqual(notes);
    expect(result[3].notenum).toBe(72);
    expect(result[3].lyric).toBe("い");
    expect(result[3].length).toBe(240);
  });

  it("AddNote: indexを指定した場合はその位置にノートを挿入する", () => {
    const result = AddNote(notes, 1, 84, "う", 360, 120);
    expect(result.length).toBe(4);
    expect(result[0]).toEqual(notes[0]);
    expect(result[1].notenum).toBe(84);
    expect(result[1].lyric).toBe("う");
    expect(result[1].length).toBe(360);
    expect(result.slice(2, 4)).toEqual(notes.slice(1, 3));
  });

  it("AddNote: 追加したノートのテンポは前のノートから継承される", () => {
    const notesWithTempo = [createNote(60), createNote(62)];
    notesWithTempo[1].tempo = 140;
    const result = AddNote(notesWithTempo, undefined, 64, "え", 480, 120);
    expect(result[2].tempo).toBe(140);
  });

  // getTargetPpltamentIndex関数のテスト
  it("getTargetPpltamentIndex: ポルタメント領域内をクリックした場合はインデックスを返す", () => {
    const poltaments = [
      { x: 100, y: 200 },
      { x: 300, y: 400 },
    ];
    const result = getTargetPpltamentIndex({ x: 105, y: 205 }, poltaments);
    expect(result).toBe(0);
  });

  it("getTargetPpltamentIndex: 複数のポルタメントがある場合は最も近いものを返す", () => {
    const poltaments = [
      { x: 100, y: 200 },
      { x: 200, y: 300 },
      { x: 300, y: 400 },
    ];
    const result = getTargetPpltamentIndex({ x: 205, y: 305 }, poltaments);
    expect(result).toBe(1);
  });

  it("getTargetPpltamentIndex: 閾値より遠い場合はundefinedを返す", () => {
    const poltaments = [{ x: 100, y: 200 }];
    const result = getTargetPpltamentIndex({ x: 1000, y: 1000 }, poltaments);
    expect(result).toBe(undefined);
  });

  it("getTargetPpltamentIndex: 空配列の場合はundefinedを返す", () => {
    const result = getTargetPpltamentIndex({ x: 100, y: 200 }, []);
    expect(result).toBe(undefined);
  });

  // エッジケーステスト
  it("getTargetNoteIndexFromX: 空配列の場合は-1を返す", () => {
    const result = getTargetNoteIndexFromX(0, [], [], 1);
    expect(result).toBe(-1);
  });

  it("getTargetNoteIndexFromX: 負のX座標の場合は最後のノートより前のインデックスを返す", () => {
    const result = getTargetNoteIndexFromX(-100, notes, notesLeft, 1);
    // 負のX座標の場合、findIndexが0を返し、0-1=-1となり、notes.length-1が返される
    expect(result).toBe(notes.length - 1);
  });

  it("getTargetNoteIndex: 範囲外のnotenumの場合はundefinedを返す", () => {
    const result = getTargetNoteIndex(
      {
        x: 0,
        y: -100, // 範囲外のY座標
      } as DOMPoint,
      notes,
      notesLeft,
      1,
      1
    );
    expect(result).toBe(undefined);
  });

  it("handleToggleModeTap: 空の選択リストに追加した場合はソートされた配列になる", () => {
    const setSelectedNotesIndexSpy = vi.fn();
    handleToggleModeTap([], 2, setSelectedNotesIndexSpy);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([2]);
  });

  it("handleRangeModeTap: startIndexとtargetIndexが同じ場合は1つのノートを選択する", () => {
    const setStartIndexSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    const setSeveritySpy = vi.fn();
    const setValueSpy = vi.fn();
    const setOpenSpy = vi.fn();
    handleRangeModeTap(
      0,
      0,
      setStartIndexSpy,
      setSelectedNotesIndexSpy,
      setSeveritySpy,
      setValueSpy,
      setOpenSpy,
      "範囲選択完了"
    );
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0]);
    // startIndexが既に設定されている場合は、setStartIndexは呼ばれない
    expect(setStartIndexSpy).not.toHaveBeenCalled();
  });

  it("handleRangeModeTap: startIndexより小さいtargetIndexの場合は逆順で選択する", () => {
    const setStartIndexSpy = vi.fn();
    const setSelectedNotesIndexSpy = vi.fn();
    const setSeveritySpy = vi.fn();
    const setValueSpy = vi.fn();
    const setOpenSpy = vi.fn();
    handleRangeModeTap(
      5,
      2,
      setStartIndexSpy,
      setSelectedNotesIndexSpy,
      setSeveritySpy,
      setValueSpy,
      setOpenSpy,
      "範囲選択完了"
    );
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([2, 3, 4, 5]);
    // startIndexが既に設定されている場合は、setStartIndexは呼ばれない
    expect(setStartIndexSpy).not.toHaveBeenCalled();
  });
});
