import type { Meta, StoryObj } from "@storybook/react";
import FooterDisclaimer from "../../../src/components/Footer/FooterDisclaimer";

const meta = {
  title: "components/Footer/FooterDisclaimer",
  component: FooterDisclaimer,
  tags: ["autodocs"],
} satisfies Meta<typeof FooterDisclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    matches: true,
  },
};
