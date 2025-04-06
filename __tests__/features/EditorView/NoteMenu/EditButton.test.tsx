import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { EditButton } from "../../../../src/features/EditorView/NoteMenu/EditButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("EditButton", () => {
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
  it("EditButton:クリックすると、setPropertyTargetNoteにnoteが渡される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const setPropertyTargetNoteSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    render(
      <EditButton
        setPropertyTargetNote={setPropertyTargetNoteSpy}
        selectedNotesIndex={[0]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("EditButton");
    await fireEvent.click(button);
    expect(setPropertyTargetNoteSpy).toHaveBeenCalledWith(notes[0]);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
  });
});
