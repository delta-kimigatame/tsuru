import * as React from "react";

import { MenuItem } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";

/**
 * LoadVBDialog内において、zipを解凍する際の文字コードを選択するためのセレクトボックス。
 * zipを読み込んでいる最中は変更できないようにする。
 * @param props
 */
export const EncodingSelect: React.FC<EncodingSelectProps> = (props) => {
  const { t } = useTranslation();

  /**
   * セレクトボックスを変更した際の処理。
   * props.setValueを用いて親コンポーネントに選択した文字コードを返す
   * @param e
   */
  const handleChange = (e: SelectChangeEvent) => {
    props.setValue(e.target.value);
  };
  return (
    <FormControl fullWidth sx={{ m: 1 }}>
      <InputLabel>{t("loadVBDialog.encoding")}</InputLabel>
      <Select
        label={t("loadVBDialog.encoding")}
        variant="filled"
        defaultValue=""
        value={props.value}
        onChange={handleChange}
        disabled={props.disabled}
        data-testid="encoding-select"
      >
        <MenuItem value={"utf-8"}>UTF-8</MenuItem>
        <MenuItem value={"Shift-Jis"}>Shift-JIS</MenuItem>
      </Select>
    </FormControl>
  );
};

export interface EncodingSelectProps {
  /**
   * 現在選択されている文字コード。textdecoderが引数としてとれる形の文字コード
   */
  value: string;
  /**
   * 文字コードの状態を更新するためのコールバック
   */
  setValue: React.Dispatch<React.SetStateAction<string>>;
  /**
   * 操作可否を指定する。zipの再読み込み中は操作不可にする。
   */
  disabled: boolean;
}
