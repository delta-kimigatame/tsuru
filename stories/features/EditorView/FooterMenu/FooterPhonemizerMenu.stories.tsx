import { Meta, StoryObj } from "@storybook/react";
import { FooterPhonemizerMenu } from "../../../../src/features/EditorView/FooterMenu/FooterPhonemizerMenu";

const meta: Meta<typeof FooterPhonemizerMenu> = {
  title: "features/EditorView/FooterMenu/FooterPhonemizerMenu",
  component: FooterPhonemizerMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    anchor: document.createElement("div"),
    handleClose: () => {},
  },
};
