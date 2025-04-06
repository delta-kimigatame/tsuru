import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  notesDown,
  NotesDownButton,
} from "../../../../src/features/EditorView/NoteMenu/NotesDownButton";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NotesDownButton", () => {
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

  it("notesDown:渡したノートが半音上がる", () => {
    const notes = createNotes();
    const resultNotes = notesDown(notes);
    resultNotes.forEach((n, i) => {
      expect(n.notenum).toBe(notes[i].notenum - 1);
    });
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });

  it("ボタンをクリックすると、選択されたノートが半音上がる", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(<NotesDownButton selectedNotesIndex={[0, 2, 4]} />);
    const button = await screen.findByTestId("NotesDownButton");
    fireEvent.click(button);
    //notesが更新されているはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes.length).toBe(5);
    //半音上がっている
    expect(resultNotes[0].notenum).toBe(59);
    expect(resultNotes[2].notenum).toBe(61);
    expect(resultNotes[4].notenum).toBe(63);
    //そのまま
    expect(resultNotes[1].notenum).toBe(61);
    expect(resultNotes[3].notenum).toBe(63);
    const undoResult = undoManager.undo();
    // 更新対象のノートだけが保存されているはず
    expect(undoResult.length).toBe(3);
    expect(undoResult[0].index).toBe(0);
    expect(undoResult[1].index).toBe(2);
    expect(undoResult[2].index).toBe(4);
  });
});
