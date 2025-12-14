import { Meta, StoryObj } from "@storybook/react";
import { FooterZoomMenu } from "../../../../src/features/EditorView/FooterMenu/FooterZoomMenu";

const meta: Meta<typeof FooterZoomMenu> = {
  title: "features/EditorView/FooterMenu/FooterZoomMenu",
  component: FooterZoomMenu,
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
