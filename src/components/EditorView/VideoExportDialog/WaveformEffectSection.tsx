import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PALETTE,
  WAVEFORM_ROTATION_SPEED_MAX,
  WAVEFORM_ROTATION_SPEED_MIN,
  WAVEFORM_STROKE_WIDTH_PX_MAX,
  WAVEFORM_STROKE_WIDTH_PX_MIN,
  WAVEFORM_WINDOW_SIZE_MAX,
  WAVEFORM_WINDOW_SIZE_MIN,
} from "../../../config/videoExport";
import {
  WAVEFORM_COLOR_MODES,
  WAVEFORM_DRAW_METHODS,
  WAVEFORM_TYPES,
  type WaveformColorMode,
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
  colorMode: WaveformColorMode;
  opacity: number;
  xPercent: number;
  yPercent: number;
  rotation: number;
  widthPercent: number;
  heightPercent: number;
  startAngle: number;
  rotationSpeed: number;
  windowSize: number;
  strokeWidthPx: number;
  isPreviewPlaying: boolean;
  onEnabledChange: (v: boolean) => void;
  onTypeChange: (v: WaveformType) => void;
  onDrawMethodChange: (v: WaveformDrawMethod) => void;
  onColorChange: (v: string) => void;
  onColorModeChange: (v: WaveformColorMode) => void;
  onOpacityChange: (v: number) => void;
  onXPercentChange: (v: number) => void;
  onYPercentChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onWidthPercentChange: (v: number) => void;
  onHeightPercentChange: (v: number) => void;
  onStartAngleChange: (v: number) => void;
  onRotationSpeedChange: (v: number) => void;
  onWindowSizeChange: (v: number) => void;
  onStrokeWidthPxChange: (v: number) => void;
  onStartPreview: () => void;
  onStopPreview: () => void;
};

export const WaveformEffectSection: React.FC<Props> = ({
  enabled,
  type,
  drawMethod,
  color,
  colorMode,
  opacity,
  xPercent,
  yPercent,
  rotation,
  widthPercent,
  heightPercent,
  startAngle,
  rotationSpeed,
  windowSize,
  strokeWidthPx,
  isPreviewPlaying,
  onEnabledChange,
  onTypeChange,
  onDrawMethodChange,
  onColorChange,
  onColorModeChange,
  onOpacityChange,
  onXPercentChange,
  onYPercentChange,
  onRotationChange,
  onWidthPercentChange,
  onHeightPercentChange,
  onStartAngleChange,
  onRotationSpeedChange,
  onWindowSizeChange,
  onStrokeWidthPxChange,
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
        <Accordion
          sx={{
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 1 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {t("editor.videoExport.waveformSection")}
            </Typography>
            <Tooltip
              title={
                isPreviewPlaying
                  ? t("editor.videoExport.waveformPreviewSineStop")
                  : t("editor.videoExport.waveformPreviewSine")
              }
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  isPreviewPlaying ? onStopPreview() : onStartPreview();
                }}
                sx={{ mr: 0.5 }}
              >
                {isPreviewPlaying ? (
                  <StopIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails
            sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}
          >
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
                    {t(
                      `editor.videoExport.waveformType_${wt.replace("-", "_")}`,
                    )}
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

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, mb: 0.5, display: "block" }}
            >
              {t("editor.videoExport.waveformColorMode")}
            </Typography>
            <Select
              size="small"
              fullWidth
              value={colorMode}
              onChange={(e) =>
                onColorModeChange(e.target.value as WaveformColorMode)
              }
              sx={{ bgcolor: "background.paper" }}
            >
              {WAVEFORM_COLOR_MODES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  <Typography variant="body2">
                    {t(`editor.videoExport.waveformColorMode_${mode}`)}
                  </Typography>
                </MenuItem>
              ))}
            </Select>

            <LabeledSlider
              label={t("editor.videoExport.waveformOpacity")}
              value={opacity}
              onChange={onOpacityChange}
              min={0}
              max={100}
              unit="%"
            />
            <LabeledSlider
              label={t("editor.videoExport.waveformStrokeWidth")}
              value={strokeWidthPx}
              onChange={onStrokeWidthPxChange}
              min={WAVEFORM_STROKE_WIDTH_PX_MIN}
              max={WAVEFORM_STROKE_WIDTH_PX_MAX}
              unit="px"
            />
            <LabeledSlider
              label={t("editor.videoExport.waveformX")}
              value={xPercent}
              onChange={onXPercentChange}
              min={-100}
              max={200}
              unit="%"
            />
            <LabeledSlider
              label={t("editor.videoExport.waveformY")}
              value={yPercent}
              onChange={onYPercentChange}
              min={-100}
              max={200}
              unit="%"
            />
            <LabeledSlider
              label={t("editor.videoExport.waveformRotation")}
              value={rotation}
              onChange={onRotationChange}
              min={-180}
              max={180}
              unit="°"
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
              unit=""
            />

            {type === "oscilloscope-circular" && (
              <>
                <LabeledSlider
                  label={t("editor.videoExport.waveformStartAngle")}
                  value={startAngle}
                  onChange={onStartAngleChange}
                  min={-180}
                  max={180}
                  unit="°"
                />
                <LabeledSlider
                  label={t("editor.videoExport.waveformRotationSpeed")}
                  value={rotationSpeed}
                  onChange={onRotationSpeedChange}
                  min={WAVEFORM_ROTATION_SPEED_MIN}
                  max={WAVEFORM_ROTATION_SPEED_MAX}
                  unit="°/s"
                  valueMinWidth={72}
                />
              </>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};
