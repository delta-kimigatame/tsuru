import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { base64ToArrayBuffer } from "../../storybook/utils";
import { LoadVBDialog, LoadVBDialogProps } from "./LoadVBDialog";

export default {
  title: "LoadVBDialog/LoadVBDialog",
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
