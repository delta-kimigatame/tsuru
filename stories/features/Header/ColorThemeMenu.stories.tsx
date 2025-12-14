import { Meta, StoryObj } from "@storybook/react";
import { ColorThemeMenu } from "../../../src/features/Header/ColorThemeMenu";

const meta: Meta<typeof ColorThemeMenu> = {
  title: "features/Header/ColorThemeMenu",
  component: ColorThemeMenu,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
    anchor: document.createElement("div"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
