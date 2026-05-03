import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Collapse,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FONT_SIZE_SLIDER_MAX,
  FONT_SIZE_SLIDER_MIN,
  LYRICS_SHADOW_BLUR_MAX,
  LYRICS_SHADOW_BLUR_MIN,
  LYRICS_STROKE_WIDTH_MAX,
  LYRICS_STROKE_WIDTH_MIN,
  TEXT_POSITION_MAX,
  TEXT_POSITION_MIN,
} from "../../../config/videoExport";
import { LabeledSlider } from "./LabeledSlider";
import { TextStyleToolbar } from "./TextStyleToolbar";

type Props = {
  sectionTitleKey: string;
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  xPercent: number;
  yPercent: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  bgBarEnabled: boolean;
  bgBarColor: string;
  bgBarOpacity: number;
  onTextChange: (v: string) => void;
  onFontSizeChange: (v: number) => void;
  onBoldItalicChange: (bold: boolean, italic: boolean) => void;
  onColorChange: (v: string) => void;
  onXPercentChange: (v: number) => void;
  onYPercentChange: (v: number) => void;
  onShadowEnabledChange: (v: boolean) => void;
  onShadowColorChange: (v: string) => void;
  onShadowBlurChange: (v: number) => void;
  onStrokeEnabledChange: (v: boolean) => void;
  onStrokeColorChange: (v: string) => void;
  onStrokeWidthChange: (v: number) => void;
  onBgBarEnabledChange: (v: boolean) => void;
  onBgBarColorChange: (v: string) => void;
  onBgBarOpacityChange: (v: number) => void;
};

export const TextOverlaySection: React.FC<Props> = ({
  sectionTitleKey,
  text,
  fontSize,
  bold,
  italic,
  color,
  xPercent,
  yPercent,
  shadowEnabled,
  shadowColor,
  shadowBlur,
  strokeEnabled,
  strokeColor,
  strokeWidth,
  bgBarEnabled,
  bgBarColor,
  bgBarOpacity,
  onTextChange,
  onFontSizeChange,
  onBoldItalicChange,
  onColorChange,
  onXPercentChange,
  onYPercentChange,
  onShadowEnabledChange,
  onShadowColorChange,
  onShadowBlurChange,
  onStrokeEnabledChange,
  onStrokeColorChange,
  onStrokeWidthChange,
  onBgBarEnabledChange,
  onBgBarColorChange,
  onBgBarOpacityChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Divider sx={{ fontSize: "0.75rem" }}>{t(sectionTitleKey)}</Divider>
      <TextField
        size="small"
        fullWidth
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        inputProps={{
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") e.preventDefault();
          },
        }}
      />
      <TextStyleToolbar
        bold={bold}
        italic={italic}
        color={color}
        onBoldItalicChange={onBoldItalicChange}
        onColorChange={onColorChange}
      />
      <LabeledSlider
        label={t("editor.videoExport.textFontSize")}
        value={fontSize}
        onChange={onFontSizeChange}
        min={FONT_SIZE_SLIDER_MIN}
        max={FONT_SIZE_SLIDER_MAX}
        unit="px"
        valueMinWidth={44}
      />
      <LabeledSlider
        label={t("editor.videoExport.textPositionX")}
        value={xPercent}
        onChange={onXPercentChange}
        min={TEXT_POSITION_MIN}
        max={TEXT_POSITION_MAX}
        valueMinWidth={44}
      />
      <LabeledSlider
        label={t("editor.videoExport.textPositionY")}
        value={yPercent}
        onChange={onYPercentChange}
        min={TEXT_POSITION_MIN}
        max={TEXT_POSITION_MAX}
        valueMinWidth={44}
      />

      {/* 文字装飾 Accordion */}
      <Accordion
        disableGutters
        defaultExpanded={false}
        sx={{
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">
            {t("editor.videoExport.textDecoration")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}
        >
          {/* シャドウ */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={shadowEnabled}
                onChange={(e) => onShadowEnabledChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {t("editor.videoExport.textShadow")}
              </Typography>
            }
          />
          <Collapse in={shadowEnabled} unmountOnExit>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {t("editor.videoExport.textShadowColor")}
                </Typography>
                <Box
                  component="input"
                  type="color"
                  value={shadowColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onShadowColorChange(e.target.value)
                  }
                  sx={{
                    width: 32,
                    height: 28,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
              <LabeledSlider
                label={t("editor.videoExport.textShadowBlur")}
                value={shadowBlur}
                onChange={onShadowBlurChange}
                min={LYRICS_SHADOW_BLUR_MIN}
                max={LYRICS_SHADOW_BLUR_MAX}
                unit="px"
                valueMinWidth={34}
              />
            </Box>
          </Collapse>

          {/* 縁取り */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={strokeEnabled}
                onChange={(e) => onStrokeEnabledChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {t("editor.videoExport.textStroke")}
              </Typography>
            }
          />
          <Collapse in={strokeEnabled} unmountOnExit>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {t("editor.videoExport.textStrokeColor")}
                </Typography>
                <Box
                  component="input"
                  type="color"
                  value={strokeColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onStrokeColorChange(e.target.value)
                  }
                  sx={{
                    width: 32,
                    height: 28,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
              <LabeledSlider
                label={t("editor.videoExport.textStrokeWidth")}
                value={strokeWidth}
                onChange={onStrokeWidthChange}
                min={LYRICS_STROKE_WIDTH_MIN}
                max={LYRICS_STROKE_WIDTH_MAX}
                unit="px"
                valueMinWidth={34}
              />
            </Box>
          </Collapse>

          {/* 背景バー */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={bgBarEnabled}
                onChange={(e) => onBgBarEnabledChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {t("editor.videoExport.textBgBar")}
              </Typography>
            }
          />
          <Collapse in={bgBarEnabled} unmountOnExit>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {t("editor.videoExport.textBgBarColor")}
                </Typography>
                <Box
                  component="input"
                  type="color"
                  value={bgBarColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onBgBarColorChange(e.target.value)
                  }
                  sx={{
                    width: 32,
                    height: 28,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
              <LabeledSlider
                label={t("editor.videoExport.textBgBarOpacity")}
                value={bgBarOpacity}
                onChange={onBgBarOpacityChange}
                min={0}
                max={100}
                unit="%"
                valueMinWidth={34}
              />
            </Box>
          </Collapse>
        </AccordionDetails>
      </Accordion>
    </>
  );
};
