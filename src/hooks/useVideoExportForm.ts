import React from "react";
import { useTranslation } from "react-i18next";
import { COLOR_PALLET } from "../config/pallet";
import {
  DEFAULT_PIANOROLL_VIDEO_ENABLED,
  DEFAULT_PIANOROLL_VIDEO_LAYOUT,
  PIANOROLL_VIDEO_ICON_CONFIG,
} from "../config/pianoroll";
import {
  BACKGROUND_PATTERN_GAP_MAX,
  BACKGROUND_PATTERN_GAP_MIN,
  BACKGROUND_PATTERN_ROTATION_MAX,
  BACKGROUND_PATTERN_ROTATION_MIN,
  BACKGROUND_PATTERN_SIZE_MAX,
  BACKGROUND_PATTERN_SIZE_MIN,
  BG_MAX_HEIGHT,
  BG_MAX_WIDTH,
  DEFAULT_BACKGROUND_PATTERN_GAP,
  DEFAULT_BACKGROUND_PATTERN_ROTATION,
  DEFAULT_BACKGROUND_PATTERN_SIZE,
  DEFAULT_BACKGROUND_STYLE,
  DEFAULT_BG_COLOR,
  DEFAULT_BG_IMAGE_OPACITY,
  DEFAULT_BG_SECONDARY_COLOR,
  DEFAULT_BG_SECONDARY_OPACITY,
  DEFAULT_BG_SIZE,
  DEFAULT_LYRICS_BG_BAR_COLOR,
  DEFAULT_LYRICS_BG_BAR_ENABLED,
  DEFAULT_LYRICS_BG_BAR_OPACITY,
  DEFAULT_LYRICS_BLUR_AMOUNT,
  DEFAULT_LYRICS_BLUR_DURATION_MS,
  DEFAULT_LYRICS_BLUR_ENABLED,
  DEFAULT_LYRICS_BOUNCE_IN_DIRECTION,
  DEFAULT_LYRICS_BOUNCE_IN_ENABLED,
  DEFAULT_LYRICS_BOUNCE_IN_OUT_DURATION_MS,
  DEFAULT_LYRICS_BOUNCE_OUT_DIRECTION,
  DEFAULT_LYRICS_BOUNCE_OUT_ENABLED,
  DEFAULT_LYRICS_COLOR,
  DEFAULT_LYRICS_FADE_DURATION_MS,
  DEFAULT_LYRICS_FADE_ENABLED,
  DEFAULT_LYRICS_FONT_SIZE,
  DEFAULT_LYRICS_MAX_WIDTH_PERCENT,
  DEFAULT_LYRICS_SCALE_DURATION_MS,
  DEFAULT_LYRICS_SCALE_ENABLED,
  DEFAULT_LYRICS_SCALE_FROM,
  DEFAULT_LYRICS_SHADOW_BLUR,
  DEFAULT_LYRICS_SHADOW_COLOR,
  DEFAULT_LYRICS_SHADOW_ENABLED,
  DEFAULT_LYRICS_SLIDE_AMOUNT,
  DEFAULT_LYRICS_SLIDE_DURATION_MS,
  DEFAULT_LYRICS_SLIDE_ENABLED,
  DEFAULT_LYRICS_SLIDE_IN_DIRECTION,
  DEFAULT_LYRICS_SLIDE_IN_ENABLED,
  DEFAULT_LYRICS_SLIDE_IN_OUT_DURATION_MS,
  DEFAULT_LYRICS_SLIDE_OUT_DIRECTION,
  DEFAULT_LYRICS_SLIDE_OUT_ENABLED,
  DEFAULT_LYRICS_STAGGER_ENABLED,
  DEFAULT_LYRICS_STAGGER_INTERVAL_MS,
  DEFAULT_LYRICS_STROKE_COLOR,
  DEFAULT_LYRICS_STROKE_ENABLED,
  DEFAULT_LYRICS_STROKE_WIDTH,
  DEFAULT_LYRICS_WIPE_DURATION_MS,
  DEFAULT_LYRICS_WIPE_IN_DIRECTION,
  DEFAULT_LYRICS_WIPE_IN_ENABLED,
  DEFAULT_LYRICS_WIPE_OUT_DIRECTION,
  DEFAULT_LYRICS_WIPE_OUT_ENABLED,
  DEFAULT_LYRICS_Y_PERCENT,
  DEFAULT_MAIN_TEXT_BG_BAR_COLOR,
  DEFAULT_MAIN_TEXT_BG_BAR_ENABLED,
  DEFAULT_MAIN_TEXT_BG_BAR_OPACITY,
  DEFAULT_MAIN_TEXT_BOLD,
  DEFAULT_MAIN_TEXT_COLOR,
  DEFAULT_MAIN_TEXT_FONT_SIZE,
  DEFAULT_MAIN_TEXT_ITALIC,
  DEFAULT_MAIN_TEXT_SHADOW_BLUR,
  DEFAULT_MAIN_TEXT_SHADOW_COLOR,
  DEFAULT_MAIN_TEXT_SHADOW_ENABLED,
  DEFAULT_MAIN_TEXT_STROKE_COLOR,
  DEFAULT_MAIN_TEXT_STROKE_ENABLED,
  DEFAULT_MAIN_TEXT_STROKE_WIDTH,
  DEFAULT_MAIN_TEXT_X,
  DEFAULT_MAIN_TEXT_Y,
  DEFAULT_PADDING_MODE,
  DEFAULT_PORTRAIT_OPACITY,
  DEFAULT_PORTRAIT_SCALE_PERCENT,
  DEFAULT_PORTRAIT_SHOW,
  DEFAULT_PORTRAIT_X_OFFSET,
  DEFAULT_PORTRAIT_Y_OFFSET,
  DEFAULT_SUB_TEXT_BG_BAR_COLOR,
  DEFAULT_SUB_TEXT_BG_BAR_ENABLED,
  DEFAULT_SUB_TEXT_BG_BAR_OPACITY,
  DEFAULT_SUB_TEXT_BOLD,
  DEFAULT_SUB_TEXT_COLOR,
  DEFAULT_SUB_TEXT_FONT_SIZE,
  DEFAULT_SUB_TEXT_ITALIC,
  DEFAULT_SUB_TEXT_SHADOW_BLUR,
  DEFAULT_SUB_TEXT_SHADOW_COLOR,
  DEFAULT_SUB_TEXT_SHADOW_ENABLED,
  DEFAULT_SUB_TEXT_STROKE_COLOR,
  DEFAULT_SUB_TEXT_STROKE_ENABLED,
  DEFAULT_SUB_TEXT_STROKE_WIDTH,
  DEFAULT_SUB_TEXT_X,
  DEFAULT_SUB_TEXT_Y,
  DEFAULT_WAVEFORM_COLOR,
  DEFAULT_WAVEFORM_COLOR_MODE,
  DEFAULT_WAVEFORM_DRAW_METHOD,
  DEFAULT_WAVEFORM_ENABLED,
  DEFAULT_WAVEFORM_FFT_BIN_COUNT,
  DEFAULT_WAVEFORM_FFT_GAUGE_SEGMENTS,
  DEFAULT_WAVEFORM_FFT_GAUGE_SHAPE,
  DEFAULT_WAVEFORM_FFT_ICON_EMIT_STRENGTH,
  DEFAULT_WAVEFORM_FFT_ICON_GLOW_STRENGTH,
  DEFAULT_WAVEFORM_FFT_ICON_SHAPE,
  DEFAULT_WAVEFORM_FFT_ICON_SIZE_PERCENT,
  DEFAULT_WAVEFORM_FFT_ICON_STRENGTH_MODE,
  DEFAULT_WAVEFORM_FFT_SHAPE,
  DEFAULT_WAVEFORM_FFT_SIZE,
  DEFAULT_WAVEFORM_HEIGHT_PERCENT,
  DEFAULT_WAVEFORM_OPACITY,
  DEFAULT_WAVEFORM_ROTATION,
  DEFAULT_WAVEFORM_ROTATION_SPEED,
  DEFAULT_WAVEFORM_START_ANGLE,
  DEFAULT_WAVEFORM_STROKE_WIDTH_PX,
  DEFAULT_WAVEFORM_TYPE,
  DEFAULT_WAVEFORM_WIDTH_PERCENT,
  DEFAULT_WAVEFORM_WINDOW_SIZE,
  DEFAULT_WAVEFORM_X_PERCENT,
  DEFAULT_WAVEFORM_Y_PERCENT,
  HEX_RE,
  PORTRAIT_DRAW_SCALE_MAX,
  PORTRAIT_MAX_HEIGHT_RATIO,
  PORTRAIT_MAX_SCALE_FALLBACK,
  PORTRAIT_MAX_WIDTH_RATIO,
  PORTRAIT_NATURAL_HEIGHT_FALLBACK,
  PORTRAIT_OFFSET_MIN_FALLBACK,
  PREVIEW_MAX_H,
  PREVIEW_MAX_W,
} from "../config/videoExport";
import type { Note } from "../lib/Note";
import { useCookieStore } from "../store/cookieStore";
import { useMusicProjectStore } from "../store/musicProjectStore";
import type { ColorTheme } from "../types/colorTheme";
import {
  HORIZONTAL_ZOOM_STEPS,
  VERTICAL_ZOOM_STEPS,
  drawPianorollVideoFrame,
  getOneStepSmallerZoom,
  type PianorollRenderState,
  type PianorollVideoLayout,
  type PianorollVideoOptions,
} from "../utils/pianorollVideo";
import {
  FONT_STACK,
  drawSubtitleOnCanvas,
  drawVideoBackground,
  extractLyricsSegments,
  type BackgroundOptions,
  type BackgroundStyle,
  type BgPaddingMode,
  type LyricsOptions,
  type LyricsSegment,
  type PortraitOptions,
  type SlideDirection,
  type TextOptions,
  type VideoResolution,
} from "../utils/videoExport";
import {
  buildWaveformFftCache,
  drawWaveformEffect,
  generateChirpWave,
  type WaveformColorMode,
  type WaveformDrawMethod,
  type WaveformEffectOptions,
  type WaveformFftGaugeShape,
  type WaveformFftIconShape,
  type WaveformFftIconStrengthMode,
  type WaveformFftShape,
  type WaveformType,
} from "../utils/waveformEffect";
import { useThemeMode } from "./useThemeMode";

type Options = {
  onClose: () => void;
  onConfirm: (
    imageFile: File | null,
    resolution: VideoResolution,
    background: BackgroundOptions,
    bgPaddingMode: BgPaddingMode,
    bgImageOpacity: number,
    portraitOptions: PortraitOptions | null,
    mainTextOptions: TextOptions | null,
    subTextOptions: TextOptions | null,
    lyricsOptions: LyricsOptions | null,
    pianorollOptions: PianorollVideoOptions | null,
    waveformOptions: WaveformEffectOptions | null,
  ) => void;
  portraitBlob?: Blob | null;
  portraitNaturalHeight?: number;
  voiceIcon?: ArrayBuffer;
  notes?: Note[];
  notesLeftMs?: number[];
  selectNotesIndex?: number[];
};

