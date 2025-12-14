import { IconButton } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import { DividerNoteIcon } from "../../../../src/components/EditorView/NoteMenu/DividerNoteIcon";

const meta = {
  title: "components/EditorView/NoteMenu/DividerNoteIcon",
  component: DividerNoteIcon,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <IconButton>
        <Story />
      </IconButton>
    ),
  ],
} satisfies Meta<typeof DividerNoteIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
