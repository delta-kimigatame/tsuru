import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  notesRight,
  NotesRightButton,
} from "../../../../src/features/EditorView/NoteMenu/NotesRightButton";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NotesRightButton", () => {
  const createNotes = (): Note[] => {
    const notes = new Array();
    notes.push(new Note());
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

  it("notesRight:選択したノートが1つ右へ", () => {
    const notes = createNotes();
    const resultNotes = notesRight(notes, [1, 3, 4]);
    expect(resultNotes[0].index).toBe(0);
    expect(resultNotes[1].index).toBe(2);
    expect(resultNotes[2].index).toBe(1);
    expect(resultNotes[3].index).toBe(5);
    expect(resultNotes[4].index).toBe(3);
    expect(resultNotes[5].index).toBe(4);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });

  it("ボタンをクリックすると、選択されたノートが1つ右へ", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesRightButton
        selectedNotesIndex={[1, 3, 4]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
      />
    );
    const button = await screen.findByTestId("NotesRightButton");
    fireEvent.click(button);
    //notesが更新されているはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes.length).toBe(6);
    //ノートが1つ左へ indexはsetNotesで修正されるため、notenumで確認
    expect(resultNotes[0].notenum).toBe(60);
    expect(resultNotes[1].notenum).toBe(62);
    expect(resultNotes[2].notenum).toBe(61);
    expect(resultNotes[3].notenum).toBe(65);
    expect(resultNotes[4].notenum).toBe(63);
    expect(resultNotes[5].notenum).toBe(64);
    //selectNoteIndexも1ずつ小さくなるはず
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([2, 4, 5]);
    const undoResult = undoManager.undo();
    // 全てのノートが保存されているはず
    expect(undoResult.length).toBe(6);
    expect(undoResult[0].notenum).toBe(60);
    expect(undoResult[1].notenum).toBe(61);
    expect(undoResult[2].notenum).toBe(62);
    expect(undoResult[3].notenum).toBe(63);
    expect(undoResult[4].notenum).toBe(64);
    expect(undoResult[5].notenum).toBe(65);
  });
  it("最後のノートが選択されているとき、disabledになる", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesRightButton
        selectedNotesIndex={[1, 3, 4, 5]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
      />
    );
    const button = await screen.findByTestId("NotesRightButton");
    // 0が含まれていると、disableのはず
    expect(button).toHaveAttribute("disabled");
  });
});
