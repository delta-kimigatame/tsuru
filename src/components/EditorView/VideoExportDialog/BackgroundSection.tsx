import ClearIcon from "@mui/icons-material/Clear";
import ImageIcon from "@mui/icons-material/Image";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BACKGROUND_GRADIENT_ANGLE_MAX,
  BACKGROUND_GRADIENT_ANGLE_MIN,
  BACKGROUND_GRADIENT_POSITION_MAX,
  BACKGROUND_GRADIENT_POSITION_MIN,
  BACKGROUND_GRADIENT_STRENGTH_MAX,
  BACKGROUND_GRADIENT_STRENGTH_MIN,
  BACKGROUND_GRADIENT_TYPES,
  BACKGROUND_NOISE_INTENSITY_MAX,
  BACKGROUND_NOISE_INTENSITY_MIN,
  BACKGROUND_PATTERN_GAP_MAX,
  BACKGROUND_PATTERN_GAP_MIN,
  BACKGROUND_PATTERN_ROTATION_MAX,
  BACKGROUND_PATTERN_ROTATION_MIN,
  BACKGROUND_PATTERN_SIZE_MAX,
  BACKGROUND_PATTERN_SIZE_MIN,
  BACKGROUND_SEED_MAX,
  BACKGROUND_SEED_MIN,
  PALETTE,
} from "../../../config/videoExport";
import {
  BACKGROUND_STYLES,
  BG_PADDING_MODES,
  type BackgroundGradientType,
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
  noiseIntensity: number;
  onNoiseIntensityChange: (v: number) => void;
  seed: number;
  onSeedChange: (v: number) => void;
  gradientEnabled: boolean;
  onGradientEnabledChange: (v: boolean) => void;
  gradientType: BackgroundGradientType;
  onGradientTypeChange: (v: BackgroundGradientType) => void;
  gradientAngleDeg: number;
  onGradientAngleDegChange: (v: number) => void;
  gradientStartPercent: number;
  onGradientStartPercentChange: (v: number) => void;
  gradientEndPercent: number;
  onGradientEndPercentChange: (v: number) => void;
  gradientStrengthPercent: number;
  onGradientStrengthPercentChange: (v: number) => void;
  movementEnabled: boolean;
  onMovementEnabledChange: (v: boolean) => void;
  moveXPerFrame: number;
  onMoveXPerFrameChange: (v: number) => void;
  moveYPerFrame: number;
  onMoveYPerFrameChange: (v: number) => void;
  isMovementPreviewPlaying: boolean;
  onStartMovementPreview: () => void;
  onStopMovementPreview: () => void;
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
  noiseIntensity,
  onNoiseIntensityChange,
  seed,
  onSeedChange,
  gradientEnabled,
  onGradientEnabledChange,
  gradientType,
  onGradientTypeChange,
  gradientAngleDeg,
  onGradientAngleDegChange,
  gradientStartPercent,
  onGradientStartPercentChange,
  gradientEndPercent,
  onGradientEndPercentChange,
  gradientStrengthPercent,
  onGradientStrengthPercentChange,
  movementEnabled,
  onMovementEnabledChange,
  moveXPerFrame,
  onMoveXPerFrameChange,
  moveYPerFrame,
  onMoveYPerFrameChange,
  isMovementPreviewPlaying,
  onStartMovementPreview,
  onStopMovementPreview,
  bgSize,
  bgPaddingMode,
  onBgPaddingModeChange,
  bgImageOpacity,
  onBgImageOpacityChange,
}) => {
  const { t } = useTranslation();
  const isNoiseTextureStyle = React.useMemo(
    () =>
      [
        "starfield",
        "clouds",
        "woodgrain",
        "paper",
        "concrete",
        "stucco",
        "fabric",
        "leather",
      ].includes(backgroundStyle),
    [backgroundStyle],
  );

  return (
    <>
      {/* 画像選択 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 1 }}>
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
          {!isNoiseTextureStyle && (
            <LabeledSlider
              label={t("editor.videoExport.backgroundPatternGap")}
              value={patternGap}
              onChange={onPatternGapChange}
              min={BACKGROUND_PATTERN_GAP_MIN}
              max={BACKGROUND_PATTERN_GAP_MAX}
              unit="px"
              valueMinWidth={52}
            />
          )}
          <LabeledSlider
            label={t("editor.videoExport.backgroundPatternRotation")}
            value={patternRotation}
            onChange={onPatternRotationChange}
            min={BACKGROUND_PATTERN_ROTATION_MIN}
            max={BACKGROUND_PATTERN_ROTATION_MAX}
            unit="deg"
            valueMinWidth={64}
          />
          {isNoiseTextureStyle && (
            <>
              <LabeledSlider
                label={t("editor.videoExport.backgroundNoiseIntensity")}
                value={noiseIntensity}
                onChange={onNoiseIntensityChange}
                min={BACKGROUND_NOISE_INTENSITY_MIN}
                max={BACKGROUND_NOISE_INTENSITY_MAX}
                unit="%"
                valueMinWidth={52}
              />
              <LabeledSlider
                label={t("editor.videoExport.backgroundSeed")}
                value={seed}
                onChange={onSeedChange}
                min={BACKGROUND_SEED_MIN}
                max={BACKGROUND_SEED_MAX}
                valueMinWidth={52}
              />
            </>
          )}
          <Stack spacing={1.25}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                p: 1,
                backgroundColor: "action.hover",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={gradientEnabled}
                    onChange={(e) => onGradientEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.backgroundGradientEnable")}
                  </Typography>
                }
              />

              {gradientEnabled && (
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption">
                      {t("editor.videoExport.backgroundGradientType")}
                    </Typography>
                    <Select
                      size="small"
                      value={gradientType}
                      onChange={(e) =>
                        onGradientTypeChange(
                          e.target.value as BackgroundGradientType,
                        )
                      }
                      sx={{ minWidth: 140, fontSize: "0.8rem" }}
                    >
                      {BACKGROUND_GRADIENT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {t(
                            `editor.videoExport.backgroundGradientType_${type}`,
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <LabeledSlider
                    label={t("editor.videoExport.backgroundGradientAngle")}
                    value={gradientAngleDeg}
                    onChange={onGradientAngleDegChange}
                    min={BACKGROUND_GRADIENT_ANGLE_MIN}
                    max={BACKGROUND_GRADIENT_ANGLE_MAX}
                    unit="deg"
                    valueMinWidth={64}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.backgroundGradientStart")}
                    value={gradientStartPercent}
                    onChange={onGradientStartPercentChange}
                    min={BACKGROUND_GRADIENT_POSITION_MIN}
                    max={BACKGROUND_GRADIENT_POSITION_MAX}
                    unit="%"
                    valueMinWidth={52}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.backgroundGradientEnd")}
                    value={gradientEndPercent}
                    onChange={onGradientEndPercentChange}
                    min={BACKGROUND_GRADIENT_POSITION_MIN}
                    max={BACKGROUND_GRADIENT_POSITION_MAX}
                    unit="%"
                    valueMinWidth={52}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.backgroundGradientStrength")}
                    value={gradientStrengthPercent}
                    onChange={onGradientStrengthPercentChange}
                    min={BACKGROUND_GRADIENT_STRENGTH_MIN}
                    max={BACKGROUND_GRADIENT_STRENGTH_MAX}
                    unit="%"
                    valueMinWidth={52}
                  />
                </Stack>
              )}
            </Box>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                p: 1,
                backgroundColor: "action.hover",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={movementEnabled}
                    onChange={(e) => onMovementEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.backgroundMove")}
                  </Typography>
                }
              />

              {movementEnabled && (
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  <LabeledSlider
                    label={t("editor.videoExport.backgroundMoveX")}
                    value={moveXPerFrame}
                    onChange={onMoveXPerFrameChange}
                    min={-20}
                    max={20}
                    unit="px/f"
                    valueMinWidth={64}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.backgroundMoveY")}
                    value={moveYPerFrame}
                    onChange={onMoveYPerFrameChange}
                    min={-20}
                    max={20}
                    unit="px/f"
                    valueMinWidth={64}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant={
                        isMovementPreviewPlaying ? "outlined" : "contained"
                      }
                      color="primary"
                      startIcon={
                        isMovementPreviewPlaying ? (
                          <StopIcon />
                        ) : (
                          <PlayArrowIcon />
                        )
                      }
                      onClick={
                        isMovementPreviewPlaying
                          ? onStopMovementPreview
                          : onStartMovementPreview
                      }
                    >
                      {isMovementPreviewPlaying
                        ? t("editor.videoExport.backgroundMovePreviewStop")
                        : t("editor.videoExport.backgroundMovePreview")}
                    </Button>
                  </Box>
                </Stack>
              )}
            </Box>
          </Stack>
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
