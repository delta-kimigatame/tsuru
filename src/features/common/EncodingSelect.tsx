import * as React from "react";

import { MenuItem } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { EncodingOption } from "../../utils/EncodingMapping";

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
    LOG.debug("change", "EncodingSelect");
    LOG.info(`エンコードの変更：${e.target.value}`, "EncodingSelect");
    props.setValue(e.target.value as EncodingOption);
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
        <MenuItem value={EncodingOption.UTF8}>UTF-8</MenuItem>
        <MenuItem value={EncodingOption.SHIFT_JIS}>Shift-JIS</MenuItem>
        <MenuItem value={EncodingOption.GB18030}>GB18030</MenuItem>
        <MenuItem value={EncodingOption.GBK}>GBK</MenuItem>
        <MenuItem value={EncodingOption.BIG5}>BIG5</MenuItem>
      </Select>
    </FormControl>
  );
};

export interface EncodingSelectProps {
  /**
   * 現在選択されている文字コード。textdecoderが引数としてとれる形の文字コード
   */
  value: EncodingOption;
  /**
   * 文字コードの状態を更新するためのコールバック
   */
  setValue: React.Dispatch<React.SetStateAction<EncodingOption>>;
  /**
   * 操作可否を指定する。zipの再読み込み中は操作不可にする。
   */
  disabled: boolean;
}
