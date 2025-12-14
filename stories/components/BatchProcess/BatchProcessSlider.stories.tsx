import type { Meta, StoryObj } from "@storybook/react";
import { BatchProcessSlider } from "../../../src/components/BatchProcess/BatchProcessSlider";
import type { SliderUIProp } from "../../../src/types/batchProcess";

const meta = {
  title: "components/BatchProcess/BatchProcessSlider",
  component: BatchProcessSlider,
  tags: ["autodocs"],
} satisfies Meta<typeof BatchProcessSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: {
      key: "exampleNumber",
      labelKey: "batchprocess.example.Slider",
      inputType: "slider",
      min: 0,
      max: 200,
      defaultValue: 100,
    } as SliderUIProp,
    value: 100,
    onChange: (key: string, value: number) => {
      console.log(`Changed ${key}: ${value}`);
    },
  },
};
