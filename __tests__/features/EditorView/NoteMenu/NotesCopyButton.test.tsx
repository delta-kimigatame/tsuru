import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotesCopyButton } from "../../../../src/features/EditorView/NoteMenu/NotesCopyButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../../src/store/snackBarStore";

describe("NotesCopyButton", () => {
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
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue("mocked text"),
      },
    });
  });

  it("ボタンをクリックすると、選択したノートがコピーされる。成功", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const setSelectedNotesIndexSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesCopyButton
        selectedNotesIndex={[0, 2, 4]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("NotesCopyButton");
    await fireEvent.click(button);
    // スナックバーの状態を取得して確認する
    const snackBarState = useSnackBarStore.getState();
    expect(snackBarState.severity).toBe("success");
    expect(snackBarState.value).toBe("editor.copySuccess");
    expect(snackBarState.open).toBe(true);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
    //notesは更新されないはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(dummyNotes).toEqual(resultNotes);
  });

  it("ボタンをクリックすると、選択したノートがコピーされる。失敗", async () => {
    const dummyNotes = createNotes();
    const store = useMusicProjectStore.getState();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue({
      message: "error",
    });
    const setSelectedNotesIndexSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(
      <NotesCopyButton
        selectedNotesIndex={[0, 2, 4]}
        setSelectedNotesIndex={setSelectedNotesIndexSpy}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("NotesCopyButton");
    await fireEvent.click(button);
    // スナックバーの状態を取得して確認する
    const snackBarState = useSnackBarStore.getState();
    expect(snackBarState.severity).toBe("error");
    expect(snackBarState.value).toBe("editor.copyError");
    expect(snackBarState.open).toBe(true);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
    //notesは更新されないはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(dummyNotes).toEqual(resultNotes);
  });
});
