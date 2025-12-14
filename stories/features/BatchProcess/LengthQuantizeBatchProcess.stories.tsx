import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { LengthQuantizeBatchProcess } from "../../../src/lib/BatchProcess/LengthQuantizeBatchProcess";

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/LengthQuantizeBatchProcess",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    batchprocess: new LengthQuantizeBatchProcess(),
    selectedNotesIndex: [],
  },
};
