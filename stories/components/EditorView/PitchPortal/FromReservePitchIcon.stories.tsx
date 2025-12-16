import type { Meta, StoryObj } from "@storybook/react";
import { FromReservePitchIcon } from "../../../../src/components/EditorView/PitchPortal/FromReservePitchIcon";

const meta = {
  title: "components/EditorView/PitchPortal/FromReservePitchIcon",
  component: FromReservePitchIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof FromReservePitchIcon>;

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
