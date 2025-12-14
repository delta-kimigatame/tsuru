import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { RulePaper } from "../../../src/components/TopView/RulePaper";
import { getDesignTokens } from "../../../src/config/theme";
import i18n from "../../../src/i18n/configs";

export default {
  title: "02_トップ/トップ部品/利用規約",
  component: RulePaper,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn = (args) => <RulePaper {...args} />;
export const Default = Template.bind({});
Default.args = {};
Default.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Default.storyName = "デフォルト";
