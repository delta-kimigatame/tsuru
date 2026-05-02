import { Checkbox, Divider, FormControlLabel, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PORTRAIT_OFFSET_MAX } from "../../../config/videoExport";
import { LabeledSlider } from "./LabeledSlider";

type Props = {
  showPortrait: boolean;
  portraitOpacity: number;
  portraitScalePercent: number;
  portraitXOffset: number;
  portraitYOffset: number;
  portraitMaxScale: number;
  portraitXOffsetMin: number;
  portraitYOffsetMin: number;
  onShowPortraitChange: (v: boolean) => void;
  onPortraitOpacityChange: (v: number) => void;
  onPortraitScaleChange: (v: number) => void;
  onPortraitXOffsetChange: (v: number) => void;
  onPortraitYOffsetChange: (v: number) => void;
};

export const PortraitSection: React.FC<Props> = ({
  showPortrait,
  portraitOpacity,
  portraitScalePercent,
  portraitXOffset,
  portraitYOffset,
  portraitMaxScale,
  portraitXOffsetMin,
  portraitYOffsetMin,
  onShowPortraitChange,
  onPortraitOpacityChange,
  onPortraitScaleChange,
  onPortraitXOffsetChange,
  onPortraitYOffsetChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Divider sx={{ fontSize: "0.75rem" }}>
        {t("editor.videoExport.portraitSection")}
      </Divider>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={showPortrait}
            onChange={(e) => onShowPortraitChange(e.target.checked)}
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
          <LabeledSlider
            label={t("editor.videoExport.portraitOpacity")}
            value={portraitOpacity}
            onChange={onPortraitOpacityChange}
            min={0}
            max={100}
          />
          <LabeledSlider
            label={t("editor.videoExport.portraitScale")}
            value={portraitScalePercent}
            onChange={onPortraitScaleChange}
            min={0}
            max={portraitMaxScale}
            valueMinWidth={44}
          />
          <LabeledSlider
            label={t("editor.videoExport.portraitOffsetX")}
            value={portraitXOffset}
            onChange={onPortraitXOffsetChange}
            min={portraitXOffsetMin}
            max={PORTRAIT_OFFSET_MAX}
            valueMinWidth={44}
          />
          <LabeledSlider
            label={t("editor.videoExport.portraitOffsetY")}
            value={portraitYOffset}
            onChange={onPortraitYOffsetChange}
            min={portraitYOffsetMin}
            max={PORTRAIT_OFFSET_MAX}
            valueMinWidth={44}
          />
        </>
      )}
    </>
  );
};
