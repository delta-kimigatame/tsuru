import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import { EncodingSelect, EncodingSelectProps } from "./EncodingSelect";

export default {
  title: "50_共通部品/文字コード選択",
  component: EncodingSelect,
  argTypes: {},
} as Meta;

const lightTheme = createTheme(getDesignTokens("light"));
const Template: StoryFn<EncodingSelectProps> = (args) => (
  <EncodingSelect {...args} />
);
export const Default = Template.bind({});
Default.args = {
  disabled: false,
  value: "",
  setValue: () => {},
};
Default.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Default.storyName = "デフォルト";
export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  value: "",
  setValue: () => {},
};
Disabled.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

Disabled.storyName = "使用不可";
