import type { Meta, StoryObj } from "@storybook/react";
import { BatchProcessTextBoxString } from "../../../src/components/BatchProcess/BatchProcessTextBoxString";
import type { TextBoxStringUIProp } from "../../../src/types/batchProcess";

const meta = {
  title: "components/BatchProcess/BatchProcessTextBoxString",
  component: BatchProcessTextBoxString,
  tags: ["autodocs"],
} satisfies Meta<typeof BatchProcessTextBoxString>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: {
      key: "exampleString",
      labelKey: "batchprocess.example.textboxstring",
      inputType: "textbox-string",
      defaultValue: "aaa",
    } as TextBoxStringUIProp,
    value: "aaa",
    onChange: (key: string, value: string) => {
      console.log(`Changed ${key}: ${value}`);
    },
  },
};
