import { Meta, StoryObj } from "@storybook/react";
import { LinkPaper } from "../../../src/components/TopView/LinkPaper";

const meta: Meta<typeof LinkPaper> = {
  title: "components/TopView/LinkPaper",
  component: LinkPaper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
