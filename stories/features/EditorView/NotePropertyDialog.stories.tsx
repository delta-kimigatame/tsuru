import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  NotePropertyDialog,
  NotePropertyDialogProps,
} from "../../../src/features/EditorView/NotePropertyDialog";
import { Note } from "../../../src/lib/Note";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
dummyNote.notenum = 60;
dummyNote.lyric = "あ";
dummyNote.preutter = 10;
dummyNote.overlap = -5;
dummyNote.stp = 3;

const dummyRestNote = new Note();
dummyRestNote.length = 480;
dummyRestNote.tempo = 120;
dummyRestNote.notenum = 60;
dummyRestNote.lyric = "R";
dummyRestNote.preutter = 10;
dummyRestNote.overlap = -5;
dummyRestNote.stp = 3;

const DummyParent: React.FC<
  NotePropertyDialogProps & { notes: Array<Note> }
> = (args) => {
  const useProject = useMusicProjectStore();
  React.useEffect(() => {
    useProject.setUst({} as Ust);
    useProject.setNotes(args.notes);
  }, []);
  return (
    <NotePropertyDialog
      {...args}
      open={useProject.notes.length !== 0 ? args.open : false}
    />
  );
};

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/NotePropertyDialog",
  component: DummyParent,
  tags: ["autodocs"],
  args: {
    open: true,
    note: dummyNote,
    handleClose: () => {},
    notes: [dummyNote],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RestNote: Story = {
  args: {
    note: dummyRestNote,
    notes: [dummyRestNote],
  },
};
