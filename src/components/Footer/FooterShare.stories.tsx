import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import i18n from "../../i18n/configs";
import FooterShare from "./FooterShare";

i18n.changeLanguage("ja");
export default {
  title: "04_フッタ/フッタ部品/共有ボタン",
  component: FooterShare,
  argTypes: {},
} as Meta;

// matchesを明示的に型定義
interface FooterShareProps {
  matches: boolean;
}

const Template: StoryFn<FooterShareProps> = (args) => <FooterShare {...args} />;
export const Default = Template.bind({});
Default.args = {
  matches: true,
};
Default.storyName = "デフォルト";
