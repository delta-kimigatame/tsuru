import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { SelectUIProp } from "../../types/batchProcess";

/**
 * BatchProcessにおけるUI自動生成で使用するセレクトボックス
 */
export const BatchProcessSelect: React.FC<BatchProcessSelectProps> = ({
  config,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <FormControl fullWidth sx={{ m: 1 }}>
      <InputLabel>{t(config.labelKey)}</InputLabel>
      <Select
        label={t(config.labelKey)}
        variant="filled"
        defaultValue={config.defaultValue}
        value={value}
        onChange={(e) => {
          onChange(config.key, e.target.value);
        }}
      >
        {config.options.map((o, i) => (
          <MenuItem value={o}>{config.displayOptionKey[i]}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export interface BatchProcessSelectProps {
  config: SelectUIProp;
  value: string;
  onChange: (key: string, value: string) => void;
}
