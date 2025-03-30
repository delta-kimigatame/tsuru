import AutorenewIcon from "@mui/icons-material/Autorenew";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import StopIcon from "@mui/icons-material/Stop";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../../config/editor";
import { useMenu } from "../../../hooks/useMenu";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { BaseBatchProcess } from "../../../lib/BaseBatchProcess";
import { LOG } from "../../../lib/Logging";
import { Ust } from "../../../lib/Ust";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { executeBatchProcess } from "../../../utils/batchProcess";
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
  const [zoomMenuAnchor, handleZoomMenuOpen, handleZoomMenuClose] = useMenu(
    "FooterMenu.ZoomMenu"
  );
  const [
    batchProcessMenuAnchor,
    handleBatchProcessMenuOpen,
    handleBatchProcessMenuClose,
  ] = useMenu("FooterMenu.BatchProcessMenu");
  const windowSize = useWindowSize();
  const menuVertical = useVerticalFooterMenu();
  const theme = useTheme();

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
   * バッチプロセスを実行するか引数編集用のUIを開く
   * @param index バッチプロセスのインデックス
   */
  const processBatchProcess = (index: number) => {
    const bp = new batchProcesses[index].cls();
    setBatchProcessProgress(true);
    if (bp.ui.length === 0) {
      executeBatchProcess<void>(
        props.selectedNotesIndex,
        notes,
        setNotes,
        vb,
        bp.process,
        undefined
      );
      setBatchProcessProgress(false);
    } else {
      LOG.info(`バッチ処理ダイアログの起動。bp:${bp.title}`, "FooterMenu");
      setDialogBatchProcess(bp);
      setBatchProcessDialogOpen(true);
    }
    handleBatchProcessMenuClose();
  };

  const handleSelectClick = () => {
    LOG.debug("click SelectTab", "FooterMenu");
    if (props.selectMode === "toggle") {
      props.setSelectMode("range");
      snackBarStore.setSeverity("info");
      snackBarStore.setValue(t("editor.selectRangeBegin")); //範囲の最初のノートを選択してください
      snackBarStore.setOpen(true);
    } else if (props.selectMode === "range") {
      if (props.selectedNotesIndex.length !== 0) {
        props.setSelectedNotesIndex([]);
        snackBarStore.setSeverity("info");
        snackBarStore.setValue(t("editor.selectReset")); //ノートの選択解除
        snackBarStore.setOpen(true);
      } else {
        props.setSelectMode("toggle");
      }
    } else {
      props.setSelectMode("toggle");
    }
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
        orientation={menuVertical ? "vertical" : "horizontal"}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        sx={{
          display: "flex",
          position: "fixed",
          bottom: 0,
          right: 0,
          width: menuVertical ? undefined : "100%",
          height: menuVertical
            ? windowSize.height - EDITOR_CONFIG.HEADER_HEIGHT
            : undefined,
          zIndex: 20,
          backgroundColor: theme.palette.background.default,
        }}
        value={0}
      >
        <Tab
          icon={ustLoadProgress ? <CircularProgress /> : <LibraryMusicIcon />}
          label={t("editor.footer.project")}
          onClick={handleProjectTabClick}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            ustLoadProgress || batchProcessProgress || props.synthesisProgress
          }
        />
        <Tab
          icon={<ZoomInIcon />}
          label={t("editor.footer.zoom")}
          onClick={handleZoomMenuOpen}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={notes.length === 0 || batchProcessProgress}
        />
        <Tab
          icon={
            props.selectMode === "toggle" ? <SelectAllIcon /> : <ClearIcon />
          }
          label={
            props.selectMode === "toggle"
              ? t("editor.footer.selectRange")
              : props.selectedNotesIndex.length !== 0
              ? t("editor.footer.selectReset")
              : t("editor.footer.selectCancel")
          }
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            notes.length === 0 ||
            batchProcessProgress ||
            props.synthesisProgress
          }
          onClick={handleSelectClick}
        />
        <Tab
          icon={batchProcessProgress ? <CircularProgress /> : <AutorenewIcon />}
          label={t("editor.footer.batchprocess")}
          onClick={handleBatchProcessMenuOpen}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            notes.length === 0 ||
            batchProcessProgress ||
            props.synthesisProgress
          }
        />
        <Tab
          icon={
            props.synthesisProgress ? (
              <CircularProgress />
            ) : props.playing ? (
              <StopIcon />
            ) : (
              <PlayArrowIcon />
            )
          }
          label={
            props.synthesisProgress
              ? `${props.synthesisCount}/${
                  props.selectedNotesIndex.length !== 0
                    ? props.selectedNotesIndex.length
                    : notes.length
                }`
              : props.playing
              ? t("editor.footer.playStop")
              : t("editor.footer.play")
          }
          onClick={() => {
            props.playing ? props.handlePlayStop() : props.handlePlay();
          }}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            notes.length === 0 ||
            batchProcessProgress ||
            props.synthesisProgress
          }
        />
        <Tab
          icon={
            props.synthesisProgress ? <CircularProgress /> : <DownloadIcon />
          }
          label={
            props.synthesisProgress
              ? `${props.synthesisCount}/${
                  props.selectedNotesIndex.length !== 0
                    ? props.selectedNotesIndex.length
                    : notes.length
                }`
              : t("editor.footer.wav")
          }
          onClick={props.handleDownload}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            notes.length === 0 ||
            batchProcessProgress ||
            props.synthesisProgress
          }
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
  /** ノートを選択するためのコールバック */
  setSelectedNotesIndex: (indexes: number[]) => void;
  /** 再生ボタンを押したときの動作 */
  handlePlay: () => void;
  /** ダウンロードボタンを押したときの動作 */
  handleDownload: () => void;
  /** 生成処理状況 */
  synthesisProgress: boolean;
  /** 生成処理の進捗状況をいくつめのノートまで進んだか */
  synthesisCount: number;
  /** 再生中の状況 */
  playing: boolean;
  /** 再生を終了するためのコールバック */
  handlePlayStop: () => void;
  /** 選択モード */
  selectMode: "toggle" | "range" | "pitch";
  /** 選択モードを更新するためのコールバック */
  setSelectMode: (mode: "toggle" | "range" | "pitch") => void;
}
