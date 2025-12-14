import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { AddSuffixBatchProcess } from "../../../src/lib/BatchProcess/AddSuffixBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/AddSuffixBatchProcess",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    batchprocess: new AddSuffixBatchProcess(),
    selectedNotesIndex: [],
  },
};
