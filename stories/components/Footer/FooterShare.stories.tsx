import { Meta, StoryFn } from "@storybook/react";
import FooterShare from "../../../src/components/Footer/FooterShare";
import i18n from "../../../src/i18n/configs";

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
