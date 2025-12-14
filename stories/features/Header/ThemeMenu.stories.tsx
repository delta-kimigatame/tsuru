import { Meta, StoryObj } from "@storybook/react";
import { ThemeMenu } from "../../../src/features/Header/ThemeMenu";

const meta: Meta<typeof ThemeMenu> = {
  title: "features/Header/ThemeMenu",
  component: ThemeMenu,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
    anchor: document.createElement("div"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
