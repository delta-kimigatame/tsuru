import type { Meta, StoryObj } from "@storybook/react";
import { XButton } from "../../../src/components/common/XButton";

const meta = {
  title: "components/common/XButton",
  component: XButton,
  tags: ["autodocs"],
} satisfies Meta<typeof XButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "共有",
    href: "https://twitter.com/intent/tweet",
  },
};
