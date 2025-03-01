import { useInitializeCookieStore } from "../store/cookieStore";

/**
 * Appsを初期化する際に実行するカスタムフック
 */
export const useInitializeApp = (): void => {
  useInitializeCookieStore();
};
