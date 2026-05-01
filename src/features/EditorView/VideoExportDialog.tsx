import ClearIcon from "@mui/icons-material/Clear";
import ImageIcon from "@mui/icons-material/Image";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (imageFile: File) => void;
  synthesisProgress: boolean;
};

export const VideoExportDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  synthesisProgress,
}) => {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    // 同じファイルを再選択できるようにリセット
    e.target.value = "";
  };

  const handleClearImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleClose = () => {
    handleClearImage();
    onClose();
  };

  const handleConfirm = () => {
    if (!imageFile) return;
    onConfirm(imageFile);
  };

  // ダイアログが閉じられたらプレビュー URL を解放
  React.useEffect(() => {
    if (!open) {
      handleClearImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("editor.videoExport.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* 画像選択エリア */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ImageIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("editor.videoExport.selectImage")}
            </Button>
            {imageFile && (
              <IconButton size="small" onClick={handleClearImage}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>

          {/* サムネイルプレビュー */}
          {imagePreviewUrl && (
            <Box
              component="img"
              src={imagePreviewUrl}
              alt="preview"
              sx={{
                width: "100%",
                maxHeight: 200,
                objectFit: "contain",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            />
          )}

          {!imageFile && (
            <Typography variant="caption" color="text.secondary">
              {t("editor.videoExport.selectImage")}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={synthesisProgress}>
          {t("editor.videoExport.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!imageFile || synthesisProgress}
        >
          {t("editor.videoExport.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
