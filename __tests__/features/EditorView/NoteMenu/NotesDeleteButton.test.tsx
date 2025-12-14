import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteNote,
  NotesDeleteButton,
} from "../../../../src/features/EditorView/NoteMenu/NotesDeleteButton";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NotesDeleteButton", () => {
  const createNotes = (): Note[] => {
    const notes = new Array();
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.forEach((n, i) => {
      n.index = i;
      n.length = 480;
      n.notenum = 60 + i;
      n.lyric = "あ";
      n.hasTempo = false;
      n.tempo = 120;
    });
    return notes;
  };
  beforeEach(() => {
    /** 各テスト実行前にundoManagerを初期化しておく */
    undoManager.clear();
  });

  it("notesDelete:選択したノートが削除される", () => {
    const notes = createNotes();
    const resultNotes = deleteNote(notes, [0, 2, 4]);
    expect(resultNotes.length).toBe(2);
    expect(resultNotes[0].index).toBe(1);
    expect(resultNotes[1].index).toBe(3);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });

  it("NotesDeleteButton:ボタンをクリックすると、選択したノートが削除される", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesDeleteButton
        selectedNotesIndex={[0, 2, 4]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("NotesDeleteButton");
    fireEvent.click(button);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([]);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
    //notesが更新されているはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes.length).toBe(2);
    expect(resultNotes[0].notenum).toBe(61);
    expect(resultNotes[1].notenum).toBe(63);
    // undoにはすべて保存されているはず
    const undoResult = undoManager.undo();
    expect(undoResult.length).toBe(dummyNotes.length);
    // 重要なプロパティのみを比較（phonemizerは異なる可能性がある）
    undoResult.forEach((note: Note, i: number) => {
      expect(note.notenum).toBe(dummyNotes[i].notenum);
      expect(note.lyric).toBe(dummyNotes[i].lyric);
      expect(note.length).toBe(dummyNotes[i].length);
    });
  });
});
