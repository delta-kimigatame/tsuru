import type {
  BackgroundStyle,
  BgPaddingMode,
  SlideDirection,
  VideoResolution,
} from "../utils/videoExport";
import type {
  WaveformColorMode,
  WaveformDrawMethod,
  WaveformFftGaugeShape,
  WaveformFftIconShape,
  WaveformFftIconStrengthMode,
  WaveformFftShape,
  WaveformType,
} from "../utils/waveformEffect";

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
export const DEFAULT_BG_SECONDARY_COLOR = "#ffd54f";
export const DEFAULT_BG_SECONDARY_OPACITY = 100;
export const DEFAULT_BACKGROUND_STYLE: BackgroundStyle = "solid";
export const DEFAULT_BACKGROUND_PATTERN_SIZE = 48;
export const DEFAULT_BACKGROUND_PATTERN_GAP = 24;
export const DEFAULT_BACKGROUND_PATTERN_ROTATION = 0;
export const BACKGROUND_PATTERN_SIZE_MIN = 2;
export const BACKGROUND_PATTERN_SIZE_MAX = 200;
export const BACKGROUND_PATTERN_GAP_MIN = 0;
export const BACKGROUND_PATTERN_GAP_MAX = 200;
export const BACKGROUND_PATTERN_ROTATION_MIN = 0;
export const BACKGROUND_PATTERN_ROTATION_MAX = 360;
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
// 字幕設定デフォルト・定数
// ---------------------------------------------------------------------------

export const DEFAULT_LYRICS_FONT_SIZE = 48;
export const DEFAULT_LYRICS_COLOR = "#000000";
export const DEFAULT_LYRICS_Y_PERCENT = 85;
export const DEFAULT_LYRICS_MAX_WIDTH_PERCENT = 80;
export const LYRICS_FONT_SIZE_MIN = 12;
export const LYRICS_FONT_SIZE_MAX = 120;

// Shadow
export const DEFAULT_LYRICS_SHADOW_ENABLED = false;
export const DEFAULT_LYRICS_SHADOW_COLOR = "#000000";
export const DEFAULT_LYRICS_SHADOW_BLUR = 4;
export const LYRICS_SHADOW_BLUR_MIN = 0;
export const LYRICS_SHADOW_BLUR_MAX = 20;

// Stroke
export const DEFAULT_LYRICS_STROKE_ENABLED = false;
export const DEFAULT_LYRICS_STROKE_COLOR = "#000000";
export const DEFAULT_LYRICS_STROKE_WIDTH = 3;
export const LYRICS_STROKE_WIDTH_MIN = 1;
export const LYRICS_STROKE_WIDTH_MAX = 10;

// BgBar
export const DEFAULT_LYRICS_BG_BAR_ENABLED = false;
export const DEFAULT_LYRICS_BG_BAR_COLOR = "#000000";
export const DEFAULT_LYRICS_BG_BAR_OPACITY = 60;

// Fade
export const DEFAULT_LYRICS_FADE_ENABLED = false;
export const DEFAULT_LYRICS_FADE_DURATION_MS = 300;
export const LYRICS_FADE_DURATION_MS_MIN = 50;
export const LYRICS_FADE_DURATION_MS_MAX = 1000;

// Scale
export const DEFAULT_LYRICS_SCALE_ENABLED = false;
export const DEFAULT_LYRICS_SCALE_FROM = 300;
export const DEFAULT_LYRICS_SCALE_DURATION_MS = 300;
export const LYRICS_SCALE_FROM_MIN = 0;
export const LYRICS_SCALE_FROM_MAX = 500;
export const LYRICS_SCALE_DURATION_MS_MIN = 50;
export const LYRICS_SCALE_DURATION_MS_MAX = 1000;

// Slide
export const DEFAULT_LYRICS_SLIDE_ENABLED = false;
export const DEFAULT_LYRICS_SLIDE_AMOUNT = 100;
export const DEFAULT_LYRICS_SLIDE_DURATION_MS = 300;
export const LYRICS_SLIDE_AMOUNT_MIN = 0;
export const LYRICS_SLIDE_AMOUNT_MAX = 500;
export const LYRICS_SLIDE_DURATION_MS_MIN = 50;
export const LYRICS_SLIDE_DURATION_MS_MAX = 1000;

