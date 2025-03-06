import InfoIcon from "@mui/icons-material/Info";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import {
  HeaderMenuItemBase,
  HeadermenuItemBaseProps,
} from "./HeaderMenuItemBase";
export default {
  title: "Header/HeaderMenuItemBase",
  component: HeaderMenuItemBase,
  argTypes: {},
} as Meta;

const Template: StoryFn<HeadermenuItemBaseProps> = (args) => (
  <HeaderMenuItemBase {...args} />
);

export const Default = Template.bind({});
Default.args = {
  onClick: () => {},
  text: "iconサンプル",
  icon: <InfoIcon />,
};
Default.storyName = "通常のヘッダメニュー";
export const AvatarTest = Template.bind({});
AvatarTest.args = {
  onClick: () => {},
  text: "文字アイコン",
  icon: "A",
};
AvatarTest.storyName = "文字アイコンのヘッダメニュー";
