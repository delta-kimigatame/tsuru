import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { PrivacyPaper } from "./PrivacyPaper";

export default {
  title: "02_トップ/トップ部品/プライバシーポリシー",
  component: PrivacyPaper,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn = (args) => <PrivacyPaper {...args} />;
export const Default = Template.bind({});
Default.args = {};
Default.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Default.storyName = "デフォルト";
