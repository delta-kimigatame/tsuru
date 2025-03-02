import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import i18n from "../../i18n/configs";
import { Footer } from "./Footer";

i18n.changeLanguage("ja");
export default {
  title: "Footer/Footer",
  component: Footer,
  parameters: {
    viewport: {
      defaultViewport: "responsive", // デフォルトの表示をレスポンシブに
    },
  },
  argTypes: {},
} as Meta;

const Template: StoryFn = () => <Footer />;
export const Default = Template.bind({});
Default.args = {};

// モバイルビュー用の Story
export const NarrowScreen = Template.bind({});
NarrowScreen.storyName = "狭い画面 (モバイルレイアウト)";
NarrowScreen.parameters = {
  viewport: {
    defaultViewport: "mobile1", // Storybook の `mobile1` サイズを使用
  },
};
