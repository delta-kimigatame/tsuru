import { Alert, Snackbar } from "@mui/material";
import React from "react";
import { EDITOR_CONFIG } from "../../config/editor";
import { useVerticalFooterMenu } from "../../hooks/useVerticalFooterMenu";
import { LOG } from "../../lib/Logging";
import { useSnackBarStore } from "../../store/snackBarStore";

/**
 * アプリケーション全体で使用するsnackbar
 * useSnackBarStoreの値を用いる。
 */
export const SnackBar: React.FC = () => {
  const { open, severity, value, setOpen, setValue, setSeverity } =
    useSnackBarStore();
  const menuVertical = useVerticalFooterMenu();
  const [internalOpen, setInternalOpen] = React.useState(open);

  // スナックバーの外部状態が変わったら、内部状態で再レンダリングを制御する
  React.useEffect(() => {
    if (open) {
      // 新しいメッセージが来た場合、既存を閉じてから表示
      setInternalOpen(false);
      // 少し遅延させてから再表示
      const timeout = setTimeout(() => {
        setInternalOpen(true);
      }, 100); // 100msくらいの遅延
      return () => clearTimeout(timeout);
    } else {
      setInternalOpen(false);
    }
  }, [open, value]);
  /**
   * snackbarが閉じられる祭、globalな値を初期値に戻す
   */
  const handleClose = () => {
    LOG.debug("close", "SnackBar");
    setInternalOpen(false);
  };
  return (
    <Snackbar
      open={internalOpen}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ bottom: menuVertical ? 0 : EDITOR_CONFIG.FOOTER_MENU_SIZE }}
    >
      <Alert severity={severity} sx={{ width: "100%" }} variant="filled">
        {value}
      </Alert>
    </Snackbar>
  );
};
