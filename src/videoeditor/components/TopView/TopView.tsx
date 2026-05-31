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

      <BasePaper title="Video Editor">
        <Box sx={{ m: 1, p: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            動画編集は UST を必須入力として開始します。UST 読込後に WAV
            を読み込むと、編集画面を表示できます。
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
              UST読込（必須）
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AudiotrackIcon />}
              disabled={!canLoadWav}
              onClick={() => wavInputRef.current?.click()}
            >
              WAV読込（必須）
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => portraitInputRef.current?.click()}
            >
              立ち絵読込（任意）
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => iconInputRef.current?.click()}
            >
              アイコン読込（任意）
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={ustFileName ? `UST: ${ustFileName}` : "UST: 未読込"}
              color={ustFileName ? "success" : "default"}
              variant={ustFileName ? "filled" : "outlined"}
            />
            <Chip
              label={wavFileName ? `WAV: ${wavFileName}` : "WAV: 未読込"}
              color={wavFileName ? "success" : "default"}
              variant={wavFileName ? "filled" : "outlined"}
            />
            <Chip
              label={
                portraitFileName
                  ? `立ち絵: ${portraitFileName}`
                  : "立ち絵: 未読込（任意）"
              }
              variant="outlined"
            />
            <Chip
              label={
                iconFileName
                  ? `アイコン: ${iconFileName}`
                  : "アイコン: 未読込（任意）"
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
              動画編集画面を開く
            </Button>
          </Box>
        </Box>
      </BasePaper>

      <LinkPaper />
      <HistoryPaper />
    </>
  );
};
