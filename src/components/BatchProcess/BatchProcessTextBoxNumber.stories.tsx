import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { TextBoxNumberUIProp } from "../../types/batchProcess";
import {
  BatchProcessTextBoxNumber,
  BatchProcessTextBoxNumberProps,
} from "./BatchProcessTextBoxNumber";

export default {
  title: "03_3_バッチプロセス/共通部品/テキストボックス(数値用)",
  component: BatchProcessTextBoxNumber,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<BatchProcessTextBoxNumberProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <BatchProcessTextBoxNumber {...args} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {
  config: {
    key: "exampleNumber",
    labelKey: "batchprocess.example.textboxNumber",
    inputType: "textbox-number",
    min: 0,
    max: 200,
    defaultValue: 100,
  } as TextBoxNumberUIProp,
  value: 100,
  onChange: (key: string, value: number) => {
    console.log(`Changed ${key}: ${value}`);
  },
};
Default.storyName = "デフォルト";
