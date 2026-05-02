import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  visible: boolean;
};

export const ExportPreviewCanvas: React.FC<Props> = ({
  canvasRef,
  visible,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {t("editor.videoExport.exportPreview")}
      </Typography>
      <Box
        sx={{
          mt: 0.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          bgcolor: "action.hover",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
        />
      </Box>
    </Box>
  );
};