// SlideInOut
export const DEFAULT_LYRICS_SLIDE_IN_ENABLED = false;
export const DEFAULT_LYRICS_SLIDE_IN_DIRECTION: SlideDirection = "up";
export const DEFAULT_LYRICS_SLIDE_OUT_ENABLED = false;
export const DEFAULT_LYRICS_SLIDE_OUT_DIRECTION: SlideDirection = "down";
export const DEFAULT_LYRICS_SLIDE_IN_OUT_DURATION_MS = 300;
export const LYRICS_SLIDE_IN_OUT_DURATION_MS_MIN = 50;
export const LYRICS_SLIDE_IN_OUT_DURATION_MS_MAX = 1000;

// Blur
export const DEFAULT_LYRICS_BLUR_ENABLED = false;
export const DEFAULT_LYRICS_BLUR_AMOUNT = 20;
export const DEFAULT_LYRICS_BLUR_DURATION_MS = 300;
export const LYRICS_BLUR_AMOUNT_MIN = 1;
export const LYRICS_BLUR_AMOUNT_MAX = 100;
export const LYRICS_BLUR_DURATION_MS_MIN = 50;
export const LYRICS_BLUR_DURATION_MS_MAX = 1000;

// Wipe
export const DEFAULT_LYRICS_WIPE_IN_ENABLED = false;
export const DEFAULT_LYRICS_WIPE_IN_DIRECTION: SlideDirection = "left";
export const DEFAULT_LYRICS_WIPE_OUT_ENABLED = false;
export const DEFAULT_LYRICS_WIPE_OUT_DIRECTION: SlideDirection = "right";
export const DEFAULT_LYRICS_WIPE_DURATION_MS = 300;
export const LYRICS_WIPE_DURATION_MS_MIN = 50;
export const LYRICS_WIPE_DURATION_MS_MAX = 1000;

// Bounce
export const DEFAULT_LYRICS_BOUNCE_IN_ENABLED = false;
export const DEFAULT_LYRICS_BOUNCE_IN_DIRECTION: SlideDirection = "down";
export const DEFAULT_LYRICS_BOUNCE_OUT_ENABLED = false;
export const DEFAULT_LYRICS_BOUNCE_OUT_DIRECTION: SlideDirection = "down";
export const DEFAULT_LYRICS_BOUNCE_IN_OUT_DURATION_MS = 500;
export const LYRICS_BOUNCE_IN_OUT_DURATION_MS_MIN = 100;
export const LYRICS_BOUNCE_IN_OUT_DURATION_MS_MAX = 1500;

// Stagger
export const DEFAULT_LYRICS_STAGGER_ENABLED = false;
export const DEFAULT_LYRICS_STAGGER_INTERVAL_MS = 50;
export const LYRICS_STAGGER_INTERVAL_MS_MIN = 10;
export const LYRICS_STAGGER_INTERVAL_MS_MAX = 300;

// ---------------------------------------------------------------------------
// テキストオーバーレイのデフォルト値
// ---------------------------------------------------------------------------

export const DEFAULT_MAIN_TEXT_FONT_SIZE = 72;
export const DEFAULT_MAIN_TEXT_X = 5;
export const DEFAULT_MAIN_TEXT_Y = 85;
export const DEFAULT_MAIN_TEXT_COLOR = "#000000";
export const DEFAULT_MAIN_TEXT_BOLD = true;
export const DEFAULT_MAIN_TEXT_ITALIC = false;
export const DEFAULT_MAIN_TEXT_SHADOW_ENABLED = false;
export const DEFAULT_MAIN_TEXT_SHADOW_COLOR = "#000000";
export const DEFAULT_MAIN_TEXT_SHADOW_BLUR = 4;
export const DEFAULT_MAIN_TEXT_STROKE_ENABLED = false;
export const DEFAULT_MAIN_TEXT_STROKE_COLOR = "#000000";
export const DEFAULT_MAIN_TEXT_STROKE_WIDTH = 3;
export const DEFAULT_MAIN_TEXT_BG_BAR_ENABLED = false;
export const DEFAULT_MAIN_TEXT_BG_BAR_COLOR = "#000000";
export const DEFAULT_MAIN_TEXT_BG_BAR_OPACITY = 60;
export const DEFAULT_SUB_TEXT_FONT_SIZE = 36;
export const DEFAULT_SUB_TEXT_X = 5;
export const DEFAULT_SUB_TEXT_Y = 93;
export const DEFAULT_SUB_TEXT_COLOR = "#000000";
export const DEFAULT_SUB_TEXT_BOLD = false;
export const DEFAULT_SUB_TEXT_ITALIC = false;
export const DEFAULT_SUB_TEXT_SHADOW_ENABLED = false;
export const DEFAULT_SUB_TEXT_SHADOW_COLOR = "#000000";
export const DEFAULT_SUB_TEXT_SHADOW_BLUR = 4;
export const DEFAULT_SUB_TEXT_STROKE_ENABLED = false;
export const DEFAULT_SUB_TEXT_STROKE_COLOR = "#000000";
export const DEFAULT_SUB_TEXT_STROKE_WIDTH = 3;
export const DEFAULT_SUB_TEXT_BG_BAR_ENABLED = false;
export const DEFAULT_SUB_TEXT_BG_BAR_COLOR = "#000000";
export const DEFAULT_SUB_TEXT_BG_BAR_OPACITY = 60;

