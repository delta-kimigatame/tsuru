import React from "react";
import { create } from "zustand";
import { cookieDefaults } from "../config/cookie";
import { useProjectCookie } from "../services/useProjectCookie";
import { ColorTheme } from "../types/colorTheme";
import { Language } from "../types/language";
import { Mode } from "../types/mode";
import { defaultParam } from "../types/note";

/**
 * CookieStore
 *
 * アプリケーションの設定を管理する状態を格納するためのインターフェースです。
 * 各項目はcookieから取得したデフォルト値を初期値として保持し、
 * アプリ内での設定変更を反映するために利用されます。
 */
interface CookieState {
  /**
   * 表示モードの設定。`light`（ライトモード）、`dark`（ダークモード）、または`system`（システム設定による選択）のいずれか。
   */
  mode: Mode;

  /**
   * 言語設定。アプリケーションが使用する言語コードを格納します。
   */
  language: Language;

  /**
   * アプリケーションのカラーテーマ。テーマの設定に基づいてUIが調整されます。
   */
  colorTheme: ColorTheme;

  /**
   * ノートのデフォルト設定。音符の強弱やエフェクトなど、音符に関連するパラメータが含まれます。
   */
  defaultNote: defaultParam;

  /**
   * 表示モードを更新する関数。モードを変更するために使用されます。
   *
   * @param mode 新しい表示モード。`light`、`dark`、`system` のいずれか。
   */
  setMode: (mode: Mode) => void;

  /**
   * 言語設定を更新する関数。選択されている言語を変更します。
   *
   * @param language 新しい言語コード。
   */
  setLanguage: (language: Language) => void;

  /**
   * カラーテーマを更新する関数。選択されているカラーテーマを変更します。
   *
   * @param colorTheme 新しいカラーテーマ。
   */
  setColorTheme: (colorTheme: ColorTheme) => void;

  /**
   * ノートのデフォルト設定を更新する関数。音符に関連する設定を変更します。
   *
   * @param defaultNote 新しいノート設定。
   */
  setDefaultNote: (defaultNote: defaultParam) => void;

  /**
   * cookieに表示モードを保存する関数。
   *
   * @param mode 新しい表示モード。
   */
  setModeInCookie: (mode: Mode) => void;

  /**
   * cookieに言語設定を保存する関数。
   *
   * @param language 新しい言語コード。
   */
  setLanguageInCookie: (language: Language) => void;

  /**
   * cookieにカラーテーマを保存する関数。
   *
   * @param colorTheme 新しいカラーテーマ。
   */
  setColorThemeInCookie: (colorTheme: ColorTheme) => void;

  /**
   * cookieにノートのデフォルト設定を保存する関数。
   *
   * @param defaultNote 新しいノート設定。
   */
  setDefaultNoteInCookie: (defaultNote: defaultParam) => void;

  /**
   * 初期化フラグ。状態が初期化されているかどうかを示します。
   */
  isInitialized: boolean;
}

/**
 * useCookieStore
 *
 * Zustandのストアを使用して、アプリケーションの設定を管理します。
 * このストアは、表示モード、言語、カラーテーマ、ノート設定の変更を追跡し、
 * 各コンポーネントで必要に応じて状態を更新します。
 */
export const useCookieStore = create<CookieState>((set) => {
  return {
    mode: cookieDefaults.mode,
    language: cookieDefaults.language,
    colorTheme: cookieDefaults.colorTheme,
    defaultNote: cookieDefaults.defaultNote,
    // 状態更新関数
    setMode: (newMode) =>
      set((state) => {
        state.setModeInCookie(newMode); // Cookie に保存
        return { mode: newMode };
      }),

    setLanguage: (newLanguage) =>
      set((state) => {
        state.setLanguageInCookie(newLanguage);
        return { language: newLanguage };
      }),

    setColorTheme: (newColorTheme) =>
      set((state) => {
        state.setColorThemeInCookie(newColorTheme);
        return { colorTheme: newColorTheme };
      }),

    setDefaultNote: (newDefaultNote) =>
      set((state) => {
        state.setDefaultNoteInCookie(newDefaultNote);
        return { defaultNote: newDefaultNote };
      }),

    // 初期状態ではダミー関数を設定
    setModeInCookie: () => {},
    setLanguageInCookie: () => {},
    setColorThemeInCookie: () => {},
    setDefaultNoteInCookie: () => {},
    isInitialized: false,
  };
});
export const useInitializeCookieStore = () => {
  const projectCookie = useProjectCookie();

  React.useEffect(() => {
    if (!projectCookie || useCookieStore.getState().isInitialized) return;

    useCookieStore.setState({
      mode: projectCookie.mode,
      language: projectCookie.language,
      colorTheme: projectCookie.colorTheme,
      defaultNote: projectCookie.defaultNote,
      setModeInCookie: projectCookie.setMode,
      setLanguageInCookie: projectCookie.setLanguage,
      setColorThemeInCookie: projectCookie.setColorTheme,
      setDefaultNoteInCookie: projectCookie.setDefaultNote,
      isInitialized: true,
    });
  }, [projectCookie]);
};
