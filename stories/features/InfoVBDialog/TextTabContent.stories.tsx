import { Meta, StoryObj } from "@storybook/react";
import * as iconv from "iconv-lite";
import JSZip from "jszip";
import { TextTabContent } from "../../../src/features/InfoVBDialog/TextTabContent";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

const meta: Meta<typeof TextTabContent> = {
  title: "features/InfoVBDialog/TextTabContent",
  component: TextTabContent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

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

export const ShiftJIS: Story = {
  args: {
    textFile: shiftJisTextFile,
    encoding: EncodingOption.SHIFT_JIS,
  },
};

export const UTF8: Story = {
  args: {
    textFile: utf8TextFile,
    encoding: EncodingOption.UTF8,
  },
};

export const TextUndefined: Story = {
  args: {
    textFile: undefined,
    encoding: EncodingOption.SHIFT_JIS,
  },
};
