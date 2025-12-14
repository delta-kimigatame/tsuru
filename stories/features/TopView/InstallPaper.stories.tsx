import { Meta, StoryObj } from "@storybook/react";
import { InstallPaper } from "../../../src/features/TopView/InstallPaper";

const meta: Meta<typeof InstallPaper> = {
  title: "features/TopView/InstallPaper",
  component: InstallPaper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
