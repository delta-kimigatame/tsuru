import { Meta, StoryObj } from "@storybook/react";
import { BatchProcessTextBoxNumber } from "../../../src/components/BatchProcess/BatchProcessTextBoxNumber";
import { TextBoxNumberUIProp } from "../../../src/types/batchProcess";

const meta: Meta<typeof BatchProcessTextBoxNumber> = {
  title: "components/BatchProcess/BatchProcessTextBoxNumber",
  component: BatchProcessTextBoxNumber,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: {
      key: "exampleNumber",
      labelKey: "batchprocess.example.textboxNumber",
      inputType: "textbox-number",
      min: 0,
      max: 200,
      defaultValue: 100,
    } as TextBoxNumberUIProp,
    value: 100,
    onChange: (key: string, value: number) => {
      console.log(`Changed ${key}: ${value}`);
    },
  },
};
