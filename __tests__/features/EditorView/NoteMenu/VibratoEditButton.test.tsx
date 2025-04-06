import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VibratoEditButton } from "../../../../src/features/EditorView/NoteMenu/VibratoEditButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("VibratoEditButton", () => {
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
  it("VibratoEditButton:クリックすると、setVibratoTargetNoteにnoteが渡される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const setVibratoTargetNoteSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    render(
      <VibratoEditButton
        setVibratoTargetNote={setVibratoTargetNoteSpy}
        selectedNotesIndex={[0]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("vibratoEditButton");
    await fireEvent.click(button);
    expect(setVibratoTargetNoteSpy).toHaveBeenCalledWith(notes[0]);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
  });
  it("VibratoEditButton:selectNotesIndex[0]が指すノートがlyric===Rのときdisabled", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    notes[0].lyric = "R";
    store.setNotes(notes);
    const setVibratoTargetNoteSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    render(
      <VibratoEditButton
        setVibratoTargetNote={setVibratoTargetNoteSpy}
        selectedNotesIndex={[0]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("vibratoEditButton");
    expect(button).toHaveAttribute("disabled");
  });
});
