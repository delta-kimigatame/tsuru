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
import { useMusicProjectStore } from "../store/musicProjectStore";
import { SnackBar } from "./common/SnackBar";
import { EditorView } from "./EditorView/EditorView";

export const App: React.FC = () => {
  useInitializeApp();
  const mode_ = useThemeMode();
  const { language } = useCookieStore();
  const { vb } = useMusicProjectStore();
  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode_)),
    [mode_]
  );
  React.useMemo(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      {vb !== null ? (
        <EditorView />
      ) : (
        <>
          <br />
          <br />
          <TopView />
          <Footer />
        </>
      )}
      <SnackBar />
    </ThemeProvider>
  );
};
