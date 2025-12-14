import { PaletteMode } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { Preview } from "@storybook/react-vite";
import { useMemo } from "react";
import { I18nextProvider } from "react-i18next";
import { getDesignTokens } from "../src/config/theme";
import i18n from "../src/i18n/configs";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    options: {
      storySort: {
        order: [
          "Tutorial", // チュートリアルを最優先
          "Components",
          "Features",
          "App",
        ],
        method: "alphabetical",
      },
    },
  },

  // i18n統合 + テーマ統合
  decorators: [
    (Story, context) => {
      // グローバルツールバーから言語を取得
      const locale = context.globals.locale || "ja";
      i18n.changeLanguage(locale);

      // グローバルツールバーからテーマモードを取得
      const mode = (context.globals.theme || "light") as PaletteMode;
      const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <I18nextProvider i18n={i18n}>
            <Story />
          </I18nextProvider>
        </ThemeProvider>
      );
    },
  ],

  // グローバルツールバーで言語切り替え + テーマ切り替え
  globalTypes: {
    locale: {
      description: "言語",
      defaultValue: "ja",
      toolbar: {
        icon: "globe",
        items: [
          { value: "ja", title: "日本語" },
          { value: "en", title: "English" },
          { value: "zh", title: "中文" },
        ],
        showName: true,
      },
    },
    theme: {
      description: "テーマ",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
