import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BasePaper } from "../../../components/common/BasePaper";
import { HistoryPaper } from "./HistoryPaper";
import { LinkPaper } from "./LinkPaper";

type Props = {
  ustFileName?: string;
  wavFileName?: string;
  portraitFileName?: string;
  iconFileName?: string;
  canLoadWav: boolean;
  canOpenEditor: boolean;
  errorMessage?: string;
  onUstSelected: (file: File) => void;
  onWavSelected: (file: File) => void;
  onPortraitSelected: (file: File) => void;
  onIconSelected: (file: File) => void;
  onOpenEditor: () => void;
};

export const TopView: React.FC<Props> = ({
  ustFileName,
  wavFileName,
  portraitFileName,
  iconFileName,
  canLoadWav,
  canOpenEditor,
  errorMessage,
  onUstSelected,
  onWavSelected,
  onPortraitSelected,
  onIconSelected,
  onOpenEditor,
}) => {
  const { t } = useTranslation();
  const ustInputRef = React.useRef<HTMLInputElement>(null);
  const wavInputRef = React.useRef<HTMLInputElement>(null);
  const portraitInputRef = React.useRef<HTMLInputElement>(null);
  const iconInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={ustInputRef}
        hidden
        type="file"
        accept=".ust"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUstSelected(file);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={wavInputRef}
        hidden
        type="file"
        accept=".wav"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onWavSelected(file);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={portraitInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPortraitSelected(file);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={iconInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onIconSelected(file);
          e.currentTarget.value = "";
        }}
      />

      <BasePaper title={t("videoEditor.topTitle")}>
        <Box sx={{ m: 1, p: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t("videoEditor.topDescription")}
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<MusicNoteIcon />}
              onClick={() => ustInputRef.current?.click()}
            >
              {t("videoEditor.loadUstRequired")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AudiotrackIcon />}
              disabled={!canLoadWav}
              onClick={() => wavInputRef.current?.click()}
            >
              {t("videoEditor.loadWavRequired")}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => portraitInputRef.current?.click()}
            >
              {t("videoEditor.loadPortraitOptional")}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => iconInputRef.current?.click()}
            >
              {t("videoEditor.loadIconOptional")}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={
                ustFileName
                  ? t("videoEditor.ustStatusLoaded", { name: ustFileName })
                  : t("videoEditor.ustStatusEmpty")
              }
              color={ustFileName ? "success" : "default"}
              variant={ustFileName ? "filled" : "outlined"}
            />
            <Chip
              label={
                wavFileName
                  ? t("videoEditor.wavStatusLoaded", { name: wavFileName })
                  : t("videoEditor.wavStatusEmpty")
              }
              color={wavFileName ? "success" : "default"}
              variant={wavFileName ? "filled" : "outlined"}
            />
            <Chip
              label={
                portraitFileName
                  ? t("videoEditor.portraitStatusLoaded", {
                      name: portraitFileName,
                    })
                  : t("videoEditor.portraitStatusEmpty")
              }
              variant="outlined"
            />
            <Chip
              label={
                iconFileName
                  ? t("videoEditor.iconStatusLoaded", { name: iconFileName })
                  : t("videoEditor.iconStatusEmpty")
              }
              variant="outlined"
            />
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<MovieIcon />}
              disabled={!canOpenEditor}
              onClick={onOpenEditor}
            >
              {t("videoEditor.openEditor")}
            </Button>
          </Box>
        </Box>
      </BasePaper>

      <LinkPaper />
      <HistoryPaper />
    </>
  );
};