// ---------------------------------------------------------------------------
// 音声波形エフェクトのデフォルト値
// ---------------------------------------------------------------------------

export const DEFAULT_WAVEFORM_ENABLED = false;
export const DEFAULT_WAVEFORM_TYPE: WaveformType = "oscilloscope";
export const DEFAULT_WAVEFORM_DRAW_METHOD: WaveformDrawMethod = "polyline";
export const DEFAULT_WAVEFORM_COLOR = "#000000";
export const DEFAULT_WAVEFORM_COLOR_MODE: WaveformColorMode = "solid";
export const DEFAULT_WAVEFORM_OPACITY = 100;
export const DEFAULT_WAVEFORM_X_PERCENT = 50;
export const DEFAULT_WAVEFORM_Y_PERCENT = 50;
export const DEFAULT_WAVEFORM_ROTATION = 0;
export const DEFAULT_WAVEFORM_WIDTH_PERCENT = 80;
export const DEFAULT_WAVEFORM_HEIGHT_PERCENT = 20;
export const DEFAULT_WAVEFORM_START_ANGLE = 0;
export const DEFAULT_WAVEFORM_ROTATION_SPEED = 0;
export const DEFAULT_WAVEFORM_WINDOW_SIZE = 2048;
export const DEFAULT_WAVEFORM_STROKE_WIDTH_PX = 1;
export const DEFAULT_WAVEFORM_FFT_SHAPE: WaveformFftShape = "barBottom";
export const DEFAULT_WAVEFORM_FFT_GAUGE_SHAPE: WaveformFftGaugeShape = "bar";
export const DEFAULT_WAVEFORM_FFT_BIN_COUNT = 48;
export const DEFAULT_WAVEFORM_FFT_SIZE = 256;
export const DEFAULT_WAVEFORM_FFT_GAUGE_SEGMENTS = 0;
export const DEFAULT_WAVEFORM_FFT_ICON_SHAPE: WaveformFftIconShape = "circle";
export const DEFAULT_WAVEFORM_FFT_ICON_STRENGTH_MODE: WaveformFftIconStrengthMode =
  "glow";
export const DEFAULT_WAVEFORM_FFT_ICON_SIZE_PERCENT = 80;
export const WAVEFORM_FFT_ICON_SIZE_PERCENT_MIN = 10;
export const WAVEFORM_FFT_ICON_SIZE_PERCENT_MAX = 100;
export const WAVEFORM_WINDOW_SIZE_MIN = 256;
export const WAVEFORM_WINDOW_SIZE_MAX = 4096;
export const WAVEFORM_ROTATION_SPEED_MIN = -360;
export const WAVEFORM_ROTATION_SPEED_MAX = 360;
export const WAVEFORM_STROKE_WIDTH_PX_MIN = 1;
export const WAVEFORM_STROKE_WIDTH_PX_MAX = 4;
export const WAVEFORM_FFT_BIN_COUNT_MIN = 8;
export const WAVEFORM_FFT_BIN_COUNT_MAX = 96;
export const WAVEFORM_FFT_SIZE_MIN = 64;
export const WAVEFORM_FFT_SIZE_MAX = 1024;
export const WAVEFORM_FFT_GAUGE_SEGMENTS_MIN = 0;
export const WAVEFORM_FFT_GAUGE_SEGMENTS_MAX = 20;
