import { IconButton } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import { EnvelopeNoteIcon } from "../../../../src/components/EditorView/NoteMenu/EnvelopeNoteIcon";

const meta = {
  title: "components/EditorView/NoteMenu/EnvelopeNoteIcon",
  component: EnvelopeNoteIcon,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <IconButton>
        <Story />
      </IconButton>
    ),
  ],
} satisfies Meta<typeof EnvelopeNoteIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
