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
import { LOG } from "../../lib/Logging";
import { VoiceBank } from "../../lib/VoiceBanks/VoiceBank";
import { VoiceBankLowMemory } from "../../lib/VoiceBanks/VoiceBankLowMemory";
import { zipReader } from "../../services/zipReader";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import {
  EncodingOption,
  getFileReaderEncoding,
  getTextDecoderEncoding,
} from "../../utils/EncodingMapping";
import { EncodingSelect } from "../common/EncodingSelect";

export const LoadVBDialog: React.FC<LoadVBDialogProps> = (props) => {
  const { t } = useTranslation();
  /** 読込中判定 */
  const [processing, setProcessing] = React.useState<boolean>(false);
  /** zipファイル */
  const [zipFiles, setZipFiles] = React.useState<{
    [key: string]: JSZip.JSZipObject;
  } | null>(null);
  /** 省メモリーZIP読込用のreader */
  const lowMemoryReaderRef = React.useRef<zipReader | null>(null);
  const lowMemoryReaderFileRef = React.useRef<File | null>(null);
  /** プレビューに表示するファイル名 */
  const [fileNames, setFileNames] = React.useState<string[] | null>(null);
  /** zipのファイル名を解釈するための文字コード */
  const [encoding, setEncoding] = React.useState<EncodingOption>(
    EncodingOption.SHIFT_JIS,
  );
  /** snackbarの操作 */
  const snackBarStore = useSnackBarStore();

  const { setVb } = useMusicProjectStore();
  /**
   * ダイアログを閉じる際の動作
   * あわせてファイル読み込みを中止する
   */
  const handleClose = () => {
    LOG.debug("音源読込ダイアログを閉じる", "LoadVBDialog");
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
  const handleButtonClick = async () => {
    LOG.debug("click", "LoadVBDialog");
    if (props.loadMode === "standard" && zipFiles === null) return;
    if (props.loadMode === "lowMemory" && lowMemoryReaderRef.current === null)
      return;
    setProcessing(true);
    try {
      const vb =
        props.loadMode === "lowMemory"
          ? new VoiceBankLowMemory(lowMemoryReaderRef.current!)
          : new VoiceBank(zipFiles!);
      LOG.info(
        props.loadMode === "lowMemory"
          ? "省メモリーzipをvoicebankとしてinitialize"
          : "zipをvoicebankとしてinitialize",
        "LoadVBDialog",
      );
      await vb.initialize(getFileReaderEncoding(encoding));
      LOG.info("zipをvoicebankとしてinitialize完了", "LoadVBDialog");
      setVb(vb);
      props.setDialogOpen(false);
      props.setProcessing(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      LOG.error(`zipをvoicebankとしてinitialize失敗:${e}`, "LoadVBDialog");
      snackBarStore.setSeverity("error");
      if (message === "character.txt not found.") {
        snackBarStore.setValue(t("loadVBDialog.characterTxtNotFoundError"));
      } else if (
        message === "Invalid character.txt." ||
        message === "txtかnameのどちらかが必要です"
      ) {
        snackBarStore.setValue(t("loadVBDialog.invalidCharacterTxtError"));
      } else {
        snackBarStore.setValue(t("loadVBDialog.error"));
      }
      snackBarStore.setOpen(true);
      props.setDialogOpen(false);
      props.setProcessing(false);
    }
  };

  /** ファイルや文字コードが変更された際の処理 */
  React.useEffect(() => {
    LOG.debug("ファイル更新もしくはエンコード変更検知", "LoadVBDialog");
    let isCancelled = false;
    const loadArchive = async () => {
      if (props.readFile === null) {
        LOG.debug("ファイルはnull、ダイアログを閉じる", "LoadVBDialog");
        props.setDialogOpen(false);
        return;
      }
      setProcessing(true);
      setFileNames(null);
      try {
        if (props.loadMode === "lowMemory") {
          const reader =
            lowMemoryReaderFileRef.current === props.readFile &&
            lowMemoryReaderRef.current !== null
              ? lowMemoryReaderRef.current
              : new zipReader(props.readFile);
          if (reader === lowMemoryReaderRef.current) {
            await reader.LoadFileLists(encoding);
          } else {
            await reader.Initialize(encoding);
            lowMemoryReaderRef.current = reader;
            lowMemoryReaderFileRef.current = props.readFile;
          }
          if (!isCancelled) {
            setZipFiles(null);
            setFileNames(reader.GetFileList());
          }
        } else {
          const zip = new JSZip();
          const td = new TextDecoder(getTextDecoderEncoding(encoding));
          const loadedZip = await zip.loadAsync(props.readFile, {
            decodeFileName: (fileNameBinary: Uint8Array) =>
              td.decode(fileNameBinary),
          });
          if (!isCancelled) {
            setZipFiles(loadedZip.files);
            setFileNames(Object.keys(loadedZip.files));
          }
        }
        LOG.info(
          `encoding:${encoding}に基づきzipファイルのロード完了`,
          "LoadVBDialog",
        );
      } catch (e) {
        if (isCancelled) return;
        const message = e instanceof Error ? e.message : "";
        LOG.error(
          `encoding:${encoding}に基づきzipファイルのロード失敗:${e}`,
          "LoadVBDialog",
        );
        snackBarStore.setSeverity("error");
        snackBarStore.setValue(
          message.includes("Encrypted")
            ? t("loadVBDialog.encryptedError")
            : t("loadVBDialog.unzipError"),
        );
        snackBarStore.setOpen(true);
        props.setDialogOpen(false);
        props.setProcessing(false);
      } finally {
        if (!isCancelled) setProcessing(false);
      }
    };
    loadArchive();
    return () => {
      isCancelled = true;
    };
  }, [props.readFile, props.loadMode, encoding]);

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
            disabled={processing || fileNames === null}
            size="large"
            sx={{ mx: 1 }}
          >
            {processing ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              t("loadVBDialog.submit")
            )}
          </Button>
          <FileList processing={processing} files={fileNames ?? []} />
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
  /** ZIPの読込方式 */
  loadMode?: "standard" | "lowMemory";
}
