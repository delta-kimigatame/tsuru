import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotePasteButton } from "../../../../src/features/EditorView/NoteMenu/NotePasteButton";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NotePasteButton", () => {
  beforeEach(() => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
  });

  it("NotePasteButton:ボタンをクリックすると、setPasteTargetNoteが呼ばれる", () => {
    const setPasteTargetNote = vi.fn();
    const handleMenuClose = vi.fn();

    render(
      <NotePasteButton
        selectedNotesIndex={[0]}
        setPasteTargetNote={setPasteTargetNote}
        handleMenuClose={handleMenuClose}
      />
    );

    const button = screen.getByTestId("notePasteButton");
    fireEvent.click(button);

    expect(setPasteTargetNote).toHaveBeenCalledWith([0]);
    expect(handleMenuClose).toHaveBeenCalled();
  });

  it("NotePasteButton:複数のノートが選択されている場合も動作する", () => {
    const setPasteTargetNote = vi.fn();
    const handleMenuClose = vi.fn();

    render(
      <NotePasteButton
        selectedNotesIndex={[0, 1, 2]}
        setPasteTargetNote={setPasteTargetNote}
        handleMenuClose={handleMenuClose}
      />
    );

    const button = screen.getByTestId("notePasteButton");
    fireEvent.click(button);

    expect(setPasteTargetNote).toHaveBeenCalledWith([0, 1, 2]);
    expect(handleMenuClose).toHaveBeenCalled();
  });
});
