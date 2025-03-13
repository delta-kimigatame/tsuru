import { TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { TextBoxNumberUIProp } from "../../types/batchProcess";

/**
 * BatchProcessにおけるUI自動生成で使用する数値を扱うテキストボックス
 */
export const BatchProcessTextBoxNumber: React.FC<
  BatchProcessTextBoxNumberProps
> = ({ config, value, onChange }) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      variant="outlined"
      sx={{
        m: 1,
      }}
      type="number"
      label={t(config.labelKey)}
      value={value}
      onChange={(e) => onChange(config.key, Number(e.target.value))}
      slotProps={{
        htmlInput: {
          min: config.min,
          max: config.max,
        },
      }}
    />
  );
};

export interface BatchProcessTextBoxNumberProps {
  config: TextBoxNumberUIProp;
  value: number;
  onChange: (key: string, value: number) => void;
}
