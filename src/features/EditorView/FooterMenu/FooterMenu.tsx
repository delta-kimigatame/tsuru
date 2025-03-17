import AutorenewIcon from "@mui/icons-material/Autorenew";
import DownloadIcon from "@mui/icons-material/Download";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { CircularProgress, Tab, Tabs } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BaseBatchProcess } from "../../../lib/BaseBatchProcess";
import { LOG } from "../../../lib/Logging";
import { Ust } from "../../../lib/Ust";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { loadBatchProcessClasses } from "../../../utils/loadBatchProcess";
import { BatchProcessDialog } from "../../BatchProcess/BatchProcessDialog";
import { FooterBatchProcessMenu } from "./FooterBatchProcessMenu";
import { FooterZoomMenu } from "./FooterZoomMenu";

/**
 * エディタビューの下部に表示するフッターメニュー
 *
 * 将来の拡張性を考慮してスクローラブルとし、原則アイコンボタンを用いる
 */
export const FooterMenu: React.FC<FooterMenuProps> = (props) => {
  const { t } = useTranslation();
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { setUst, setNotes, setNote, setUstFlags, setUstTempo, notes, vb } =
    useMusicProjectStore();
  const snackBarStore = useSnackBarStore();
  const [ustLoadProgress, setUstLoadProgress] = React.useState<boolean>(false);
  const [batchProcesses, setBatchProcesses] = React.useState<
    Array<{ title: string; cls: new () => BaseBatchProcess }>
  >([]);
  const [batchProcessDialogOpen, setBatchProcessDialogOpen] =
    React.useState<boolean>(false);
  const [dialogBatchProcess, setDialogBatchProcess] =
    React.useState<BaseBatchProcess | null>(null);
  const [batchProcessProgress, setBatchProcessProgress] =
    React.useState<boolean>(false);
  const [zoomMenuAnchor, setZoomMenuAnchor] =
    React.useState<HTMLElement | null>(null);
  const [batchProcessMenuAnchor, setBatchProcessMenuAnchor] =
    React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    LOG.debug(`コンポーネントマウント`, "FooterMenu");
    loadBatchProcessClasses().then((results) => {
      LOG.debug(`バッチプロセスの一覧取得`, "FooterMenu");
      setBatchProcesses(results);
    });
  }, []);
  /**
   * inputのファイルを変更した際の動作
   * nullやファイル数が0の場合何もせず終了する。
   * ファイルが含まれている場合、1つ目のファイルをreadFileにセットする。
   * 実際のファイルの読込はloadVBDialogで行う。
   * @param e
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      LOG.warn("ustの読込がキャンセルされたか失敗しました", "FooterMenu");
      return;
    }
    setUstLoadProgress(true);
    LOG.info(`ustの選択:${e.target.files[0].name}`, "FooterMenu");
    LoadUst(e.target.files[0]);
  };

  /**
   * ustファイルを非同期で読み込み、グローバルな状態ust,notes,ustTempo,ustFlagsを更新する
   * @param file 選択されたustファイル
   */
  const LoadUst = async (file: File): Promise<void> => {
    try {
      LOG.info(`ustの読込開始`, "FooterMenu");
      const ust = new Ust();
      const buf = await file.arrayBuffer();
      await ust.load(buf);
      LOG.info(
        `ustの読込完了。ノート数:${ust.notes.length},bpm=:${ust.tempo},flags:${ust.flags}`,
        "FooterMenu"
      );
      setUst(ust);
      setUstTempo(ust.tempo);
      setUstFlags(ust.flags);
      if (vb !== null) {
        notes.forEach((n) => n.applyOto(vb));
      } else {
        LOG.warn(
          `vbがロードされていません。テスト以外では必ず事前にロードされるはずなので何かがおかしい`,
          "FooterMenu"
        );
      }
      setNotes(ust.notes);
      setUstLoadProgress(false);
    } catch (e) {
      LOG.warn(`ustの読込失敗。${e}`, "FooterMenu");
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.footer.ustLoadError"));
      snackBarStore.setOpen(true);
      setUstLoadProgress(false);
    }
  };

  /**
   * Projectタブをクリックした際の動作。
   * 不可視のinputのクリックイベントを発火する
   */
  const handleProjectTabClick = () => {
    LOG.debug("click ProjectTab", "FooterMenu");
    /** ファイル読み込みの発火 */
    LOG.info("ustファイルの選択", "FooterMenu");
    inputRef.current.click();
  };

  /**
   * zoomタブをクリックした際の動作。
   * zoomメニューを開く
   * @param e
   */
  const handleZoomTabClick = (e) => {
    LOG.debug("click ZoomTab", "FooterMenu");
    LOG.info("zoomメニューを開く", "FooterMenu");
    setZoomMenuAnchor(e.currentTarget);
  };

  /**
   * zoomメニューを閉じる動作
   */
  const handleZoomMenuClose = () => {
    LOG.info("zoomメニューを閉じる", "FooterMenu");
    setZoomMenuAnchor(null);
  };

  /**
   * BatchProcessタブをクリックした際の動作。
   * BatchProcessメニューを開く
   * @param e
   */
  const handleBatchProcessTabClick = (e) => {
    LOG.debug("click BatchProcessTab", "FooterMenu");
    LOG.info("BatchProcessメニューを開く", "FooterMenu");
    setBatchProcessMenuAnchor(e.currentTarget);
  };
  /**
   * BatchProcessメニューを閉じる動作
   */
  const handleBatchProcessMenuClose = () => {
    LOG.info("BatchProcessメニューを閉じる", "FooterMenu");
    setBatchProcessMenuAnchor(null);
  };

  /**
   * バッチプロセスを実行するか引数編集用のUIを開く
   * @param index バッチプロセスのインデックス
   */
  const processBatchProcess = (index: number) => {
    const bp = new batchProcesses[index].cls();
    setBatchProcessProgress(true);
    if (bp.ui.length === 0) {
      const targetNotes =
        props.selectedNotesIndex.length > 0
          ? props.selectedNotesIndex.map((idx) => notes[idx])
          : notes;
      LOG.info(
        `selectedIndex:${props.selectedNotesIndex}、selectedNotes:${props.selectedNotesIndex.length}、target:${targetNotes.length}`,
        "FooterMenu"
      );
      /** 処理自体の実行とオプションはprocess側でロギング */
      LOG.info("バッチ処理の実行", "FooterMenu");
      const resultNotes = bp.process(targetNotes);
      LOG.info("バッチ処理の実行完了", "FooterMenu");
      if (props.selectedNotesIndex.length > 0) {
        // 選択されたノートのみ更新
        LOG.info("選択されたノートの更新", "FooterMenu");
        props.selectedNotesIndex.forEach((idx, i) => {
          setNote(idx, resultNotes[i]);
          if (idx !== 0) {
            resultNotes[i].prev = notes[idx - 1];
            notes[idx - 1].next = resultNotes[i];
          }
        });
      } else {
        // 全ノート更新の場合、全てのインデックスに対して更新
        LOG.info("全てのノートの更新", "FooterMenu");
        notes.forEach((_, idx) => {
          if (idx !== 0) {
            resultNotes[idx].prev = resultNotes[idx - 1];
            resultNotes[idx - 1].next = resultNotes[idx];
          }
          setNote(idx, resultNotes[idx]);
        });
      }
      setBatchProcessProgress(false);
    } else {
      LOG.info(`バッチ処理ダイアログの起動。bp:${bp.title}`, "FooterMenu");
      setDialogBatchProcess(bp);
      setBatchProcessDialogOpen(true);
    }
    handleBatchProcessMenuClose();
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inputRef}
        accept=".ust"
        data-testid="file-input"
      ></input>
      <Tabs
        variant="scrollable"
        scrollButtons={true}
        sx={{
          display: "flex",
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 20,
          backgroundColor: "Background",
        }}
        value={0}
      >
        <Tab
          icon={ustLoadProgress ? <CircularProgress /> : <LibraryMusicIcon />}
          label={t("editor.footer.project")}
          onClick={handleProjectTabClick}
          sx={{ flex: 1 }}
          value={0}
          disabled={ustLoadProgress && batchProcessProgress}
        />
        <Tab
          icon={<ZoomInIcon />}
          label={t("editor.footer.zoom")}
          onClick={handleZoomTabClick}
          sx={{ flex: 1 }}
          value={0}
          disabled={notes.length === 0 && batchProcessProgress}
        />
        <Tab
          icon={batchProcessProgress ? <CircularProgress /> : <AutorenewIcon />}
          label={t("editor.footer.batchprocess")}
          onClick={handleBatchProcessTabClick}
          sx={{ flex: 1 }}
          value={0}
          disabled={notes.length === 0 && batchProcessProgress}
        />
        <Tab
          icon={<PlayArrowIcon />}
          label={t("editor.footer.play")}
          onClick={undefined}
          sx={{ flex: 1 }}
          value={0}
          disabled={notes.length === 0 && batchProcessProgress}
        />
        <Tab
          icon={<DownloadIcon />}
          label={t("editor.footer.wav")}
          onClick={undefined}
          sx={{ flex: 1 }}
          value={0}
          disabled={notes.length === 0 && batchProcessProgress}
        />
      </Tabs>
      <FooterZoomMenu
        anchor={zoomMenuAnchor}
        handleClose={handleZoomMenuClose}
      />
      <FooterBatchProcessMenu
        anchor={batchProcessMenuAnchor}
        handleClose={handleBatchProcessMenuClose}
        batchProcesses={batchProcesses}
        process={processBatchProcess}
      />
      <BatchProcessDialog
        batchprocess={dialogBatchProcess}
        selectedNotesIndex={props.selectedNotesIndex}
        dialogOpen={batchProcessDialogOpen}
        setDialogOpen={setBatchProcessDialogOpen}
        setProcessing={setBatchProcessProgress}
      />
    </>
  );
};

export interface FooterMenuProps {
  /** 選択されているノートのインデックス 将来的に必須引数にするが開発中のため暫定的にオプショナルとする */
  selectedNotesIndex: number[];
}
