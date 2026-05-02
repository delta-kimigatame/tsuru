import ClearIcon from "@mui/icons-material/Clear";
import ImageIcon from "@mui/icons-material/Image";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BG_PADDING_MODES,
  VIDEO_RESOLUTIONS,
  type BgPaddingMode,
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
  ) => void;
  synthesisProgress: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const VideoExportDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  synthesisProgress,
}) => {
  const { t } = useTranslation();

  // 画像
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 背景色
  const [bgColor, setBgColor] = React.useState<string>(DEFAULT_COLOR);
  const [colorInput, setColorInput] = React.useState<string>(DEFAULT_COLOR);

  // 解像度（常に使用）
  const [bgSize, setBgSize] = React.useState<VideoResolution>(DEFAULT_BG_SIZE);

  // パディングモード（画像あり・固定解像度時のみ有効）
  const [bgPaddingMode, setBgPaddingMode] =
    React.useState<BgPaddingMode>(DEFAULT_PADDING_MODE);

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
    if (imageFile) {
      onConfirm(imageFile, bgSize, bgPaddingMode, bgColor);
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
