import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { NoteMenu } from "../../../../src/features/EditorView/NoteMenu/NoteMenu";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NoteMenu", () => {
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
  it("NoteMenu:menuAnchorがnullの時描画されない", () => {
    render(
      <NoteMenu
        menuAnchor={null}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(screen.queryByTestId("NotesLeftButton")).toBeNull();
  });
  it("NoteMenu:menuAnchorが非nullの時、必須描画される8つのボタンを確認", () => {
    render(
      <NoteMenu
        menuAnchor={{ x: 0, y: 0 }}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(screen.queryByTestId("NotesLeftButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesRightButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesUpButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDownButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesCopyButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesPasteButton")).not.toBeNull();
    expect(screen.queryByTestId("notePasteGoButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDeleteButton")).not.toBeNull();
    //以下4つのボタンは描画されない
    expect(screen.queryByTestId("EditButton")).toBeNull();
    expect(screen.queryByTestId("envelopeEditButton")).toBeNull();
    expect(screen.queryByTestId("pitchEditButton")).toBeNull();
    expect(screen.queryByTestId("DividerButton")).toBeNull();
  });
  it("NoteMenu:menuAnchorがselectNotesIndex.lengthが1のとき全てのボタンが表示される", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NoteMenu
        menuAnchor={{ x: 0, y: 0 }}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[0]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(screen.queryByTestId("NotesLeftButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesRightButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesUpButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDownButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesCopyButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesPasteButton")).not.toBeNull();
    expect(screen.queryByTestId("notePasteGoButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDeleteButton")).not.toBeNull();
    expect(screen.queryByTestId("EditButton")).not.toBeNull();
    expect(screen.queryByTestId("envelopeEditButton")).not.toBeNull();
    expect(screen.queryByTestId("pitchEditButton")).not.toBeNull();
    expect(screen.queryByTestId("DividerButton")).not.toBeNull();
  });
  it("NoteMenu:menuAnchorがselectNotesIndex.lengthが2以上のとき8つのボタンが表示される", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NoteMenu
        menuAnchor={{ x: 0, y: 0 }}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[0, 1]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(screen.queryByTestId("NotesLeftButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesRightButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesUpButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDownButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesCopyButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesPasteButton")).not.toBeNull();
    expect(screen.queryByTestId("notePasteGoButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDeleteButton")).not.toBeNull();
    //以下4つのボタンは表示されない
    expect(screen.queryByTestId("EditButton")).toBeNull();
    expect(screen.queryByTestId("envelopeEditButton")).toBeNull();
    expect(screen.queryByTestId("pitchEditButton")).toBeNull();
    expect(screen.queryByTestId("DividerButton")).toBeNull();
  });
  it("NoteMenu:EditButtonをクリックすると、NotePropertyDialogが表示される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NoteMenu
        menuAnchor={{ x: 0, y: 0 }}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[0]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(
      screen.queryByRole("button", {
        name: /editor.noteProperty.submitButton/i,
      })
    ).toBeNull();
    const button = await screen.findByTestId("EditButton");
    fireEvent.click(button);
    expect(
      screen.queryByRole("button", {
        name: /editor.noteProperty.submitButton/i,
      })
    ).not.toBeNull();
  });
  it("NoteMenu:DividerButtonをクリックすると、NotePropertyDialogが表示される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NoteMenu
        menuAnchor={{ x: 0, y: 0 }}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[0]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(
      screen.queryByRole("button", {
        name: /editor.noteDividerDialog.submitButton/i,
      })
    ).toBeNull();
    const button = await screen.findByTestId("DividerButton");
    fireEvent.click(button);
    expect(
      screen.queryByRole("button", {
        name: /editor.noteDividerDialog.submitButton/i,
      })
    ).not.toBeNull();
  });
  it("NoteMenu:envelopeEditButtonをクリックすると、EnvelopeDialogが表示される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    render(
      <NoteMenu
        menuAnchor={{ x: 0, y: 0 }}
        setMenuAnchor={() => {}}
        selectedNotesIndex={[0]}
        setSelectedNotesIndex={() => {}}
      />
    );
    expect(
      screen.queryByRole("button", {
        name: /editor.envelopeDialog.submitButton/i,
      })
    ).toBeNull();
    const button = await screen.findByTestId("envelopeEditButton");
    fireEvent.click(button);
    expect(
      screen.queryByRole("button", {
        name: /editor.envelopeDialog.submitButton/i,
      })
    ).not.toBeNull();
  });
});
