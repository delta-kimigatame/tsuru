import PianoIcon from "@mui/icons-material/Piano";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  PIANOROLL_VIDEO_FPS_OPTIONS,
  PIANOROLL_VIDEO_HORIZONTAL_ZOOM_STEPS,
  PIANOROLL_VIDEO_LAYOUTS,
  PIANOROLL_VIDEO_VERTICAL_ZOOM_STEPS,
} from "../../../config/pianoroll";
import { colors, type ColorTheme } from "../../../types/colorTheme";
import {
  type PianorollVideoLayout,
  type VoiceColorLegendPosition,
} from "../../../utils/pianorollVideo";

type Props = {
  enabled: boolean;
  layout: PianorollVideoLayout;
  colorTheme: ColorTheme;
  themeMode: "light" | "dark";
  horizontalZoom: number;
  verticalZoom: number;
  fps: number;
  extraContentWhenEnabled?: React.ReactNode;
  onEnabledChange: (v: boolean) => void;
  onLayoutChange: (v: PianorollVideoLayout) => void;
  onColorThemeChange: (v: ColorTheme) => void;
  onThemeModeChange: (v: "light" | "dark") => void;
  onHorizontalZoomChange: (v: number) => void;
  onVerticalZoomChange: (v: number) => void;
  onFpsChange: (v: number) => void;
  onApplyThemeToOutside: () => void;
  showKeyboard: boolean;
  showBackground: boolean;
  voiceColorEnabled: boolean;
  voiceColorLegendEnabled: boolean;
  voiceColorLegendPosition: VoiceColorLegendPosition;
  voiceColorLegendXPercent: number;
  voiceColorLegendYPercent: number;
  voiceColorLegendScale: number;
  voiceColors: string[];
  defaultVoiceColorMap: Record<string, string>;
  voiceColorMap: Record<string, string>;
  onShowKeyboardChange: (v: boolean) => void;
  onShowBackgroundChange: (v: boolean) => void;
  onVoiceColorEnabledChange: (v: boolean) => void;
  onVoiceColorLegendEnabledChange: (v: boolean) => void;
  onVoiceColorLegendPositionChange: (v: VoiceColorLegendPosition) => void;
  onVoiceColorLegendXPercentChange: (v: number) => void;
  onVoiceColorLegendYPercentChange: (v: number) => void;
  onVoiceColorLegendScaleChange: (v: number) => void;
  onVoiceColorMapChange: (key: string, color: string) => void;
  currentNoteInfoEnabled: boolean;
  currentNoteInfoShowVelocity: boolean;
  currentNoteInfoShowFlags: boolean;
  currentNoteInfoShowIntensity: boolean;
  onCurrentNoteInfoEnabledChange: (v: boolean) => void;
  onCurrentNoteInfoShowVelocityChange: (v: boolean) => void;
  onCurrentNoteInfoShowFlagsChange: (v: boolean) => void;
  onCurrentNoteInfoShowIntensityChange: (v: boolean) => void;
  currentNoteInfoPosition: VoiceColorLegendPosition;
  currentNoteInfoXPercent: number;
  currentNoteInfoYPercent: number;
  currentNoteInfoScale: number;
  onCurrentNoteInfoPositionChange: (v: VoiceColorLegendPosition) => void;
  onCurrentNoteInfoXPercentChange: (v: number) => void;
  onCurrentNoteInfoYPercentChange: (v: number) => void;
  onCurrentNoteInfoScaleChange: (v: number) => void;
};

const LAYOUT_OPTIONS: PianorollVideoLayout[] = [...PIANOROLL_VIDEO_LAYOUTS];

