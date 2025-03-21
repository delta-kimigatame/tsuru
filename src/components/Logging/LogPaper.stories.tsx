import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { LOG } from "../../lib/Logging";
import { LogPaper } from "./LogPaper";

export default {
  title: "80_ログ/ログ表示共通部品",
  component: LogPaper,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn = (args) => <LogPaper {...args} />;
export const Default = Template.bind({});
Default.args = {};
Default.decorators = [
  (Story) => {
    LOG.clear();
    LOG.debug("ログテスト", "storybook");
    LOG.info("ログテスト", "storybook");
    LOG.warn("ログテスト", "storybook");
    LOG.error("ログテスト", "storybook");
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];
Default.storyName = "デフォルト";
export const Empty = Template.bind({});
Empty.args = {};
Empty.decorators = [
  (Story) => {
    LOG.clear();
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];
Empty.storyName = "ログ無し";
