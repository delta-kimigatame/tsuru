import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotePasteGoButton,
  pasteGo,
} from "../../../../src/features/EditorView/NoteMenu/NotePasteGoButton";
import { dumpNotes, Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../../src/store/snackBarStore";

describe("NotePasteGoButton", () => {
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
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue("mocked text"),
      },
    });
  });

  it("pasteGo:指定したインデックスの次にノートが挿入される", () => {
    const notes = createNotes();
    const resultNotes = pasteGo(notes, [notes[0]], 3);
    expect(resultNotes.length).toBe(6);
    expect(resultNotes[0].index).toBe(0);
    expect(resultNotes[1].index).toBe(1);
    expect(resultNotes[2].index).toBe(2);
    expect(resultNotes[3].index).toBe(3);
    expect(resultNotes[4].index).toBe(0); //3の次
    expect(resultNotes[5].index).toBe(4);
    expect(resultNotes[4]).toEqual(notes[0]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });
  it("pasteGo:指定したインデックスの次にノートが挿入される。複数", () => {
    const notes = createNotes();
    const resultNotes = pasteGo(notes, [notes[0], notes[1]], 3);
    expect(resultNotes.length).toBe(7);
    expect(resultNotes[0].index).toBe(0);
    expect(resultNotes[1].index).toBe(1);
    expect(resultNotes[2].index).toBe(2);
    expect(resultNotes[3].index).toBe(3);
    expect(resultNotes[4].index).toBe(0); //3の次
    expect(resultNotes[5].index).toBe(1); //3の次
    expect(resultNotes[6].index).toBe(4);
    expect(resultNotes[4]).toEqual(notes[0]);
    expect(resultNotes[5]).toEqual(notes[1]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });

  it("ボタンをクリックすると、選択した位置の後ろにノートが挿入される。成功", async () => {
    const notes = createNotes();
    const insertText = dumpNotes([notes[0]], 120, "");
    const store = useMusicProjectStore.getState();
    vi.spyOn(navigator.clipboard, "readText").mockResolvedValue(insertText);
    const handleMenuCloseSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NotePasteGoButton
        selectedNotesIndex={[3]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("notePasteGoButton");
    await fireEvent.click(button);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
    const resultNotes = useMusicProjectStore.getState().notes;
    //resultNotes[3]の次にnotes[0]が挿入されているはず。indexなどがsetNotesにより変わるため、notenumで確認
    expect(resultNotes.length).toBe(6);
    expect(resultNotes[0].notenum).toBe(60);
    expect(resultNotes[1].notenum).toBe(61);
    expect(resultNotes[2].notenum).toBe(62);
    expect(resultNotes[3].notenum).toBe(63);
    expect(resultNotes[4].notenum).toBe(60); //3の次
    expect(resultNotes[5].notenum).toBe(64);
  });

  it("ボタンをクリックすると、選択した位置の後ろにノートが挿入される。失敗", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    vi.spyOn(navigator.clipboard, "readText").mockRejectedValue(undefined);
    const handleMenuCloseSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NotePasteGoButton
        selectedNotesIndex={[3]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("notePasteGoButton");
    await fireEvent.click(button);
    // スナックバーの状態を取得して確認する
    const snackBarState = useSnackBarStore.getState();
    expect(snackBarState.severity).toBe("warning");
    expect(snackBarState.value).toBe("editor.pasteError");
    expect(snackBarState.open).toBe(true);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
    //notesは更新されないはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(notes).toEqual(resultNotes);
  });
});
