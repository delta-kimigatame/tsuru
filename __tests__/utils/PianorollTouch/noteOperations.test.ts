import { beforeEach, describe, expect, it, vi } from "vitest";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { AddNote, createNewNote } from "../../../src/utils/PianorollTouch/noteOperations";

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

describe("noteOperations", () => {
  const createNote = (notenum: number) => {
    const n = new Note();
    n.length = 480;
    n.notenum = notenum;
    return n;
  };
  const notes = [createNote(60), createNote(107), createNote(24)];

  beforeEach(() => {
    undoManager.clear();
  });

  describe("createNewNote", () => {
    it("空配列の場合はustTempoをテンポとして使用する", () => {
      const result = createNewNote([], undefined, 60, "あ", 480, 120);
      expect(result.notenum).toBe(60);
      expect(result.lyric).toBe("あ");
      expect(result.length).toBe(480);
      expect(result.tempo).toBe(120);
      expect(result.hasTempo).toBe(false);
    });

    it("indexがundefinedの場合は最後のノートからテンポを継承する", () => {
      const notesWithTempo = [createNote(60), createNote(62)];
      notesWithTempo[1].tempo = 140;
      const result = createNewNote(
        notesWithTempo,
        undefined,
        64,
        "い",
        480,
        120
      );
      expect(result.tempo).toBe(140);
    });

    it("indexを指定した場合はそのインデックスのノートからテンポを継承する", () => {
      const notesWithTempo = [createNote(60), createNote(62)];
      notesWithTempo[0].tempo = 130;
      notesWithTempo[1].tempo = 140;
      const result = createNewNote(notesWithTempo, 1, 64, "う", 360, 120);
      expect(result.tempo).toBe(140);
    });
  });

  describe("AddNote", () => {
    it("空配列にノートを追加した場合は1つのノートを含む配列になる", () => {
      const result = AddNote([], undefined, 60, "あ", 480, 120);
      expect(result.length).toBe(1);
      expect(result[0].notenum).toBe(60);
      expect(result[0].lyric).toBe("あ");
      expect(result[0].length).toBe(480);
      expect(result[0].tempo).toBe(120);
    });

    it("indexがundefinedの場合は末尾にノートを追加する", () => {
      const result = AddNote(notes, undefined, 72, "い", 240, 120);
      expect(result.length).toBe(4);
      expect(result.slice(0, 3)).toEqual(notes);
      expect(result[3].notenum).toBe(72);
      expect(result[3].lyric).toBe("い");
      expect(result[3].length).toBe(240);
    });

    it("indexを指定した場合はその位置にノートを挿入する", () => {
      const result = AddNote(notes, 1, 84, "う", 360, 120);
      expect(result.length).toBe(4);
      expect(result[0]).toEqual(notes[0]);
      expect(result[1].notenum).toBe(84);
      expect(result[1].lyric).toBe("う");
      expect(result[1].length).toBe(360);
      expect(result.slice(2, 4)).toEqual(notes.slice(1, 3));
    });

    it("追加したノートのテンポは前のノートから継承される", () => {
      const notesWithTempo = [createNote(60), createNote(62)];
      notesWithTempo[1].tempo = 140;
      const result = AddNote(notesWithTempo, undefined, 64, "え", 480, 120);
      expect(result[2].tempo).toBe(140);
    });

    it("undoManagerにコマンドを登録する", () => {
      const result = AddNote(notes, 1, 84, "う", 360, 120);
      const undoResult = undoManager.undo();
      const redoResult = undoManager.redo();
      expect(undoResult).toEqual(notes);
      expect(redoResult).toEqual(result);
    });
  });
});
