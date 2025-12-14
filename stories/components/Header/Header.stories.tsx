import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { Header } from "../../../src/components/Header/Header";
import { getDesignTokens } from "../../../src/config/theme";
import i18n from "../../../src/i18n/configs";

// i18n を日本語に設定
i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

export default {
  title: "01_ヘッダ/ヘッダ全体",
  component: Header,
} as Meta;

const Template: StoryFn = () => (
  <ThemeProvider theme={lightTheme}>
    <Header />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.storyName = "デフォルト";
