import { Meta, StoryFn } from "@storybook/react";
import FooterLinks from "../../../src/components/Footer/FooterLinks";
import i18n from "../../../src/i18n/configs";

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
