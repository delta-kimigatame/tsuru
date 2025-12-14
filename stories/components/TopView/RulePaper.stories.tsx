import type { Meta, StoryObj } from "@storybook/react";
import { RulePaper } from "../../../src/components/TopView/RulePaper";

const meta = {
  title: "components/TopView/RulePaper",
  component: RulePaper,
  tags: ["autodocs"],
} satisfies Meta<typeof RulePaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
