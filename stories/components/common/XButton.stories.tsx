import { Meta, StoryFn } from "@storybook/react";
import { XButton, XButtonProps } from "../../../src/components/common/XButton";

export default {
  title: "50_共通部品/Xボタン",
  component: XButton,
  argTypes: {},
} as Meta;

const Template: StoryFn<XButtonProps> = (args) => <XButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "共有",
  href: "https://twitter.com/intent/tweet",
};
Default.storyName = "デフォルト";
