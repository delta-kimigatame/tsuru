import { Meta, StoryObj } from "@storybook/react";
import { SelectVBButton } from "../../../src/features/TopView/SelectVbButton";

const meta: Meta<typeof SelectVBButton> = {
  title: "features/TopView/SelectVBButton",
  component: SelectVBButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    processing: false,
    setProcessing: () => {},
    setReadFile: () => {},
    setDialogOpen: () => {},
  },
};

export const Processing: Story = {
  args: {
    processing: true,
    setProcessing: () => {},
    setReadFile: () => {},
    setDialogOpen: () => {},
  },
};

Processing.storyName = "音源読込中";
