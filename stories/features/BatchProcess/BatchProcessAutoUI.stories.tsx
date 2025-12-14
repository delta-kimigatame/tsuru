import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { PreprocessingBatchProcess } from "../../../src/lib/BatchProcess/PreprocessingBatchProcess";
import { ResetEditBatchProcess } from "../../../src/lib/BatchProcess/ResetEditBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/BatchProcessAutoUI",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ResetEditAutoUI: Story = {
  args: {
    batchprocess: new ResetEditBatchProcess(),
    selectedNotesIndex: [],
  },
};

export const PreprocessingAutoUI: Story = {
  args: {
    batchprocess: new PreprocessingBatchProcess(),
    selectedNotesIndex: [],
  },
};
