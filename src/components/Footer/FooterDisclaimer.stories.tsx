import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import i18n from "../../i18n/configs";
import FooterDisclaimer from "./FooterDisclaimer";

i18n.changeLanguage("ja");
export default {
  title: "Components/Footer/FooterDisclaimer",
  component: FooterDisclaimer,
  argTypes: {},
} as Meta;

// matchesを明示的に型定義
interface FooterDisclaimerProps {
  matches: boolean;
}

const Template: StoryFn<FooterDisclaimerProps> = (args) => (
  <FooterDisclaimer {...args} />
);
export const Default = Template.bind({});
Default.args = {
  matches: true,
};
