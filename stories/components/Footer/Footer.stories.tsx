import { Meta, StoryFn } from "@storybook/react";
import { Footer } from "../../../src/components/Footer/Footer";
import i18n from "../../../src/i18n/configs";

i18n.changeLanguage("ja");
export default {
  title: "04_フッタ/フッタ全体",
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
Default.storyName = "デフォルト";

// モバイルビュー用の Story
export const NarrowScreen = Template.bind({});
NarrowScreen.storyName = "狭い画面 (モバイルレイアウト)";
NarrowScreen.parameters = {
  viewport: {
    defaultViewport: "iphonex", // Storybook の `mobile1` サイズを使用
  },
};
