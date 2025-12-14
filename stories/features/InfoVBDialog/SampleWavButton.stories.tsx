import { Meta, StoryObj } from "@storybook/react";
import { SampleWavButton } from "../../../src/features/InfoVBDialog/SampleWavButton";
import { sampleWav } from "../../../src/storybook/sampledata";

const meta: Meta<typeof SampleWavButton> = {
  title: "features/InfoVBDialog/SampleWavButton",
  component: SampleWavButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sampleUrl: "data:audio/wav;base64," + sampleWav,
  },
};

export const Disabled: Story = {
  args: {
    sampleUrl: undefined,
  },
};
