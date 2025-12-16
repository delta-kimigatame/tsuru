import type { Meta, StoryObj } from "@storybook/react";
import { BelowPitchIcon } from "../../../../src/components/EditorView/PitchPortal/BelowPitchIcon";

const meta = {
  title: "components/EditorView/PitchPortal/BelowPitchIcon",
  component: BelowPitchIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof BelowPitchIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトサイズのアイコン
 */
export const Default: Story = {};

/**
 * 小さいサイズのアイコン
 */
export const Small: Story = {
  args: {
    fontSize: "small",
  },
};

/**
 * 大きいサイズのアイコン
 */
export const Large: Story = {
  args: {
    fontSize: "large",
  },
};

/**
 * カスタムカラーのアイコン
 */
export const CustomColor: Story = {
  args: {
    sx: { color: "primary.main" },
  },
};
