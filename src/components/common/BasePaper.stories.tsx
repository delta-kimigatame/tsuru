import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import { BasePaper, BasePaperProps } from "./BasePaper";

export default {
  title: "50_共通部品/ペーパー",
  component: BasePaper,
  argTypes: {},
} as Meta;

const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn<BasePaperProps> = (args) => <BasePaper {...args} />;
export const Default = Template.bind({});
Default.args = {
  title: "デフォルト",
  children: (
    <>
      test
      <br />
      test
    </>
  ),
};
Default.storyName = "デフォルト";
export const ElevationChange = Template.bind({});
ElevationChange.args = {
  title: "エレベーション6",
  children: (
    <>
      test
      <br />
      test
    </>
  ),
  elevation: 6,
};
ElevationChange.storyName = "エレベーション6";

export const SxAdd = Template.bind({});
SxAdd.args = {
  title: "sx(maxWidth:300)",
  children: (
    <>
      test
      <br />
      test
    </>
  ),
  sx: { maxWidth: 300 },
};
SxAdd.storyName = "スタイルの追加(maxwidth:300)";

export const ThemeProviderStory = Template.bind({});
ThemeProviderStory.args = {
  title: "Theme test(light)",
  children: (
    <>
      test
      <br />
      test
    </>
  ),
};
ThemeProviderStory.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ThemeProviderStory.storyName = "ライトモード";
export const ThemeProviderStoryDark = Template.bind({});
ThemeProviderStoryDark.args = {
  title: "Theme test(dark)",
  children: (
    <>
      test
      <br />
      test
    </>
  ),
};
ThemeProviderStoryDark.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ThemeProviderStoryDark.storyName = "ダークモード";
