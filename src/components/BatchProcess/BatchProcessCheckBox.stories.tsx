import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { CheckboxUIProp } from "../../types/batchProcess";
import {
  BatchProcessCheckBox,
  BatchProcessCheckBoxProps,
} from "./BatchProcessCheckBox";

export default {
  title: "03_3_バッチプロセス/共通部品/チェックボックス",
  component: BatchProcessCheckBox,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<BatchProcessCheckBoxProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <BatchProcessCheckBox {...args} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {
  config: {
    key: "testCheckbox",
    labelKey: "batchprocess.example.checkbox",
    inputType: "checkbox",
  } as CheckboxUIProp,
  value: true,
  onChange: (key: string, value: boolean) => {
    console.log(`Changed ${key}: ${value}`);
  },
};
Default.storyName = "デフォルト";
