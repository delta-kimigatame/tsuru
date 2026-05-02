import { Box, TextField } from "@mui/material";
import React from "react";
import { HEX_RE } from "../../../config/videoExport";

type Props = {
  /** テキストフィールドの生入力値 */
  colorInput: string;
  /** バリデーション済みの確定色（colorInput が無効な間のスウォッチ表示に使用） */
  bgColor: string;
  onChange: (raw: string) => void;
};

export const ColorHexInput: React.FC<Props> = ({
  colorInput,
  bgColor,
  onChange,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "4px",
        bgcolor: HEX_RE.test(colorInput) ? colorInput : bgColor,
        border: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    />
    <TextField
      size="small"
      value={colorInput}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{
        maxLength: 7,
        style: { fontFamily: "monospace", fontSize: "0.85rem" },
      }}
      sx={{ width: 110 }}
    />
  </Box>
);
