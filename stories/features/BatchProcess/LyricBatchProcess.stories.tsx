import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { LyricBatchProcess } from "../../../src/lib/BatchProcess/LyricBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/LyricBatchProcess",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    batchprocess: new LyricBatchProcess(),
    selectedNotesIndex: [],
  },
};