export const PianorollSection: React.FC<Props> = ({
  enabled,
  layout,
  colorTheme,
  themeMode,
  horizontalZoom,
  verticalZoom,
  fps,
  extraContentWhenEnabled,
  onEnabledChange,
  onLayoutChange,
  onColorThemeChange,
  onThemeModeChange,
  onHorizontalZoomChange,
  onVerticalZoomChange,
  onFpsChange,
  onApplyThemeToOutside,
  showKeyboard,
  showBackground,
  voiceColorEnabled,
  voiceColorLegendEnabled,
  voiceColorLegendPosition,
  voiceColorLegendXPercent,
  voiceColorLegendYPercent,
  voiceColorLegendScale,
  voiceColors,
  defaultVoiceColorMap,
  voiceColorMap,
  onShowKeyboardChange,
  onShowBackgroundChange,
  onVoiceColorEnabledChange,
  onVoiceColorLegendEnabledChange,
  onVoiceColorLegendPositionChange,
  onVoiceColorLegendXPercentChange,
  onVoiceColorLegendYPercentChange,
  onVoiceColorLegendScaleChange,
  onVoiceColorMapChange,
  currentNoteInfoEnabled,
  currentNoteInfoShowVelocity,
  currentNoteInfoShowFlags,
  currentNoteInfoShowIntensity,
  onCurrentNoteInfoEnabledChange,
  onCurrentNoteInfoShowVelocityChange,
  onCurrentNoteInfoShowFlagsChange,
  onCurrentNoteInfoShowIntensityChange,
  currentNoteInfoPosition,
  currentNoteInfoXPercent,
  currentNoteInfoYPercent,
  currentNoteInfoScale,
  onCurrentNoteInfoPositionChange,
  onCurrentNoteInfoXPercentChange,
  onCurrentNoteInfoYPercentChange,
  onCurrentNoteInfoScaleChange,
}) => {
  const { t } = useTranslation();

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
        <PianoIcon fontSize="small" color="primary" />
        <Typography
          variant="subtitle2"
          color="primary"
          fontWeight="bold"
          sx={{ letterSpacing: "0.01em" }}
        >
          {t("editor.videoExport.pianorollSection")}
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
            {t("editor.videoExport.pianorollEnable")}
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
            {t("editor.videoExport.pianorollLayout")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={layout}
            onChange={(e) =>
              onLayoutChange(e.target.value as PianorollVideoLayout)
            }
            sx={{ bgcolor: "background.paper" }}
          >
            {LAYOUT_OPTIONS.map((l) => (
              <MenuItem key={l} value={l}>
                <Typography variant="body2">
                  {t(`editor.videoExport.pianorollLayout_${l}`)}
                </Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.pianorollHorizontalZoom")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={horizontalZoom}
            onChange={(e) => onHorizontalZoomChange(Number(e.target.value))}
            sx={{ bgcolor: "background.paper" }}
          >
            {PIANOROLL_VIDEO_HORIZONTAL_ZOOM_STEPS.map((zoom) => (
              <MenuItem key={zoom} value={zoom}>
                <Typography variant="body2">{`${zoom}x`}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.pianorollVerticalZoom")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={verticalZoom}
            onChange={(e) => onVerticalZoomChange(Number(e.target.value))}
            sx={{ bgcolor: "background.paper" }}
          >
            {PIANOROLL_VIDEO_VERTICAL_ZOOM_STEPS.map((zoom) => (
              <MenuItem key={zoom} value={zoom}>
                <Typography variant="body2">{`${zoom}x`}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.pianorollFps")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={fps}
            onChange={(e) => onFpsChange(Number(e.target.value))}
            sx={{ bgcolor: "background.paper" }}
          >
            {PIANOROLL_VIDEO_FPS_OPTIONS.map((value) => (
              <MenuItem key={value} value={value}>
                <Typography variant="body2">
                  {t(`editor.videoExport.pianorollFps_${value}`)}
                </Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.pianorollColorTheme")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={colorTheme}
            onChange={(e) => onColorThemeChange(e.target.value as ColorTheme)}
            sx={{ bgcolor: "background.paper" }}
          >
            {colors.map((c) => (
              <MenuItem key={c} value={c}>
                <Typography variant="body2">{t(`colorTheme.${c}`)}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.25, mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.pianorollThemeMode")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={themeMode}
            onChange={(e) =>
              onThemeModeChange(e.target.value as "light" | "dark")
            }
            sx={{ bgcolor: "background.paper" }}
          >
            <MenuItem value="light">
              <Typography variant="body2">{t("theme.light")}</Typography>
            </MenuItem>
            <MenuItem value="dark">
              <Typography variant="body2">{t("theme.dark")}</Typography>
            </MenuItem>
          </Select>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showKeyboard}
                onChange={(e) => onShowKeyboardChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {t("editor.videoExport.pianorollShowKeyboard")}
              </Typography>
            }
            sx={{ mt: 1.25, mb: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showBackground}
                onChange={(e) => onShowBackgroundChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {t("editor.videoExport.pianorollShowBackground")}
              </Typography>
            }
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={voiceColorEnabled}
                onChange={(e) => onVoiceColorEnabledChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {t("editor.videoExport.pianorollVoiceColorEnabled")}
              </Typography>
            }
            sx={{ mb: 1.25 }}
          />

          {voiceColorEnabled && (
            <Box sx={{ mb: 1.25, ml: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={voiceColorLegendEnabled}
                    onChange={(e) =>
                      onVoiceColorLegendEnabledChange(e.target.checked)
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.voiceColorLegendEnabled")}
                  </Typography>
                }
                sx={{ mb: voiceColorLegendEnabled ? 1 : 0 }}
              />

              {voiceColorLegendEnabled && (
                <Stack spacing={1.25} sx={{ pl: 2 }}>
                  <Box>
                    <InputLabel shrink sx={{ fontSize: 12, mb: 0.5 }}>
                      {t("editor.videoExport.voiceColorLegendXPercent")}
                    </InputLabel>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Slider
                        value={voiceColorLegendXPercent}
                        onChange={(_, value) =>
                          onVoiceColorLegendXPercentChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        min={0}
                        max={100}
                        step={1}
                        size="small"
                        valueLabelDisplay="auto"
                        sx={{ flex: 1 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 44 }}>
                        {voiceColorLegendXPercent.toFixed(0)}%
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <InputLabel shrink sx={{ fontSize: 12, mb: 0.5 }}>
                      {t("editor.videoExport.voiceColorLegendYPercent")}
                    </InputLabel>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Slider
                        value={voiceColorLegendYPercent}
                        onChange={(_, value) =>
                          onVoiceColorLegendYPercentChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        min={0}
                        max={100}
                        step={1}
                        size="small"
                        valueLabelDisplay="auto"
                        sx={{ flex: 1 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 44 }}>
                        {voiceColorLegendYPercent.toFixed(0)}%
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <InputLabel shrink sx={{ fontSize: 12, mb: 0.5 }}>
                      {t("editor.videoExport.voiceColorLegendScale")}
                    </InputLabel>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Slider
                        value={voiceColorLegendScale}
                        onChange={(_, value) =>
                          onVoiceColorLegendScaleChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        min={0.2}
                        max={5}
                        step={0.1}
                        size="small"
                        valueLabelDisplay="auto"
                        sx={{ flex: 1 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 36 }}>
                        {voiceColorLegendScale.toFixed(1)}x
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {voiceColors.length > 0 && (
                <Stack spacing={0.75} sx={{ mt: 1.25 }}>
                  {voiceColors.map((voiceColor) => {
                    const displayLabel =
                      voiceColor === ""
                        ? t("editor.videoExport.voiceColorDefault")
                        : voiceColor;
                    const colorValue =
                      voiceColorMap[voiceColor] ??
                      defaultVoiceColorMap[voiceColor] ??
                      "#000000";
                    return (
                      <Stack
                        key={voiceColor || "__default__"}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <input
                          type="color"
                          value={colorValue}
                          onChange={(e) =>
                            onVoiceColorMapChange(voiceColor, e.target.value)
                          }
                          style={{
                            width: 32,
                            height: 24,
                            border: "none",
                            borderRadius: 2,
                            padding: 0,
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        />
                        <Typography variant="caption" sx={{ minWidth: 100 }}>
                          {displayLabel}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Box>
          )}

          {/* 現在再生中ノート情報セクション */}
          <Box sx={{ mb: 1.25 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={currentNoteInfoEnabled}
                  onChange={(e) =>
                    onCurrentNoteInfoEnabledChange(e.target.checked)
                  }
                />
              }
              label={
                <Typography variant="body2">
                  {t("editor.videoExport.currentNoteInfoEnabled")}
                </Typography>
              }
              sx={{ mb: currentNoteInfoEnabled ? 1 : 0 }}
            />

            {currentNoteInfoEnabled && (
              <Stack spacing={0.75} sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={currentNoteInfoShowVelocity}
                      onChange={(e) =>
                        onCurrentNoteInfoShowVelocityChange(e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("editor.videoExport.currentNoteInfoShowVelocity")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={currentNoteInfoShowFlags}
                      onChange={(e) =>
                        onCurrentNoteInfoShowFlagsChange(e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("editor.videoExport.currentNoteInfoShowFlags")}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={currentNoteInfoShowIntensity}
                      onChange={(e) =>
                        onCurrentNoteInfoShowIntensityChange(e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("editor.videoExport.currentNoteInfoShowIntensity")}
                    </Typography>
                  }
                />

                <Box>
                  <InputLabel shrink sx={{ fontSize: 12, mb: 0.5 }}>
                    {t("editor.videoExport.currentNoteInfoXPercent")}
                  </InputLabel>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Slider
                      value={currentNoteInfoXPercent}
                      onChange={(_, value) =>
                        onCurrentNoteInfoXPercentChange(
                          Array.isArray(value) ? value[0] : value,
                        )
                      }
                      min={0}
                      max={100}
                      step={1}
                      size="small"
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 44 }}>
                      {currentNoteInfoXPercent.toFixed(0)}%
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <InputLabel shrink sx={{ fontSize: 12, mb: 0.5 }}>
                    {t("editor.videoExport.currentNoteInfoYPercent")}
                  </InputLabel>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Slider
                      value={currentNoteInfoYPercent}
                      onChange={(_, value) =>
                        onCurrentNoteInfoYPercentChange(
                          Array.isArray(value) ? value[0] : value,
                        )
                      }
                      min={0}
                      max={100}
                      step={1}
                      size="small"
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 44 }}>
                      {currentNoteInfoYPercent.toFixed(0)}%
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <InputLabel shrink sx={{ fontSize: 12, mb: 0.5 }}>
                    {t("editor.videoExport.currentNoteInfoScale")}
                  </InputLabel>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Slider
                      value={currentNoteInfoScale}
                      onChange={(_, value) =>
                        onCurrentNoteInfoScaleChange(
                          Array.isArray(value) ? value[0] : value,
                        )
                      }
                      min={0.2}
                      max={5}
                      step={0.1}
                      size="small"
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 36 }}>
                      {currentNoteInfoScale.toFixed(1)}x
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="small"
            fullWidth
            sx={{ mt: 1.25 }}
            onClick={onApplyThemeToOutside}
          >
            {t("editor.videoExport.applyPianorollThemeToOutside")}
          </Button>

          {extraContentWhenEnabled && (
            <Box sx={{ mt: 1.25 }}>{extraContentWhenEnabled}</Box>
          )}
        </Box>
      )}
    </Box>
  );
};
