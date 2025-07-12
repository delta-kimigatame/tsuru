import * as React from "react";
import { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getDesignTokens } from "../../config/theme";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Button } from "@mui/material";
import { BasePaper } from "../../components/common/BasePaper";
import { Footer } from "../../components/Footer/Footer";
import { LogPaper } from "../../components/Logging/LogPaper";
import { useThemeMode } from "../../hooks/useThemeMode";
import { LOG } from "../../lib/Logging";
import { useCookieStore } from "../../store/cookieStore";

/**
 * エラー時に表示される画面。
 * 操作ログにエラーメッセージを付与したものをテキスト形式でダウンロードすることができる。
 */
export const ErrorPaper: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { t } = useTranslation();
  const mode_ = useThemeMode();
  const { colorTheme } = useCookieStore();
  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode_, colorTheme)),
    [mode_, colorTheme]
  );
  /**
   * ダウンロードボタンを押した際の動作
   */
  const handleButtonClick = () => {
    const text =
      LOG.datas.join("\r\n") + error.message + "\r\n" + error.stack + "\r\n";
    console.log(text);
    const logFile = new File([text], `log_${new Date().toJSON()}.txt`, {
      type: "text/plane;charset=utf-8",
    });
    const url = URL.createObjectURL(logFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = logFile.name;
    a.click();
  };

  return (
    <ThemeProvider theme={theme}>
      <BasePaper title={t("error.title")}>
        <Box sx={{ m: 1, p: 1 }}>
          <Typography variant="body2">{t("error.message")}</Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={handleButtonClick}
            size="large"
            sx={{ mx: 1 }}
            color="error"
          >
            {t("error.download")}
          </Button>
        </Box>
      </BasePaper>
      <LogPaper />
      <Footer />
    </ThemeProvider>
  );
};
