import type { Meta, StoryObj } from "@storybook/react";
import FooterLinks from "../../../src/components/Footer/FooterLinks";

const meta = {
  title: "components/Footer/FooterLinks",
  component: FooterLinks,
  tags: ["autodocs"],
} satisfies Meta<typeof FooterLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
