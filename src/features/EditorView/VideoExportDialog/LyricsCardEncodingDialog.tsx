import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { readTextFile } from "../../../services/readTextFile";
import {
  EncodingOption,
  getFileReaderEncoding,
} from "../../../utils/EncodingMapping";
import { parseLyricsCard } from "../../../utils/parseLyricsCard";

type Props = {
  open: boolean;
  fileBuf: ArrayBuffer | null;
  onConfirm: (words: string[]) => void;
  onCancel: () => void;
};

/**
 * 歌詞カードテキストファイルの文字コード＆分割オプション選択ダイアログ。
 * ファイルのバイナリバッファを受け取り、複数の文字コードでプレビューを表示。
 * ユーザーが正しいエンコーディングと分割オプションを選択した後、
 * テキストを解析して単語配列を返す。
 */
export const LyricsCardEncodingDialog: React.FC<Props> = ({
  open,
  fileBuf,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  const [encoding, setEncoding] = React.useState<EncodingOption>(
    EncodingOption.UTF8,
  );
  const [splitByHalfSpace, setSplitByHalfSpace] = React.useState(true); // デフォルト ON
  const [previewText, setPreviewText] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  // fileBuf または encoding が変わるたびにプレビューを更新
  React.useEffect(() => {
    if (!open || !fileBuf) return;

    const updatePreview = async () => {
      setLoading(true);
      try {
        const text = await readTextFile(
          fileBuf,
          getFileReaderEncoding(encoding),
        );
        setPreviewText(text);
      } catch {
        setPreviewText("");
      }
      setLoading(false);
    };

    updatePreview();
  }, [open, fileBuf, encoding, t]);

  const handleConfirm = async () => {
    if (!fileBuf) return;
    try {
      const text = await readTextFile(fileBuf, getFileReaderEncoding(encoding));
      const words = parseLyricsCard(text, splitByHalfSpace);
      if (words.length === 0) return; // エラーハンドリングは親に任せる
      onConfirm(words);
    } catch {
      // エラーハンドリングは親に任せる
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("editor.videoExport.lyricsCardEncodingDialogTitle")}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 文字コード選択 */}
        <FormControl fullWidth>
          <InputLabel>{t("loadVBDialog.encoding")}</InputLabel>
          <Select
            label={t("loadVBDialog.encoding")}
            value={encoding}
            onChange={(e: SelectChangeEvent) =>
              setEncoding(e.target.value as EncodingOption)
            }
          >
            <MenuItem value={EncodingOption.UTF8}>UTF-8</MenuItem>
            <MenuItem value={EncodingOption.SHIFT_JIS}>Shift-JIS</MenuItem>
            <MenuItem value={EncodingOption.GB18030}>GB18030</MenuItem>
            <MenuItem value={EncodingOption.GBK}>GBK</MenuItem>
            <MenuItem value={EncodingOption.BIG5}>BIG5</MenuItem>
            <MenuItem value={EncodingOption.WINDOWS_1252}>
              Windows-1252
            </MenuItem>
          </Select>
        </FormControl>

        {/* 半角スペース分割オプション */}
        <FormControlLabel
          control={
            <Switch
              checked={splitByHalfSpace}
              onChange={(e) => setSplitByHalfSpace(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              {t("editor.videoExport.lyricsCardSplitByHalfSpace")}
            </Typography>
          }
        />

        {/* プレビュー */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {t("editor.videoExport.lyricsCardEncodingPreview")}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={previewText}
            InputProps={{ readOnly: true }}
            disabled={loading}
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "monospace",
                fontSize: "0.85rem",
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          disabled={!fileBuf || loading}
          onClick={handleConfirm}
        >
          {t("common.ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
