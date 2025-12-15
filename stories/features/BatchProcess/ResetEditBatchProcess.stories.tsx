import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { ResetEditBatchProcess } from "../../../src/lib/BatchProcess/ResetEditBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/ResetEditBatchProcess",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    batchprocess: new ResetEditBatchProcess(),
    selectedNotesIndex: [],
  },
};
