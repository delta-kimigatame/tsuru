import * as React from "react";
import { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getDesignTokens } from "../../config/theme";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Alert, Button } from "@mui/material";
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
  const isRemoveChildError =
    !!error?.message &&
    error.message.startsWith("Failed to execute 'removeChild' on 'Node'");

  const getNoTranslateMessage = (): string => {
    const raw =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "en";
    const lang = raw.split("-")[0];
    switch (lang) {
      case "ja":
        return "このエラーはブラウザの自動翻訳機能が原因で発生することがあります。ブラウザの自動翻訳を無効にしてから再度お試しください。";
      case "en":
        return "This error can be caused by your browser's automatic translation. Please disable browser automatic translation and try again.";
      case "zh":
        return raw.toLowerCase().includes("tw") ||
          raw.toLowerCase().includes("hk")
          ? "此錯誤可能由瀏覽器自動翻譯功能導致。請關閉瀏覽器的自動翻譯後再試。"
          : "此错误可能由浏览器自动翻译功能导致。请关闭浏览器的自动翻译后再试。";
      case "ko":
        return "이 오류는 브라우저 자동 번역 기능으로 인해 발생할 수 있습니다. 브라우저의 자동 번역 기능을 끄고 다시 시도하세요.";
      case "fr":
        return "Cette erreur peut être causée par la traduction automatique du navigateur. Désactivez la traduction automatique du navigateur et réessayez.";
      case "de":
        return "Dieser Fehler kann durch die automatische Übersetzung des Browsers verursacht werden. Deaktivieren Sie die automatische Übersetzung und versuchen Sie es erneut.";
      case "es":
        return "Este error puede ser causado por la traducción automática del navegador. Desactive la traducción automática del navegador e inténtelo de nuevo.";
      case "ru":
        return "Эта ошибка может быть вызвана автоматическим переводом в браузере. Отключите автоматический перевод браузера и попробуйте снова.";
      case "pt":
        return "Este erro pode ser causado pela tradução automática do navegador. Desative a tradução automática do navegador e tente novamente.";
      default:
        return "This error can be caused by your browser's automatic translation. Please disable browser automatic translation and try again.";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <BasePaper title={t("error.title")}>
        <Box sx={{ m: 1, p: 1 }}>
          {isRemoveChildError && (
            <Alert severity="warning" sx={{ mb: 2, fontWeight: "bold" }}>
              {getNoTranslateMessage()}
            </Alert>
          )}
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
