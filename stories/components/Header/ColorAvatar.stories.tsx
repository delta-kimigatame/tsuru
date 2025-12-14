import { Meta, StoryObj } from "@storybook/react";
import { ColorAvatar } from "../../../src/components/Header/ColorAvatar";

const meta: Meta<typeof ColorAvatar> = {
  title: "components/Header/ColorAvatar",
  component: ColorAvatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: "#9575CD",
    colorTheme: "default",
  },
};

export const Red: Story = {
  args: {
    color: "#F44336",
    colorTheme: "red",
  },
};

export const Blue: Story = {
  args: {
    color: "#2196F3",
    colorTheme: "blue",
  },
};
