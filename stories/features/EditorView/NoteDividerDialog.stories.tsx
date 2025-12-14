import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  NoteDividerDialog,
  NoteDividerDialogProps,
} from "../../../src/features/EditorView/NoteDividerDialog";
import { Note } from "../../../src/lib/Note";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;

const shortNote = new Note();
shortNote.length = 240;
shortNote.tempo = 120;

const longNote = new Note();
longNote.length = 480 * 5 + 240;
longNote.tempo = 120;

const DummyParent: React.FC<NoteDividerDialogProps & { notes: Array<Note> }> = (
  args
) => {
  const useProject = useMusicProjectStore();
  React.useEffect(() => {
    useProject.setUst({} as Ust);
    useProject.setNotes(args.notes);
  }, []);
  return (
    <NoteDividerDialog
      {...args}
      open={useProject.notes.length !== 0 ? args.open : false}
    />
  );
};

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/NoteDividerDialog",
  component: DummyParent,
  tags: ["autodocs"],
  args: { open: true, noteIndex: 0, handleClose: () => {}, notes: [dummyNote] },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortNote: Story = {
  args: {
    notes: [shortNote],
  },
};

export const LongNote: Story = {
  args: {
    notes: [longNote],
  },
};
