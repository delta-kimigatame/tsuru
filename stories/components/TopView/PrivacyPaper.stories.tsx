import type { Meta, StoryObj } from "@storybook/react";
import { PrivacyPaper } from "../../../src/components/TopView/PrivacyPaper";

const meta = {
  title: "components/TopView/PrivacyPaper",
  component: PrivacyPaper,
  tags: ["autodocs"],
} satisfies Meta<typeof PrivacyPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
