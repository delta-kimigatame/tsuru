import { Meta, StoryObj } from "@storybook/react";
import { LoadVBUnit } from "../../../src/features/TopView/LoadVBUnit";

const meta: Meta<typeof LoadVBUnit> = {
  title: "features/TopView/LoadVBUnit",
  component: LoadVBUnit,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
