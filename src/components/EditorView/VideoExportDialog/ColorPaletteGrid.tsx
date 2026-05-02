import { Box, Tooltip } from "@mui/material";
import React from "react";

type Props = {
  palette: string[][];
  /** 選択中の色。null のとき（画像選択中など）はハイライトなし */
  activeColor: string | null;
  onColorSelect: (color: string) => void;
};

export const ColorPaletteGrid: React.FC<Props> = ({
  palette,
  activeColor,
  onColorSelect,
}) => (
  <Box sx={{ display: "flex", gap: "3px" }}>
    {palette.map((column, ci) => (
      <Box
        key={ci}
        sx={{ display: "flex", flexDirection: "column", gap: "3px" }}
      >
        {column.map((color) => {
          const active = activeColor === color;
          return (
            <Tooltip key={color} title={color} placement="top" arrow>
              <Box
                onClick={() => onColorSelect(color)}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "3px",
                  bgcolor: color,
                  cursor: "pointer",
                  border: active ? "2px solid" : "1px solid",
                  borderColor: active ? "primary.main" : "divider",
                  transition: "transform 0.1s",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    ))}
  </Box>
);
