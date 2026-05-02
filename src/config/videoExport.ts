import type {
  BgPaddingMode,
  TextAlign,
  VideoResolution,
} from "../utils/videoExport";

// ---------------------------------------------------------------------------
// カラーパレット生成
// ---------------------------------------------------------------------------

/** HSL（h:0-360, s:0-100, l:0-100）→ "#rrggbb" */
export const hslToHex = (h: number, s: number, l: number): string => {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/** 8 基本色相 × 5 明度段階 ＋ グレースケール列 */
export const PALETTE_HUES = [0, 30, 60, 120, 180, 210, 270, 330];
export const PALETTE_LIGHTNESS = [85, 65, 45, 30, 15];
export const PALETTE_GRAYS = [
  "#ffffff",
  "#cccccc",
  "#888888",
  "#444444",
  "#000000",
];
export const PALETTE_SATURATION = 80;

/** [列][行] の 2D 配列: 0 列目がグレースケール、1〜8 列目がカラー */
export const PALETTE: string[][] = [
  PALETTE_GRAYS,
  ...PALETTE_HUES.map((h) =>
    PALETTE_LIGHTNESS.map((l) => hslToHex(h, PALETTE_SATURATION, l)),
  ),
];

// ---------------------------------------------------------------------------
// 背景色デフォルト
// ---------------------------------------------------------------------------

export const DEFAULT_BG_COLOR = "#ffffff";
export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// ---------------------------------------------------------------------------
// 解像度・パディングモードデフォルト
// ---------------------------------------------------------------------------

export const DEFAULT_BG_SIZE: VideoResolution = "1920x1080";
export const DEFAULT_PADDING_MODE: BgPaddingMode = "color";
export const DEFAULT_BG_IMAGE_OPACITY = 100;

/** "image" モード時のキャンバス最大サイズ（FHD 上限） */
export const BG_MAX_WIDTH = 1920;
export const BG_MAX_HEIGHT = 1080;

// ---------------------------------------------------------------------------
// エクスポートプレビュー Canvas の最大サイズ
// ---------------------------------------------------------------------------

export const PREVIEW_MAX_W = 320;
export const PREVIEW_MAX_H = 200;

// ---------------------------------------------------------------------------
// 立絵設定デフォルト・定数
// ---------------------------------------------------------------------------

export const DEFAULT_PORTRAIT_SHOW = true;
export const DEFAULT_PORTRAIT_OPACITY = 100;
export const DEFAULT_PORTRAIT_SCALE_PERCENT = 100;
export const DEFAULT_PORTRAIT_X_OFFSET = 0;
export const DEFAULT_PORTRAIT_Y_OFFSET = 0;

/** portraitNaturalHeight が渡されない場合のフォールバック値 */
export const PORTRAIT_NATURAL_HEIGHT_FALLBACK = 800;

/** canvas 幅に対する立絵の最大描画幅の比率 */
export const PORTRAIT_MAX_WIDTH_RATIO = 0.5;

/** canvas 高さに対する立絵の最大描画高さの比率 */
export const PORTRAIT_MAX_HEIGHT_RATIO = 0.5;

/** 立絵の描画スケール上限（自然サイズ = 1.0） */
export const PORTRAIT_DRAW_SCALE_MAX = 1.0;

/** portraitMaxScale を計算できない場合のフォールバック */
export const PORTRAIT_MAX_SCALE_FALLBACK = 200;

/** portraitXOffset/portraitYOffset を計算できない場合のフォールバック下限 */
export const PORTRAIT_OFFSET_MIN_FALLBACK = -200;

/** portraitXOffset/portraitYOffset スライダーの上限 */
export const PORTRAIT_OFFSET_MAX = 200;

// ---------------------------------------------------------------------------
// テキストスライダー範囲
// ---------------------------------------------------------------------------

export const FONT_SIZE_SLIDER_MIN = 8;
export const FONT_SIZE_SLIDER_MAX = 200;
export const TEXT_POSITION_MIN = 0;
export const TEXT_POSITION_MAX = 100;

// ---------------------------------------------------------------------------
// テキストオーバーレイのデフォルト値
// ---------------------------------------------------------------------------

export const DEFAULT_MAIN_TEXT_FONT_SIZE = 72;
export const DEFAULT_MAIN_TEXT_X = 5;
export const DEFAULT_MAIN_TEXT_Y = 85;
export const DEFAULT_MAIN_TEXT_COLOR = "#ffffff";
export const DEFAULT_MAIN_TEXT_BOLD = true;
export const DEFAULT_MAIN_TEXT_ITALIC = false;
export const DEFAULT_MAIN_TEXT_ALIGN: TextAlign = "left";

export const DEFAULT_SUB_TEXT_FONT_SIZE = 36;
export const DEFAULT_SUB_TEXT_X = 5;
export const DEFAULT_SUB_TEXT_Y = 93;
export const DEFAULT_SUB_TEXT_COLOR = "#ffffff";
export const DEFAULT_SUB_TEXT_BOLD = false;
export const DEFAULT_SUB_TEXT_ITALIC = false;
export const DEFAULT_SUB_TEXT_ALIGN: TextAlign = "left";
