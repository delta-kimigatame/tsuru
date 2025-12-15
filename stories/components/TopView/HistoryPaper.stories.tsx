import type { Meta, StoryObj } from "@storybook/react";
import { HistoryPaper } from "../../../src/components/TopView/HistoryPaper";

const meta = {
  title: "components/TopView/HistoryPaper",
  component: HistoryPaper,
  tags: ["autodocs"],
} satisfies Meta<typeof HistoryPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
