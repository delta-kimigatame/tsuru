import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { BasePaper } from "../components/common/BasePaper";
import { Footer } from "../components/Footer/Footer";
import { getDesignTokens } from "../config/theme";
import { useInitializeApp } from "../hooks/useInitializeApp";
import { useThemeMode } from "../hooks/useThemeMode";
import i18n from "../i18n/configs";
import { useCookieStore } from "../store/cookieStore";
import { SnackBar } from "./common/SnackBar";

export const App: React.FC = () => {
  useInitializeApp();
  const mode_ = useThemeMode();
  const { language } = useCookieStore();
  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode_)),
    [mode_]
  );
  React.useMemo(() => {
    i18n.changeLanguage(language);
  }, [language]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BasePaper title="aaa">表示テスト用仮の文字列</BasePaper>
      <Footer />
      <SnackBar />
    </ThemeProvider>
  );
};
