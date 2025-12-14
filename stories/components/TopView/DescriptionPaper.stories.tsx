import type { Meta, StoryObj } from "@storybook/react";
import { DescriptionPaper } from "../../../src/components/TopView/DescriptionPaper";

const meta = {
  title: "components/TopView/DescriptionPaper",
  component: DescriptionPaper,
  tags: ["autodocs"],
} satisfies Meta<typeof DescriptionPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
