import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "../../../src/components/Header/Header";

const meta = {
  title: "components/Header/Header",
  component: Header,
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
