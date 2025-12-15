import { Meta, StoryObj } from "@storybook/react";
import { SampleWavButton } from "../../../src/features/InfoVBDialog/SampleWavButton";

const meta: Meta<typeof SampleWavButton> = {
  title: "features/InfoVBDialog/SampleWavButton",
  component: SampleWavButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSample: Story = {
  args: {
    sampleUrl:
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
  },
};

export const NoSample: Story = {
  args: {
    sampleUrl: undefined,
  },
};
