import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { HeaderMenuItemProps } from "../../../components/Header/HeaderMenuItemBase";
import { useCookieStore } from "../../../store/cookieStore";
import { HeaderMenuLanguage } from "./HeaderMenuLanguage";

// ダミーの言語設定用ストアを上書きする（Story 用）
const dummyLanguage = "ja";
// 例えば、useCookieStore の言語が更新される仕組みがあるなら、ここでその初期値を設定
useCookieStore.setState({ language: dummyLanguage });

export default {
  title: "Header/HeaderMenuLanguage",
  component: HeaderMenuLanguage,
  argTypes: {},
} as Meta;

const Template: StoryFn<HeaderMenuItemProps> = (args) => (
  <HeaderMenuLanguage {...args} />
);

export const Default = Template.bind({});
Default.storyName = "HeaderMenuLanguage のデフォルト表示";
Default.args = {
  onClick: () => {},
  onMenuClose: () => {
    console.log("Menu closed");
  },
  // HeaderMenuLanguage は内部で useCookieStore.getState().language を使用するため、
  // 他に直接渡す props は特にないので、onClick, onMenuClose のみ
};
