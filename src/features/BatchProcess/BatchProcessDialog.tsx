import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BaseBatchProcess } from "../../lib/BaseBatchProcess";
import { LOG } from "../../lib/Logging";
import { BatchProcess } from "./BatchProcess";

export const BatchProcessDialog: React.FC<BatchProcessDialogProps> = (
  props
) => {
  const { t } = useTranslation();
  /**
   * ダイアログを閉じる際の動作
   * あわせてファイル読み込みを中止する
   */
  const handleClose = () => {
    LOG.debug("バッチプロセスダイアログを閉じる", "BatchProcessDialog");
    props.setDialogOpen(false);
    props.setProcessing(false);
  };
  return (
    <>
      <Dialog
        open={props.dialogOpen && props.batchprocess !== null}
        onClose={handleClose}
        fullScreen
      >
        {props.batchprocess !== null && (
          <DialogTitle>{t(props.batchprocess.title)}</DialogTitle>
        )}
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          {props.batchprocess !== null && (
            <BatchProcess
              selectedNotesIndex={props.selectedNotesIndex}
              batchprocess={props.batchprocess}
              handleClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export interface BatchProcessDialogProps {
  /** 実行するバッチプロセスの初期化済みインスタンス */
  batchprocess: BaseBatchProcess;
  /** 対象ノート。空配列の場合すべて */
  selectedNotesIndex: number[];
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
  /** ダイアログの表示状況を更新するためのコールバック */
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** バッチ処理の実行状況を更新するためのコールバック */
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}
