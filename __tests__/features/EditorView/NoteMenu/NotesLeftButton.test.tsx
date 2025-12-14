import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  notesLeft,
  NotesLeftButton,
} from "../../../../src/features/EditorView/NoteMenu/NotesLeftButton";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NotesLeftButton", () => {
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

  it("notesLeft:選択したノートが1つ左へ", () => {
    const notes = createNotes();
    const resultNotes = notesLeft(notes, [1, 3, 4]);
    expect(resultNotes[0].index).toBe(1);
    expect(resultNotes[1].index).toBe(0);
    expect(resultNotes[2].index).toBe(3);
    expect(resultNotes[3].index).toBe(4);
    expect(resultNotes[4].index).toBe(2);
    expect(resultNotes[5].index).toBe(5);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });

  it("NotesLeftButton:ボタンをクリックすると、選択されたノートが1つ左へ", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesLeftButton
        selectedNotesIndex={[1, 3, 4]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
      />
    );
    const button = await screen.findByTestId("NotesLeftButton");
    fireEvent.click(button);
    //notesが更新されているはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes.length).toBe(6);
    //ノートが1つ左へ indexはsetNotesで修正されるため、notenumで確認
    expect(resultNotes[0].notenum).toBe(61);
    expect(resultNotes[1].notenum).toBe(60);
    expect(resultNotes[2].notenum).toBe(63);
    expect(resultNotes[3].notenum).toBe(64);
    expect(resultNotes[4].notenum).toBe(62);
    expect(resultNotes[5].notenum).toBe(65);
    //selectNoteIndexも1ずつ小さくなるはず
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0, 2, 3]);
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
  it("NotesLeftButton:0番目のノートが選択されているとき、disabledになる", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesLeftButton
        selectedNotesIndex={[0, 1, 3, 4]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
      />
    );
    const button = await screen.findByTestId("NotesLeftButton");
    // 0が含まれていると、disableのはず
    expect(button).toHaveAttribute("disabled");
  });

  it("NotesLeftButton:範囲外のインデックスが含まれている場合、フィルタリングされる", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesLeftButton
        selectedNotesIndex={[-1, 1, 10]} // -1と10は範囲外
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
      />
    );
    const button = await screen.findByTestId("NotesLeftButton");
    fireEvent.click(button);

    // 範囲外インデックスがフィルタされ、[1]のみ処理される
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([0]);
  });

  it("NotesLeftButton:全て範囲外のインデックスの場合、何も実行されない", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    const setSelectedNotesIndexSpy = vi.fn();
    const initialNotes = dummyNotes.map((n) => n.deepCopy());
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesLeftButton
        selectedNotesIndex={[-1, 10, 100]} // すべて範囲外
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
      />
    );
    const button = await screen.findByTestId("NotesLeftButton");
    fireEvent.click(button);

    const resultNotes = useMusicProjectStore.getState().notes;
    // ノートが変更されていないことを確認
    resultNotes.forEach((note, i) => {
      expect(note.notenum).toBe(initialNotes[i].notenum);
    });
    // setSelectedNotesIndexが呼ばれていないことを確認
    expect(setSelectedNotesIndexSpy).not.toHaveBeenCalled();
  });
});
