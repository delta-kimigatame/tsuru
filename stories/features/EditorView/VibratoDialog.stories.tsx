import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  VibratoDialog,
  VibratoDialogProps,
} from "../../../src/features/EditorView/VibratoDialog";
import { Note } from "../../../src/lib/Note";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
dummyNote.notenum = 60;
dummyNote.lyric = "あ";
dummyNote.vibrato = "50,120,40,35,45,1,8,0";

const dummyNoVibratoNote = new Note();
dummyNoVibratoNote.length = 480;
dummyNoVibratoNote.tempo = 120;
dummyNoVibratoNote.notenum = 60;
dummyNote.lyric = "あ";

const DummyParent: React.FC<VibratoDialogProps & { notes: Array<Note> }> = (
  args
) => {
  const useProject = useMusicProjectStore();
  React.useEffect(() => {
    useProject.setUst({} as Ust);
    useProject.setNotes(args.notes);
  }, []);
  return (
    <VibratoDialog
      {...args}
      open={useProject.notes.length !== 0 ? args.open : false}
    />
  );
};

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/VibratoDialog",
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

export const UndefinedVibrato: Story = {
  args: {
    note: dummyNoVibratoNote,
    notes: [dummyNoVibratoNote],
  },
};
