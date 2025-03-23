import { ColorTheme } from "../types/colorTheme";
import { Language } from "../types/language";
import { Mode } from "../types/mode";
import { defaultParam } from "../types/note";
import { defaultNote } from "./note";
import { resampWorkersCount } from "./workers";

export const COOKIE_KEYS = {
  mode: "mode",
  language: "language",
  colorTheme: "colorTheme",
  defaultNote: "defaultNote",
  verticalZoom: "verticalZoom",
  horizontalZoom: "horizontalZoom",
  workersCount: "workersCount",
  fastResamp: "fastResamp",
  useCache: "useCache",
  backgroundResamp: "backgroundResamp",
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
} = {
  mode: "system",
  language: "ja",
  colorTheme: "default",
  defaultNote: defaultNote,
  verticalZoom: 1,
  horizontalZoom: 1,
  workersCount: resampWorkersCount,
  fastResamp: false,
  useCache: true,
  backgroundResamp: true,
};
