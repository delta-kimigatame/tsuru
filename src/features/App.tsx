import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { getDesignTokens } from "../config/theme";
import { useInitializeApp } from "../hooks/useInitializeApp";
import { useThemeMode } from "../hooks/useThemeMode";

export const App: React.FC = () => {
  useInitializeApp();
  const mode_ = useThemeMode();
  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode_)),
    [mode_]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      表示テスト用仮の文字列
    </ThemeProvider>
  );
};
