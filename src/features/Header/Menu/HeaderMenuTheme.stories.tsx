import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { HeaderMenuItemProps } from "../../../components/Header/HeaderMenuItemBase";
import { useCookieStore } from "../../../store/cookieStore";
import { HeaderMenuTheme } from "./HeaderMenuTheme";

// ダミーの言語設定用ストアを上書きする（Story 用）
const dummyTheme = "system";
// 例えば、useCookieStore の言語が更新される仕組みがあるなら、ここでその初期値を設定
useCookieStore.setState({ mode: dummyTheme });

export default {
  title: "01_ヘッダ/ヘッダ部品/メニュー部品/テーマボタン",
  component: HeaderMenuTheme,
  argTypes: {},
} as Meta;

const Template: StoryFn<HeaderMenuItemProps> = (args) => (
  <HeaderMenuTheme {...args} />
);

export const Default = Template.bind({});
Default.storyName = "デフォルト";
Default.args = {
  onClick: () => {},
  onMenuClose: () => {
    console.log("Menu closed");
  },
  // HeaderMenuTheme は内部で useCookieStore.getState().Theme を使用するため、
  // 他に直接渡す props は特にないので、onClick, onMenuClose のみ
};
