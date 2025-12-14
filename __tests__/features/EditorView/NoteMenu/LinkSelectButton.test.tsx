import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LinkSelectButton } from "../../../../src/features/EditorView/NoteMenu/LinkSelectButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("LinkSelectButton", () => {
  beforeEach(() => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
  });

  const createNotes = (): Note[] => {
    const dummyNotes: Note[] = [];
    // R, あ, い, う, R, え, お の構成
    const lyrics = ["R", "あ", "い", "う", "R", "え", "お"];
    for (let i = 0; i < lyrics.length; i++) {
      const note = new Note();
      note.notenum = 60 + i;
      note.lyric = lyrics[i];
      note.length = 480;
      dummyNotes.push(note);
    }
    return dummyNotes;
  };

  it("LinkSelectButton:ボタンをクリックすると、R間のフレーズが選択される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setSelectedNotesIndex = vi.fn();
    const handleMenuClose = vi.fn();

    render(
      <LinkSelectButton
        selectedNotesIndex={[2]} // "い"を選択
        setSelectedNotesIndex={setSelectedNotesIndex}
        handleMenuClose={handleMenuClose}
      />
    );

    const button = screen.getByTestId("LinkSelectButton");
    fireEvent.click(button);

    // R(0) から R(4) までの [0,1,2,3,4] が選択されることを確認
    expect(setSelectedNotesIndex).toHaveBeenCalledWith([0, 1, 2, 3, 4]);
    expect(handleMenuClose).toHaveBeenCalled();
  });

  it("LinkSelectButton:選択されたノートがRの場合、何も選択されない", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setSelectedNotesIndex = vi.fn();
    const handleMenuClose = vi.fn();

    render(
      <LinkSelectButton
        selectedNotesIndex={[0]} // "R"を選択
        setSelectedNotesIndex={setSelectedNotesIndex}
        handleMenuClose={handleMenuClose}
      />
    );

    const button = screen.getByTestId("LinkSelectButton");
    fireEvent.click(button);

    // setSelectedNotesIndexが呼ばれないことを確認
    expect(setSelectedNotesIndex).not.toHaveBeenCalled();
    // handleMenuCloseは呼ばれる
    expect(handleMenuClose).toHaveBeenCalled();
  });

  it("LinkSelectButton:複数ノートが選択されているとき、disabledになる", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);

    render(
      <LinkSelectButton
        selectedNotesIndex={[1, 2]}
        setSelectedNotesIndex={vi.fn()}
        handleMenuClose={vi.fn()}
      />
    );

    const button = screen.getByTestId("LinkSelectButton");
    expect(button).toBeDisabled();
  });

  it("LinkSelectButton:フレーズの最初のノートを選択した場合、配列の先頭から選択される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setSelectedNotesIndex = vi.fn();

    render(
      <LinkSelectButton
        selectedNotesIndex={[1]} // "あ"を選択(フレーズの最初)
        setSelectedNotesIndex={setSelectedNotesIndex}
        handleMenuClose={vi.fn()}
      />
    );

    const button = screen.getByTestId("LinkSelectButton");
    fireEvent.click(button);

    // R(0) から R(4) までが選択される
    expect(setSelectedNotesIndex).toHaveBeenCalledWith([0, 1, 2, 3, 4]);
  });

  it("LinkSelectButton:フレーズの最後のノートを選択した場合、配列の末尾まで選択される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setSelectedNotesIndex = vi.fn();

    render(
      <LinkSelectButton
        selectedNotesIndex={[6]} // "お"を選択(最後のノート、Rなし)
        setSelectedNotesIndex={setSelectedNotesIndex}
        handleMenuClose={vi.fn()}
      />
    );

    const button = screen.getByTestId("LinkSelectButton");
    fireEvent.click(button);

    // R(4) から 最後(6) までが選択される
    expect(setSelectedNotesIndex).toHaveBeenCalledWith([4, 5, 6]);
  });
});
