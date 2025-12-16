import type { Meta, StoryObj } from "@storybook/react";
import { AbovePitchIcon } from "../../../../src/components/EditorView/PitchPortal/AbovePitchIcon";

const meta = {
  title: "components/EditorView/PitchPortal/AbovePitchIcon",
  component: AbovePitchIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof AbovePitchIcon>;

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
