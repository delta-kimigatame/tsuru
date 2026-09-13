import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button, CircularProgress, Typography } from "@mui/material";
import { LOG } from "../../lib/Logging";
import { useSnackBarStore } from "../../store/snackBarStore";

/**
 * 省メモリーZIP読込（β）用の音源選択ボタン。
 * ZIP解析はLoadVBDialogへ委譲し、このコンポーネントはファイル選択のみを担当する。
 */
export const SelectVBLowMemoryButton: React.FC<SelectVBLowMemoryButtonProps> = (
  props,
) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const snackBarStore = useSnackBarStore();

  const handleButtonClick = () => {
    LOG.debug("click", "SelectVBLowMemoryButton");
    props.setProcessing(false);
    props.setReadFile(null);
    LOG.info("省メモリー音源zipファイルの選択", "SelectVBLowMemoryButton");
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file === undefined) {
      LOG.warn(
        "省メモリー音源zipの選択がキャンセルされたか失敗しました",
        "SelectVBLowMemoryButton",
      );
      return;
    }
    if (!(await isZipFile(file))) {
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("top.invalidFile"));
      snackBarStore.setOpen(true);
      return;
    }

    props.setProcessing(true);
    props.setLoadMode("lowMemory");
    props.setReadFile(file);
    LOG.info(`省メモリー音源zipの選択:${file.name}`, "SelectVBLowMemoryButton");
    LOG.gtag("selectVbLowMemory", {
      filename: file.name,
      fileSize: file.size,
    });
    props.setDialogOpen(true);
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inputRef}
        accept=".uar,.zip"
        data-testid="low-memory-file-input"
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
        disabled={props.processing}
        size="large"
      >
        {props.processing ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          t("top.selectLowMemoryZipButtonText")
        )}
      </Button>
      <Typography variant="caption">
        {t("top.selectLowMemoryZipButtonDescription")}
      </Typography>
    </>
  );
};

const isZipFile = async (file: File): Promise<boolean> => {
  if (file.size < 4) return false;
  const header = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(header);
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
};

export interface SelectVBLowMemoryButtonProps {
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setReadFile: React.Dispatch<React.SetStateAction<File | null>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadMode: React.Dispatch<React.SetStateAction<"standard" | "lowMemory">>;
}
