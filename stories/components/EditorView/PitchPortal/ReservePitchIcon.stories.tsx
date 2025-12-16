import type { Meta, StoryObj } from "@storybook/react";
import { ReservePitchIcon } from "../../../../src/components/EditorView/PitchPortal/ReservePitchIcon";

const meta = {
  title: "components/EditorView/PitchPortal/ReservePitchIcon",
  component: ReservePitchIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof ReservePitchIcon>;

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
