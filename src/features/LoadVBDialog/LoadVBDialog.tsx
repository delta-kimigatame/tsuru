import * as React from "react";
import { useTranslation } from "react-i18next";

import CloseIcon from "@mui/icons-material/Close";
import { Button, CircularProgress } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import JSZip from "jszip";
import { FileList } from "../../components/LoadVBDialog/FileList";
import { VoiceBank } from "../../lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import {
  EncodingOption,
  getTextDecoderEncoding,
} from "../../utils/EncodingMapping";
import { EncodingSelect } from "./EncodingSelect";

export const LoadVBDialog: React.FC<LoadVBDialogProps> = (props) => {
  const { t } = useTranslation();
  /** 読込中判定 */
  const [processing, setProcessing] = React.useState<boolean>(false);
  /** zipファイル */
  const [zipFiles, setZipFiles] = React.useState<{
    [key: string]: JSZip.JSZipObject;
  } | null>(null);
  /** zipのファイル名を解釈するための文字コード */
  const [encoding, setEncoding] = React.useState<EncodingOption>(
    EncodingOption.SHIFT_JIS
  );
  /** snackbarの操作 */
  const snackBarStore = useSnackBarStore();

  const { setVb } = useMusicProjectStore();
  /**
   * zipを指定した文字コードで読み込む
   * @param file 読み込んだファイル
   * @param encoding 文字コード
   */
  const loadZip = async (file: File, encoding: EncodingOption) => {
    const zip = new JSZip();

    const td = new TextDecoder(getTextDecoderEncoding(encoding));
    zip
      .loadAsync(file, {
        decodeFileName: (fileNameBinary: Uint8Array) =>
          td.decode(fileNameBinary),
      })
      .then((z) => {
        setProcessing(false);
        setZipFiles(z.files);
      });
  };
  /**
   * ダイアログを閉じる際の動作
   * あわせてファイル読み込みを中止する
   */
  const handleClose = () => {
    props.setDialogOpen(false);
    props.setProcessing(false);
  };

  /**
   * OKボタンをクリックした際の動作。
   * zipファイルの文字コード確定後にクリックし、音声ライブラリをロードする。
   * 読込成功した場合はglobalな状態を更新する。
   * 読込失敗した場合はsnackbarを開く。
   * いずれの場合もダイアログを閉じる。
   */
  const handleButtonClick = () => {
    const vb = new VoiceBank(zipFiles);
    setProcessing(true);
    vb.initialize()
      .then(() => {
        setVb(vb);
        props.setDialogOpen(false);
        props.setProcessing(false);
      })
      .catch((e) => {
        snackBarStore.setSeverity("error");
        snackBarStore.setValue(t("loadVBDialog.error"));
        snackBarStore.setOpen(true);
        props.setDialogOpen(false);
        props.setProcessing(false);
      });
  };

  /** ファイルや文字コードが変更された際の処理 */
  React.useEffect(() => {
    if (props.readFile === null) {
      props.setDialogOpen(false);
    } else {
      setProcessing(true);
      loadZip(props.readFile, encoding);
    }
  }, [props.readFile, encoding]);

  return (
    <>
      <Dialog
        open={props.dialogOpen && props.readFile !== null}
        onClose={handleClose}
        fullScreen
      >
        <DialogTitle>
          {t("loadVBDialog.title")} {t("loadVBDialog.encodeCheck")}
        </DialogTitle>
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
          <EncodingSelect
            value={encoding}
            setValue={setEncoding}
            disabled={processing}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
            disabled={processing && zipFiles !== null}
            size="large"
            sx={{ mx: 1 }}
          >
            {processing ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              t("loadVBDialog.submit")
            )}
          </Button>
          <FileList
            processing={processing}
            files={zipFiles ? Object.keys(zipFiles) : []}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export interface LoadVBDialogProps {
  /** 読み込んだファイル */
  readFile: File | null;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
  /** 音源読込処理の状況を更新するためのコールバック */
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  /** 読み込んだファイルを更新するためのコールバック */
  setReadFile: React.Dispatch<React.SetStateAction<File | null>>;
  /** ダイアログの表示状況を更新するためのコールバック */
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
