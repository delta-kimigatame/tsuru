import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { HeaderMenuItemProps } from "../../../components/Header/HeaderMenuItemBase";
import i18n from "../../../i18n/configs";
import { HeaderMenuLog } from "./HeaderMenuLog";

export default {
  title: "01_ヘッダ/ヘッダ部品/メニュー部品/ログ表示ボタン",
  component: HeaderMenuLog,
  argTypes: {},
} as Meta;

const Template: StoryFn<HeaderMenuItemProps> = (args) => (
  <HeaderMenuLog {...args} />
);

i18n.changeLanguage("ja");
export const Default = Template.bind({});
Default.storyName = "デフォルト";
Default.args = {
  onClick: () => {},
  onMenuClose: () => {
    console.log("Menu closed");
  },
};

export const ShowDialog = Template.bind({});
ShowDialog.storyName = "ダイアログ表示";
ShowDialog.args = {
  onClick: () => {},
  onMenuClose: () => {
    console.log("Menu closed");
  },
};
ShowDialog.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  const button = await within(document.body).findByText(
    /操作ログ表示/i,
    {},
    { timeout: 5000 }
  );
  await userEvent.click(button);
};
