import { PaletteMode } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import { LOG } from "../lib/Logging";
import { useCookieStore } from "../store/cookieStore";

/**
 * モード設定を読み込むためのカスタムフック
 *
 * このフックは、cookieに保存されたカラーモードの設定を基に、モードを決定します。
 * - 設定が"system"の場合、ユーザーの端末設定（ダークモード/ライトモード）に従います。
 * - その他の設定（"light"や"dark"）が保存されていれば、それを優先して使用します。
 *
 * @returns {PaletteMode} "light", "dark"のいずれか。cookieの設定が"system"の場合は、端末設定に基づいたモードが返されます。
 * */
export const useThemeMode = (): PaletteMode => {
  const { mode } = useCookieStore();
  const prefersDarkMode: boolean = useMediaQuery(
    "(prefers-color-scheme: dark)"
  );

  const computedMode = React.useMemo<PaletteMode>(() => {
    const mode_: PaletteMode =
      mode !== "system" ? mode : prefersDarkMode ? "dark" : "light";
    LOG.debug("モードの取得", "useThemeMode");
    LOG.debug(
      `cookie:${mode}、端末設定:${prefersDarkMode}、採用:${mode_}`,
      "useThemeMode"
    );
    return mode_;
  }, [mode, prefersDarkMode]);

  return computedMode;
};
