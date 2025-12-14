import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { getDesignTokens } from "../../../src/config/theme";
import {
  SelectVBButton,
  SelectVBButtonProps,
} from "../../../src/features/TopView/SelectVbButton";
import i18n from "../../../src/i18n/configs";

export default {
  title: "02_トップ/トップ部品/音源選択ボタン",
  component: SelectVBButton,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<SelectVBButtonProps> = (args) => (
  <SelectVBButton {...args} />
);
export const Default = Template.bind({});
Default.args = {
  processing: false,
  setProcessing: () => {},
  setReadFile: () => {},
  setDialogOpen: () => {},
};
Default.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Default.storyName = "デフォルト";
export const Processing = Template.bind({});
Processing.args = {
  processing: true,
  setProcessing: () => {},
  setReadFile: () => {},
  setDialogOpen: () => {},
};
Processing.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

Processing.storyName = "音源読込中";
