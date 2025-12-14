import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeDialog } from "../../../../src/features/EditorView/EnvelopeDialog/EnvelopeDialog";
import { Note } from "../../../../src/lib/Note";

const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
dummyNote.preutter = 50;
dummyNote.overlap = 30;
dummyNote.envelope = "0,5,35,0,100,100,0";

const meta: Meta<typeof EnvelopeDialog> = {
  title: "features/EditorView/EnvelopeDialog/EnvelopeDialog",
  component: EnvelopeDialog,
  tags: ["autodocs"],
  args: { open: true, note: dummyNote, handleClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
