import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { TextBoxStringUIProp } from "../../types/batchProcess";
import {
  BatchProcessTextBoxString,
  BatchProcessTextBoxStringProps,
} from "./BatchProcessTextBoxString";

export default {
  title: "BatchProcess/BatchProcessTextBoxString",
  component: BatchProcessTextBoxString,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<BatchProcessTextBoxStringProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <BatchProcessTextBoxString {...args} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {
  config: {
    key: "exampleString",
    labelKey: "batchprocess.example.textboxstring",
    inputType: "textbox-string",
    defaultValue: "aaa",
  } as TextBoxStringUIProp,
  value: "aaa",
  onChange: (key: string, value: string) => {
    console.log(`Changed ${key}: ${value}`);
  },
};
