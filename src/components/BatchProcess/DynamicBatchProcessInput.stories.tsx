import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import {
  CheckboxUIProp,
  SelectUIProp,
  SliderUIProp,
  SwitchUIProp,
  TextBoxNumberUIProp,
  TextBoxStringUIProp,
} from "../../types/batchProcess";
import {
  DynamicBatchProcessInput,
  DynamicBatchProcessInputProps,
} from "./DynamicBatchProcessInput";

export default {
  title: "03_3_バッチプロセス/自動UI(部品)",
  component: DynamicBatchProcessInput,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const theme = createTheme(getDesignTokens("light"));

const Template: StoryFn<DynamicBatchProcessInputProps> = (args) => (
  <ThemeProvider theme={theme}>
    <DynamicBatchProcessInput {...args} />
  </ThemeProvider>
);

export const CheckBoxStory = Template.bind({});
CheckBoxStory.args = {
  config: {
    key: "testCheckbox",
    labelKey: "batchprocess.example.checkbox",
    inputType: "checkbox",
    defaultValue: true,
  } as CheckboxUIProp,
  value: true,
  onChange: (key: string, value: boolean | string | number) =>
    console.log(`Changed ${key}: ${value}`),
};
CheckBoxStory.storyName = "チェックボックス";

export const SwitchStory = Template.bind({});
SwitchStory.args = {
  config: {
    key: "testSwitch",
    labelKey: "batchprocess.example.switch",
    inputType: "switch",
    defaultValue: false,
  } as SwitchUIProp,
  value: false,
  onChange: (key: string, value: boolean | string | number) =>
    console.log(`Changed ${key}: ${value}`),
};
SwitchStory.storyName = "スイッチ";

export const SelectStory = Template.bind({});
SelectStory.args = {
  config: {
    key: "testSelect",
    labelKey: "batchprocess.example.select",
    inputType: "select",
    options: ["option1", "option2", "option3"],
    displayOptionKey: "batchprocess.example.select.options", // i18n キーとして設定（実際は i18n リソースで配列として定義）
    defaultValue: "option2",
  } as SelectUIProp,
  value: "option2",
  onChange: (key: string, value: boolean | string | number) =>
    console.log(`Changed ${key}: ${value}`),
};
SelectStory.storyName = "セレクトボックス";

export const TextBoxNumberStory = Template.bind({});
TextBoxNumberStory.args = {
  config: {
    key: "testTextBoxNumber",
    labelKey: "batchprocess.example.textboxNumber",
    inputType: "textbox-number",
    min: 0,
    max: 200,
    defaultValue: 100,
  } as TextBoxNumberUIProp,
  value: 100,
  onChange: (key: string, value: boolean | string | number) =>
    console.log(`Changed ${key}: ${value}`),
};
TextBoxNumberStory.storyName = "テキストボックス(数値用)";

export const TextBoxStringStory = Template.bind({});
TextBoxStringStory.args = {
  config: {
    key: "testTextBoxString",
    labelKey: "batchprocess.example.textboxString",
    inputType: "textbox-string",
    defaultValue: "initial text",
  } as TextBoxStringUIProp,
  value: "initial text",
  onChange: (key: string, value: boolean | string | number) =>
    console.log(`Changed ${key}: ${value}`),
};
TextBoxStringStory.storyName = "テキストボックス(文字列用)";

export const SliderStory = Template.bind({});
SliderStory.args = {
  config: {
    key: "testSlider",
    labelKey: "batchprocess.example.slider",
    inputType: "slider",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
  } as SliderUIProp,
  value: 50,
  onChange: (key: string, value: boolean | string | number) =>
    console.log(`Changed ${key}: ${value}`),
};
SliderStory.storyName = "スライダー";
