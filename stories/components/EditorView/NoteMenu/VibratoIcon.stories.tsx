import { IconButton } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import { VibratoIcon } from "../../../../src/components/EditorView/NoteMenu/VibratoIcon";

const meta = {
  title: "components/EditorView/NoteMenu/VibratoIcon",
  component: VibratoIcon,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <IconButton>
        <Story />
      </IconButton>
    ),
  ],
} satisfies Meta<typeof VibratoIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
