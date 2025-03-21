import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import { FileList, FileListProps } from "./FileList";

export default {
  title: "05_音源読込画面/ファイル一覧",
  component: FileList,
  argTypes: {},
} as Meta;

const lightTheme = createTheme(getDesignTokens("light"));
const Template: StoryFn<FileListProps> = (args) => <FileList {...args} />;
export const Default = Template.bind({});
Default.args = {
  processing: false,
  files: ["_ああいあうえあ.wav", "character.txt"],
};
Default.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Default.storyName = "デフォルト";
export const Processing = Template.bind({});
Processing.args = {
  processing: true,
  files: ["_ああいあうえあ.wav", "character.txt"],
};
Processing.storyName = "ファイル読込中";
Processing.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
