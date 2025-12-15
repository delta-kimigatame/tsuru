import { Meta, StoryObj } from "@storybook/react";
import { FooterProjectMenu } from "../../../../src/features/EditorView/FooterMenu/FooterProjectMenu";

const meta: Meta<typeof FooterProjectMenu> = {
  title: "features/EditorView/FooterMenu/FooterProjectMenu",
  component: FooterProjectMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    anchor: document.createElement("div"),
    handleClose: () => {},
    setUstLoadProgress: () => {},
  },
};
