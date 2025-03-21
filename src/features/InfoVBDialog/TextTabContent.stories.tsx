import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import * as iconv from "iconv-lite";
import JSZip from "jszip";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import { EncodingOption } from "../../utils/EncodingMapping";
import { TextTabContent, TextTabContentProps } from "./TextTabContent";

const lightTheme = createTheme(getDesignTokens("light"));

export default {
  title: "06_音源情報画面/音源情報画面部品/テキストタブ(中身)",
  component: TextTabContent,
} as Meta;

// サンプルテキスト
const sampleText = "あいう\r\nえお";

// Shift-JIS 用のテキストファイルを作成
const zipShift = new JSZip();
const shiftJisFile = new File(
  [iconv.encode(sampleText, "Windows-31j")],
  "test.txt",
  { type: "text/plane;charset=shift-jis" }
);
zipShift.file("test.txt", shiftJisFile);
const shiftJisTextFile = zipShift.files["test.txt"];

// UTF-8 用のテキストファイルを作成
const zipUtf8 = new JSZip();
const utf8File = new File([sampleText], "test.txt", {
  type: "text/plain;charset=utf-8",
});
zipUtf8.file("test.txt", utf8File);
const utf8TextFile = zipUtf8.files["test.txt"];

const Template: StoryFn<TextTabContentProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <TextTabContent {...args} />
  </ThemeProvider>
);

export const ShiftJIS = Template.bind({});
ShiftJIS.storyName = "Shift-JIS テキストファイル";
ShiftJIS.args = {
  textFile: shiftJisTextFile,
  encoding: EncodingOption.SHIFT_JIS,
};

export const UTF8 = Template.bind({});
UTF8.storyName = "UTF-8 テキストファイル";
UTF8.args = {
  textFile: utf8TextFile,
  encoding: EncodingOption.UTF8,
};

export const TextUndefined = Template.bind({});
ShiftJIS.storyName = "テキストファイルがundefined";
ShiftJIS.args = {
  textFile: undefined,
  encoding: EncodingOption.SHIFT_JIS,
};

// 遅延処理用のヘルパー関数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 読み込み処理に3秒の遅延を入れるオーバーライド関数
const delayedReadTextFile = async (buffer: ArrayBuffer, encoding: string) => {
  await delay(3000);
  // サンプルテキストとして "あいう\r\nえお" を返す
  return "あいう\r\nえお";
};
