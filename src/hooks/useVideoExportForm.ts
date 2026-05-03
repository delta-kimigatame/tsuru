import React from "react";
import { useTranslation } from "react-i18next";
import {
  BG_MAX_HEIGHT,
  BG_MAX_WIDTH,
  DEFAULT_BG_COLOR,
  DEFAULT_BG_IMAGE_OPACITY,
  DEFAULT_BG_SIZE,
  DEFAULT_LYRICS_BG_BAR_COLOR,
  DEFAULT_LYRICS_BG_BAR_ENABLED,
  DEFAULT_LYRICS_BG_BAR_OPACITY,
  DEFAULT_LYRICS_COLOR,
  DEFAULT_LYRICS_FADE_DURATION_MS,
  DEFAULT_LYRICS_FADE_ENABLED,
  DEFAULT_LYRICS_FONT_SIZE,
  DEFAULT_LYRICS_MAX_WIDTH_PERCENT,
  DEFAULT_LYRICS_SHADOW_BLUR,
  DEFAULT_LYRICS_SHADOW_COLOR,
  DEFAULT_LYRICS_SHADOW_ENABLED,
  DEFAULT_LYRICS_STROKE_COLOR,
  DEFAULT_LYRICS_STROKE_ENABLED,
  DEFAULT_LYRICS_STROKE_WIDTH,
  DEFAULT_LYRICS_Y_PERCENT,
  DEFAULT_MAIN_TEXT_BOLD,
  DEFAULT_MAIN_TEXT_COLOR,
  DEFAULT_MAIN_TEXT_FONT_SIZE,
  DEFAULT_MAIN_TEXT_ITALIC,
  DEFAULT_MAIN_TEXT_X,
  DEFAULT_MAIN_TEXT_Y,
  DEFAULT_PADDING_MODE,
  DEFAULT_PORTRAIT_OPACITY,
  DEFAULT_PORTRAIT_SCALE_PERCENT,
  DEFAULT_PORTRAIT_SHOW,
  DEFAULT_PORTRAIT_X_OFFSET,
  DEFAULT_PORTRAIT_Y_OFFSET,
  DEFAULT_SUB_TEXT_BOLD,
  DEFAULT_SUB_TEXT_COLOR,
  DEFAULT_SUB_TEXT_FONT_SIZE,
  DEFAULT_SUB_TEXT_ITALIC,
  DEFAULT_SUB_TEXT_X,
  DEFAULT_SUB_TEXT_Y,
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
import {
  FONT_STACK,
  extractLyricsSegments,
  type BgPaddingMode,
  type LyricsOptions,
  type LyricsSegment,
  type PortraitOptions,
  type TextOptions,
  type VideoResolution,
} from "../utils/videoExport";

type Options = {
  onClose: () => void;
  onConfirm: (
    imageFile: File,
    resolution: VideoResolution,
    bgPaddingMode: BgPaddingMode,
    bgColor: string,
    bgImageOpacity: number,
    portraitOptions: PortraitOptions | null,
    mainTextOptions: TextOptions | null,
    subTextOptions: TextOptions | null,
    lyricsOptions: LyricsOptions | null,
  ) => void;
  portraitBlob?: Blob | null;
  portraitNaturalHeight?: number;
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
    notes,
    notesLeftMs,
    selectNotesIndex,
  } = options;
  const { t } = useTranslation();

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

  // -----------------------------------------------------------------------

  const applyColor = (hex: string) => {
    setBgColor(hex);
    setColorInput(hex);
  };

  const handleColorInputChange = React.useCallback((v: string) => {
    setColorInput(v);
    if (HEX_RE.test(v)) setBgColor(v);
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
    );
    const subTextOptions = buildTextOptions(
      subText,
      subTextFontSize,
      subTextBold,
      subTextItalic,
      subTextColor,
      subTextX,
      subTextY,
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
          }
        : null;

    if (imageFile) {
      onConfirm(
        imageFile,
        bgSize,
        bgPaddingMode,
        bgColor,
        bgImageOpacity,
        portraitOptions,
        mainTextOptions,
        subTextOptions,
        lyricsOptions,
      );
      return;
    }
    // 単色背景を Canvas で生成して File に変換。画像なしなので mode = "color" に固定
    const [w, h] = bgSize.split("x").map(Number);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      onConfirm(
        new File([blob], "background.png", { type: "image/png" }),
        bgSize,
        "color",
        bgColor,
        100,
        portraitOptions,
        mainTextOptions,
        subTextOptions,
        lyricsOptions,
      );
    }, "image/png");
  };

  // ダイアログが閉じられたら状態をリセット
  React.useEffect(() => {
    if (!open) {
      clearImage();
      applyColor(DEFAULT_BG_COLOR);
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
      setSubText(t("editor.videoExport.subTextDefault"));
      setSubTextFontSize(DEFAULT_SUB_TEXT_FONT_SIZE);
      setSubTextX(DEFAULT_SUB_TEXT_X);
      setSubTextY(DEFAULT_SUB_TEXT_Y);
      setSubTextColor(DEFAULT_SUB_TEXT_COLOR);
      setSubTextBold(DEFAULT_SUB_TEXT_BOLD);
      setSubTextItalic(DEFAULT_SUB_TEXT_ITALIC);
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

  // エクスポートプレビューをキャンバスにレンダリング
  React.useEffect(() => {
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

    let outW = 0;
    let outH = 0;
    if (bgSize !== "image") {
      [outW, outH] = bgSize.split("x").map(Number);
    }

    const draw = (img: HTMLImageElement | null) => {
      if (bgSize === "image" && img) {
        const s = Math.min(
          1,
          BG_MAX_WIDTH / img.naturalWidth,
          BG_MAX_HEIGHT / img.naturalHeight,
        );
        outW = Math.round(img.naturalWidth * s);
        outH = Math.round(img.naturalHeight * s);
      }

      const prevScale = Math.min(PREVIEW_MAX_W / outW, PREVIEW_MAX_H / outH);
      const pw = Math.round(outW * prevScale);
      const ph = Math.round(outH * prevScale);
      canvas.width = pw;
      canvas.height = ph;
      ctx.clearRect(0, 0, pw, ph);

      if (bgSize === "image") {
        ctx.drawImage(img!, 0, 0, pw, ph);
        return;
      }

      const imgW = img?.naturalWidth ?? 0;
      const imgH = img?.naturalHeight ?? 0;

      // 背景レイヤー: 常に bgColor を最背面に描画
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, pw, ph);

      if (img && bgPaddingMode !== "color") {
        const bgSc = Math.max(pw / imgW, ph / imgH);
        if (bgPaddingMode === "blur") {
          const blurPx = Math.max(1, Math.round(20 * prevScale));
          ctx.filter = `blur(${blurPx}px)`;
        }
        ctx.globalAlpha = bgImageOpacity / 100;
        ctx.drawImage(
          img,
          (pw - imgW * bgSc) / 2,
          (ph - imgH * bgSc) / 2,
          imgW * bgSc,
          imgH * bgSc,
        );
        ctx.globalAlpha = 1;
        ctx.filter = "none";
      }

      // 前景レイヤー（contain・拡大なし）
      if (img) {
        const fgSc = Math.min(1, outW / imgW, outH / imgH) * prevScale;
        const fgW = imgW * fgSc;
        const fgH = imgH * fgSc;
        ctx.drawImage(img, (pw - fgW) / 2, (ph - fgH) / 2, fgW, fgH);
      }

      // 立絵レイヤー
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

      // テキストレイヤー
      const drawTextLayer = (
        text: string,
        fontSize: number,
        bold: boolean,
        italic: boolean,
        color: string,
        xPercent: number,
        yPercent: number,
      ) => {
        if (!text.trim()) return;
        const scaledSize = Math.max(1, Math.round(fontSize * prevScale));
        ctx.save();
        ctx.font = `${italic ? "italic" : "normal"} ${bold ? "bold" : "normal"} ${scaledSize}px ${FONT_STACK}`;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 1;
        ctx.fillText(text, (pw * xPercent) / 100, (ph * yPercent) / 100);
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
      );
      drawTextLayer(
        subText,
        subTextFontSize,
        subTextBold,
        subTextItalic,
        subTextColor,
        subTextX,
        subTextY,
      );

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
    bgSize,
    bgPaddingMode,
    bgColor,
    bgImageOpacity,
    showPortrait,
    portraitImage,
    portraitOpacity,
    portraitScalePercent,
    portraitXOffset,
    portraitYOffset,
    mainText,
    mainTextFontSize,
    mainTextBold,
    mainTextItalic,
    mainTextColor,
    mainTextX,
    mainTextY,
    subText,
    subTextFontSize,
    subTextBold,
    subTextItalic,
    subTextColor,
    subTextX,
    subTextY,
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

  return {
    // refs
    fileInputRef,
    previewCanvasRef,
    // background
    imageFile,
    imagePreviewUrl,
    bgColor,
    colorInput,
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
    handleColorInputChange,
    handleMainBoldItalicChange,
    handleSubBoldItalicChange,
    // setters
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
    setSubText,
    setSubTextFontSize,
    setSubTextX,
    setSubTextY,
    setSubTextColor,
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
  };
};
