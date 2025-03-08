import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { TopView } from "../components/TopView/TopView";
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
      <Header />
      {/* 本来はvbがloadされたあとTopViewとFooterは非表示となり、代わりにEditorViewを表示する。
       * 現時点ではEditorViewが未実装のため、このままにしておく。
       */}
      <TopView />
      <Footer />
      <SnackBar />
    </ThemeProvider>
  );
};
