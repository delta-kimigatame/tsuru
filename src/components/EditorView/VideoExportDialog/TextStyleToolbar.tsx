import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  bold: boolean;
  italic: boolean;
  color: string;
  onBoldItalicChange: (bold: boolean, italic: boolean) => void;
  onColorChange: (color: string) => void;
};

export const TextStyleToolbar: React.FC<Props> = ({
  bold,
  italic,
  color,
  onBoldItalicChange,
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
      <Box sx={{ flex: 1 }} />
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
    </Box>
  );
};
