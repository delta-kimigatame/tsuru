import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotesCacheClearButton } from "../../../../src/features/EditorView/NoteMenu/NotesCacheClearButton";
import { Note } from "../../../../src/lib/Note";
import { resampCache } from "../../../../src/lib/ResampCache";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NotesCacheClearButton", () => {
  beforeEach(() => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);

    // resampCacheのclearByIndicesをモック化
    vi.spyOn(resampCache, "clearByIndices").mockImplementation(() => {});
  });

  const createNotes = (): Note[] => {
    const dummyNotes: Note[] = [];
    for (let i = 0; i < 5; i++) {
      const note = new Note();
      note.notenum = 60 + i;
      note.lyric = "あ";
      note.length = 480;
      dummyNotes.push(note);
    }
    return dummyNotes;
  };

  it("NotesCacheClearButton:ボタンをクリックすると、選択したノートのキャッシュがクリアされる", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const handleMenuClose = vi.fn();

    render(
      <NotesCacheClearButton
        selectedNotesIndex={[0, 2]}
        setSelectedNotesIndex={vi.fn()}
        handleMenuClose={handleMenuClose}
      />
    );

    const button = screen.getByTestId("NotesCacheClearButton");
    fireEvent.click(button);

    // clearByIndicesが選択されたインデックスで呼ばれたことを確認
    expect(resampCache.clearByIndices).toHaveBeenCalledWith([0, 2]);
    expect(handleMenuClose).toHaveBeenCalled();
  });

  it("NotesCacheClearButton:単一ノートが選択されている場合も動作する", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const handleMenuClose = vi.fn();

    render(
      <NotesCacheClearButton
        selectedNotesIndex={[3]}
        setSelectedNotesIndex={vi.fn()}
        handleMenuClose={handleMenuClose}
      />
    );

    const button = screen.getByTestId("NotesCacheClearButton");
    fireEvent.click(button);

    expect(resampCache.clearByIndices).toHaveBeenCalledWith([3]);
    expect(handleMenuClose).toHaveBeenCalled();
  });
});
