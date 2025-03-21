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
      <InputLabel>
        {t(config.labelKey, { returnObjects: true }) as Array<string>}
      </InputLabel>
      <Select
        label={t(config.labelKey)}
        variant="filled"
        defaultValue={config.defaultValue}
        value={
          typeof config.defaultValue === "number" && value !== undefined
            ? value.toString()
            : value
        }
        onChange={(e) => {
          onChange(
            config.key,
            typeof config.defaultValue === "number"
              ? Number(e.target.value)
              : e.target.value
          );
        }}
      >
        {config.options.map((o, i) => (
          <MenuItem value={o}>
            {
              (
                t(config.displayOptionKey, {
                  returnObjects: true,
                }) as Array<string>
              )[i]
            }
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export interface BatchProcessSelectProps {
  config: SelectUIProp;
  value: string | number;
  onChange: (key: string, value: string | number) => void;
}
