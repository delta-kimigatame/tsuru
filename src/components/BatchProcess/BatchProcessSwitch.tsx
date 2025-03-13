import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import React from "react";
import { useTranslation } from "react-i18next";
import { SwitchUIProp } from "../../types/batchProcess";

/**
 * BatchProcessにおけるUI自動生成で使用するチェックボックス
 */
export const BatchProcessSwitch: React.FC<BatchProcessSwitchProps> = ({
  config,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <FormControlLabel
      control={
        <Switch
          checked={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(config.key, e.target.checked);
          }}
          inputProps={{ "aria-label": "controlled" }}
        />
      }
      label={t(config.labelKey)}
    />
  );
};

export interface BatchProcessSwitchProps {
  config: SwitchUIProp;
  value: boolean;
  onChange: (key: string, value: boolean) => void;
}
