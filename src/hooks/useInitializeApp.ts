import { LOG } from "../lib/Logging";
import { useInitializeCookieStore } from "../store/cookieStore";

/**
 * Appsを初期化する際に実行するカスタムフック
 */
export const useInitializeApp = (): void => {
  LOG.info("アプリケーションの初期化", "useInitializeApp");
  LOG.debug(window.navigator.userAgent, "useInitializeApp");
  LOG.debug(
    "画面サイズ:" + [window.innerWidth, window.innerHeight],
    "useInitializeApp"
  );
  useInitializeCookieStore();
};
