import { Meta, StoryObj } from "@storybook/react";
import { LanguageMenu } from "../../../src/features/Header/LanguageMenu";

const meta: Meta<typeof LanguageMenu> = {
  title: "features/Header/LanguageMenu",
  component: LanguageMenu,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
    anchor: document.createElement("div"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
