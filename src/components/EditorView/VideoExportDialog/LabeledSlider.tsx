import { Box, Slider, Typography } from "@mui/material";
import React from "react";

type Props = {
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** 値表示部分の最小幅（monospace テキスト用） */
  valueMinWidth?: number;
};

export const LabeledSlider: React.FC<Props> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "%",
  valueMinWidth = 36,
}) => (
  <Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 0.5,
      }}
    >
      <Typography variant="caption">{label}</Typography>
      <Typography
        variant="caption"
        sx={{
          fontFamily: "monospace",
          minWidth: valueMinWidth,
          textAlign: "right",
        }}
      >
        {value}
        {unit}
      </Typography>
    </Box>
    <Slider
      size="small"
      value={value}
      onChange={(_e, v) => onChange(v as number)}
      min={min}
      max={max}
      step={step}
      sx={{ mx: 1, width: "calc(100% - 16px)" }}
    />
  </Box>
);
