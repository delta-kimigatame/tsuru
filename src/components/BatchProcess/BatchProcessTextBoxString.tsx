import { TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { TextBoxStringUIProp } from "../../types/batchProcess";

/**
 * BatchProcessにおけるUI自動生成で使用する文字列を扱うテキストボックス
 */
export const BatchProcessTextBoxString: React.FC<
  BatchProcessTextBoxStringProps
> = ({ config, value, onChange }) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      variant="outlined"
      sx={{
        m: 1,
      }}
      type="text"
      label={t(config.labelKey)}
      value={value}
      onChange={(e) => onChange(config.key, e.target.value)}
    />
  );
};

export interface BatchProcessTextBoxStringProps {
  config: TextBoxStringUIProp;
  value: string;
  onChange: (key: string, value: string) => void;
}
