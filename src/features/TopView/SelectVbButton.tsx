import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button, CircularProgress, Typography } from "@mui/material";
import { LOG } from "../../lib/Logging";

/**
 * このアプリケーションにおける最初のUTAU音源読込処理を実行するためのボタンです。
 * このボタンをクリックすると、OSのファイル選択画面が表示され、ユーザーはUTAU音源形式のzipファイルを選択します。
 * 選択されたzipファイルは、LoadVBDialogで読込処理を行います。
 * 読込処理実行中には、このボタンはdisableとなります。
 * @param props
 * @returns
 */
export const SelectVBButton: React.FC<SelectVBButtonProps> = (props) => {
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef(null);
  const { t } = useTranslation();

  /**
   * ボタンをクリックした際の動作。
   * 隠し要素であるinputのクリックイベントを発火する。
   */
  const handleButtonClick = () => {
    LOG.debug("click", "SelectVBButton");
    /** 実行状況の初期化 */
    props.setProcessing(false);
    props.setReadFile(null);
    /** ファイル読み込みの発火 */
    LOG.info("音源zipファイルの選択", "SelectVBButton");
    inputRef.current.click();
  };

  /**
   * inputのファイルを変更した際の動作
   * nullやファイル数が0の場合何もせず終了する。
   * ファイルが含まれている場合、1つ目のファイルをreadFileにセットする。
   * 実際のファイルの読込はloadVBDialogで行う。
   * @param e
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      LOG.warn(
        "音源zipの選択がキャンセルされたか失敗しました",
        "SelectVBButton"
      );
      return;
    }
    props.setProcessing(true);
    LOG.info(`音源zipの選択:${e.target.files[0].name}`, "SelectVBButton");
    props.setReadFile(e.target.files[0]);
    LOG.info(`音源読込ダイアログの表示`, "SelectVBButton");
    props.setDialogOpen(true);
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inputRef}
        accept="application/zip"
        data-testid="file-input"
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
          t("top.selectZipButtonText")
        )}
      </Button>
      <Typography variant="caption">
        {t("top.selectZipButtonDescription")}
      </Typography>
    </>
  );
};

export interface SelectVBButtonProps {
  /** 音源読込処理の状況を管理するstate。読込中はtrue */
  processing: boolean;
  /** 音源読込処理の状況を更新するためのコールバック */
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  /** 読み込んだファイルを更新するためのコールバック */
  setReadFile: React.Dispatch<React.SetStateAction<File | null>>;
  /** ダイアログの表示状況を更新するためのコールバック */
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
