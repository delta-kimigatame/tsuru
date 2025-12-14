import type { Meta, StoryObj } from "@storybook/react";
import { FileList } from "../../../src/components/LoadVBDialog/FileList";

const meta = {
  title: "components/LoadVBDialog/FileList",
  component: FileList,
  tags: ["autodocs"],
} satisfies Meta<typeof FileList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    processing: false,
    files: ["_ああいあうえあ.wav", "character.txt"],
  },
};

export const Processing: Story = {
  args: {
    processing: true,
    files: ["_ああいあうえあ.wav", "character.txt"],
  },
};
