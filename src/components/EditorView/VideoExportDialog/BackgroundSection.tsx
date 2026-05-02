import ClearIcon from "@mui/icons-material/Clear";
import ImageIcon from "@mui/icons-material/Image";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PALETTE } from "../../../config/videoExport";
import {
  BG_PADDING_MODES,
  VIDEO_RESOLUTIONS,
  type BgPaddingMode,
  type VideoResolution,
} from "../../../utils/videoExport";
import { ColorHexInput } from "./ColorHexInput";
import { ColorPaletteGrid } from "./ColorPaletteGrid";
import { LabeledSlider } from "./LabeledSlider";

type Props = {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  bgColor: string;
  colorInput: string;
  onColorInputChange: (v: string) => void;
  onColorApply: (hex: string) => void;
  bgSize: VideoResolution;
  onBgSizeChange: (s: VideoResolution) => void;
  bgPaddingMode: BgPaddingMode;
  onBgPaddingModeChange: (m: BgPaddingMode) => void;
  bgImageOpacity: number;
  onBgImageOpacityChange: (v: number) => void;
};

export const BackgroundSection: React.FC<Props> = ({
  imageFile,
  imagePreviewUrl,
  fileInputRef,
  onFileChange,
  onClearImage,
  bgColor,
  colorInput,
  onColorInputChange,
  onColorApply,
  bgSize,
  onBgSizeChange,
  bgPaddingMode,
  onBgPaddingModeChange,
  bgImageOpacity,
  onBgImageOpacityChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* 画像選択 */}
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
          <IconButton size="small" onClick={onClearImage}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onFileChange}
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

      {/* カラーパレット */}
      <ColorPaletteGrid
        palette={PALETTE}
        activeColor={imageFile ? null : bgColor}
        onColorSelect={onColorApply}
      />

      {/* Hex 入力 + スウォッチ */}
      <ColorHexInput
        colorInput={colorInput}
        bgColor={bgColor}
        onChange={onColorInputChange}
      />

      {/* 解像度選択 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption">
          {t("editor.videoExport.bgSize")}
        </Typography>
        <Select
          size="small"
          value={bgSize}
          onChange={(e) => onBgSizeChange(e.target.value as VideoResolution)}
          sx={{ fontSize: "0.8rem" }}
        >
          {VIDEO_RESOLUTIONS.map((s) => (
            <MenuItem key={s} value={s} disabled={s === "image" && !imageFile}>
              {s === "image" ? t("editor.videoExport.bgSizeImage") : s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* パディングモード（画像あり かつ 固定解像度時のみ） */}
      {imageFile && bgSize !== "image" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption">
            {t("editor.videoExport.bgPadding")}
          </Typography>
          <Select
            size="small"
            value={bgPaddingMode}
            onChange={(e) =>
              onBgPaddingModeChange(e.target.value as BgPaddingMode)
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

      {/* 背景画像の不透明度（image/blur モード時のみ） */}
      {imageFile && bgSize !== "image" && bgPaddingMode !== "color" && (
        <LabeledSlider
          label={t("editor.videoExport.bgImageOpacity")}
          value={bgImageOpacity}
          onChange={onBgImageOpacityChange}
          min={0}
          max={100}
        />
      )}
    </>
  );
};
