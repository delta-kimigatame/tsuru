import { Alert, Snackbar } from "@mui/material";
import React from "react";
import { useSnackBarStore } from "../../store/snackBarStore";

/**
 * アプリケーション全体で使用するsnackbar
 * useSnackBarStoreの値を用いる。
 */
export const SnackBar: React.FC = () => {
  const { open, severity, value, setOpen, setValue, setSeverity } =
    useSnackBarStore();
  /**
   * snackbarが閉じられる祭、globalな値を初期値に戻す
   */
  const handleClose = () => {
    setOpen(false);
    setValue("");
    setSeverity("info");
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message={
        <Alert severity={severity} sx={{ width: "100%" }} variant="filled">
          {value}
        </Alert>
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    ></Snackbar>
  );
};
