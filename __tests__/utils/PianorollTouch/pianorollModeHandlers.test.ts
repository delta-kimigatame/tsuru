import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIANOROLL_CONFIG } from "../../../src/config/pianoroll";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import {
  handleAddModeTap,
  handlePitchModeTap,
  handleRangeModeTap,
  handleToggleModeTap,
} from "../../../src/utils/PianorollTouch/pianorollModeHandlers";

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

describe("pianorollModeHandlers", () => {
  const createNote = (notenum: number) => {
    const n = new Note();
    n.length = 480;
    n.notenum = notenum;
    return n;
  };
  const notes = [createNote(60), createNote(107), createNote(24)];
  const notesLeft = [0, 480, 960];

  beforeEach(() => {
    undoManager.clear();
  });

  describe("handleToggleModeTap", () => {
    it("未選択の場合、ソートして追加される", () => {
      const setSelectedNotesIndexSpy = vi.fn();
      handleToggleModeTap([1], 0, setSelectedNotesIndexSpy);
      expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0, 1]);
    });

    it("選択済みの場合、除外される", () => {
      const setSelectedNotesIndexSpy = vi.fn();
      handleToggleModeTap([0, 1], 0, setSelectedNotesIndexSpy);
      expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([1]);
    });

    it("空の選択リストに追加した場合はソートされた配列になる", () => {
      const setSelectedNotesIndexSpy = vi.fn();
      handleToggleModeTap([], 2, setSelectedNotesIndexSpy);
      expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([2]);
    });
  });

  describe("handleRangeModeTap", () => {
    it("startIndexがundefinedの場合、startIndexが更新され、スナックバーが表示される", () => {
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

    it("startIndexが非undefinedの場合、startIndex～targetIndexがselectされる", () => {
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

    it("startIndexとtargetIndexが同じ場合は1つのノートを選択する", () => {
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
      expect(setStartIndexSpy).not.toHaveBeenCalled();
    });

    it("startIndexより小さいtargetIndexの場合は逆順で選択する", () => {
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
      expect(setStartIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe("handlePitchModeTap", () => {
    it("poltamentをタップした場合、選択ポルタメントを切り替える", () => {
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

    it("ノートをタップした場合で、そのノートのlyricが非Rの場合、ノートを切り替える", () => {
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

    it("ノートをタップした場合で、そのノートのlyricがRの場合、ノートを切り替えない", () => {
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
  });

  describe("handleAddModeTap", () => {
    it("ノート末尾より右側をタップした場合、末尾にノートを追加する", () => {
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

    it("ノート末尾より左側をタップした場合、タップしたノートの左側にノートを追加する", () => {
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
  });
});
