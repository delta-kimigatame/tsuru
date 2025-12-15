import { Meta, StoryObj } from "@storybook/react";
import { SelectVBDirButton } from "../../../src/features/TopView/SelectVBDirButton";

const meta: Meta<typeof SelectVBDirButton> = {
  title: "features/TopView/SelectVBDirButton",
  component: SelectVBDirButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    processing: false,
    setProcessing: () => {},
    setReadFile: () => {},
  },
};

export const Processing: Story = {
  args: {
    processing: true,
    setProcessing: () => {},
    setReadFile: () => {},
  },
};
