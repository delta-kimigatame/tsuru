import MovieIcon from "@mui/icons-material/Movie";
import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  VIDEO_RESOLUTIONS,
  type VideoResolution,
} from "../../../utils/videoExport";

type Props = {
  bgSize: VideoResolution;
  onBgSizeChange: (s: VideoResolution) => void;
  imageFile: File | null;
};

export const ResolutionSection: React.FC<Props> = ({
  bgSize,
  onBgSizeChange,
  imageFile,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "primary.main",
        bgColor: "primary.main",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(144,202,249,0.08)"
            : "rgba(25,118,210,0.06)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <MovieIcon fontSize="small" color="primary" />
        <Typography
          variant="subtitle2"
          color="primary"
          fontWeight="bold"
          sx={{ letterSpacing: "0.01em" }}
        >
          {t("editor.videoExport.outputResolutionSection")}
        </Typography>
      </Stack>

      <Select
        size="small"
        fullWidth
        value={bgSize}
        onChange={(e) => onBgSizeChange(e.target.value as VideoResolution)}
        sx={{ bgcolor: "background.paper" }}
      >
        {VIDEO_RESOLUTIONS.map((s) => (
          <MenuItem key={s} value={s} disabled={s === "image" && !imageFile}>
            <Typography
              variant="body2"
              fontWeight={s !== "image" ? "bold" : undefined}
            >
              {s === "image" ? t("editor.videoExport.bgSizeImage") : s}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
