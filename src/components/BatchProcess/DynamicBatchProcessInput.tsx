import React from "react";
import { UIProp } from "../../types/batchProcess";
import { BatchProcessCheckBox } from "./BatchProcessCheckBox";
import { BatchProcessSelect } from "./BatchProcessSelect";
import { BatchProcessSlider } from "./BatchProcessSlider";
import { BatchProcessSwitch } from "./BatchProcessSwitch";
import { BatchProcessTextBoxNumber } from "./BatchProcessTextBoxNumber";
import { BatchProcessTextBoxString } from "./BatchProcessTextBoxString";

/**
 * UIPropsにあわせて適切なフォーム部品を返すためのコンポーネント
 */
export const DynamicBatchProcessInput: React.FC<
  DynamicBatchProcessInputProps
> = ({ config, value, onChange }) => {
  switch (config.inputType) {
    case "checkbox":
      return (
        <BatchProcessCheckBox
          config={config}
          value={value as boolean}
          onChange={onChange}
        />
      );
    case "switch":
      return (
        <BatchProcessSwitch
          config={config}
          value={value as boolean}
          onChange={onChange}
        />
      );
    case "select":
      return (
        <BatchProcessSelect
          config={config}
          value={value as string}
          onChange={onChange}
        />
      );
    case "textbox-string":
      return (
        <BatchProcessTextBoxString
          config={config}
          value={value as string}
          onChange={onChange}
        />
      );
    case "textbox-number":
      return (
        <BatchProcessTextBoxNumber
          config={config}
          value={value as number}
          onChange={onChange}
        />
      );
    case "slider":
      return (
        <BatchProcessSlider
          config={config}
          value={value as number}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
};

export interface DynamicBatchProcessInputProps {
  config: UIProp;
  value: number | string | boolean;
  onChange: (key: string, value: number | string | boolean) => void;
}
