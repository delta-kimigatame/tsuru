import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { SwitchUIProp } from "../../types/batchProcess";
import {
  BatchProcessSwitch,
  BatchProcessSwitchProps,
} from "./BatchProcessSwitch";

export default {
  title: "03_3_バッチプロセス/共通部品/スイッチ",
  component: BatchProcessSwitch,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<BatchProcessSwitchProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <BatchProcessSwitch {...args} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {
  config: {
    key: "testSwitch",
    labelKey: "batchprocess.example.Switch",
    inputType: "switch",
  } as SwitchUIProp,
  value: true,
  onChange: (key: string, value: boolean) => {
    console.log(`Changed ${key}: ${value}`);
  },
};
Default.storyName = "デフォルト";
