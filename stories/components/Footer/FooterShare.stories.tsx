import type { Meta, StoryObj } from "@storybook/react";
import FooterShare from "../../../src/components/Footer/FooterShare";

const meta = {
  title: "components/Footer/FooterShare",
  component: FooterShare,
  tags: ["autodocs"],
} satisfies Meta<typeof FooterShare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    matches: true,
  },
};
