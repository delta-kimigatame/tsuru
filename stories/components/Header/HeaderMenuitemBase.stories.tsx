import InfoIcon from "@mui/icons-material/Info";
import type { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuItemBase } from "../../../src/components/Header/HeaderMenuItemBase";

const meta = {
  title: "components/Header/HeaderMenuItemBase",
  component: HeaderMenuItemBase,
  tags: ["autodocs"],
} satisfies Meta<typeof HeaderMenuItemBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => {},
    text: "iconサンプル",
    icon: <InfoIcon />,
  },
};

export const AvatarTest: Story = {
  args: {
    onClick: () => {},
    text: "文字アイコン",
    icon: "A",
  },
};
