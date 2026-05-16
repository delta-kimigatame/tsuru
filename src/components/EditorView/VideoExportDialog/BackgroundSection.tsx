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
import {
  BACKGROUND_PATTERN_GAP_MAX,
  BACKGROUND_PATTERN_GAP_MIN,
  BACKGROUND_PATTERN_ROTATION_MAX,
  BACKGROUND_PATTERN_ROTATION_MIN,
  BACKGROUND_PATTERN_SIZE_MAX,
  BACKGROUND_PATTERN_SIZE_MIN,
  PALETTE,
} from "../../../config/videoExport";
import {
  BACKGROUND_STYLES,
  BG_PADDING_MODES,
  type BackgroundStyle,
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
  backgroundStyle: BackgroundStyle;
  onBackgroundStyleChange: (style: BackgroundStyle) => void;
  bgColor: string;
  secondaryColor: string;
  secondaryOpacity: number;
  colorInput: string;
  secondaryColorInput: string;
  onColorInputChange: (v: string) => void;
  onSecondaryColorInputChange: (v: string) => void;
  onColorApply: (hex: string) => void;
  onSecondaryColorApply: (hex: string) => void;
  onSecondaryOpacityChange: (v: number) => void;
  patternSize: number;
  onPatternSizeChange: (v: number) => void;
  patternGap: number;
  onPatternGapChange: (v: number) => void;
  patternRotation: number;
  onPatternRotationChange: (v: number) => void;
  bgSize: VideoResolution;
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
  backgroundStyle,
  onBackgroundStyleChange,
  bgColor,
  secondaryColor,
  secondaryOpacity,
  colorInput,
  secondaryColorInput,
  onColorInputChange,
  onSecondaryColorInputChange,
  onColorApply,
  onSecondaryColorApply,
  onSecondaryOpacityChange,
  patternSize,
  onPatternSizeChange,
  patternGap,
  onPatternGapChange,
  patternRotation,
  onPatternRotationChange,
  bgSize,
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
          fullWidth
          variant="contained"
          color="primary"
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
        {t("editor.videoExport.backgroundStyleSection")}
      </Divider>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption">
          {t("editor.videoExport.backgroundStyle")}
        </Typography>
        <Select
          size="small"
          value={backgroundStyle}
          onChange={(e) =>
            onBackgroundStyleChange(e.target.value as BackgroundStyle)
          }
          sx={{ minWidth: 180, fontSize: "0.8rem" }}
        >
          {BACKGROUND_STYLES.map((style) => (
            <MenuItem key={style} value={style}>
              {t(`editor.videoExport.backgroundStyle_${style}`)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* 第1色 */}
      <Typography variant="caption">
        {t("editor.videoExport.backgroundPrimaryColor")}
      </Typography>
      <ColorPaletteGrid
        palette={PALETTE}
        activeColor={bgColor}
        onColorSelect={onColorApply}
      />
      <ColorHexInput
        colorInput={colorInput}
        bgColor={bgColor}
        onChange={onColorInputChange}
      />

      {backgroundStyle !== "solid" && (
        <>
          <Typography variant="caption">
            {t("editor.videoExport.backgroundSecondaryColor")}
          </Typography>
          <ColorPaletteGrid
            palette={PALETTE}
            activeColor={secondaryColor}
            onColorSelect={onSecondaryColorApply}
          />
          <ColorHexInput
            colorInput={secondaryColorInput}
            bgColor={secondaryColor}
            onChange={onSecondaryColorInputChange}
          />
          <LabeledSlider
            label={t("editor.videoExport.backgroundSecondaryOpacity")}
            value={secondaryOpacity}
            onChange={onSecondaryOpacityChange}
            min={0}
            max={100}
          />
          <LabeledSlider
            label={t("editor.videoExport.backgroundPatternSize")}
            value={patternSize}
            onChange={onPatternSizeChange}
            min={BACKGROUND_PATTERN_SIZE_MIN}
            max={BACKGROUND_PATTERN_SIZE_MAX}
            unit="px"
            valueMinWidth={52}
          />
          <LabeledSlider
            label={t("editor.videoExport.backgroundPatternGap")}
            value={patternGap}
            onChange={onPatternGapChange}
            min={BACKGROUND_PATTERN_GAP_MIN}
            max={BACKGROUND_PATTERN_GAP_MAX}
            unit="px"
            valueMinWidth={52}
          />
          <LabeledSlider
            label={t("editor.videoExport.backgroundPatternRotation")}
            value={patternRotation}
            onChange={onPatternRotationChange}
            min={BACKGROUND_PATTERN_ROTATION_MIN}
            max={BACKGROUND_PATTERN_ROTATION_MAX}
            unit="deg"
            valueMinWidth={64}
          />
        </>
      )}

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
