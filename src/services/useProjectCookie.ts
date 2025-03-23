import { COOKIE_KEYS, cookieDefaults } from "../config/cookie";
import { LOG } from "../lib/Logging";
import { ColorTheme } from "../types/colorTheme";
import { Language } from "../types/language";
import { Mode } from "../types/mode";
import { defaultParam } from "../types/note";
import { useCookie } from "./useCookie";

/**
 * useProjectCookie
 *
 * 本プロジェクトに特化したクッキー管理のカスタムフックです。
 * `useCookie` フックを利用して、プロジェクト固有の設定値（モード、言語、カラーテーマ、ノート設定）を取得・更新します。
 * 取得されるクッキーは、プロジェクト固有のキーを基に保存されます。
 *
 * @returns プロジェクト固有の設定（`mode`, `language`, `colorTheme`, `defaultNote`）と、それらを更新するための関数。
 */
export const useProjectCookie = () => {
  LOG.info("cookieの取得", "useProjectCookie");
  const { getStringCookie, setStringCookie, getObjectCookie, setObjectCookie } =
    useCookie();
  /**
   * モード（`light`, `dark`, `system`）を取得します。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.mode` を返します。
   */
  const mode = getStringCookie(COOKIE_KEYS.mode, cookieDefaults.mode) as Mode;
  /**
   * 言語（`ja`, `en` など）を取得します。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.language` を返します。
   */
  const language = getStringCookie(
    COOKIE_KEYS.language,
    cookieDefaults.language
  ) as Language;
  /**
   * カラーテーマを取得します。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.colorTheme` を返します。
   */
  const colorTheme = getStringCookie(
    COOKIE_KEYS.colorTheme,
    cookieDefaults.colorTheme
  ) as ColorTheme;
  /**
   * ノートのデフォルト設定をオブジェクトとして取得します。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.defaultNote` を返します。
   */
  const defaultNote = getObjectCookie(
    COOKIE_KEYS.defaultNote,
    cookieDefaults.defaultNote
  ) as defaultParam;

  /**
   * ピアノロールのheight方向の拡大率を取得します。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.verticalZoom` を返します。
   */
  const verticalZoom = parseFloat(
    getStringCookie(
      COOKIE_KEYS.verticalZoom,
      cookieDefaults.verticalZoom.toString()
    )
  );
  /**
   * ピアノロールのwidth方向の拡大率を取得します。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.horizontalZoom` を返します。
   */
  const horizontalZoom = parseFloat(
    getStringCookie(
      COOKIE_KEYS.horizontalZoom,
      cookieDefaults.horizontalZoom.toString()
    )
  );
  /**
   * 合成処理に使用するworkerの数。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.workersCount` を返します。
   */
  const workersCount = parseInt(
    getStringCookie(
      COOKIE_KEYS.workersCount,
      cookieDefaults.workersCount.toString()
    )
  );
  /**
   * 非周期性指標を省略して合成を高速化するか
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.fastResamp` を返します。
   */
  const fastResamp = getStringCookie(
    COOKIE_KEYS.fastResamp,
    cookieDefaults.fastResamp.toString()
  ) as unknown as boolean;
  /**
   * resampの結果をキャッシュするかを選択します。
   * trueの方が高速ですが、falseの方が省メモリです
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.useCache` を返します。
   */
  const useCache = getStringCookie(
    COOKIE_KEYS.useCache,
    cookieDefaults.useCache.toString()
  ) as unknown as boolean;
  /**
   * バックグラウンドでresampのキャッシュを作成するか選択します。
   * trueの方が再生ボタンを押した際の応答はいいですが、falseにすれば意図しないタイミングでの負荷を防げます。
   * クッキーが存在しない場合は、デフォルトで `cookieDefaults.backgroundResamp` を返します。
   */
  const backgroundResamp = getStringCookie(
    COOKIE_KEYS.backgroundResamp,
    cookieDefaults.backgroundResamp.toString()
  ) as unknown as boolean;

  /**
   * モードをクッキーに保存します。
   * @param newMode 更新するモード（`light`, `dark`, `system`）
   */
  const setMode = (newMode: Mode) => setStringCookie(COOKIE_KEYS.mode, newMode);
  /**
   * 言語をクッキーに保存します。
   * @param newLanguage 更新する言語（`ja`, `en` など）
   */
  const setLanguage = (newLanguage: Language) =>
    setStringCookie(COOKIE_KEYS.language, newLanguage);
  /**
   * カラーテーマをクッキーに保存します。
   * @param newColorTheme 更新するカラーテーマ
   */
  const setColorTheme = (newColorTheme: ColorTheme) =>
    setStringCookie(COOKIE_KEYS.colorTheme, newColorTheme);
  /**
   * ノートのデフォルト設定をクッキーに保存します。
   * @param newDefaultNote 更新するデフォルトノート設定
   */
  const setDefaultNote = (newDefaultNote: defaultParam) =>
    setObjectCookie(COOKIE_KEYS.defaultNote, newDefaultNote);

  /**
   * ピアノロールのwidth方向の拡大率をcookieに保存します。
   * @param newHorizontalZoom 更新する拡大率
   */
  const setHorizontalZoom = (newHorizontalZoom: number) => {
    setStringCookie(COOKIE_KEYS.horizontalZoom, newHorizontalZoom.toString());
  };
  /**
   * ピアノロールのheight方向の拡大率をcookieに保存します。
   * @param newVerticalZoom 更新する拡大率
   */
  const setVerticalZoom = (newVerticalZoom: number) => {
    setStringCookie(COOKIE_KEYS.verticalZoom, newVerticalZoom.toString());
  };
  /**
   * 合成処理に使用するworkerをcookieに保存します。
   * @param newWorkersCount 更新後の合成処理に使用するworker
   */
  const setWorkersCount = (newWorkersCount: number) => {
    setStringCookie(COOKIE_KEYS.workersCount, newWorkersCount.toString());
  };
  /**
   * 非周期性指標を省略して合成をcookieに保存します。
   * @param newFastResamp 非周期性指標を省略して合成するかの更新後の設定
   */
  const setFastResamp = (newFastResamp: boolean) => {
    setStringCookie(COOKIE_KEYS.fastResamp, newFastResamp.toString());
  };
  /**
   * resampの結果をキャッシュするかをcookieに保存します。
   * @param newUseCache resampの結果をキャッシュするかの更新後の設定
   */
  const setUseCache = (newUseCache: boolean) => {
    setStringCookie(COOKIE_KEYS.useCache, newUseCache.toString());
  };
  /**
   * バックグラウンドでresampのキャッシュを作成するかをcookieに保存します。
   * @param newBackgroundResamp バックグラウンドでresampのキャッシュを作成するかの更新後の設定
   */
  const setBackgroundResamp = (newBackgroundResamp: boolean) => {
    setStringCookie(
      COOKIE_KEYS.backgroundResamp,
      newBackgroundResamp.toString()
    );
  };

  LOG.debug(
    `mode:${mode},language:${language},colorTheme:${colorTheme},${defaultNote},verticalZoom:${verticalZoom},horizontalZoom:${horizontalZoom}`,
    "useProjectCookie"
  );
  return {
    mode,
    language,
    colorTheme,
    defaultNote,
    verticalZoom,
    horizontalZoom,
    workersCount,
    fastResamp,
    useCache,
    backgroundResamp,
    setMode,
    setLanguage,
    setColorTheme,
    setDefaultNote,
    setVerticalZoom,
    setHorizontalZoom,
    setWorkersCount,
    setFastResamp,
    setUseCache,
    setBackgroundResamp,
  };
};
