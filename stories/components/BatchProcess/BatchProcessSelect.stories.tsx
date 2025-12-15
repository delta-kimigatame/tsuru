import type { Meta, StoryObj } from "@storybook/react";
import { BatchProcessSelect } from "../../../src/components/BatchProcess/BatchProcessSelect";
import type { SelectUIProp } from "../../../src/types/batchProcess";

const meta = {
  title: "components/BatchProcess/BatchProcessSelect",
  component: BatchProcessSelect,
  tags: ["autodocs"],
} satisfies Meta<typeof BatchProcessSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: {
      key: "exampleSelect",
      labelKey: "batchprocess.example.select",
      inputType: "select",
      options: ["option1", "option2", "option3"],
      displayOptionKey: "batchprocess.example.select.options",
      defaultValue: "option2",
    } as SelectUIProp,
    value: "option2",
    onChange: (key: string, value: string | number) => {
      console.log(`Changed ${key}: ${value}`);
    },
  },
};
