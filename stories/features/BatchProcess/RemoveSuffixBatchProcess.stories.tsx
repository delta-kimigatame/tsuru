import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { RemoveSuffixBatchProcess } from "../../../src/lib/BatchProcess/RemoveSuffixBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/RemoveSuffixBatchProcess",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    batchprocess: new RemoveSuffixBatchProcess(),
    selectedNotesIndex: [],
  },
};
