import { Box, Typography } from "@mui/material";
import Slider from "@mui/material/Slider";
import React from "react";
import { useTranslation } from "react-i18next";
import { SliderUIProp } from "../../types/batchProcess";

/**
 * BatchProcessにおけるUI自動生成で使用するスライダー
 */
export const BatchProcessSlider: React.FC<BatchProcessSliderProps> = ({
  config,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const marks = [
    { value: config.min, label: config.min.toString() },
    { value: config.max, label: config.max.toString() },
  ];
  return (
    <Box sx={{ m: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        {t(config.labelKey)}
      </Typography>
      <Slider
        value={value}
        step={config.step}
        min={config.min}
        max={config.max}
        valueLabelDisplay="auto"
        onChange={(e, newValue) => {
          onChange(config.key, newValue as number);
        }}
        marks={marks}
        sx={{ mx: 1 }}
      />
    </Box>
  );
};

export interface BatchProcessSliderProps {
  config: SliderUIProp;
  value: number;
  onChange: (key: string, value: number) => void;
}
