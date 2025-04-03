import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { PitchEditButton } from "../../../../src/features/EditorView/NoteMenu/PitchEditButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("PitchEditButton", () => {
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
  it("PitchEditButton:クリックすると、setPitchTargetIndexにnoteのindexが渡される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const setPitchTargetNoteSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    render(
      <PitchEditButton
        setPitchTargetIndex={setPitchTargetNoteSpy}
        selectedNotesIndex={[0]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("pitchEditButton");
    await fireEvent.click(button);
    expect(setPitchTargetNoteSpy).toHaveBeenCalledWith(0);
    expect(handleMenuCloseSpy).toHaveBeenCalled();
  });
  it("PitchEditButton:selectNotesIndex[0]が指すノートがlyric===Rのときdisabled", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    notes[0].lyric = "R";
    store.setNotes(notes);
    const setPitchTargetNoteSpy = vi.fn();
    const handleMenuCloseSpy = vi.fn();
    render(
      <PitchEditButton
        setPitchTargetIndex={setPitchTargetNoteSpy}
        selectedNotesIndex={[0]}
        handleMenuClose={handleMenuCloseSpy}
      />
    );
    const button = await screen.findByTestId("pitchEditButton");
    expect(button).toHaveAttribute("disabled");
  });
});
