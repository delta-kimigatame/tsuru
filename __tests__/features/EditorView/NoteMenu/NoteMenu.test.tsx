import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoteMenu } from "../../../../src/features/EditorView/NoteMenu/NoteMenu";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("NoteMenu", () => {
  beforeEach(() => {
    // vbをセットアップしてAliaseSelectがエラーにならないようにする
    const dummyVb = {
      oto: {
        SearchAliases: vi.fn().mockReturnValue(["あ", "い", "う"]),
      },
    } as unknown as VoiceBank;
    const store = useMusicProjectStore.getState();
    store.setVb(dummyVb);
    store.setUst({} as Ust);
  });
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
    expect(screen.queryByTestId("notePasteButton")).not.toBeNull();
    expect(screen.queryByTestId("notePasteGoButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDeleteButton")).not.toBeNull();
    //以下5つのボタンは描画されない
    expect(screen.queryByTestId("EditButton")).toBeNull();
    expect(screen.queryByTestId("envelopeEditButton")).toBeNull();
    expect(screen.queryByTestId("pitchEditButton")).toBeNull();
    expect(screen.queryByTestId("DividerButton")).toBeNull();
    expect(screen.queryByTestId("vibratoEditButton")).toBeNull();
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
    expect(screen.queryByTestId("notePasteButton")).not.toBeNull();
    expect(screen.queryByTestId("notePasteGoButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDeleteButton")).not.toBeNull();
    expect(screen.queryByTestId("EditButton")).not.toBeNull();
    expect(screen.queryByTestId("envelopeEditButton")).not.toBeNull();
    expect(screen.queryByTestId("vibratoEditButton")).not.toBeNull();
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
    expect(screen.queryByTestId("notePasteButton")).not.toBeNull();
    expect(screen.queryByTestId("notePasteGoButton")).not.toBeNull();
    expect(screen.queryByTestId("NotesDeleteButton")).not.toBeNull();
    //以下5つのボタンは表示されない
    expect(screen.queryByTestId("EditButton")).toBeNull();
    expect(screen.queryByTestId("envelopeEditButton")).toBeNull();
    expect(screen.queryByTestId("pitchEditButton")).toBeNull();
    expect(screen.queryByTestId("DividerButton")).toBeNull();
    expect(screen.queryByTestId("vibratoEditButton")).toBeNull();
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
  it("NoteMenu:vibratoEditButtonをクリックすると、VibratoDialogが表示される", async () => {
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
        name: /editor.vibratoDialog.submitButton/i,
      })
    ).toBeNull();
    const button = await screen.findByTestId("vibratoEditButton");
    fireEvent.click(button);
    expect(
      screen.queryByRole("button", {
        name: /editor.vibratoDialog.submitButton/i,
      })
    ).not.toBeNull();
  });

  it("NoteMenu:selectedNotesIndex.length === 1のとき、AliaseSelectとLengthSelectが表示される", () => {
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
    // AliaseSelectのInputLabelが表示されることを確認
    expect(screen.queryByText(/notemenu.alias/i)).not.toBeNull();
    // LengthSelectのInputLabelが表示されることを確認
    expect(screen.queryByText(/notemenu.length/i)).not.toBeNull();
  });

  it("NoteMenu:selectedNotesIndex.length !== 1のとき、AliaseSelectとLengthSelectが表示されない", () => {
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
    // AliaseSelectとLengthSelectが表示されない
    expect(screen.queryByText(/notemenu.alias/i)).toBeNull();
    expect(screen.queryByText(/notemenu.length/i)).toBeNull();
  });
});
