import { Divider, TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FONT_SIZE_SLIDER_MAX,
  FONT_SIZE_SLIDER_MIN,
  TEXT_POSITION_MAX,
  TEXT_POSITION_MIN,
} from "../../../config/videoExport";
import type { TextAlign } from "../../../utils/videoExport";
import { LabeledSlider } from "./LabeledSlider";
import { TextStyleToolbar } from "./TextStyleToolbar";

type Props = {
  sectionTitleKey: string;
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: TextAlign;
  color: string;
  xPercent: number;
  yPercent: number;
  onTextChange: (v: string) => void;
  onFontSizeChange: (v: number) => void;
  onBoldItalicChange: (bold: boolean, italic: boolean) => void;
  onAlignChange: (align: TextAlign) => void;
  onColorChange: (v: string) => void;
  onXPercentChange: (v: number) => void;
  onYPercentChange: (v: number) => void;
};

export const TextOverlaySection: React.FC<Props> = ({
  sectionTitleKey,
  text,
  fontSize,
  bold,
  italic,
  align,
  color,
  xPercent,
  yPercent,
  onTextChange,
  onFontSizeChange,
  onBoldItalicChange,
  onAlignChange,
  onColorChange,
  onXPercentChange,
  onYPercentChange,
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
        align={align}
        color={color}
        onBoldItalicChange={onBoldItalicChange}
        onAlignChange={onAlignChange}
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
    </>
  );
};
