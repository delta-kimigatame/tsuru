import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { SliderUIProp } from "../../types/batchProcess";
import {
  BatchProcessSlider,
  BatchProcessSliderProps,
} from "./BatchProcessSlider";

export default {
  title: "03_3_バッチプロセス/共通部品/スライダー",
  component: BatchProcessSlider,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<BatchProcessSliderProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <BatchProcessSlider {...args} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {
  config: {
    key: "exampleNumber",
    labelKey: "batchprocess.example.Slider",
    inputType: "slider",
    min: 0,
    max: 200,
    defaultValue: 100,
  } as SliderUIProp,
  value: 100,
  onChange: (key: string, value: number) => {
    console.log(`Changed ${key}: ${value}`);
  },
};
Default.storyName = "デフォルト";
