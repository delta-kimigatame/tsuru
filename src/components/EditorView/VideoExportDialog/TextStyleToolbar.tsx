import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { TextAlign } from "../../../utils/videoExport";

type Props = {
  bold: boolean;
  italic: boolean;
  align: TextAlign;
  color: string;
  onBoldItalicChange: (bold: boolean, italic: boolean) => void;
  onAlignChange: (align: TextAlign) => void;
  onColorChange: (color: string) => void;
};

export const TextStyleToolbar: React.FC<Props> = ({
  bold,
  italic,
  align,
  color,
  onBoldItalicChange,
  onAlignChange,
  onColorChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <ToggleButtonGroup
        size="small"
        value={[...(bold ? ["bold"] : []), ...(italic ? ["italic"] : [])]}
        onChange={(_e, v) => {
          const f = v as string[];
          onBoldItalicChange(f.includes("bold"), f.includes("italic"));
        }}
      >
        <ToggleButton
          value="bold"
          sx={{ fontWeight: "bold", px: 1.5, minWidth: 36 }}
        >
          B
        </ToggleButton>
        <ToggleButton
          value="italic"
          sx={{ fontStyle: "italic", px: 1.5, minWidth: 36 }}
        >
          I
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={align}
        onChange={(_e, v) => {
          if (v !== null) onAlignChange(v as TextAlign);
        }}
      >
        <ToggleButton value="left">
          <FormatAlignLeftIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="center">
          <FormatAlignCenterIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="right">
          <FormatAlignRightIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ flex: 1 }} />
      <Tooltip title={t("editor.videoExport.textColor")}>
        <Box
          component="input"
          type="color"
          value={color}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onColorChange(e.target.value)
          }
          sx={{
            width: 32,
            height: 32,
            p: 0,
            border: "none",
            borderRadius: 1,
            cursor: "pointer",
          }}
        />
      </Tooltip>
    </Box>
  );
};
