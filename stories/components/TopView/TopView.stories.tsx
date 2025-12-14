import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { TopView } from "../../../src/components/TopView/TopView";
import { getDesignTokens } from "../../../src/config/theme";
import i18n from "../../../src/i18n/configs";

export default {
  title: "02_トップ/トップ全体",
  component: TopView,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn = (args) => <TopView {...args} />;
export const Default = Template.bind({});
Default.args = {};
Default.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Default.storyName = "ライトモード";

export const DarkMode = Template.bind({});
DarkMode.args = {};
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];
DarkMode.storyName = "ダークモード";

export const Japanese = Template.bind({});
Japanese.args = {};
Japanese.decorators = [
  (Story) => {
    i18n.changeLanguage("ja");
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];
Japanese.storyName = "日本語";

export const English = Template.bind({});
English.args = {};
English.decorators = [
  (Story) => {
    i18n.changeLanguage("en");
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];
English.storyName = "English";