export const useVideoExportForm = (open: boolean, options: Options) => {
  const {
    onClose,
    onConfirm,
    portraitBlob,
    portraitNaturalHeight,
    voiceIcon,
    notes,
    notesLeftMs,
    selectNotesIndex,
  } = options;
  const { t } = useTranslation();
  const { colorTheme, horizontalZoom, verticalZoom } = useCookieStore();
  const { tone, isMinor } = useMusicProjectStore();
  const themeMode = useThemeMode();

  // アニメーションプレビュー用 refs / state
  const animPreviewRafRef = React.useRef<number | null>(null);
  const animPreviewStartRef = React.useRef<number | null>(null);
  const animPreviewActiveRef = React.useRef(false);
  const [isAnimPreviewPlaying, setIsAnimPreviewPlaying] = React.useState(false);

  // 画像
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // 背景色
  const [bgColor, setBgColor] = React.useState<string>(DEFAULT_BG_COLOR);
  const [colorInput, setColorInput] = React.useState<string>(DEFAULT_BG_COLOR);
  const [bgSecondaryColor, setBgSecondaryColor] = React.useState<string>(
    DEFAULT_BG_SECONDARY_COLOR,
  );
  const [bgSecondaryOpacity, setBgSecondaryOpacity] = React.useState<number>(
    DEFAULT_BG_SECONDARY_OPACITY,
  );
  const [secondaryColorInput, setSecondaryColorInput] = React.useState<string>(
    DEFAULT_BG_SECONDARY_COLOR,
  );
  const [backgroundStyle, setBackgroundStyle] = React.useState<BackgroundStyle>(
    DEFAULT_BACKGROUND_STYLE,
  );
  const [backgroundPatternSize, setBackgroundPatternSize] =
    React.useState<number>(DEFAULT_BACKGROUND_PATTERN_SIZE);
  const [backgroundPatternGap, setBackgroundPatternGap] =
    React.useState<number>(DEFAULT_BACKGROUND_PATTERN_GAP);
  const [backgroundPatternRotation, setBackgroundPatternRotation] =
    React.useState<number>(DEFAULT_BACKGROUND_PATTERN_ROTATION);

  // 解像度
  const [bgSize, setBgSize] = React.useState<VideoResolution>(DEFAULT_BG_SIZE);

  // パディングモード
  const [bgPaddingMode, setBgPaddingMode] =
    React.useState<BgPaddingMode>(DEFAULT_PADDING_MODE);

  // 背景画像の不透明度 0–100
  const [bgImageOpacity, setBgImageOpacity] = React.useState<number>(
    DEFAULT_BG_IMAGE_OPACITY,
  );

  // 立絵設定
  const [showPortrait, setShowPortrait] = React.useState<boolean>(
    DEFAULT_PORTRAIT_SHOW,
  );
  const [portraitOpacity, setPortraitOpacity] = React.useState<number>(
    DEFAULT_PORTRAIT_OPACITY,
  );
  const [portraitScalePercent, setPortraitScalePercent] =
    React.useState<number>(DEFAULT_PORTRAIT_SCALE_PERCENT);
  const [portraitXOffset, setPortraitXOffset] = React.useState<number>(
    DEFAULT_PORTRAIT_X_OFFSET,
  );
  const [portraitYOffset, setPortraitYOffset] = React.useState<number>(
    DEFAULT_PORTRAIT_Y_OFFSET,
  );
  // プレビュー用にロード済み HTMLImageElement
  const [portraitImage, setPortraitImage] =
    React.useState<HTMLImageElement | null>(null);
  const [voiceIconImage, setVoiceIconImage] =
    React.useState<HTMLImageElement | null>(null);
  // 背景画像の自然サイズ（立絵最大スケール計算用）
  const [imageNaturalSize, setImageNaturalSize] = React.useState<{
    w: number;
    h: number;
  } | null>(null);

  // メインテキスト設定
  const [mainText, setMainText] = React.useState<string>(() =>
    t("editor.videoExport.mainTextDefault"),
  );
  const [mainTextFontSize, setMainTextFontSize] = React.useState<number>(
    DEFAULT_MAIN_TEXT_FONT_SIZE,
  );
  const [mainTextX, setMainTextX] = React.useState<number>(DEFAULT_MAIN_TEXT_X);
  const [mainTextY, setMainTextY] = React.useState<number>(DEFAULT_MAIN_TEXT_Y);
  const [mainTextColor, setMainTextColor] = React.useState<string>(
    DEFAULT_MAIN_TEXT_COLOR,
  );
  const [mainTextBold, setMainTextBold] = React.useState<boolean>(
    DEFAULT_MAIN_TEXT_BOLD,
  );
  const [mainTextItalic, setMainTextItalic] = React.useState<boolean>(
    DEFAULT_MAIN_TEXT_ITALIC,
  );
  const [mainTextShadowEnabled, setMainTextShadowEnabled] =
    React.useState<boolean>(DEFAULT_MAIN_TEXT_SHADOW_ENABLED);
  const [mainTextShadowColor, setMainTextShadowColor] = React.useState<string>(
    DEFAULT_MAIN_TEXT_SHADOW_COLOR,
  );
  const [mainTextShadowBlur, setMainTextShadowBlur] = React.useState<number>(
    DEFAULT_MAIN_TEXT_SHADOW_BLUR,
  );
  const [mainTextStrokeEnabled, setMainTextStrokeEnabled] =
    React.useState<boolean>(DEFAULT_MAIN_TEXT_STROKE_ENABLED);
  const [mainTextStrokeColor, setMainTextStrokeColor] = React.useState<string>(
    DEFAULT_MAIN_TEXT_STROKE_COLOR,
  );
  const [mainTextStrokeWidth, setMainTextStrokeWidth] = React.useState<number>(
    DEFAULT_MAIN_TEXT_STROKE_WIDTH,
  );
  const [mainTextBgBarEnabled, setMainTextBgBarEnabled] =
    React.useState<boolean>(DEFAULT_MAIN_TEXT_BG_BAR_ENABLED);
  const [mainTextBgBarColor, setMainTextBgBarColor] = React.useState<string>(
    DEFAULT_MAIN_TEXT_BG_BAR_COLOR,
  );
  const [mainTextBgBarOpacity, setMainTextBgBarOpacity] =
    React.useState<number>(DEFAULT_MAIN_TEXT_BG_BAR_OPACITY);

  // サブテキスト設定
  const [subText, setSubText] = React.useState<string>(() =>
    t("editor.videoExport.subTextDefault"),
  );
  const [subTextFontSize, setSubTextFontSize] = React.useState<number>(
    DEFAULT_SUB_TEXT_FONT_SIZE,
  );
  const [subTextX, setSubTextX] = React.useState<number>(DEFAULT_SUB_TEXT_X);
  const [subTextY, setSubTextY] = React.useState<number>(DEFAULT_SUB_TEXT_Y);
  const [subTextColor, setSubTextColor] = React.useState<string>(
    DEFAULT_SUB_TEXT_COLOR,
  );
  const [subTextBold, setSubTextBold] = React.useState<boolean>(
    DEFAULT_SUB_TEXT_BOLD,
  );
  const [subTextItalic, setSubTextItalic] = React.useState<boolean>(
    DEFAULT_SUB_TEXT_ITALIC,
  );
  const [subTextShadowEnabled, setSubTextShadowEnabled] =
    React.useState<boolean>(DEFAULT_SUB_TEXT_SHADOW_ENABLED);
  const [subTextShadowColor, setSubTextShadowColor] = React.useState<string>(
    DEFAULT_SUB_TEXT_SHADOW_COLOR,
  );
  const [subTextShadowBlur, setSubTextShadowBlur] = React.useState<number>(
    DEFAULT_SUB_TEXT_SHADOW_BLUR,
  );
  const [subTextStrokeEnabled, setSubTextStrokeEnabled] =
    React.useState<boolean>(DEFAULT_SUB_TEXT_STROKE_ENABLED);
  const [subTextStrokeColor, setSubTextStrokeColor] = React.useState<string>(
    DEFAULT_SUB_TEXT_STROKE_COLOR,
  );
  const [subTextStrokeWidth, setSubTextStrokeWidth] = React.useState<number>(
    DEFAULT_SUB_TEXT_STROKE_WIDTH,
  );
  const [subTextBgBarEnabled, setSubTextBgBarEnabled] = React.useState<boolean>(
    DEFAULT_SUB_TEXT_BG_BAR_ENABLED,
  );
  const [subTextBgBarColor, setSubTextBgBarColor] = React.useState<string>(
    DEFAULT_SUB_TEXT_BG_BAR_COLOR,
  );
  const [subTextBgBarOpacity, setSubTextBgBarOpacity] = React.useState<number>(
    DEFAULT_SUB_TEXT_BG_BAR_OPACITY,
  );

  // 字幕設定
  const [lyricsEnabled, setLyricsEnabled] = React.useState<boolean>(false);
  const [lyricsSegments, setLyricsSegments] = React.useState<LyricsSegment[]>(
    [],
  );
  const [lyricsFontSize, setLyricsFontSize] = React.useState<number>(
    DEFAULT_LYRICS_FONT_SIZE,
  );
  const [lyricsColor, setLyricsColor] =
    React.useState<string>(DEFAULT_LYRICS_COLOR);
  const [lyricsYPercent, setLyricsYPercent] = React.useState<number>(
    DEFAULT_LYRICS_Y_PERCENT,
  );
  const [lyricsMaxWidthPercent, setLyricsMaxWidthPercent] =
    React.useState<number>(DEFAULT_LYRICS_MAX_WIDTH_PERCENT);
  // 字幕文字装飾
  const [lyricsShadowEnabled, setLyricsShadowEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_SHADOW_ENABLED,
  );
  const [lyricsShadowColor, setLyricsShadowColor] = React.useState<string>(
    DEFAULT_LYRICS_SHADOW_COLOR,
  );
  const [lyricsShadowBlur, setLyricsShadowBlur] = React.useState<number>(
    DEFAULT_LYRICS_SHADOW_BLUR,
  );
  const [lyricsStrokeEnabled, setLyricsStrokeEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_STROKE_ENABLED,
  );
  const [lyricsStrokeColor, setLyricsStrokeColor] = React.useState<string>(
    DEFAULT_LYRICS_STROKE_COLOR,
  );
  const [lyricsStrokeWidth, setLyricsStrokeWidth] = React.useState<number>(
    DEFAULT_LYRICS_STROKE_WIDTH,
  );
  const [lyricsBgBarEnabled, setLyricsBgBarEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_BG_BAR_ENABLED,
  );
  const [lyricsBgBarColor, setLyricsBgBarColor] = React.useState<string>(
    DEFAULT_LYRICS_BG_BAR_COLOR,
  );
  const [lyricsBgBarOpacity, setLyricsBgBarOpacity] = React.useState<number>(
    DEFAULT_LYRICS_BG_BAR_OPACITY,
  );
  // 字幕フェード
  const [lyricsFadeEnabled, setLyricsFadeEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_FADE_ENABLED,
  );
  const [lyricsFadeDurationMs, setLyricsFadeDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_FADE_DURATION_MS);
  // 字幕スケール
  const [lyricsScaleEnabled, setLyricsScaleEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_SCALE_ENABLED,
  );
  const [lyricsScaleFrom, setLyricsScaleFrom] = React.useState<number>(
    DEFAULT_LYRICS_SCALE_FROM,
  );
  const [lyricsScaleDurationMs, setLyricsScaleDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_SCALE_DURATION_MS);
  // 字幕スライド
  const [lyricsSlideEnabled, setLyricsSlideEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_SLIDE_ENABLED,
  );
  const [lyricsSlideAmount, setLyricsSlideAmount] = React.useState<number>(
    DEFAULT_LYRICS_SLIDE_AMOUNT,
  );
  const [lyricsSlideDurationMs, setLyricsSlideDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_SLIDE_DURATION_MS);
  const [lyricsSlideInEnabled, setLyricsSlideInEnabled] =
    React.useState<boolean>(DEFAULT_LYRICS_SLIDE_IN_ENABLED);
  const [lyricsSlideInDirection, setLyricsSlideInDirection] =
    React.useState<SlideDirection>(DEFAULT_LYRICS_SLIDE_IN_DIRECTION);
  const [lyricsSlideOutEnabled, setLyricsSlideOutEnabled] =
    React.useState<boolean>(DEFAULT_LYRICS_SLIDE_OUT_ENABLED);
  const [lyricsSlideOutDirection, setLyricsSlideOutDirection] =
    React.useState<SlideDirection>(DEFAULT_LYRICS_SLIDE_OUT_DIRECTION);
  const [lyricsSlideInOutDurationMs, setLyricsSlideInOutDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_SLIDE_IN_OUT_DURATION_MS);
  const [lyricsBlurEnabled, setLyricsBlurEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_BLUR_ENABLED,
  );
  const [lyricsBlurAmount, setLyricsBlurAmount] = React.useState<number>(
    DEFAULT_LYRICS_BLUR_AMOUNT,
  );
  const [lyricsBlurDurationMs, setLyricsBlurDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_BLUR_DURATION_MS);
  const [lyricsWipeInEnabled, setLyricsWipeInEnabled] = React.useState<boolean>(
    DEFAULT_LYRICS_WIPE_IN_ENABLED,
  );
  const [lyricsWipeInDirection, setLyricsWipeInDirection] =
    React.useState<SlideDirection>(DEFAULT_LYRICS_WIPE_IN_DIRECTION);
  const [lyricsWipeOutEnabled, setLyricsWipeOutEnabled] =
    React.useState<boolean>(DEFAULT_LYRICS_WIPE_OUT_ENABLED);
  const [lyricsWipeOutDirection, setLyricsWipeOutDirection] =
    React.useState<SlideDirection>(DEFAULT_LYRICS_WIPE_OUT_DIRECTION);
  const [lyricsWipeDurationMs, setLyricsWipeDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_WIPE_DURATION_MS);
  const [lyricsBounceInEnabled, setLyricsBounceInEnabled] =
    React.useState<boolean>(DEFAULT_LYRICS_BOUNCE_IN_ENABLED);
  const [lyricsBounceInDirection, setLyricsBounceInDirection] =
    React.useState<SlideDirection>(DEFAULT_LYRICS_BOUNCE_IN_DIRECTION);
  const [lyricsBounceOutEnabled, setLyricsBounceOutEnabled] =
    React.useState<boolean>(DEFAULT_LYRICS_BOUNCE_OUT_ENABLED);
  const [lyricsBounceOutDirection, setLyricsBounceOutDirection] =
    React.useState<SlideDirection>(DEFAULT_LYRICS_BOUNCE_OUT_DIRECTION);
  const [lyricsBounceInOutDurationMs, setLyricsBounceInOutDurationMs] =
    React.useState<number>(DEFAULT_LYRICS_BOUNCE_IN_OUT_DURATION_MS);
  const [lyricsStaggerEnabled, setLyricsStaggerEnabled] =
    React.useState<boolean>(DEFAULT_LYRICS_STAGGER_ENABLED);
  const [lyricsStaggerIntervalMs, setLyricsStaggerIntervalMs] =
    React.useState<number>(DEFAULT_LYRICS_STAGGER_INTERVAL_MS);

  // -----------------------------------------------------------------------

  const applyColor = (hex: string) => {
    setBgColor(hex);
    setColorInput(hex);
  };

  const applySecondaryColor = (hex: string) => {
    setBgSecondaryColor(hex);
    setSecondaryColorInput(hex);
  };

  const handleColorInputChange = React.useCallback((v: string) => {
    setColorInput(v);
    if (HEX_RE.test(v)) setBgColor(v);
  }, []);

  const handleSecondaryColorInputChange = React.useCallback((v: string) => {
    setSecondaryColorInput(v);
    if (HEX_RE.test(v)) setBgSecondaryColor(v);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const backgroundOptions = React.useMemo<BackgroundOptions>(
    () => ({
      style: backgroundStyle,
      primaryColor: bgColor,
      secondaryColor: bgSecondaryColor,
      secondaryOpacity: Math.min(100, Math.max(0, bgSecondaryOpacity)),
      size: Math.min(
        BACKGROUND_PATTERN_SIZE_MAX,
        Math.max(BACKGROUND_PATTERN_SIZE_MIN, backgroundPatternSize),
      ),
      gap: Math.min(
        BACKGROUND_PATTERN_GAP_MAX,
        Math.max(BACKGROUND_PATTERN_GAP_MIN, backgroundPatternGap),
      ),
      rotation: Math.min(
        BACKGROUND_PATTERN_ROTATION_MAX,
        Math.max(BACKGROUND_PATTERN_ROTATION_MIN, backgroundPatternRotation),
      ),
    }),
    [
      backgroundStyle,
      bgColor,
      bgSecondaryColor,
      bgSecondaryOpacity,
      backgroundPatternSize,
      backgroundPatternGap,
      backgroundPatternRotation,
    ],
  );

  const defaultPianorollLayout =
    DEFAULT_PIANOROLL_VIDEO_LAYOUT as PianorollVideoLayout;

  const [pianorollEnabled, setPianorollEnabled] = React.useState(
    DEFAULT_PIANOROLL_VIDEO_ENABLED,
  );
  const [pianorollColorTheme, setPianorollColorTheme] =
    React.useState<ColorTheme>(colorTheme);
  const [pianorollThemeMode, setPianorollThemeMode] = React.useState<
    "light" | "dark"
  >(themeMode);
  const [pianorollLayout, setPianorollLayout] =
    React.useState<PianorollVideoLayout | null>(null);
  // pianorollLayout が null の場合は bgSize 変化に追従するデフォルト値を使う
  const effectivePianorollLayout = pianorollLayout ?? defaultPianorollLayout;

  const pianorollPreviewOptions =
    React.useMemo<PianorollVideoOptions | null>(() => {
      if (
        !notes ||
        !notesLeftMs ||
        notes.length === 0 ||
        notesLeftMs.length === 0
      ) {
        return null;
      }
      return {
        enabled: pianorollEnabled,
        layout: effectivePianorollLayout,
        notes,
        notesLeftMs,
        colorTheme: pianorollColorTheme,
        themeMode: pianorollThemeMode,
        horizontalZoom: getOneStepSmallerZoom(
          horizontalZoom,
          HORIZONTAL_ZOOM_STEPS,
        ),
        verticalZoom: getOneStepSmallerZoom(verticalZoom, VERTICAL_ZOOM_STEPS),
        tone,
        isMinor,
        voiceIconImage,
      };
    }, [
      notes,
      notesLeftMs,
      pianorollEnabled,
      effectivePianorollLayout,
      pianorollColorTheme,
      pianorollThemeMode,
      horizontalZoom,
      verticalZoom,
      tone,
      isMinor,
      voiceIconImage,
    ]);

  const applyPianorollThemeToOutside = React.useCallback(() => {
    const pallet =
      COLOR_PALLET[pianorollColorTheme]?.[pianorollThemeMode] ??
      COLOR_PALLET.default.light;

    applyColor(pallet.whiteKey);
    applySecondaryColor(pallet.note);

    setMainTextColor(pallet.lyric);
    setSubTextColor(pallet.lyric);
    setLyricsColor(pallet.lyric);

    setMainTextShadowColor(pallet.selectedNote);
    setMainTextStrokeColor(pallet.selectedNote);
    setMainTextBgBarColor(pallet.selectedNote);

    setSubTextShadowColor(pallet.selectedNote);
    setSubTextStrokeColor(pallet.selectedNote);
    setSubTextBgBarColor(pallet.selectedNote);

    setLyricsShadowColor(pallet.selectedNote);
    setLyricsStrokeColor(pallet.selectedNote);
    setLyricsBgBarColor(pallet.selectedNote);

    setWaveformColor(pallet.selectedNote);
  }, [
    pianorollColorTheme,
    pianorollThemeMode,
    applyColor,
    applySecondaryColor,
  ]);

  // 波形エフェクト設定
  const waveformSinePreviewRafRef = React.useRef<number | null>(null);
  const waveformSinePreviewActiveRef = React.useRef(false);
  const [isWaveformSinePreviewPlaying, setIsWaveformSinePreviewPlaying] =
    React.useState(false);

  const [waveformEnabled, setWaveformEnabled] = React.useState<boolean>(
    DEFAULT_WAVEFORM_ENABLED,
  );
  const [waveformType, setWaveformType] = React.useState<WaveformType>(
    DEFAULT_WAVEFORM_TYPE,
  );
  const [waveformDrawMethod, setWaveformDrawMethod] =
    React.useState<WaveformDrawMethod>(DEFAULT_WAVEFORM_DRAW_METHOD);
  const [waveformFftShape, setWaveformFftShape] =
    React.useState<WaveformFftShape>(DEFAULT_WAVEFORM_FFT_SHAPE);
  const [waveformFftGaugeShape, setWaveformFftGaugeShape] =
    React.useState<WaveformFftGaugeShape>(DEFAULT_WAVEFORM_FFT_GAUGE_SHAPE);
  const [waveformColor, setWaveformColor] = React.useState<string>(
    DEFAULT_WAVEFORM_COLOR,
  );
  const [waveformColorMode, setWaveformColorMode] =
    React.useState<WaveformColorMode>(DEFAULT_WAVEFORM_COLOR_MODE);
  const [waveformOpacity, setWaveformOpacity] = React.useState<number>(
    DEFAULT_WAVEFORM_OPACITY,
  );
  const [waveformXPercent, setWaveformXPercent] = React.useState<number>(
    DEFAULT_WAVEFORM_X_PERCENT,
  );
  const [waveformYPercent, setWaveformYPercent] = React.useState<number>(
    DEFAULT_WAVEFORM_Y_PERCENT,
  );
  const [waveformRotation, setWaveformRotation] = React.useState<number>(
    DEFAULT_WAVEFORM_ROTATION,
  );
  const [waveformWidthPercent, setWaveformWidthPercent] =
    React.useState<number>(DEFAULT_WAVEFORM_WIDTH_PERCENT);
  const [waveformHeightPercent, setWaveformHeightPercent] =
    React.useState<number>(DEFAULT_WAVEFORM_HEIGHT_PERCENT);
  const [waveformStartAngle, setWaveformStartAngle] = React.useState<number>(
    DEFAULT_WAVEFORM_START_ANGLE,
  );
  const [waveformRotationSpeed, setWaveformRotationSpeed] =
    React.useState<number>(DEFAULT_WAVEFORM_ROTATION_SPEED);
  const [waveformWindowSize, setWaveformWindowSize] = React.useState<number>(
    DEFAULT_WAVEFORM_WINDOW_SIZE,
  );
  const [waveformStrokeWidthPx, setWaveformStrokeWidthPx] =
    React.useState<number>(DEFAULT_WAVEFORM_STROKE_WIDTH_PX);
  const [waveformFftBinCount, setWaveformFftBinCount] = React.useState<number>(
    DEFAULT_WAVEFORM_FFT_BIN_COUNT,
  );
  const [waveformFftSize, setWaveformFftSize] = React.useState<number>(
    DEFAULT_WAVEFORM_FFT_SIZE,
  );
  const [waveformFftGaugeSegments, setWaveformFftGaugeSegments] =
    React.useState<number>(DEFAULT_WAVEFORM_FFT_GAUGE_SEGMENTS);
  const [waveformFftIconShape, setWaveformFftIconShape] =
    React.useState<WaveformFftIconShape>(DEFAULT_WAVEFORM_FFT_ICON_SHAPE);
  const [waveformFftIconStrengthMode, setWaveformFftIconStrengthMode] =
    React.useState<WaveformFftIconStrengthMode>(
      DEFAULT_WAVEFORM_FFT_ICON_STRENGTH_MODE,
    );
  const [waveformFftIconSizePercent, setWaveformFftIconSizePercent] =
    React.useState<number>(DEFAULT_WAVEFORM_FFT_ICON_SIZE_PERCENT);
  const [waveformFftIconGlowStrength, setWaveformFftIconGlowStrength] =
    React.useState<number>(DEFAULT_WAVEFORM_FFT_ICON_GLOW_STRENGTH);
  const [waveformFftIconEmitStrength, setWaveformFftIconEmitStrength] =
    React.useState<number>(DEFAULT_WAVEFORM_FFT_ICON_EMIT_STRENGTH);

  const waveformOptions = React.useMemo<WaveformEffectOptions>(
    () => ({
      enabled: waveformEnabled,
      type: waveformType,
      drawMethod: waveformDrawMethod,
      fftShape: waveformFftShape,
      fftGaugeShape: waveformFftGaugeShape,
      fftGaugeSegments: waveformFftGaugeSegments,
      color: waveformColor,
      colorMode: waveformColorMode,
      opacity: waveformOpacity,
      xPercent: waveformXPercent,
      yPercent: waveformYPercent,
      rotation: waveformRotation,
      widthPercent: waveformWidthPercent,
      heightPercent: waveformHeightPercent,
      startAngle: waveformStartAngle,
      rotationSpeed: waveformRotationSpeed,
      windowSize: waveformWindowSize,
      strokeWidthPx: waveformStrokeWidthPx,
      fftBinCount: waveformFftBinCount,
      fftSize: waveformFftSize,
      fftIconShape: waveformFftIconShape,
      fftIconStrengthMode: waveformFftIconStrengthMode,
      fftIconSizePercent: waveformFftIconSizePercent,
      fftIconGlowStrength: waveformFftIconGlowStrength,
      fftIconEmitStrength: waveformFftIconEmitStrength,
    }),
    [
      waveformEnabled,
      waveformType,
      waveformDrawMethod,
      waveformFftShape,
      waveformFftGaugeShape,
      waveformFftGaugeSegments,
      waveformColor,
      waveformColorMode,
      waveformOpacity,
      waveformXPercent,
      waveformYPercent,
      waveformRotation,
      waveformWidthPercent,
      waveformHeightPercent,
      waveformStartAngle,
      waveformRotationSpeed,
      waveformWindowSize,
      waveformStrokeWidthPx,
      waveformFftBinCount,
      waveformFftSize,
      waveformFftIconShape,
      waveformFftIconStrengthMode,
      waveformFftIconSizePercent,
      waveformFftIconGlowStrength,
      waveformFftIconEmitStrength,
    ],
  );

  /** セグメント i の歌詞テキストを更新する */
  const updateSegmentLyric = React.useCallback((i: number, value: string) => {
    setLyricsSegments((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, lyric: value } : s)),
    );
  }, []);

  /** セグメント i と i+1 を結合する */
  const mergeSegments = React.useCallback((i: number) => {
    setLyricsSegments((prev) => {
      if (i >= prev.length - 1) return prev;
      const a = prev[i];
      const b = prev[i + 1];
      const merged: LyricsSegment = {
        startMs: a.startMs,
        endMs: b.endMs,
        lyric: a.lyric + b.lyric,
        // a の最後の境界点と b の最初の境界点が同じ値なので重複を除去
        noteBoundaries: [...a.noteBoundaries.slice(0, -1), ...b.noteBoundaries],
      };
      return [...prev.slice(0, i), merged, ...prev.slice(i + 2)];
    });
  }, []);

  /** セグメント i を noteBoundaries[k] の位置で分割する */
  const splitSegment = React.useCallback((i: number, k: number) => {
    setLyricsSegments((prev) => {
      const seg = prev[i];
      if (!seg || k <= 0 || k >= seg.noteBoundaries.length - 1) return prev;
      const splitMs = seg.noteBoundaries[k];
      const a: LyricsSegment = {
        startMs: seg.startMs,
        endMs: splitMs,
        lyric: seg.lyric.slice(0, k),
        noteBoundaries: seg.noteBoundaries.slice(0, k + 1),
      };
      const b: LyricsSegment = {
        startMs: splitMs,
        endMs: seg.endMs,
        lyric: seg.lyric.slice(k),
        noteBoundaries: seg.noteBoundaries.slice(k),
      };
      return [...prev.slice(0, i), a, b, ...prev.slice(i + 1)];
    });
  }, []);

  const handleClose = () => {
    clearImage();
    onClose();
  };

  const buildTextOptions = (
    text: string,
    fontSize: number,
    bold: boolean,
    italic: boolean,
    color: string,
    xPercent: number,
    yPercent: number,
    shadowEnabled: boolean,
    shadowColor: string,
    shadowBlur: number,
    strokeEnabled: boolean,
    strokeColor: string,
    strokeWidth: number,
    bgBarEnabled: boolean,
    bgBarColor: string,
    bgBarOpacity: number,
  ): TextOptions | null =>
    text.trim()
      ? {
          text,
          fontSize,
          fontWeight: bold ? "bold" : "normal",
          fontStyle: italic ? "italic" : "normal",
          color,
          xPercent,
          yPercent,
          textAlign: "left",
          shadowEnabled,
          shadowColor,
          shadowBlur,
          strokeEnabled,
          strokeColor,
          strokeWidth,
          bgBarEnabled,
          bgBarColor,
          bgBarOpacity,
        }
      : null;

  const handleConfirm = () => {
    const portraitOptions: PortraitOptions | null =
      portraitBlob && showPortrait
        ? {
            blob: portraitBlob,
            naturalHeight:
              portraitNaturalHeight ?? PORTRAIT_NATURAL_HEIGHT_FALLBACK,
            opacity: portraitOpacity,
            scalePercent: portraitScalePercent,
            xOffset: portraitXOffset,
            yOffset: portraitYOffset,
          }
        : null;

    const mainTextOptions = buildTextOptions(
      mainText,
      mainTextFontSize,
      mainTextBold,
      mainTextItalic,
      mainTextColor,
      mainTextX,
      mainTextY,
      mainTextShadowEnabled,
      mainTextShadowColor,
      mainTextShadowBlur,
      mainTextStrokeEnabled,
      mainTextStrokeColor,
      mainTextStrokeWidth,
      mainTextBgBarEnabled,
      mainTextBgBarColor,
      mainTextBgBarOpacity,
    );
    const subTextOptions = buildTextOptions(
      subText,
      subTextFontSize,
      subTextBold,
      subTextItalic,
      subTextColor,
      subTextX,
      subTextY,
      subTextShadowEnabled,
      subTextShadowColor,
      subTextShadowBlur,
      subTextStrokeEnabled,
      subTextStrokeColor,
      subTextStrokeWidth,
      subTextBgBarEnabled,
      subTextBgBarColor,
      subTextBgBarOpacity,
    );

    const lyricsOptions: LyricsOptions | null =
      lyricsEnabled && lyricsSegments.length > 0
        ? {
            segments: lyricsSegments,
            fontSize: lyricsFontSize,
            color: lyricsColor,
            xPercent: 50,
            yPercent: lyricsYPercent,
            maxWidthPercent: lyricsMaxWidthPercent,
            shadowEnabled: lyricsShadowEnabled,
            shadowColor: lyricsShadowColor,
            shadowBlur: lyricsShadowBlur,
            strokeEnabled: lyricsStrokeEnabled,
            strokeColor: lyricsStrokeColor,
            strokeWidth: lyricsStrokeWidth,
            bgBarEnabled: lyricsBgBarEnabled,
            bgBarColor: lyricsBgBarColor,
            bgBarOpacity: lyricsBgBarOpacity,
            fadeEnabled: lyricsFadeEnabled,
            fadeDurationMs: lyricsFadeDurationMs,
            scaleEnabled: lyricsScaleEnabled,
            scaleFrom: lyricsScaleFrom,
            scaleDurationMs: lyricsScaleDurationMs,
            slideEnabled: lyricsSlideEnabled,
            slideAmount: lyricsSlideAmount,
            slideDurationMs: lyricsSlideDurationMs,
            slideInEnabled: lyricsSlideInEnabled,
            slideInDirection: lyricsSlideInDirection,
            slideOutEnabled: lyricsSlideOutEnabled,
            slideOutDirection: lyricsSlideOutDirection,
            slideInOutDurationMs: lyricsSlideInOutDurationMs,
            blurEnabled: lyricsBlurEnabled,
            blurAmount: lyricsBlurAmount,
            blurDurationMs: lyricsBlurDurationMs,
            wipeInEnabled: lyricsWipeInEnabled,
            wipeInDirection: lyricsWipeInDirection,
            wipeOutEnabled: lyricsWipeOutEnabled,
            wipeOutDirection: lyricsWipeOutDirection,
            wipeDurationMs: lyricsWipeDurationMs,
            bounceInEnabled: lyricsBounceInEnabled,
            bounceInDirection: lyricsBounceInDirection,
            bounceOutEnabled: lyricsBounceOutEnabled,
            bounceOutDirection: lyricsBounceOutDirection,
            bounceInOutDurationMs: lyricsBounceInOutDurationMs,
            staggerEnabled: lyricsStaggerEnabled,
            staggerIntervalMs: lyricsStaggerIntervalMs,
          }
        : null;

    if (imageFile) {
      onConfirm(
        imageFile,
        bgSize,
        backgroundOptions,
        bgPaddingMode,
        bgImageOpacity,
        portraitOptions,
        mainTextOptions,
        subTextOptions,
        lyricsOptions,
        pianorollPreviewOptions,
        waveformOptions.enabled ? waveformOptions : null,
      );
      return;
    }
    onConfirm(
      null,
      bgSize,
      backgroundOptions,
      "color",
      100,
      portraitOptions,
      mainTextOptions,
      subTextOptions,
      lyricsOptions,
      pianorollPreviewOptions,
      waveformOptions.enabled ? waveformOptions : null,
    );
  };

  // ダイアログが閉じられたら状態をリセット
  React.useEffect(() => {
    if (!open) {
      clearImage();
      applyColor(DEFAULT_BG_COLOR);
      applySecondaryColor(DEFAULT_BG_SECONDARY_COLOR);
      setBgSecondaryOpacity(DEFAULT_BG_SECONDARY_OPACITY);
      setBackgroundStyle(DEFAULT_BACKGROUND_STYLE);
      setBackgroundPatternSize(DEFAULT_BACKGROUND_PATTERN_SIZE);
      setBackgroundPatternGap(DEFAULT_BACKGROUND_PATTERN_GAP);
      setBackgroundPatternRotation(DEFAULT_BACKGROUND_PATTERN_ROTATION);
      setBgSize(DEFAULT_BG_SIZE);
      setBgPaddingMode(DEFAULT_PADDING_MODE);
      setBgImageOpacity(DEFAULT_BG_IMAGE_OPACITY);
      setShowPortrait(DEFAULT_PORTRAIT_SHOW);
      setPortraitOpacity(DEFAULT_PORTRAIT_OPACITY);
      setPortraitScalePercent(DEFAULT_PORTRAIT_SCALE_PERCENT);
      setPortraitXOffset(DEFAULT_PORTRAIT_X_OFFSET);
      setPortraitYOffset(DEFAULT_PORTRAIT_Y_OFFSET);
      setMainText(t("editor.videoExport.mainTextDefault"));
      setMainTextFontSize(DEFAULT_MAIN_TEXT_FONT_SIZE);
      setMainTextX(DEFAULT_MAIN_TEXT_X);
      setMainTextY(DEFAULT_MAIN_TEXT_Y);
      setMainTextColor(DEFAULT_MAIN_TEXT_COLOR);
      setMainTextBold(DEFAULT_MAIN_TEXT_BOLD);
      setMainTextItalic(DEFAULT_MAIN_TEXT_ITALIC);
      setMainTextShadowEnabled(DEFAULT_MAIN_TEXT_SHADOW_ENABLED);
      setMainTextShadowColor(DEFAULT_MAIN_TEXT_SHADOW_COLOR);
      setMainTextShadowBlur(DEFAULT_MAIN_TEXT_SHADOW_BLUR);
      setMainTextStrokeEnabled(DEFAULT_MAIN_TEXT_STROKE_ENABLED);
      setMainTextStrokeColor(DEFAULT_MAIN_TEXT_STROKE_COLOR);
      setMainTextStrokeWidth(DEFAULT_MAIN_TEXT_STROKE_WIDTH);
      setMainTextBgBarEnabled(DEFAULT_MAIN_TEXT_BG_BAR_ENABLED);
      setMainTextBgBarColor(DEFAULT_MAIN_TEXT_BG_BAR_COLOR);
      setMainTextBgBarOpacity(DEFAULT_MAIN_TEXT_BG_BAR_OPACITY);
      setSubText(t("editor.videoExport.subTextDefault"));
      setSubTextFontSize(DEFAULT_SUB_TEXT_FONT_SIZE);
      setSubTextX(DEFAULT_SUB_TEXT_X);
      setSubTextY(DEFAULT_SUB_TEXT_Y);
      setSubTextColor(DEFAULT_SUB_TEXT_COLOR);
      setSubTextBold(DEFAULT_SUB_TEXT_BOLD);
      setSubTextItalic(DEFAULT_SUB_TEXT_ITALIC);
      setSubTextShadowEnabled(DEFAULT_SUB_TEXT_SHADOW_ENABLED);
      setSubTextShadowColor(DEFAULT_SUB_TEXT_SHADOW_COLOR);
      setSubTextShadowBlur(DEFAULT_SUB_TEXT_SHADOW_BLUR);
      setSubTextStrokeEnabled(DEFAULT_SUB_TEXT_STROKE_ENABLED);
      setSubTextStrokeColor(DEFAULT_SUB_TEXT_STROKE_COLOR);
      setSubTextStrokeWidth(DEFAULT_SUB_TEXT_STROKE_WIDTH);
      setSubTextBgBarEnabled(DEFAULT_SUB_TEXT_BG_BAR_ENABLED);
      setSubTextBgBarColor(DEFAULT_SUB_TEXT_BG_BAR_COLOR);
      setSubTextBgBarOpacity(DEFAULT_SUB_TEXT_BG_BAR_OPACITY);
      setLyricsEnabled(false);
      setLyricsSegments([]);
      setLyricsFontSize(DEFAULT_LYRICS_FONT_SIZE);
      setLyricsColor(DEFAULT_LYRICS_COLOR);
      setLyricsYPercent(DEFAULT_LYRICS_Y_PERCENT);
      setLyricsMaxWidthPercent(DEFAULT_LYRICS_MAX_WIDTH_PERCENT);
      setLyricsShadowEnabled(DEFAULT_LYRICS_SHADOW_ENABLED);
      setLyricsShadowColor(DEFAULT_LYRICS_SHADOW_COLOR);
      setLyricsShadowBlur(DEFAULT_LYRICS_SHADOW_BLUR);
      setLyricsStrokeEnabled(DEFAULT_LYRICS_STROKE_ENABLED);
      setLyricsStrokeColor(DEFAULT_LYRICS_STROKE_COLOR);
      setLyricsStrokeWidth(DEFAULT_LYRICS_STROKE_WIDTH);
      setLyricsBgBarEnabled(DEFAULT_LYRICS_BG_BAR_ENABLED);
      setLyricsBgBarColor(DEFAULT_LYRICS_BG_BAR_COLOR);
      setLyricsBgBarOpacity(DEFAULT_LYRICS_BG_BAR_OPACITY);
      setLyricsFadeEnabled(DEFAULT_LYRICS_FADE_ENABLED);
      setLyricsFadeDurationMs(DEFAULT_LYRICS_FADE_DURATION_MS);
      setLyricsScaleEnabled(DEFAULT_LYRICS_SCALE_ENABLED);
      setLyricsScaleFrom(DEFAULT_LYRICS_SCALE_FROM);
      setLyricsScaleDurationMs(DEFAULT_LYRICS_SCALE_DURATION_MS);
      setLyricsSlideEnabled(DEFAULT_LYRICS_SLIDE_ENABLED);
      setLyricsSlideAmount(DEFAULT_LYRICS_SLIDE_AMOUNT);
      setLyricsSlideDurationMs(DEFAULT_LYRICS_SLIDE_DURATION_MS);
      setLyricsSlideInEnabled(DEFAULT_LYRICS_SLIDE_IN_ENABLED);
      setLyricsSlideInDirection(DEFAULT_LYRICS_SLIDE_IN_DIRECTION);
      setLyricsSlideOutEnabled(DEFAULT_LYRICS_SLIDE_OUT_ENABLED);
      setLyricsSlideOutDirection(DEFAULT_LYRICS_SLIDE_OUT_DIRECTION);
      setLyricsSlideInOutDurationMs(DEFAULT_LYRICS_SLIDE_IN_OUT_DURATION_MS);
      setLyricsBlurEnabled(DEFAULT_LYRICS_BLUR_ENABLED);
      setLyricsBlurAmount(DEFAULT_LYRICS_BLUR_AMOUNT);
      setLyricsBlurDurationMs(DEFAULT_LYRICS_BLUR_DURATION_MS);
      setLyricsWipeInEnabled(DEFAULT_LYRICS_WIPE_IN_ENABLED);
      setLyricsWipeInDirection(DEFAULT_LYRICS_WIPE_IN_DIRECTION);
      setLyricsWipeOutEnabled(DEFAULT_LYRICS_WIPE_OUT_ENABLED);
      setLyricsWipeOutDirection(DEFAULT_LYRICS_WIPE_OUT_DIRECTION);
      setLyricsWipeDurationMs(DEFAULT_LYRICS_WIPE_DURATION_MS);
      setLyricsBounceInEnabled(DEFAULT_LYRICS_BOUNCE_IN_ENABLED);
      setLyricsBounceInDirection(DEFAULT_LYRICS_BOUNCE_IN_DIRECTION);
      setLyricsBounceOutEnabled(DEFAULT_LYRICS_BOUNCE_OUT_ENABLED);
      setLyricsBounceOutDirection(DEFAULT_LYRICS_BOUNCE_OUT_DIRECTION);
      setLyricsBounceInOutDurationMs(DEFAULT_LYRICS_BOUNCE_IN_OUT_DURATION_MS);
      setLyricsStaggerEnabled(DEFAULT_LYRICS_STAGGER_ENABLED);
      setLyricsStaggerIntervalMs(DEFAULT_LYRICS_STAGGER_INTERVAL_MS);
      setPianorollEnabled(DEFAULT_PIANOROLL_VIDEO_ENABLED);
      setPianorollColorTheme(colorTheme);
      setPianorollThemeMode(themeMode);
      setPianorollLayout(null);
      setWaveformEnabled(DEFAULT_WAVEFORM_ENABLED);
      setWaveformType(DEFAULT_WAVEFORM_TYPE);
      setWaveformDrawMethod(DEFAULT_WAVEFORM_DRAW_METHOD);
      setWaveformFftShape(DEFAULT_WAVEFORM_FFT_SHAPE);
      setWaveformFftGaugeShape(DEFAULT_WAVEFORM_FFT_GAUGE_SHAPE);
      setWaveformColor(DEFAULT_WAVEFORM_COLOR);
      setWaveformColorMode(DEFAULT_WAVEFORM_COLOR_MODE);
      setWaveformOpacity(DEFAULT_WAVEFORM_OPACITY);
      setWaveformXPercent(DEFAULT_WAVEFORM_X_PERCENT);
      setWaveformYPercent(DEFAULT_WAVEFORM_Y_PERCENT);
      setWaveformRotation(DEFAULT_WAVEFORM_ROTATION);
      setWaveformWidthPercent(DEFAULT_WAVEFORM_WIDTH_PERCENT);
      setWaveformHeightPercent(DEFAULT_WAVEFORM_HEIGHT_PERCENT);
      setWaveformStartAngle(DEFAULT_WAVEFORM_START_ANGLE);
      setWaveformRotationSpeed(DEFAULT_WAVEFORM_ROTATION_SPEED);
      setWaveformWindowSize(DEFAULT_WAVEFORM_WINDOW_SIZE);
      setWaveformStrokeWidthPx(DEFAULT_WAVEFORM_STROKE_WIDTH_PX);
      setWaveformFftBinCount(DEFAULT_WAVEFORM_FFT_BIN_COUNT);
      setWaveformFftSize(DEFAULT_WAVEFORM_FFT_SIZE);
      setWaveformFftGaugeSegments(DEFAULT_WAVEFORM_FFT_GAUGE_SEGMENTS);
      setWaveformFftIconShape(DEFAULT_WAVEFORM_FFT_ICON_SHAPE);
      setWaveformFftIconStrengthMode(DEFAULT_WAVEFORM_FFT_ICON_STRENGTH_MODE);
      setWaveformFftIconSizePercent(DEFAULT_WAVEFORM_FFT_ICON_SIZE_PERCENT);
      setWaveformFftIconGlowStrength(DEFAULT_WAVEFORM_FFT_ICON_GLOW_STRENGTH);
      setWaveformFftIconEmitStrength(DEFAULT_WAVEFORM_FFT_ICON_EMIT_STRENGTH);
    } else {
      // ダイアログが開いたときに字幕セグメントを初期化する
      if (notes && notesLeftMs && notes.length > 0) {
        setLyricsSegments(
          extractLyricsSegments(notes, notesLeftMs, selectNotesIndex ?? []),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 背景画像の自然サイズを取得（立絵スライダー上限計算用）
  React.useEffect(() => {
    if (!imagePreviewUrl) {
      setImageNaturalSize(null);
      return;
    }
    const el = new Image();
    el.onload = () =>
      setImageNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
    el.onerror = () => setImageNaturalSize(null);
    el.src = imagePreviewUrl;
  }, [imagePreviewUrl]);

  // portraitBlob から HTMLImageElement をロード（プレビュー用）
  React.useEffect(() => {
    if (!portraitBlob) {
      setPortraitImage(null);
      return;
    }
    const url = URL.createObjectURL(portraitBlob);
    const el = new Image();
    el.onload = () => setPortraitImage(el);
    el.onerror = () => setPortraitImage(null);
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [portraitBlob]);

  React.useEffect(() => {
    if (!voiceIcon) {
      setVoiceIconImage(null);
      return;
    }
    const url = URL.createObjectURL(
      new Blob([voiceIcon], {
        type: PIANOROLL_VIDEO_ICON_CONFIG.voiceIconMimeType,
      }),
    );
    const el = new Image();
    el.onload = () => setVoiceIconImage(el);
    el.onerror = () => setVoiceIconImage(null);
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [voiceIcon]);

  // 解像度に応じた出力サイズを計算する（立絵スライダー上限/下限の共通ロジック）
  const outputSize = React.useMemo(() => {
    if (bgSize === "image") {
      if (!imageNaturalSize) return null;
      const s = Math.min(
        1,
        BG_MAX_WIDTH / imageNaturalSize.w,
        BG_MAX_HEIGHT / imageNaturalSize.h,
      );
      return {
        outW: Math.round(imageNaturalSize.w * s),
        outH: Math.round(imageNaturalSize.h * s),
      };
    }
    const [outW, outH] = bgSize.split("x").map(Number) as [number, number];
    return { outW, outH };
  }, [bgSize, imageNaturalSize]);

  // 立絵サイズスライダーの最大値（自然サイズ = drawScale 1.0 となる scalePercent）
  const portraitMaxScale = React.useMemo(() => {
    if (!portraitImage || !outputSize) return PORTRAIT_MAX_SCALE_FALLBACK;
    const { outW, outH } = outputSize;
    const pNatW = portraitImage.naturalWidth;
    const pNatH = portraitImage.naturalHeight;
    const maxW = outW * PORTRAIT_MAX_WIDTH_RATIO;
    const maxH = Math.min(
      outH * PORTRAIT_MAX_HEIGHT_RATIO,
      portraitNaturalHeight ?? PORTRAIT_NATURAL_HEIGHT_FALLBACK,
    );
    const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
    return Math.max(1, Math.round(100 / defaultScale));
  }, [portraitImage, outputSize, portraitNaturalHeight]);

  // portraitMaxScale が変化したとき現在値が上限を超えていたらクランプ
  React.useEffect(() => {
    setPortraitScalePercent((prev) => Math.min(prev, portraitMaxScale));
  }, [portraitMaxScale]);

  // 立絵 X オフセットの下限（立絵が完全にキャンバス左端より左に出られる最小値）
  const portraitXOffsetMin = React.useMemo(() => {
    if (!portraitImage || !outputSize) return PORTRAIT_OFFSET_MIN_FALLBACK;
    const { outW, outH } = outputSize;
    const pNatW = portraitImage.naturalWidth;
    const pNatH = portraitImage.naturalHeight;
    const maxW = outW * PORTRAIT_MAX_WIDTH_RATIO;
    const maxH = Math.min(
      outH * PORTRAIT_MAX_HEIGHT_RATIO,
      portraitNaturalHeight ?? PORTRAIT_NATURAL_HEIGHT_FALLBACK,
    );
    const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
    const drawScale = Math.min(
      defaultScale * (portraitScalePercent / 100),
      PORTRAIT_DRAW_SCALE_MAX,
    );
    if (drawScale <= 0) return PORTRAIT_OFFSET_MIN_FALLBACK;
    const drawW = pNatW * drawScale;
    // px + drawW <= 0 となる最小 xOffset: xOffset <= -(outW / drawW) * 100
    return -Math.ceil((outW / drawW) * 100);
  }, [portraitImage, outputSize, portraitNaturalHeight, portraitScalePercent]);

  // portraitXOffsetMin が変化したとき現在値が下限を下回っていたらクランプ
  React.useEffect(() => {
    setPortraitXOffset((prev) => Math.max(prev, portraitXOffsetMin));
  }, [portraitXOffsetMin]);

  // 立絵 Y オフセットの下限（立絵が完全にキャンバス上端より上に出られる最小値）
  const portraitYOffsetMin = React.useMemo(() => {
    if (!portraitImage || !outputSize) return PORTRAIT_OFFSET_MIN_FALLBACK;
    const { outW, outH } = outputSize;
    const pNatW = portraitImage.naturalWidth;
    const pNatH = portraitImage.naturalHeight;
    const maxW = outW * PORTRAIT_MAX_WIDTH_RATIO;
    const maxH = Math.min(
      outH * PORTRAIT_MAX_HEIGHT_RATIO,
      portraitNaturalHeight ?? PORTRAIT_NATURAL_HEIGHT_FALLBACK,
    );
    const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
    const drawScale = Math.min(
      defaultScale * (portraitScalePercent / 100),
      PORTRAIT_DRAW_SCALE_MAX,
    );
    if (drawScale <= 0) return PORTRAIT_OFFSET_MIN_FALLBACK;
    const drawH = pNatH * drawScale;
    // py + drawH <= 0 となる最小 yOffset: yOffset <= -(outH / drawH) * 100
    return -Math.ceil((outH / drawH) * 100);
  }, [portraitImage, outputSize, portraitNaturalHeight, portraitScalePercent]);

  // portraitYOffsetMin が変化したとき現在値が下限を下回っていたらクランプ
  React.useEffect(() => {
    setPortraitYOffset((prev) => Math.max(prev, portraitYOffsetMin));
  }, [portraitYOffsetMin]);

  const renderPreviewBase = React.useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      img: HTMLImageElement | null,
    ) => {
      let outW = 0;
      let outH = 0;

      if (bgSize === "image") {
        if (!img) {
          canvas.width = 1;
          canvas.height = 1;
          ctx.clearRect(0, 0, 1, 1);
          return null;
        }
        const s = Math.min(
          1,
          BG_MAX_WIDTH / img.naturalWidth,
          BG_MAX_HEIGHT / img.naturalHeight,
        );
        outW = Math.round(img.naturalWidth * s);
        outH = Math.round(img.naturalHeight * s);
      } else {
        [outW, outH] = bgSize.split("x").map(Number);
      }

      const prevScale = Math.min(PREVIEW_MAX_W / outW, PREVIEW_MAX_H / outH);
      const pw = Math.round(outW * prevScale);
      const ph = Math.round(outH * prevScale);
      canvas.width = pw;
      canvas.height = ph;
      ctx.clearRect(0, 0, pw, ph);

      if (bgSize === "image") {
        ctx.drawImage(img, 0, 0, pw, ph);
      } else {
        drawVideoBackground(
          ctx,
          pw,
          ph,
          backgroundOptions,
          img,
          bgPaddingMode,
          bgImageOpacity,
          Math.max(1, Math.round(20 * prevScale)),
          prevScale,
        );
      }

      if (pianorollPreviewOptions) {
        const initialState: PianorollRenderState = { yOffset: 0 };
        const scaledPianorollOpts = {
          ...pianorollPreviewOptions,
          horizontalZoom: pianorollPreviewOptions.horizontalZoom * prevScale,
          verticalZoom: pianorollPreviewOptions.verticalZoom * prevScale,
          layoutScale: prevScale,
        };
        drawPianorollVideoFrame(
          ctx,
          pw,
          ph,
          0,
          scaledPianorollOpts,
          initialState,
        );
      }

      if (showPortrait && portraitImage) {
        const pNatW = portraitImage.naturalWidth;
        const pNatH = portraitImage.naturalHeight;
        const maxW = outW * PORTRAIT_MAX_WIDTH_RATIO;
        const maxH = Math.min(
          outH * PORTRAIT_MAX_HEIGHT_RATIO,
          portraitNaturalHeight ?? PORTRAIT_NATURAL_HEIGHT_FALLBACK,
        );
        const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
        const drawScale =
          Math.min(
            defaultScale * (portraitScalePercent / 100),
            PORTRAIT_DRAW_SCALE_MAX,
          ) * prevScale;
        const drawW = pNatW * drawScale;
        const drawH = pNatH * drawScale;
        const px = pw - drawW + drawW * (portraitXOffset / 100);
        const py = ph - drawH + drawH * (portraitYOffset / 100);
        ctx.globalAlpha = portraitOpacity / 100;
        ctx.drawImage(portraitImage, px, py, drawW, drawH);
        ctx.globalAlpha = 1;
      }

      // 波形エフェクト（無音でフラットライン描画）
      if (waveformOptions.enabled) {
        drawWaveformEffect(
          ctx,
          null,
          waveformOptions,
          pw,
          ph,
          0,
          44100,
          prevScale,
        );
      }

      const drawTextLayer = (
        text: string,
        fontSize: number,
        bold: boolean,
        italic: boolean,
        color: string,
        xPercent: number,
        yPercent: number,
        shadowEnabled: boolean,
        shadowColor: string,
        shadowBlur: number,
        strokeEnabled: boolean,
        strokeColor: string,
        strokeWidth: number,
        bgBarEnabled: boolean,
        bgBarColor: string,
        bgBarOpacity: number,
      ) => {
        if (!text.trim()) return;
        const scaledSize = Math.max(1, Math.round(fontSize * prevScale));
        const tx = (pw * xPercent) / 100;
        const ty = (ph * yPercent) / 100;
        ctx.save();
        ctx.font = `${italic ? "italic" : "normal"} ${bold ? "bold" : "normal"} ${scaledSize}px ${FONT_STACK}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 1;

        if (bgBarEnabled) {
          const textW = ctx.measureText(text).width;
          const padX = scaledSize * 0.5;
          const padY = scaledSize * 0.3;
          const barW = textW + padX * 2;
          const barH = scaledSize + padY * 2;
          ctx.save();
          ctx.globalAlpha = bgBarOpacity / 100;
          ctx.fillStyle = bgBarColor;
          ctx.fillRect(tx - padX, ty - barH / 2, barW, barH);
          ctx.restore();
        }

        if (shadowEnabled) {
          const scaledBlur = shadowBlur * prevScale;
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = scaledBlur;
          ctx.shadowOffsetX = scaledBlur * 0.5;
          ctx.shadowOffsetY = scaledBlur * 0.5;
        }

        if (strokeEnabled) {
          ctx.lineJoin = "round";
          ctx.lineWidth = strokeWidth * prevScale * 2;
          ctx.strokeStyle = strokeColor;
          ctx.strokeText(text, tx, ty);
        }

        ctx.fillStyle = color;
        ctx.fillText(text, tx, ty);
        ctx.restore();
      };

      drawTextLayer(
        mainText,
        mainTextFontSize,
        mainTextBold,
        mainTextItalic,
        mainTextColor,
        mainTextX,
        mainTextY,
        mainTextShadowEnabled,
        mainTextShadowColor,
        mainTextShadowBlur,
        mainTextStrokeEnabled,
        mainTextStrokeColor,
        mainTextStrokeWidth,
        mainTextBgBarEnabled,
        mainTextBgBarColor,
        mainTextBgBarOpacity,
      );
      drawTextLayer(
        subText,
        subTextFontSize,
        subTextBold,
        subTextItalic,
        subTextColor,
        subTextX,
        subTextY,
        subTextShadowEnabled,
        subTextShadowColor,
        subTextShadowBlur,
        subTextStrokeEnabled,
        subTextStrokeColor,
        subTextStrokeWidth,
        subTextBgBarEnabled,
        subTextBgBarColor,
        subTextBgBarOpacity,
      );

      return { prevScale, pw, ph };
    },
    [
      bgSize,
      backgroundOptions,
      bgPaddingMode,
      bgImageOpacity,
      pianorollPreviewOptions,
      showPortrait,
      portraitImage,
      portraitNaturalHeight,
      portraitScalePercent,
      portraitXOffset,
      portraitYOffset,
      portraitOpacity,
      mainText,
      mainTextFontSize,
      mainTextBold,
      mainTextItalic,
      mainTextColor,
      mainTextX,
      mainTextY,
      mainTextShadowEnabled,
      mainTextShadowColor,
      mainTextShadowBlur,
      mainTextStrokeEnabled,
      mainTextStrokeColor,
      mainTextStrokeWidth,
      mainTextBgBarEnabled,
      mainTextBgBarColor,
      mainTextBgBarOpacity,
      subText,
      subTextFontSize,
      subTextBold,
      subTextItalic,
      subTextColor,
      subTextX,
      subTextY,
      subTextShadowEnabled,
      subTextShadowColor,
      subTextShadowBlur,
      subTextStrokeEnabled,
      subTextStrokeColor,
      subTextStrokeWidth,
      subTextBgBarEnabled,
      subTextBgBarColor,
      subTextBgBarOpacity,
      waveformOptions,
    ],
  );

  // エクスポートプレビューをキャンバスにレンダリング
  React.useEffect(() => {
    // アニメーションプレビュー中はスキップ
    if (animPreviewActiveRef.current || waveformSinePreviewActiveRef.current)
      return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // "image" モードで画像がない場合は空にして終了
    if (bgSize === "image" && !imagePreviewUrl) {
      canvas.width = 1;
      canvas.height = 1;
      ctx.clearRect(0, 0, 1, 1);
      return;
    }

    const draw = (img: HTMLImageElement | null) => {
      const metrics = renderPreviewBase(ctx, canvas, img);
      if (!metrics) return;
      const { prevScale, pw, ph } = metrics;

      // 歌詞字幕プレビューレイヤー
      if (lyricsEnabled) {
        const previewLyric =
          lyricsSegments.length > 0
            ? lyricsSegments[0].lyric || "aaaaaaa"
            : "aaaaaaa";
        if (previewLyric.trim()) {
          const maxW = (pw * lyricsMaxWidthPercent) / 100;
          const minFontSize = 12;
          let lFontSize = Math.max(1, Math.round(lyricsFontSize * prevScale));
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `normal normal ${lFontSize}px ${FONT_STACK}`;
          while (
            lFontSize > minFontSize &&
            ctx.measureText(previewLyric).width > maxW
          ) {
            lFontSize -= 2;
            ctx.font = `normal normal ${lFontSize}px ${FONT_STACK}`;
          }
          const lcx = pw / 2;
          const lcy = (ph * lyricsYPercent) / 100;
          const textW = ctx.measureText(previewLyric).width;
          // 背景バー
          if (lyricsBgBarEnabled) {
            const padX = lFontSize * 0.5;
            const padY = lFontSize * 0.3;
            const barW = textW + padX * 2;
            const barH = lFontSize + padY * 2;
            ctx.save();
            ctx.globalAlpha = lyricsBgBarOpacity / 100;
            ctx.fillStyle = lyricsBgBarColor;
            ctx.fillRect(lcx - barW / 2, lcy - barH / 2, barW, barH);
            ctx.restore();
          }
          // shadow
          if (lyricsShadowEnabled) {
            const scaledBlur = lyricsShadowBlur * prevScale;
            ctx.shadowColor = lyricsShadowColor;
            ctx.shadowBlur = scaledBlur;
            ctx.shadowOffsetX = scaledBlur * 0.5;
            ctx.shadowOffsetY = scaledBlur * 0.5;
          }
          // stroke
          if (lyricsStrokeEnabled) {
            ctx.lineJoin = "round";
            ctx.lineWidth = lyricsStrokeWidth * prevScale * 2;
            ctx.strokeStyle = lyricsStrokeColor;
            ctx.strokeText(previewLyric, lcx, lcy);
          }
          // fill
          ctx.fillStyle = lyricsColor;
          ctx.fillText(previewLyric, lcx, lcy);
          ctx.restore();
        }
      }
    };

    if (imagePreviewUrl) {
      const el = new Image();
      el.onload = () => draw(el);
      el.src = imagePreviewUrl;
    } else {
      draw(null);
    }
  }, [
    imagePreviewUrl,
    renderPreviewBase,
    lyricsEnabled,
    lyricsSegments,
    lyricsFontSize,
    lyricsColor,
    lyricsYPercent,
    lyricsMaxWidthPercent,
    lyricsShadowEnabled,
    lyricsShadowColor,
    lyricsShadowBlur,
    lyricsStrokeEnabled,
    lyricsStrokeColor,
    lyricsStrokeWidth,
    lyricsBgBarEnabled,
    lyricsBgBarColor,
    lyricsBgBarOpacity,
    lyricsFadeEnabled,
    lyricsFadeDurationMs,
    lyricsScaleEnabled,
    lyricsScaleFrom,
    lyricsScaleDurationMs,
    lyricsSlideEnabled,
    lyricsSlideAmount,
    lyricsSlideDurationMs,
    lyricsSlideInEnabled,
    lyricsSlideInDirection,
    lyricsSlideOutEnabled,
    lyricsSlideOutDirection,
    lyricsSlideInOutDurationMs,
    lyricsBlurEnabled,
    lyricsBlurAmount,
    lyricsBlurDurationMs,
    lyricsWipeInEnabled,
    lyricsWipeInDirection,
    lyricsWipeOutEnabled,
    lyricsWipeOutDirection,
    lyricsWipeDurationMs,
    lyricsBounceInEnabled,
    lyricsBounceInDirection,
    lyricsBounceOutEnabled,
    lyricsBounceOutDirection,
    lyricsBounceInOutDurationMs,
    lyricsStaggerEnabled,
    lyricsStaggerIntervalMs,
    isAnimPreviewPlaying,
    isWaveformSinePreviewPlaying,
    pianorollPreviewOptions,
    waveformOptions,
  ]);

  // テキストの bold/italic をあわせて更新するコールバック
  const handleMainBoldItalicChange = React.useCallback(
    (bold: boolean, italic: boolean) => {
      setMainTextBold(bold);
      setMainTextItalic(italic);
    },
    [],
  );

  const handleSubBoldItalicChange = React.useCallback(
    (bold: boolean, italic: boolean) => {
      setSubTextBold(bold);
      setSubTextItalic(italic);
    },
    [],
  );

  /** アニメーションプレビュー開始 — rAF ループで最初のセグメントを繰り返し描画する */
  const startAnimPreview = React.useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (bgSize === "image" && !imagePreviewUrl) return;

    const seg: LyricsSegment = lyricsSegments[0] ?? {
      lyric: "サンプル歌詞",
      startMs: 0,
      endMs: 3000,
      noteBoundaries: [0, 3000],
    };
    const segDuration = Math.max(1000, seg.endMs - seg.startMs);

    const lyricsOpts: LyricsOptions = {
      segments: lyricsSegments.length > 0 ? lyricsSegments : [seg],
      fontSize: lyricsFontSize,
      color: lyricsColor,
      xPercent: 50,
      yPercent: lyricsYPercent,
      maxWidthPercent: lyricsMaxWidthPercent,
      shadowEnabled: lyricsShadowEnabled,
      shadowColor: lyricsShadowColor,
      shadowBlur: lyricsShadowBlur,
      strokeEnabled: lyricsStrokeEnabled,
      strokeColor: lyricsStrokeColor,
      strokeWidth: lyricsStrokeWidth,
      bgBarEnabled: lyricsBgBarEnabled,
      bgBarColor: lyricsBgBarColor,
      bgBarOpacity: lyricsBgBarOpacity,
      fadeEnabled: lyricsFadeEnabled,
      fadeDurationMs: lyricsFadeDurationMs,
      scaleEnabled: lyricsScaleEnabled,
      scaleFrom: lyricsScaleFrom,
      scaleDurationMs: lyricsScaleDurationMs,
      slideEnabled: lyricsSlideEnabled,
      slideAmount: lyricsSlideAmount,
      slideDurationMs: lyricsSlideDurationMs,
      slideInEnabled: lyricsSlideInEnabled,
      slideInDirection: lyricsSlideInDirection,
      slideOutEnabled: lyricsSlideOutEnabled,
      slideOutDirection: lyricsSlideOutDirection,
      slideInOutDurationMs: lyricsSlideInOutDurationMs,
      blurEnabled: lyricsBlurEnabled,
      blurAmount: lyricsBlurAmount,
      blurDurationMs: lyricsBlurDurationMs,
      wipeInEnabled: lyricsWipeInEnabled,
      wipeInDirection: lyricsWipeInDirection,
      wipeOutEnabled: lyricsWipeOutEnabled,
      wipeOutDirection: lyricsWipeOutDirection,
      wipeDurationMs: lyricsWipeDurationMs,
      bounceInEnabled: lyricsBounceInEnabled,
      bounceInDirection: lyricsBounceInDirection,
      bounceOutEnabled: lyricsBounceOutEnabled,
      bounceOutDirection: lyricsBounceOutDirection,
      bounceInOutDurationMs: lyricsBounceInOutDurationMs,
      staggerEnabled: lyricsStaggerEnabled,
      staggerIntervalMs: lyricsStaggerIntervalMs,
    };

    animPreviewActiveRef.current = true;
    animPreviewStartRef.current = performance.now();
    setIsAnimPreviewPlaying(true);

    const loop = (img: HTMLImageElement | null) => {
      if (!animPreviewActiveRef.current) return;
      const now = performance.now();
      const elapsed =
        (now - (animPreviewStartRef.current ?? now)) % segDuration;
      const remaining = segDuration - elapsed;
      const metrics = renderPreviewBase(ctx, canvas, img);
      if (!metrics) return;
      const scaledLyricsOpts: LyricsOptions = {
        ...lyricsOpts,
        fontSize: Math.max(1, lyricsOpts.fontSize * metrics.prevScale),
        shadowBlur: lyricsOpts.shadowBlur * metrics.prevScale,
        strokeWidth: lyricsOpts.strokeWidth * metrics.prevScale,
        slideAmount: lyricsOpts.slideAmount * metrics.prevScale,
        blurAmount: lyricsOpts.blurAmount * metrics.prevScale,
      };
      drawSubtitleOnCanvas(
        ctx,
        seg.lyric,
        scaledLyricsOpts,
        canvas.width,
        canvas.height,
        elapsed,
        remaining,
      );
      animPreviewRafRef.current = requestAnimationFrame(() => loop(img));
    };

    if (imagePreviewUrl) {
      const el = new Image();
      el.onload = () => {
        if (!animPreviewActiveRef.current) return;
        animPreviewRafRef.current = requestAnimationFrame(() => loop(el));
      };
      el.src = imagePreviewUrl;
    } else {
      animPreviewRafRef.current = requestAnimationFrame(() => loop(null));
    }
  }, [
    previewCanvasRef,
    bgSize,
    imagePreviewUrl,
    lyricsSegments,
    renderPreviewBase,
    lyricsFontSize,
    lyricsColor,
    lyricsYPercent,
    lyricsMaxWidthPercent,
    lyricsShadowEnabled,
    lyricsShadowColor,
    lyricsShadowBlur,
    lyricsStrokeEnabled,
    lyricsStrokeColor,
    lyricsStrokeWidth,
    lyricsBgBarEnabled,
    lyricsBgBarColor,
    lyricsBgBarOpacity,
    lyricsFadeEnabled,
    lyricsFadeDurationMs,
    lyricsScaleEnabled,
    lyricsScaleFrom,
    lyricsScaleDurationMs,
    lyricsSlideEnabled,
    lyricsSlideAmount,
    lyricsSlideDurationMs,
    lyricsSlideInEnabled,
    lyricsSlideInDirection,
    lyricsSlideOutEnabled,
    lyricsSlideOutDirection,
    lyricsSlideInOutDurationMs,
    lyricsBlurEnabled,
    lyricsBlurAmount,
    lyricsBlurDurationMs,
    lyricsWipeInEnabled,
    lyricsWipeInDirection,
    lyricsWipeOutEnabled,
    lyricsWipeOutDirection,
    lyricsWipeDurationMs,
    lyricsBounceInEnabled,
    lyricsBounceInDirection,
    lyricsBounceOutEnabled,
    lyricsBounceOutDirection,
    lyricsBounceInOutDurationMs,
    lyricsStaggerEnabled,
    lyricsStaggerIntervalMs,
  ]);

  /** アニメーションプレビュー停止 */
  const stopAnimPreview = React.useCallback(() => {
    if (animPreviewRafRef.current !== null) {
      cancelAnimationFrame(animPreviewRafRef.current);
      animPreviewRafRef.current = null;
    }
    animPreviewActiveRef.current = false;
    setIsAnimPreviewPlaying(false);
  }, []);

  /** 波形プレビュー開始 — 50→800Hz チープ波 0.8秒を rAF ループで描画する */
  const startWaveformSinePreview = React.useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (bgSize === "image" && !imagePreviewUrl) return;

    const CHIRP_SAMPLE_RATE = 44100;
    const CHIRP_DURATION_SEC = 1.5;
    const CHIRP_START_HZ = 50;
    const CHIRP_END_HZ = 10000;
    const chirpSamples = generateChirpWave(
      CHIRP_START_HZ,
      CHIRP_END_HZ,
      CHIRP_DURATION_SEC,
      CHIRP_SAMPLE_RATE,
    );

    // プレビュー用にFFTキャッシュを事前計算する
    const chirpFftCache = buildWaveformFftCache(
      chirpSamples,
      CHIRP_SAMPLE_RATE,
      waveformOptions.fftSize,
      waveformOptions.fftBinCount,
    );

    waveformSinePreviewActiveRef.current = true;
    const startTime = performance.now();
    setIsWaveformSinePreviewPlaying(true);

    const loop = (img: HTMLImageElement | null) => {
      if (!waveformSinePreviewActiveRef.current) return;
      const elapsed =
        ((performance.now() - startTime) / 1000) % CHIRP_DURATION_SEC;
      const metrics = renderPreviewBase(ctx, canvas, img);
      if (!metrics) return;
      if (waveformOptions.enabled) {
        drawWaveformEffect(
          ctx,
          chirpSamples,
          waveformOptions,
          metrics.pw,
          metrics.ph,
          elapsed,
          CHIRP_SAMPLE_RATE,
          metrics.prevScale,
          chirpFftCache,
        );
      }
      waveformSinePreviewRafRef.current = requestAnimationFrame(() =>
        loop(img),
      );
    };

    if (imagePreviewUrl) {
      const el = new Image();
      el.onload = () => {
        if (!waveformSinePreviewActiveRef.current) return;
        waveformSinePreviewRafRef.current = requestAnimationFrame(() =>
          loop(el),
        );
      };
      el.src = imagePreviewUrl;
    } else {
      waveformSinePreviewRafRef.current = requestAnimationFrame(() =>
        loop(null),
      );
    }
  }, [
    previewCanvasRef,
    bgSize,
    imagePreviewUrl,
    renderPreviewBase,
    waveformOptions,
  ]);

  /** 波形サイン波プレビュー停止 */
  const stopWaveformSinePreview = React.useCallback(() => {
    if (waveformSinePreviewRafRef.current !== null) {
      cancelAnimationFrame(waveformSinePreviewRafRef.current);
      waveformSinePreviewRafRef.current = null;
    }
    waveformSinePreviewActiveRef.current = false;
    setIsWaveformSinePreviewPlaying(false);
  }, []);

  return {
    // refs
    fileInputRef,
    previewCanvasRef,
    // background
    imageFile,
    imagePreviewUrl,
    backgroundStyle,
    bgColor,
    bgSecondaryColor,
    bgSecondaryOpacity,
    colorInput,
    secondaryColorInput,
    backgroundPatternSize,
    backgroundPatternGap,
    backgroundPatternRotation,
    bgSize,
    bgPaddingMode,
    bgImageOpacity,
    // portrait
    showPortrait,
    portraitOpacity,
    portraitScalePercent,
    portraitXOffset,
    portraitYOffset,
    portraitMaxScale,
    portraitXOffsetMin,
    portraitYOffsetMin,
    // mainText
    mainText,
    mainTextFontSize,
    mainTextX,
    mainTextY,
    mainTextColor,
    mainTextBold,
    mainTextItalic,
    // subText
    subText,
    subTextFontSize,
    subTextX,
    subTextY,
    subTextColor,
    subTextBold,
    subTextItalic,
    // actions
    handleClose,
    handleConfirm,
    handleFileChange,
    clearImage,
    applyColor,
    applySecondaryColor,
    handleColorInputChange,
    handleSecondaryColorInputChange,
    handleMainBoldItalicChange,
    handleSubBoldItalicChange,
    // setters
    setBackgroundStyle,
    setBackgroundPatternSize,
    setBackgroundPatternGap,
    setBackgroundPatternRotation,
    setBgSecondaryOpacity,
    setBgSize,
    setBgPaddingMode,
    setBgImageOpacity,
    setShowPortrait,
    setPortraitOpacity,
    setPortraitScalePercent,
    setPortraitXOffset,
    setPortraitYOffset,
    setMainText,
    setMainTextFontSize,
    setMainTextX,
    setMainTextY,
    setMainTextColor,
    mainTextShadowEnabled,
    mainTextShadowColor,
    mainTextShadowBlur,
    mainTextStrokeEnabled,
    mainTextStrokeColor,
    mainTextStrokeWidth,
    mainTextBgBarEnabled,
    mainTextBgBarColor,
    mainTextBgBarOpacity,
    setMainTextShadowEnabled,
    setMainTextShadowColor,
    setMainTextShadowBlur,
    setMainTextStrokeEnabled,
    setMainTextStrokeColor,
    setMainTextStrokeWidth,
    setMainTextBgBarEnabled,
    setMainTextBgBarColor,
    setMainTextBgBarOpacity,
    setSubText,
    setSubTextFontSize,
    setSubTextX,
    setSubTextY,
    setSubTextColor,
    setSubTextBold,
    setSubTextItalic,
    subTextShadowEnabled,
    subTextShadowColor,
    subTextShadowBlur,
    subTextStrokeEnabled,
    subTextStrokeColor,
    subTextStrokeWidth,
    subTextBgBarEnabled,
    subTextBgBarColor,
    subTextBgBarOpacity,
    setSubTextShadowEnabled,
    setSubTextShadowColor,
    setSubTextShadowBlur,
    setSubTextStrokeEnabled,
    setSubTextStrokeColor,
    setSubTextStrokeWidth,
    setSubTextBgBarEnabled,
    setSubTextBgBarColor,
    setSubTextBgBarOpacity,
    // lyrics
    lyricsEnabled,
    lyricsSegments,
    lyricsFontSize,
    lyricsColor,
    lyricsYPercent,
    lyricsMaxWidthPercent,
    setLyricsEnabled,
    setLyricsFontSize,
    setLyricsColor,
    setLyricsYPercent,
    setLyricsMaxWidthPercent,
    updateSegmentLyric,
    mergeSegments,
    splitSegment,
    // 歌詞文字装飾
    lyricsShadowEnabled,
    lyricsShadowColor,
    lyricsShadowBlur,
    lyricsStrokeEnabled,
    lyricsStrokeColor,
    lyricsStrokeWidth,
    lyricsBgBarEnabled,
    lyricsBgBarColor,
    lyricsBgBarOpacity,
    setLyricsShadowEnabled,
    setLyricsShadowColor,
    setLyricsShadowBlur,
    setLyricsStrokeEnabled,
    setLyricsStrokeColor,
    setLyricsStrokeWidth,
    setLyricsBgBarEnabled,
    setLyricsBgBarColor,
    setLyricsBgBarOpacity,
    // 歌詞フェード
    lyricsFadeEnabled,
    lyricsFadeDurationMs,
    setLyricsFadeEnabled,
    setLyricsFadeDurationMs,
    // 歌詞スケール
    lyricsScaleEnabled,
    lyricsScaleFrom,
    lyricsScaleDurationMs,
    setLyricsScaleEnabled,
    setLyricsScaleFrom,
    setLyricsScaleDurationMs,
    // 歌詞スライド
    lyricsSlideEnabled,
    lyricsSlideAmount,
    lyricsSlideDurationMs,
    setLyricsSlideEnabled,
    setLyricsSlideAmount,
    setLyricsSlideDurationMs,
    // 歌詞スライドイン/アウト
    lyricsSlideInEnabled,
    lyricsSlideInDirection,
    lyricsSlideOutEnabled,
    lyricsSlideOutDirection,
    lyricsSlideInOutDurationMs,
    setLyricsSlideInEnabled,
    setLyricsSlideInDirection,
    setLyricsSlideOutEnabled,
    setLyricsSlideOutDirection,
    setLyricsSlideInOutDurationMs,
    // 歌詞ブラーイン/アウト
    lyricsBlurEnabled,
    lyricsBlurAmount,
    lyricsBlurDurationMs,
    setLyricsBlurEnabled,
    setLyricsBlurAmount,
    setLyricsBlurDurationMs,
    // 歌詞ワイプイン/アウト
    lyricsWipeInEnabled,
    lyricsWipeInDirection,
    lyricsWipeOutEnabled,
    lyricsWipeOutDirection,
    lyricsWipeDurationMs,
    setLyricsWipeInEnabled,
    setLyricsWipeInDirection,
    setLyricsWipeOutEnabled,
    setLyricsWipeOutDirection,
    setLyricsWipeDurationMs,
    // 歌詞バウンスイン/アウト
    lyricsBounceInEnabled,
    lyricsBounceInDirection,
    lyricsBounceOutEnabled,
    lyricsBounceOutDirection,
    lyricsBounceInOutDurationMs,
    setLyricsBounceInEnabled,
    setLyricsBounceInDirection,
    setLyricsBounceOutEnabled,
    setLyricsBounceOutDirection,
    setLyricsBounceInOutDurationMs,
    // 歌詞スタガー
    lyricsStaggerEnabled,
    lyricsStaggerIntervalMs,
    setLyricsStaggerEnabled,
    setLyricsStaggerIntervalMs,
    // アニメーションプレビュー
    isAnimPreviewPlaying,
    startAnimPreview,
    stopAnimPreview,
    // pianoroll
    pianorollEnabled,
    setPianorollEnabled,
    pianorollColorTheme,
    setPianorollColorTheme,
    pianorollThemeMode,
    setPianorollThemeMode,
    applyPianorollThemeToOutside,
    pianorollLayout: effectivePianorollLayout,
    setPianorollLayout,
    waveformEnabled,
    setWaveformEnabled,
    waveformType,
    setWaveformType,
    waveformDrawMethod,
    setWaveformDrawMethod,
    waveformFftShape,
    setWaveformFftShape,
    waveformFftGaugeShape,
    setWaveformFftGaugeShape,
    waveformColor,
    setWaveformColor,
    waveformColorMode,
    setWaveformColorMode,
    waveformOpacity,
    setWaveformOpacity,
    waveformXPercent,
    setWaveformXPercent,
    waveformYPercent,
    setWaveformYPercent,
    waveformRotation,
    setWaveformRotation,
    waveformWidthPercent,
    setWaveformWidthPercent,
    waveformHeightPercent,
    setWaveformHeightPercent,
    waveformStartAngle,
    setWaveformStartAngle,
    waveformRotationSpeed,
    setWaveformRotationSpeed,
    waveformWindowSize,
    setWaveformWindowSize,
    waveformStrokeWidthPx,
    setWaveformStrokeWidthPx,
    waveformFftBinCount,
    setWaveformFftBinCount,
    waveformFftSize,
    setWaveformFftSize,
    waveformFftGaugeSegments,
    setWaveformFftGaugeSegments,
    waveformFftIconShape,
    setWaveformFftIconShape,
    waveformFftIconStrengthMode,
    setWaveformFftIconStrengthMode,
    waveformFftIconSizePercent,
    setWaveformFftIconSizePercent,
    waveformFftIconGlowStrength,
    setWaveformFftIconGlowStrength,
    waveformFftIconEmitStrength,
    setWaveformFftIconEmitStrength,
    isWaveformSinePreviewPlaying,
    startWaveformSinePreview,
    stopWaveformSinePreview,
  };
};
