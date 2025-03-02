import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { LoadVBDialog, LoadVBDialogProps } from "./LoadVBDialog";

/**
 * Base64文字列をArrayBufferに変換する関数
 * @param base64 - base64エンコードされた文字列
 * @returns ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export default {
  title: "Features/LoadVBDialog/LoadVBDialog",
  component: LoadVBDialog,
  argTypes: {},
} as Meta;
const lightTheme = createTheme(getDesignTokens("light"));
const Template: StoryFn<LoadVBDialogProps> = (args) => (
  <LoadVBDialog {...args} />
);

/**内部にてすと.txtを持つshift-jisで圧縮したzip */
const base64ZipData =
  "UEsDBBQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAg2WDWINnLnR4dFBLAQIUABQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAAAAAAAEAIAAAAAAAAACDZYNYg2cudHh0UEsFBgAAAAABAAEAOAAAACgAAAAAAA==";

i18n.changeLanguage("ja");
export const Default = Template.bind({});
Default.args = {
  dialogOpen: true,
  readFile: new File([base64ToArrayBuffer(base64ZipData)], "dummy.zip", {
    type: "application/zip",
  }),
  setProcessing: () => {},
  setReadFile: () => {},
  setDialogOpen: () => {},
};
Default.decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];

export const NotOpen = Template.bind({});
NotOpen.args = {
  dialogOpen: false,
  readFile: new File([base64ToArrayBuffer(base64ZipData)], "dummy.zip", {
    type: "application/zip",
  }),
  setProcessing: () => {},
  setReadFile: () => {},
  setDialogOpen: () => {},
};
NotOpen.decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];

export const FileNull = Template.bind({});
FileNull.args = {
  dialogOpen: true,
  readFile: null,
  setProcessing: () => {},
  setReadFile: () => {},
  setDialogOpen: () => {},
};
FileNull.decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];
