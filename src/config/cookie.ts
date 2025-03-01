import { ColorTheme } from "../types/colorTheme";
import { Language } from "../types/language";
import { Mode } from "../types/mode";
import { defaultParam } from "../types/note";
import { defaultNote } from "./note";

export const COOKIE_KEYS = {
  mode: "mode",
  language: "language",
  colorTheme: "colorTheme",
  defaultNote: "defaultNote",
} as const;

export type CookieKey = keyof typeof COOKIE_KEYS;

/**
 * cookieDefaults
 *
 * アプリケーションで使用する初期設定のデフォルト値を定義します。
 *
 */
export const cookieDefaults: {
  /**
   * アプリケーションの表示モード。`light`（ライトモード）または`dark`（ダークモード）、`system`（システム設定による自動選択）のいずれかを選択します。
   */
  mode: Mode;
  /**
   * 現在選択されている言語。デフォルトは日本語（`ja`）
   */
  language: Language;
  /**
   * アプリケーションのカラーテーマ。デフォルトは`default`
   */
  colorTheme: ColorTheme;
  /**
   * ノートのデフォルト設定
   */
  defaultNote: defaultParam;
} = {
  mode: "system",
  language: "ja",
  colorTheme: "default",
  defaultNote: defaultNote,
};
