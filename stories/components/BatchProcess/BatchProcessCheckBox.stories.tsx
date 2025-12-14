import type { Meta, StoryObj } from "@storybook/react";
import { BatchProcessCheckBox } from "../../../src/components/BatchProcess/BatchProcessCheckBox";
import type { CheckboxUIProp } from "../../../src/types/batchProcess";

const meta = {
  title: "components/BatchProcess/BatchProcessCheckBox",
  component: BatchProcessCheckBox,
  tags: ["autodocs"],
} satisfies Meta<typeof BatchProcessCheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: {
      key: "testCheckbox",
      labelKey: "batchprocess.example.checkbox",
      inputType: "checkbox",
    } as CheckboxUIProp,
    value: true,
    onChange: (key: string, value: boolean) => {
      console.log(`Changed ${key}: ${value}`);
    },
  },
};
