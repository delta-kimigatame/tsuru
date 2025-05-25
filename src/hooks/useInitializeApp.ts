import React from "react";
import { LOG } from "../lib/Logging";
import { useInitializeCookieStore } from "../store/cookieStore";
declare const __BUILD_TIMESTAMP__: string;

/**
 * Appsを初期化する際に実行するカスタムフック
 */
export const useInitializeApp = (): void => {
  const initialized = React.useRef(false);
  if (!initialized.current) {
    LOG.info("アプリケーションの初期化", "useInitializeApp");
    LOG.debug(`build: ${__BUILD_TIMESTAMP__}`, "useInitializeApp");
    LOG.debug(window.navigator.userAgent, "useInitializeApp");
    LOG.debug(
      "画面サイズ:" + [window.innerWidth, window.innerHeight],
      "useInitializeApp"
    );
    initialized.current = true;
  }
  useInitializeCookieStore();
};
