import ClearIcon from "@mui/icons-material/Clear";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import ImageIcon from "@mui/icons-material/Image";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BG_PADDING_MODES,
  FONT_STACK,
  VIDEO_RESOLUTIONS,
  type BgPaddingMode,
  type PortraitOptions,
  type TextAlign,
  type TextOptions,
  type VideoResolution,
} from "../../utils/videoExport";

// ---------------------------------------------------------------------------
// カラーパレット生成
// ---------------------------------------------------------------------------

/** HSL（h:0-360, s:0-100, l:0-100）→ "#rrggbb" */
const hslToHex = (h: number, s: number, l: number): string => {
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
const HUES = [0, 30, 60, 120, 180, 210, 270, 330];
const LIGHTNESS = [85, 65, 45, 30, 15];
const GRAYS = ["#ffffff", "#cccccc", "#888888", "#444444", "#000000"];
/** [列][行] の 2D 配列: 0 列目がグレースケール、1〜8 列目がカラー */
const PALETTE: string[][] = [
  GRAYS,
  ...HUES.map((h) => LIGHTNESS.map((l) => hslToHex(h, 80, l))),
];

// ---------------------------------------------------------------------------
// 解像度
// ---------------------------------------------------------------------------

const DEFAULT_COLOR = "#ffffff";
const DEFAULT_BG_SIZE: VideoResolution = "1920x1080";
const DEFAULT_PADDING_MODE: BgPaddingMode = "color";
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** エクスポートプレビュー Canvas の最大サイズ */
const PREVIEW_MAX_W = 320;
const PREVIEW_MAX_H = 200;

// ---------------------------------------------------------------------------
// テキストオーバーレイのデフォルト値（調整しやすいよう定数に集約）
// ---------------------------------------------------------------------------
const DEFAULT_MAIN_TEXT_FONT_SIZE = 72;
const DEFAULT_MAIN_TEXT_X = 5;
const DEFAULT_MAIN_TEXT_Y = 85;
const DEFAULT_MAIN_TEXT_COLOR = "#ffffff";
const DEFAULT_MAIN_TEXT_BOLD = true;
const DEFAULT_MAIN_TEXT_ITALIC = false;
const DEFAULT_MAIN_TEXT_ALIGN: TextAlign = "left";

const DEFAULT_SUB_TEXT_FONT_SIZE = 36;
const DEFAULT_SUB_TEXT_X = 5;
const DEFAULT_SUB_TEXT_Y = 93;
const DEFAULT_SUB_TEXT_COLOR = "#ffffff";
const DEFAULT_SUB_TEXT_BOLD = false;
const DEFAULT_SUB_TEXT_ITALIC = false;
const DEFAULT_SUB_TEXT_ALIGN: TextAlign = "left";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
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
  ) => void;
  synthesisProgress: boolean;
  /** vb.portrait を Blob に変換したもの。立絵なしの場合は null */
  portraitBlob?: Blob | null;
  /** vb.portraitHeight */
  portraitNaturalHeight?: number;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const VideoExportDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  synthesisProgress,
  portraitBlob,
  portraitNaturalHeight,
}) => {
  const { t } = useTranslation();

  // 画像
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // 背景色
  const [bgColor, setBgColor] = React.useState<string>(DEFAULT_COLOR);
  const [colorInput, setColorInput] = React.useState<string>(DEFAULT_COLOR);

  // 解像度（常に使用）
  const [bgSize, setBgSize] = React.useState<VideoResolution>(DEFAULT_BG_SIZE);

  // パディングモード（画像あり・固定解像度時のみ有効）
  const [bgPaddingMode, setBgPaddingMode] =
    React.useState<BgPaddingMode>(DEFAULT_PADDING_MODE);

  // 背景画像の不透明度 0–100（image/blur モード時のみ有効）
  const [bgImageOpacity, setBgImageOpacity] = React.useState<number>(100);

  // 立絵設定
  const [showPortrait, setShowPortrait] = React.useState<boolean>(true);
  const [portraitOpacity, setPortraitOpacity] = React.useState<number>(100);
  const [portraitScalePercent, setPortraitScalePercent] =
    React.useState<number>(100);
  const [portraitXOffset, setPortraitXOffset] = React.useState<number>(0);
  const [portraitYOffset, setPortraitYOffset] = React.useState<number>(0);
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
  const [mainTextAlign, setMainTextAlign] = React.useState<TextAlign>(
    DEFAULT_MAIN_TEXT_ALIGN,
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
  const [subTextAlign, setSubTextAlign] = React.useState<TextAlign>(
    DEFAULT_SUB_TEXT_ALIGN,
  );

  // -----------------------------------------------------------------------

  const applyColor = (hex: string) => {
    setBgColor(hex);
    setColorInput(hex);
  };

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

  const handleClose = () => {
    clearImage();
    onClose();
  };

  const handleConfirm = () => {
    const portraitOptions: PortraitOptions | null =
      portraitBlob && showPortrait
        ? {
            blob: portraitBlob,
            naturalHeight: portraitNaturalHeight ?? 800,
            opacity: portraitOpacity,
            scalePercent: portraitScalePercent,
            xOffset: portraitXOffset,
            yOffset: portraitYOffset,
          }
        : null;

    const buildTextOptions = (
      text: string,
      fontSize: number,
      bold: boolean,
      italic: boolean,
      color: string,
      xPercent: number,
      yPercent: number,
      align: TextAlign,
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
            textAlign: align,
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
      mainTextAlign,
    );
    const subTextOptions = buildTextOptions(
      subText,
      subTextFontSize,
      subTextBold,
      subTextItalic,
      subTextColor,
      subTextX,
      subTextY,
      subTextAlign,
    );

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
      );
      return;
    }
    // 単色背景を Canvas で生成して File に変換。画像なしノードなので mode = "color" に固定
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
      );
    }, "image/png");
  };

  // ダイアログが閉じられたら状態をリセット
  React.useEffect(() => {
    if (!open) {
      clearImage();
      applyColor(DEFAULT_COLOR);
      setBgSize(DEFAULT_BG_SIZE);
      setBgPaddingMode(DEFAULT_PADDING_MODE);
      setBgImageOpacity(100);
      setShowPortrait(true);
      setPortraitOpacity(100);
      setPortraitScalePercent(100);
      setPortraitXOffset(0);
      setPortraitYOffset(0);
      setMainText(t("editor.videoExport.mainTextDefault"));
      setMainTextFontSize(DEFAULT_MAIN_TEXT_FONT_SIZE);
      setMainTextX(DEFAULT_MAIN_TEXT_X);
      setMainTextY(DEFAULT_MAIN_TEXT_Y);
      setMainTextColor(DEFAULT_MAIN_TEXT_COLOR);
      setMainTextBold(DEFAULT_MAIN_TEXT_BOLD);
      setMainTextItalic(DEFAULT_MAIN_TEXT_ITALIC);
      setMainTextAlign(DEFAULT_MAIN_TEXT_ALIGN);
      setSubText(t("editor.videoExport.subTextDefault"));
      setSubTextFontSize(DEFAULT_SUB_TEXT_FONT_SIZE);
      setSubTextX(DEFAULT_SUB_TEXT_X);
      setSubTextY(DEFAULT_SUB_TEXT_Y);
      setSubTextColor(DEFAULT_SUB_TEXT_COLOR);
      setSubTextBold(DEFAULT_SUB_TEXT_BOLD);
      setSubTextItalic(DEFAULT_SUB_TEXT_ITALIC);
      setSubTextAlign(DEFAULT_SUB_TEXT_ALIGN);
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

  // 立絵サイズスライダーの最大値（自然サイズ = drawScale 1.0 となる scalePercent）
  const portraitMaxScale = React.useMemo(() => {
    if (!portraitImage) return 200;
    let outW: number;
    let outH: number;
    if (bgSize === "image") {
      if (!imageNaturalSize) return 200;
      const s = Math.min(
        1,
        1920 / imageNaturalSize.w,
        1080 / imageNaturalSize.h,
      );
      outW = Math.round(imageNaturalSize.w * s);
      outH = Math.round(imageNaturalSize.h * s);
    } else {
      [outW, outH] = bgSize.split("x").map(Number) as [number, number];
    }
    const pNatW = portraitImage.naturalWidth;
    const pNatH = portraitImage.naturalHeight;
    const maxW = outW * 0.5;
    const maxH = Math.min(outH * 0.5, portraitNaturalHeight ?? 800);
    const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
    return Math.max(1, Math.round(100 / defaultScale));
  }, [portraitImage, bgSize, imageNaturalSize, portraitNaturalHeight]);

  // portraitMaxScale が変化したとき現在値が上限を超えていたらクランプ
  React.useEffect(() => {
    setPortraitScalePercent((prev) => Math.min(prev, portraitMaxScale));
  }, [portraitMaxScale]);

  // 立絵 X オフセットの下限（立絵が完全にキャンバス左端より左に出られる最小値）
  const portraitXOffsetMin = React.useMemo(() => {
    if (!portraitImage) return -200;
    let outW: number;
    let outH: number;
    if (bgSize === "image") {
      if (!imageNaturalSize) return -200;
      const s = Math.min(
        1,
        1920 / imageNaturalSize.w,
        1080 / imageNaturalSize.h,
      );
      outW = Math.round(imageNaturalSize.w * s);
      outH = Math.round(imageNaturalSize.h * s);
    } else {
      [outW, outH] = bgSize.split("x").map(Number) as [number, number];
    }
    const pNatW = portraitImage.naturalWidth;
    const pNatH = portraitImage.naturalHeight;
    const maxW = outW * 0.5;
    const maxH = Math.min(outH * 0.5, portraitNaturalHeight ?? 800);
    const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
    const drawScale = Math.min(
      defaultScale * (portraitScalePercent / 100),
      1.0,
    );
    if (drawScale <= 0) return -200;
    const drawW = pNatW * drawScale;
    // px + drawW <= 0 となる最小 xOffset: xOffset <= -(outW / drawW) * 100
    return -Math.ceil((outW / drawW) * 100);
  }, [
    portraitImage,
    bgSize,
    imageNaturalSize,
    portraitNaturalHeight,
    portraitScalePercent,
  ]);

  // portraitXOffsetMin が変化したとき現在値が下限を下回っていたらクランプ
  React.useEffect(() => {
    setPortraitXOffset((prev) => Math.max(prev, portraitXOffsetMin));
  }, [portraitXOffsetMin]);

  // 立絵 Y オフセットの下限（立絵が完全にキャンバス上端より上に出られる最小値）
  const portraitYOffsetMin = React.useMemo(() => {
    if (!portraitImage) return -200;
    let outW: number;
    let outH: number;
    if (bgSize === "image") {
      if (!imageNaturalSize) return -200;
      const s = Math.min(
        1,
        1920 / imageNaturalSize.w,
        1080 / imageNaturalSize.h,
      );
      outW = Math.round(imageNaturalSize.w * s);
      outH = Math.round(imageNaturalSize.h * s);
    } else {
      [outW, outH] = bgSize.split("x").map(Number) as [number, number];
    }
    const pNatW = portraitImage.naturalWidth;
    const pNatH = portraitImage.naturalHeight;
    const maxW = outW * 0.5;
    const maxH = Math.min(outH * 0.5, portraitNaturalHeight ?? 800);
    const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
    const drawScale = Math.min(
      defaultScale * (portraitScalePercent / 100),
      1.0,
    );
    if (drawScale <= 0) return -200;
    const drawH = pNatH * drawScale;
    // py + drawH <= 0 となる最小 yOffset: yOffset <= -(outH / drawH) * 100
    return -Math.ceil((outH / drawH) * 100);
  }, [
    portraitImage,
    bgSize,
    imageNaturalSize,
    portraitNaturalHeight,
    portraitScalePercent,
  ]);

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

    // "image" モードで画像がない場合は空にして終了（JSX 側で非表示）
    if (bgSize === "image" && !imagePreviewUrl) {
      canvas.width = 1;
      canvas.height = 1;
      ctx.clearRect(0, 0, 1, 1);
      return;
    }

    // 出力解像度を決定（"image" モードは画像ロード後に確定）
    let outW = 0;
    let outH = 0;
    if (bgSize !== "image") {
      [outW, outH] = bgSize.split("x").map(Number);
    }

    const draw = (img: HTMLImageElement | null) => {
      if (bgSize === "image" && img) {
        const s = Math.min(
          1,
          1920 / img.naturalWidth,
          1080 / img.naturalHeight,
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
        // 「画像サイズ」モードはそのまま描画
        ctx.drawImage(img!, 0, 0, pw, ph);
        return;
      }

      const imgW = img?.naturalWidth ?? 0;
      const imgH = img?.naturalHeight ?? 0;

      // ── 背景レイヤー: 常に bgColor を最背面に描画 ──
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, pw, ph);

      if (img && bgPaddingMode !== "color") {
        // cover スケールで背景画像を bgColor の上に重ねる
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

      // ── 前景レイヤー（contain・拡大なし）──
      if (img) {
        // 元の出力解像度基準で fgScale を計算し prevScale でプレビュースケールに変換
        const fgSc = Math.min(1, outW / imgW, outH / imgH) * prevScale;
        const fgW = imgW * fgSc;
        const fgH = imgH * fgSc;
        ctx.drawImage(img, (pw - fgW) / 2, (ph - fgH) / 2, fgW, fgH);
      }

      // ── 立絵レイヤー ──
      if (showPortrait && portraitImage) {
        const pNatW = portraitImage.naturalWidth;
        const pNatH = portraitImage.naturalHeight;
        // エディタと同じアルゴリズム: 横50%・縦min(50%,naturalHeight) の枚内に contain
        const maxW = outW * 0.5;
        const maxH = Math.min(outH * 0.5, portraitNaturalHeight ?? 800);
        const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
        // ユーザースケール適用（自然サイズ上限）、プレビュースケールに変換
        const drawScale =
          Math.min(defaultScale * (portraitScalePercent / 100), 1.0) *
          prevScale;
        const drawW = pNatW * drawScale;
        const drawH = pNatH * drawScale;
        // オフセット適用（描画サイズ基準の %、プレビューはすでに prevScale 込みの drawW/drawH）
        const px = pw - drawW + drawW * (portraitXOffset / 100);
        const py = ph - drawH + drawH * (portraitYOffset / 100);
        ctx.globalAlpha = portraitOpacity / 100;
        ctx.drawImage(portraitImage, px, py, drawW, drawH);
        ctx.globalAlpha = 1;
      }

      // ── テキストレイヤー ──
      const drawTextLayer = (
        text: string,
        fontSize: number,
        bold: boolean,
        italic: boolean,
        color: string,
        xPercent: number,
        yPercent: number,
        align: TextAlign,
      ) => {
        if (!text.trim()) return;
        const scaledSize = Math.max(1, Math.round(fontSize * prevScale));
        ctx.save();
        ctx.font = `${italic ? "italic" : "normal"} ${bold ? "bold" : "normal"} ${scaledSize}px ${FONT_STACK}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
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
        mainTextAlign,
      );
      drawTextLayer(
        subText,
        subTextFontSize,
        subTextBold,
        subTextItalic,
        subTextColor,
        subTextX,
        subTextY,
        subTextAlign,
      );
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
    mainTextAlign,
    subText,
    subTextFontSize,
    subTextBold,
    subTextItalic,
    subTextColor,
    subTextX,
    subTextY,
    subTextAlign,
  ]);

  // -----------------------------------------------------------------------

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("editor.videoExport.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* ── 画像選択 ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ImageIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("editor.videoExport.selectImage")}
            </Button>
            {imageFile && (
              <IconButton size="small" onClick={clearImage}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>

          {imagePreviewUrl && (
            <Box
              component="img"
              src={imagePreviewUrl}
              alt="preview"
              sx={{
                width: "100%",
                maxHeight: 200,
                objectFit: "contain",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            />
          )}

          <Divider sx={{ fontSize: "0.75rem" }}>
            {t("editor.videoExport.orColor")}
          </Divider>

          {/* ── カラーパレット ── */}
          <Box sx={{ display: "flex", gap: "3px" }}>
            {PALETTE.map((column, ci) => (
              <Box
                key={ci}
                sx={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                {column.map((color) => {
                  const active = !imageFile && bgColor === color;
                  return (
                    <Tooltip key={color} title={color} placement="top" arrow>
                      <Box
                        onClick={() => applyColor(color)}
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: "3px",
                          bgcolor: color,
                          cursor: "pointer",
                          border: active ? "2px solid" : "1px solid",
                          borderColor: active ? "primary.main" : "divider",
                          transition: "transform 0.1s",
                          "&:hover": { transform: "scale(1.2)" },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>

          {/* ── Hex 入力 + スウォッチ ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "4px",
                bgcolor: HEX_RE.test(colorInput) ? colorInput : bgColor,
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            />
            <TextField
              size="small"
              value={colorInput}
              onChange={(e) => {
                const v = e.target.value;
                setColorInput(v);
                if (HEX_RE.test(v)) setBgColor(v);
              }}
              inputProps={{
                maxLength: 7,
                style: { fontFamily: "monospace", fontSize: "0.85rem" },
              }}
              sx={{ width: 110 }}
            />
          </Box>

          {/* ── 解像度選択（常時表示） ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption">
              {t("editor.videoExport.bgSize")}
            </Typography>
            <Select
              size="small"
              value={bgSize}
              onChange={(e) => setBgSize(e.target.value as VideoResolution)}
              sx={{ fontSize: "0.8rem" }}
            >
              {VIDEO_RESOLUTIONS.map((s) => (
                <MenuItem
                  key={s}
                  value={s}
                  disabled={s === "image" && !imageFile}
                >
                  {s === "image" ? t("editor.videoExport.bgSizeImage") : s}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* ── パディングモード（画像あり かつ 固定解像度時のみ） ── */}
          {imageFile && bgSize !== "image" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption">
                {t("editor.videoExport.bgPadding")}
              </Typography>
              <Select
                size="small"
                value={bgPaddingMode}
                onChange={(e) =>
                  setBgPaddingMode(e.target.value as BgPaddingMode)
                }
                sx={{ fontSize: "0.8rem" }}
              >
                {BG_PADDING_MODES.map((m) => (
                  <MenuItem key={m} value={m}>
                    {t(`editor.videoExport.bgPadding_${m}`)}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* ── 背景画像の不透明度（image/blur モード時のみ） ── */}
          {imageFile && bgSize !== "image" && bgPaddingMode !== "color" && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption">
                  {t("editor.videoExport.bgImageOpacity")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    minWidth: 36,
                    textAlign: "right",
                  }}
                >
                  {bgImageOpacity}%
                </Typography>
              </Box>
              <Slider
                size="small"
                value={bgImageOpacity}
                onChange={(_e, v) => setBgImageOpacity(v as number)}
                min={0}
                max={100}
                step={1}
                sx={{ mx: 1, width: "calc(100% - 16px)" }}
              />
            </Box>
          )}

          {/* ── 立絵設定（vbが立絵ありの場合のみ） ── */}
          {portraitBlob && (
            <>
              <Divider sx={{ fontSize: "0.75rem" }}>
                {t("editor.videoExport.portraitSection")}
              </Divider>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={showPortrait}
                    onChange={(e) => setShowPortrait(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="caption">
                    {t("editor.videoExport.portraitShow")}
                  </Typography>
                }
                sx={{ ml: 0 }}
              />
              {showPortrait && (
                <>
                  {/* 不透明度 */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        {t("editor.videoExport.portraitOpacity")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          minWidth: 36,
                          textAlign: "right",
                        }}
                      >
                        {portraitOpacity}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={portraitOpacity}
                      onChange={(_e, v) => setPortraitOpacity(v as number)}
                      min={0}
                      max={100}
                      step={1}
                      sx={{ mx: 1, width: "calc(100% - 16px)" }}
                    />
                  </Box>
                  {/* サイズ */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        {t("editor.videoExport.portraitScale")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          minWidth: 44,
                          textAlign: "right",
                        }}
                      >
                        {portraitScalePercent}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={portraitScalePercent}
                      onChange={(_e, v) => setPortraitScalePercent(v as number)}
                      min={0}
                      max={portraitMaxScale}
                      step={1}
                      sx={{ mx: 1, width: "calc(100% - 16px)" }}
                    />
                  </Box>
                  {/* X オフセット */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        {t("editor.videoExport.portraitOffsetX")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          minWidth: 44,
                          textAlign: "right",
                        }}
                      >
                        {portraitXOffset}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={portraitXOffset}
                      onChange={(_e, v) => setPortraitXOffset(v as number)}
                      min={portraitXOffsetMin}
                      max={200}
                      step={1}
                      sx={{ mx: 1, width: "calc(100% - 16px)" }}
                    />
                  </Box>
                  {/* Y オフセット */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        {t("editor.videoExport.portraitOffsetY")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          minWidth: 44,
                          textAlign: "right",
                        }}
                      >
                        {portraitYOffset}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={portraitYOffset}
                      onChange={(_e, v) => setPortraitYOffset(v as number)}
                      min={portraitYOffsetMin}
                      max={200}
                      step={1}
                      sx={{ mx: 1, width: "calc(100% - 16px)" }}
                    />
                  </Box>
                </>
              )}
            </>
          )}

          {/* ── メインテキスト ── */}
          <Divider sx={{ fontSize: "0.75rem" }}>
            {t("editor.videoExport.mainTextSection")}
          </Divider>
          <TextField
            size="small"
            fullWidth
            value={mainText}
            onChange={(e) => setMainText(e.target.value)}
            inputProps={{
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") e.preventDefault();
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <ToggleButtonGroup
              size="small"
              value={[
                ...(mainTextBold ? ["bold"] : []),
                ...(mainTextItalic ? ["italic"] : []),
              ]}
              onChange={(_e, v) => {
                const f = v as string[];
                setMainTextBold(f.includes("bold"));
                setMainTextItalic(f.includes("italic"));
              }}
            >
              <ToggleButton
                value="bold"
                sx={{ fontWeight: "bold", px: 1.5, minWidth: 36 }}
              >
                B
              </ToggleButton>
              <ToggleButton
                value="italic"
                sx={{ fontStyle: "italic", px: 1.5, minWidth: 36 }}
              >
                I
              </ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mainTextAlign}
              onChange={(_e, v) => {
                if (v !== null) setMainTextAlign(v as TextAlign);
              }}
            >
              <ToggleButton value="left">
                <FormatAlignLeftIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="center">
                <FormatAlignCenterIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="right">
                <FormatAlignRightIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ flex: 1 }} />
            <Tooltip title={t("editor.videoExport.textColor")}>
              <Box
                component="input"
                type="color"
                value={mainTextColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMainTextColor(e.target.value)
                }
                sx={{
                  width: 32,
                  height: 32,
                  p: 0,
                  border: "none",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {t("editor.videoExport.textFontSize")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                {mainTextFontSize}px
              </Typography>
            </Box>
            <Slider
              size="small"
              value={mainTextFontSize}
              onChange={(_e, v) => setMainTextFontSize(v as number)}
              min={8}
              max={200}
              step={1}
              sx={{ mx: 1, width: "calc(100% - 16px)" }}
            />
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {t("editor.videoExport.textPositionX")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                {mainTextX}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={mainTextX}
              onChange={(_e, v) => setMainTextX(v as number)}
              min={0}
              max={100}
              step={1}
              sx={{ mx: 1, width: "calc(100% - 16px)" }}
            />
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {t("editor.videoExport.textPositionY")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                {mainTextY}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={mainTextY}
              onChange={(_e, v) => setMainTextY(v as number)}
              min={0}
              max={100}
              step={1}
              sx={{ mx: 1, width: "calc(100% - 16px)" }}
            />
          </Box>

          {/* ── サブテキスト ── */}
          <Divider sx={{ fontSize: "0.75rem" }}>
            {t("editor.videoExport.subTextSection")}
          </Divider>
          <TextField
            size="small"
            fullWidth
            value={subText}
            onChange={(e) => setSubText(e.target.value)}
            inputProps={{
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") e.preventDefault();
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <ToggleButtonGroup
              size="small"
              value={[
                ...(subTextBold ? ["bold"] : []),
                ...(subTextItalic ? ["italic"] : []),
              ]}
              onChange={(_e, v) => {
                const f = v as string[];
                setSubTextBold(f.includes("bold"));
                setSubTextItalic(f.includes("italic"));
              }}
            >
              <ToggleButton
                value="bold"
                sx={{ fontWeight: "bold", px: 1.5, minWidth: 36 }}
              >
                B
              </ToggleButton>
              <ToggleButton
                value="italic"
                sx={{ fontStyle: "italic", px: 1.5, minWidth: 36 }}
              >
                I
              </ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={subTextAlign}
              onChange={(_e, v) => {
                if (v !== null) setSubTextAlign(v as TextAlign);
              }}
            >
              <ToggleButton value="left">
                <FormatAlignLeftIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="center">
                <FormatAlignCenterIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="right">
                <FormatAlignRightIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ flex: 1 }} />
            <Tooltip title={t("editor.videoExport.textColor")}>
              <Box
                component="input"
                type="color"
                value={subTextColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSubTextColor(e.target.value)
                }
                sx={{
                  width: 32,
                  height: 32,
                  p: 0,
                  border: "none",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {t("editor.videoExport.textFontSize")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                {subTextFontSize}px
              </Typography>
            </Box>
            <Slider
              size="small"
              value={subTextFontSize}
              onChange={(_e, v) => setSubTextFontSize(v as number)}
              min={8}
              max={200}
              step={1}
              sx={{ mx: 1, width: "calc(100% - 16px)" }}
            />
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {t("editor.videoExport.textPositionX")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                {subTextX}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={subTextX}
              onChange={(_e, v) => setSubTextX(v as number)}
              min={0}
              max={100}
              step={1}
              sx={{ mx: 1, width: "calc(100% - 16px)" }}
            />
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {t("editor.videoExport.textPositionY")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                {subTextY}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={subTextY}
              onChange={(_e, v) => setSubTextY(v as number)}
              min={0}
              max={100}
              step={1}
              sx={{ mx: 1, width: "calc(100% - 16px)" }}
            />
          </Box>

          {/* ── エクスポートプレビュー ── */}
          {(imageFile !== null || bgSize !== "image") && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("editor.videoExport.exportPreview")}
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                }}
              >
                <canvas
                  ref={previewCanvasRef}
                  style={{ display: "block", maxWidth: "100%", height: "auto" }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={synthesisProgress}>
          {t("editor.videoExport.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={synthesisProgress || (bgSize === "image" && !imageFile)}
        >
          {t("editor.videoExport.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
