import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button, CircularProgress, Typography } from "@mui/material";
import { LOG } from "../../lib/Logging";
import { VoiceBankFiles } from "../../lib/VoiceBanks/VoiceBankFiles";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";

export const SelectVBDirButton: React.FC<SelectVBDirButtonProps> = (props) => {
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef(null);
  const { t } = useTranslation();
  /** snackbarの操作 */
  const snackBarStore = useSnackBarStore();

  const { setVb } = useMusicProjectStore();

  /**
   * ボタンをクリックした際の動作。
   * 隠し要素であるinputのクリックイベントを発火する。
   */
  const handleButtonClick = () => {
    LOG.debug("click", "SelectVBDirButton");
    /** 実行状況の初期化 */
    props.setProcessing(false);
    props.setReadFile(null);
    /** ファイル読み込みの発火 */
    LOG.info("音源フォルダの選択", "SelectVBDirButton");
    inputRef.current.click();
  };

  /**
   * inputのファイルを変更した際の動作
   * nullやファイル数が0の場合何もせず終了する。
   * ファイルが含まれている場合、1つ目のファイルをreadFileにセットする。
   * 実際のファイルの読込はloadVBDialogで行う。
   * @param e
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      LOG.warn(
        "音源フォルダの選択がキャンセルされたか失敗しました",
        "SelectVBDirButton"
      );
      return;
    }
    props.setProcessing(true);
    LOG.info(
      `音源フォルダの選択:${e.target.files[0].webkitRelativePath}`,
      "SelectVBDirButton"
    );
    LOG.gtag("SelectVBDir");
    const vbdir = new VoiceBankFiles(Array.from(e.target.files));
    try {
      await vbdir.initialize();
      setVb(vbdir);
    } catch {
      LOG.error("dirをvoicebankとしてinitialize失敗", "SelectVBDirButton");
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("loadVBDialog.error"));
      snackBarStore.setOpen(true);
      props.setProcessing(false);
    }
    props.setProcessing(false);
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inputRef}
        data-testid="dir-input"
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
      ></input>
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
          t("top.selectDirButtonText")
        )}
      </Button>
      <Typography variant="caption">
        {t("top.selectDirButtonDescription")}
      </Typography>
    </>
  );
};

export interface SelectVBDirButtonProps {
  /** 音源読込処理の状況を管理するstate。読込中はtrue */
  processing: boolean;
  /** 音源読込処理の状況を更新するためのコールバック */
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  /** 読み込んだファイルを更新するためのコールバック */
  setReadFile: React.Dispatch<React.SetStateAction<File | null>>;
}
