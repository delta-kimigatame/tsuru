import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { PreprocessingBatchProcess } from "../../../src/lib/BatchProcess/PreprocessingBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/PreprocessingBatchProcess",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    batchprocess: new PreprocessingBatchProcess(),
    selectedNotesIndex: [],
  },
};
