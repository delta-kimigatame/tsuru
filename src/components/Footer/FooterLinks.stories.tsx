import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import i18n from "../../i18n/configs";
import FooterLinks from "./FooterLinks";

i18n.changeLanguage("ja");
export default {
  title: "04_フッタ/フッタ部品/リンク",
  component: FooterLinks,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <FooterLinks {...args} />;
export const Default = Template.bind({});
Default.args = {};
Default.storyName = "デフォルト";
