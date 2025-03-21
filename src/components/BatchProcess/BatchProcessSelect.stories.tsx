import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { SelectUIProp } from "../../types/batchProcess";
import {
  BatchProcessSelect,
  BatchProcessSelectProps,
} from "./BatchProcessSelect";

export default {
  title: "03_3_バッチプロセス/共通部品/セレクトボックス",
  component: BatchProcessSelect,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<BatchProcessSelectProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <BatchProcessSelect {...args} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {
  config: {
    key: "exampleSelect",
    labelKey: "batchprocess.example.select",
    inputType: "select",
    options: ["option1", "option2", "option3"],
    displayOptionKey: "batchprocess.example.select.options",
    defaultValue: "option2",
  } as SelectUIProp,
  value: "option2",
  onChange: (key: string, value: string) => {
    console.log(`Changed ${key}: ${value}`);
  },
};
Default.storyName = "デフォルト";
