import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { EnvelopeEditButton } from "../../../../src/features/EditorView/NoteMenu/EnvelopeEditButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("EnvelopeEditButton", () => {
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
  it("EnvelopeEditButton:クリックすると、setEnvelopeTargetNoteにnoteが渡される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const setEnvelopeTargetNoteSpy = vi.fn();
    render(
      <EnvelopeEditButton
        setEnvelopeTargetNote={setEnvelopeTargetNoteSpy}
        selectedNotesIndex={[0]}
      />
    );
    const button = await screen.findByTestId("envelopeEditButton");
    await fireEvent.click(button);
    expect(setEnvelopeTargetNoteSpy).toHaveBeenCalledWith(notes[0]);
  });
  it("EnvelopeEditButton:selectNotesIndex[0]が指すノートがlyric===Rのときdisabled", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    notes[0].lyric = "R";
    store.setNotes(notes);
    const setEnvelopeTargetNoteSpy = vi.fn();
    render(
      <EnvelopeEditButton
        setEnvelopeTargetNote={setEnvelopeTargetNoteSpy}
        selectedNotesIndex={[0]}
      />
    );
    const button = await screen.findByTestId("envelopeEditButton");
    expect(button).toHaveAttribute("disabled");
  });
});
