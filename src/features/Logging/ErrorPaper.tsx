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
import { dumpNotes } from "../../lib/Note";
import { useCookieStore } from "../../store/cookieStore";
import { useMusicProjectStore } from "../../store/musicProjectStore";

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
  const { vb, ust, notes, ustTempo, ustFlags } = useMusicProjectStore();
  const { defaultNote } = useCookieStore();
  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode_, colorTheme)),
    [mode_, colorTheme]
  );
  /**
   * ダウンロードボタンを押した際の動作
   */
  const handleButtonClick = () => {
    const text =
      LOG.datas.join("\r\n") +
      "\r\n" +
      error.message +
      "\r\n" +
      error.stack +
      "\r\n";
    let dumpUst: string;
    try {
      const dumpResult = dumpNotes(notes, ustTempo, ustFlags);
      dumpUst = `\r\n----- UST DUMP -----\r\n${dumpResult}\r\n--------------------\r\n`;
    } catch (e) {
      LOG.error(`UST DUMP failed: ${e}`, "HeaderMenuLog");
      dumpUst = `\r\n----- UST DUMP -----\r\nDUMP ERROR: ${
        e instanceof Error ? e.message : String(e)
      }\r\n--------------------\r\n`;
    }
    let dumpResampler = `\r\n----- RESAMPLER INFO -----\r\n`;
    try {
      const requests = ust
        .getRequestParam(vb, defaultNote)
        .map((r) => JSON.stringify(r));
      dumpResampler += requests.join("\r\n");
    } catch (e) {
      LOG.error(`RESAMPLER INFO failed: ${e}`, "HeaderMenuLog");
      dumpResampler += `DUMP ERROR: ${
        e instanceof Error ? e.message : String(e)
      }\r\n`;
    }
    let dumpOto = `\r\n----- OTO DATA -----\r\n`;
    try {
      dumpOto += JSON.stringify(vb.oto.GetLines());
    } catch (e) {
      LOG.error(`OTO DUMP failed: ${e}`, "HeaderMenuLog");
      dumpOto += `DUMP ERROR: ${
        e instanceof Error ? e.message : String(e)
      }\r\n`;
    }
    console.log(text);
    const logFile = new File(
      [text + "\r\n" + dumpUst + "\r\n" + dumpResampler + "\r\n" + dumpOto],
      `log_${new Date().toJSON()}.txt`,
      {
        type: "text/plain;charset=utf-8",
      }
    );
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
