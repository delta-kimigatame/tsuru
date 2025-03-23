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
interface CookieStore {
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
   * ピアノロールにおけるheight方向の拡大率
   */
  verticalZoom: number;
  /**
   * ピアノロールにおけるwidth方向の拡大率
   */
  horizontalZoom: number;
  /**
   * workerの数
   */
  workersCount: number;
  /**
   * resampにおいて、非周期性指標の分析を省略して高速化するか
   */
  fastResamp: boolean;
  /**
   * resampの結果をキャッシュするかを選択します。
   * trueの方が高速ですが、falseの方が省メモリです
   */
  useCache: boolean;
  /**
   * バックグラウンドでresampのキャッシュを作成するか選択します。
   * trueの方が再生ボタンを押した際の応答はいいですが、falseにすれば意図しないタイミングでの負荷を防げます。
   */
  backgroundResamp: boolean;

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
   * ピアノロールのheight方向の拡大率を変更します。
   *
   * @param verticalZoom ピアノロールのheight方向の拡大率
   */
  setVerticalZoom: (verticalZoom: number) => void;
  /**
   * ピアノロールのwidth方向の拡大率を変更します。
   *
   * @param horizontalZoom ピアノロールのwidth方向の拡大率
   */
  setHorizontalZoom: (horizontalZoom: number) => void;
  /**
   * 合成処理に使用するworkerの数。
   *
   * @param workersCount 合成処理に使用するworkerの数。
   */
  setWorkersCount: (workersCount: number) => void;
  /**
   * 非周期性指標を省略して合成を高速化するか
   *
   * @param fastResamp 合成処理に使用するworkerの数。
   */
  setFastResamp: (fastResamp: boolean) => void;
  /**
   * resampの結果をキャッシュするかを選択します。
   * trueの方が高速ですが、falseの方が省メモリです
   *
   * @param useCache resampの結果をキャッシュするか
   */
  setUseCache: (useCache: boolean) => void;
  /**
   * バックグラウンドでresampのキャッシュを作成するか選択します。
   * trueの方が再生ボタンを押した際の応答はいいですが、falseにすれば意図しないタイミングでの負荷を防げます。
   * @param backgroundResamp バックグラウンドでresampのキャッシュを作成するか
   */
  setBackgroundResamp: (backgroundResamp: boolean) => void;

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
   * cookieにピアノロールのheight方向の拡大率を保存する関数
   *
   * @param verticalZoom ピアノロールのheight方向の拡大率
   */
  setVerticalZoomInCookie: (veticalZoom: number) => void;
  /**
   * cookieにピアノロールのwidth方向の拡大率を保存する関数
   *
   * @param horizontalZoom ピアノロールのwidth方向の拡大率
   */
  setHorizontalZoomInCookie: (horizontalZoom: number) => void;
  /**
   * 合成処理に使用するworkerの数。
   *
   * @param workersCount 合成処理に使用するworkerの数
   */
  setWorkersCountInCookie: (workersCount: number) => void;
  /**
   * resampにおいて、非周期性指標の分析を省略して高速化するか
   *
   * @param fastResamp resampにおいて、非周期性指標の分析を省略して高速化するか
   */
  setFastResampInCookie: (fastResamp: boolean) => void;
  /**
   * resampの結果をキャッシュするかを選択します。
   * trueの方が高速ですが、falseの方が省メモリです
   * @param useCache resampにおいて、非周期性指標の分析を省略して高速化するか
   */
  setUseCacheInCookie: (useCache: boolean) => void;
  /**
   * バックグラウンドでresampのキャッシュを作成するか選択します。
   * trueの方が再生ボタンを押した際の応答はいいですが、falseにすれば意図しないタイミングでの負荷を防げます。
   * @param backgroundResamp resampにおいて、非周期性指標の分析を省略して高速化するか
   */
  setBackgroundResampInCookie: (backgroundResamp: boolean) => void;

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
export const useCookieStore = create<CookieStore>((set) => {
  return {
    mode: cookieDefaults.mode,
    language: cookieDefaults.language,
    colorTheme: cookieDefaults.colorTheme,
    defaultNote: cookieDefaults.defaultNote,
    verticalZoom: cookieDefaults.verticalZoom,
    horizontalZoom: cookieDefaults.horizontalZoom,
    workersCount: cookieDefaults.workersCount,
    fastResamp: cookieDefaults.fastResamp,
    useCache: cookieDefaults.useCache,
    backgroundResamp: cookieDefaults.backgroundResamp,
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

    setVerticalZoom: (verticalZoom) => {
      set((state) => {
        state.setVerticalZoomInCookie(verticalZoom);
        return { verticalZoom: verticalZoom };
      });
    },

    setHorizontalZoom: (horizontalZoom) => {
      set((state) => {
        state.setHorizontalZoomInCookie(horizontalZoom);
        return { horizontalZoom: horizontalZoom };
      });
    },

    setWorkersCount: (workersCount) => {
      set((state) => {
        state.setWorkersCountInCookie(workersCount);
        return { workersCount: workersCount };
      });
    },

    setFastResamp: (fastResamp) => {
      set((state) => {
        state.setFastResampInCookie(fastResamp);
        return { fastResamp: fastResamp };
      });
    },
    setUseCache: (useCache) => {
      set((state) => {
        state.setUseCacheInCookie(useCache);
        return { useCache: useCache };
      });
    },
    setBackgroundResamp: (backgroundResamp) => {
      set((state) => {
        state.setBackgroundResampInCookie(backgroundResamp);
        return { backgroundResamp: backgroundResamp };
      });
    },

    // 初期状態ではダミー関数を設定
    setModeInCookie: () => {},
    setLanguageInCookie: () => {},
    setColorThemeInCookie: () => {},
    setDefaultNoteInCookie: () => {},
    setVerticalZoomInCookie: () => {},
    setHorizontalZoomInCookie: () => {},
    setWorkersCountInCookie: () => {},
    setFastResampInCookie: () => {},
    setUseCacheInCookie: () => {},
    setBackgroundResampInCookie: () => {},
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
      verticalZoom: projectCookie.verticalZoom,
      horizontalZoom: projectCookie.horizontalZoom,
      workersCount: projectCookie.workersCount,
      fastResamp: projectCookie.fastResamp,
      useCache: projectCookie.useCache,
      backgroundResamp: projectCookie.backgroundResamp,
      setModeInCookie: projectCookie.setMode,
      setLanguageInCookie: projectCookie.setLanguage,
      setColorThemeInCookie: projectCookie.setColorTheme,
      setDefaultNoteInCookie: projectCookie.setDefaultNote,
      setVerticalZoomInCookie: projectCookie.setVerticalZoom,
      setHorizontalZoomInCookie: projectCookie.setHorizontalZoom,
      setWorkersCountInCookie: projectCookie.setWorkersCount,
      setFastResampInCookie: projectCookie.setFastResamp,
      setUseCacheInCookie: projectCookie.setUseCache,
      setBackgroundResampInCookie: projectCookie.setBackgroundResamp,
      isInitialized: true,
    });
  }, [projectCookie]);
};
