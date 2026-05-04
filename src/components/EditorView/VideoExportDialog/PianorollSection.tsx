import PianoIcon from "@mui/icons-material/Piano";
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PIANOROLL_VIDEO_LAYOUTS } from "../../../config/pianoroll";
import type { PianorollVideoLayout } from "../../../utils/pianorollVideo";

type Props = {
  enabled: boolean;
  layout: PianorollVideoLayout;
  onEnabledChange: (v: boolean) => void;
  onLayoutChange: (v: PianorollVideoLayout) => void;
};

const LAYOUT_OPTIONS: PianorollVideoLayout[] = [...PIANOROLL_VIDEO_LAYOUTS];

export const PianorollSection: React.FC<Props> = ({
  enabled,
  layout,
  onEnabledChange,
  onLayoutChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        p: 1.5,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(144,202,249,0.08)"
            : "rgba(25,118,210,0.06)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <PianoIcon fontSize="small" color="primary" />
        <Typography
          variant="subtitle2"
          color="primary"
          fontWeight="bold"
          sx={{ letterSpacing: "0.01em" }}
        >
          {t("editor.videoExport.pianorollSection")}
        </Typography>
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2">
            {t("editor.videoExport.pianorollEnable")}
          </Typography>
        }
      />

      {enabled && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: "block" }}
          >
            {t("editor.videoExport.pianorollLayout")}
          </Typography>
          <Select
            size="small"
            fullWidth
            value={layout}
            onChange={(e) =>
              onLayoutChange(e.target.value as PianorollVideoLayout)
            }
            sx={{ bgcolor: "background.paper" }}
          >
            {LAYOUT_OPTIONS.map((l) => (
              <MenuItem key={l} value={l}>
                <Typography variant="body2">
                  {t(`editor.videoExport.pianorollLayout_${l}`)}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </Box>
  );
};
