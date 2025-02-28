import { useCookies } from "react-cookie";

export const useCookie = () => {
  const [cookies, setCookie, removeCookie] = useCookies();

  /**
   * 文字列のcookieを保存する
   * @param key
   * @param value
   * @param options
   */
  const setStringCookie = (
    key: string,
    value: string,
    options = { path: "/" }
  ) => {
    setCookie(key, value, options);
  };

  /**
   * オブジェクトをJSONとしてcookieを保存する
   * @param key
   * @param value
   * @param options
   */
  const setObjectCookie = (
    key: string,
    value: object,
    options = { path: "/" }
  ) => {
    setCookie(key, JSON.stringify(value), options);
  };

  /**
   * 文字列のクッキーを取得
   * @param key
   * @param defaultValue cookieが保存されていない場合の初期値
   * @returns
   */
  const getStringCookie = (key: string, defaultValue: string): string => {
    return cookies[key] ?? defaultValue;
  };

  /**
   * JSON文字列をオブジェクトとして取得
   * @param key
   * @param defaultValue cookieが保存されていない場合やオブジェクトとして復元できない場合の初期値
   * @returns
   */
  const getObjectCookie = <T>(key: string, defaultValue: T): T => {
    const cookieValue = cookies[key];
    if (typeof cookieValue === "object") {
      return cookieValue as T;
    }
    try {
      return cookieValue ? JSON.parse(cookieValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return {
    setStringCookie,
    setObjectCookie,
    getStringCookie,
    getObjectCookie,
    removeCookie,
  };
};
