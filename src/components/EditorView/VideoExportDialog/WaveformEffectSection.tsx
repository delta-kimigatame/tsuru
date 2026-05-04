import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PALETTE,
  WAVEFORM_ROTATION_SPEED_MAX,
  WAVEFORM_ROTATION_SPEED_MIN,
  WAVEFORM_WINDOW_SIZE_MAX,
  WAVEFORM_WINDOW_SIZE_MIN,
} from "../../../config/videoExport";
import {
  WAVEFORM_DRAW_METHODS,
  WAVEFORM_TYPES,
  type WaveformDrawMethod,
  type WaveformType,
} from "../../../utils/waveformEffect";
import { ColorHexInput } from "./ColorHexInput";
import { ColorPaletteGrid } from "./ColorPaletteGrid";
import { LabeledSlider } from "./LabeledSlider";

type Props = {
  enabled: boolean;
  type: WaveformType;
  drawMethod: WaveformDrawMethod;
  color: string;
  opacity: number;
  xPercent: number;
  yPercent: number;
  rotation: number;
  widthPercent: number;
  heightPercent: number;
  startAngle: number;
  rotationSpeed: number;
  windowSize: number;
  isPreviewPlaying: boolean;
  onEnabledChange: (v: boolean) => void;
  onTypeChange: (v: WaveformType) => void;
  onDrawMethodChange: (v: WaveformDrawMethod) => void;
  onColorChange: (v: string) => void;
  onOpacityChange: (v: number) => void;
  onXPercentChange: (v: number) => void;
  onYPercentChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onWidthPercentChange: (v: number) => void;
  onHeightPercentChange: (v: number) => void;
  onStartAngleChange: (v: number) => void;
  onRotationSpeedChange: (v: number) => void;
  onWindowSizeChange: (v: number) => void;
  onStartPreview: () => void;
  onStopPreview: () => void;
};

export const WaveformEffectSection: React.FC<Props> = ({
  enabled,
  type,
  drawMethod,
  color,
  opacity,
  xPercent,
  yPercent,
  rotation,
  widthPercent,
  heightPercent,
  startAngle,
  rotationSpeed,
  windowSize,
  isPreviewPlaying,
  onEnabledChange,
  onTypeChange,
  onDrawMethodChange,
  onColorChange,
  onOpacityChange,
  onXPercentChange,
  onYPercentChange,
  onRotationChange,
  onWidthPercentChange,
  onHeightPercentChange,
  onStartAngleChange,
  onRotationSpeedChange,
  onWindowSizeChange,
  onStartPreview,
  onStopPreview,
}) => {
  const { t } = useTranslation();
  const [colorInput, setColorInput] = useState(color);

  const handleColorInputChange = (raw: string) => {
    setColorInput(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      onColorChange(raw);
    }
  };

  const handleColorSelect = (c: string) => {
    setColorInput(c);
    onColorChange(c);
  };

  return (
    <Box
      sx={{
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        p: 1.5,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(144,202,249,0.08)"
            : "rgba(25,118,210,0.06)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <GraphicEqIcon fontSize="small" color="primary" />
        <Typography
          variant="subtitle2"
          color="primary"
          fontWeight="bold"
          sx={{ letterSpacing: "0.01em" }}
        >
          {t("editor.videoExport.waveformSection")}
        </Typography>
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2">
            {t("editor.videoExport.waveformEnable")}
          </Typography>
        }
      />

      {enabled && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.waveformType")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={type}
            onChange={(e) => onTypeChange(e.target.value as WaveformType)}
            sx={{ bgcolor: "background.paper" }}
          >
            {WAVEFORM_TYPES.map((wt) => (
              <MenuItem key={wt} value={wt}>
                <Typography variant="body2">
                  {t(`editor.videoExport.waveformType_${wt.replace("-", "_")}`)}
                </Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.waveformDrawMethod")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={drawMethod}
            onChange={(e) =>
              onDrawMethodChange(e.target.value as WaveformDrawMethod)
            }
            sx={{ bgcolor: "background.paper" }}
          >
            {WAVEFORM_DRAW_METHODS.map((dm) => (
              <MenuItem key={dm} value={dm}>
                <Typography variant="body2">
                  {t(`editor.videoExport.waveformDrawMethod_${dm}`)}
                </Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.waveformColor")}
          </Typography>
          <ColorPaletteGrid
            palette={PALETTE}
            activeColor={color}
            onColorSelect={handleColorSelect}
          />
          <ColorHexInput
            colorInput={colorInput}
            bgColor={color}
            onChange={handleColorInputChange}
          />

          <LabeledSlider
            label={t("editor.videoExport.waveformOpacity")}
            value={opacity}
            onChange={onOpacityChange}
            min={0}
            max={100}
            unit="%"
          />
          <LabeledSlider
            label={t("editor.videoExport.waveformX")}
            value={xPercent}
            onChange={onXPercentChange}
            min={0}
            max={100}
            unit="%"
          />
          <LabeledSlider
            label={t("editor.videoExport.waveformY")}
            value={yPercent}
            onChange={onYPercentChange}
            min={0}
            max={100}
            unit="%"
          />
          <LabeledSlider
            label={t("editor.videoExport.waveformRotation")}
            value={rotation}
            onChange={onRotationChange}
            min={-180}
            max={180}
            unit="deg"
          />
          <LabeledSlider
            label={t("editor.videoExport.waveformWidth")}
            value={widthPercent}
            onChange={onWidthPercentChange}
            min={1}
            max={100}
            unit="%"
          />
          <LabeledSlider
            label={t("editor.videoExport.waveformHeight")}
            value={heightPercent}
            onChange={onHeightPercentChange}
            min={1}
            max={100}
            unit="%"
          />
          <LabeledSlider
            label={t("editor.videoExport.waveformWindowSize")}
            value={windowSize}
            onChange={onWindowSizeChange}
            min={WAVEFORM_WINDOW_SIZE_MIN}
            max={WAVEFORM_WINDOW_SIZE_MAX}
            step={256}
          />

          {type === "oscilloscope-circular" && (
            <>
              <LabeledSlider
                label={t("editor.videoExport.waveformStartAngle")}
                value={startAngle}
                onChange={onStartAngleChange}
                min={-180}
                max={180}
                unit="deg"
              />
              <LabeledSlider
                label={t("editor.videoExport.waveformRotationSpeed")}
                value={rotationSpeed}
                onChange={onRotationSpeedChange}
                min={WAVEFORM_ROTATION_SPEED_MIN}
                max={WAVEFORM_ROTATION_SPEED_MAX}
                unit="deg/s"
                valueMinWidth={72}
              />
            </>
          )}

          <Button
            variant="contained"
            color={isPreviewPlaying ? "error" : "primary"}
            size="small"
            fullWidth
            sx={{ mt: 1.25 }}
            onClick={isPreviewPlaying ? onStopPreview : onStartPreview}
          >
            {isPreviewPlaying
              ? t("editor.videoExport.waveformPreviewSineStop")
              : t("editor.videoExport.waveformPreviewSine")}
          </Button>
        </Box>
      )}
    </Box>
  );
};
