import type { Meta, StoryObj } from "@storybook/react";
import { BatchProcessSwitch } from "../../../src/components/BatchProcess/BatchProcessSwitch";
import type { SwitchUIProp } from "../../../src/types/batchProcess";

const meta: Meta<typeof BatchProcessSwitch> = {
  title: "components/BatchProcess/BatchProcessSwitch",
  component: BatchProcessSwitch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: {
      key: "testSwitch",
      labelKey: "batchprocess.example.Switch",
      inputType: "switch",
    } as SwitchUIProp,
    value: true,
    onChange: (key: string, value: boolean) => {
      console.log(`Changed ${key}: ${value}`);
    },
  },
};
