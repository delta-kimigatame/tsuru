import { ButtonProps } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { XButton } from "./XButton";

export default {
  title: "Common/XButton",
  component: XButton,
  argTypes: {},
} as Meta;

const Template: StoryFn<ButtonProps> = (args) => <XButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "共有",
  href: "https://twitter.com/intent/tweet",
};
