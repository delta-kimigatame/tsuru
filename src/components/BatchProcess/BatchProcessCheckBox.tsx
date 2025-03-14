import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import React from "react";
import { useTranslation } from "react-i18next";
import { CheckboxUIProp } from "../../types/batchProcess";

/**
 * BatchProcessにおけるUI自動生成で使用するチェックボックス
 */
export const BatchProcessCheckBox: React.FC<BatchProcessCheckBoxProps> = ({
  config,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange(config.key, e.target.checked);
            }}
          />
        }
        label={t(config.labelKey)}
      />
      <br />
    </>
  );
};

export interface BatchProcessCheckBoxProps {
  config: CheckboxUIProp;
  value: boolean;
  onChange: (key: string, value: boolean) => void;
}
