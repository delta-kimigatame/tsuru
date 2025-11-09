import AddBoxIcon from "@mui/icons-material/AddBox";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RedoIcon from "@mui/icons-material/Redo";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import StopIcon from "@mui/icons-material/Stop";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Wave } from "utauwav";
import { EDITOR_CONFIG } from "../../../config/editor";
import { useMenu } from "../../../hooks/useMenu";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { BaseBatchProcess } from "../../../lib/BaseBatchProcess";
import { LOG } from "../../../lib/Logging";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { executeBatchProcess } from "../../../utils/batchProcess";
import { loadBatchProcessClasses } from "../../../utils/loadBatchProcess";
import { BatchProcessDialog } from "../../BatchProcess/BatchProcessDialog";
import { FooterAudioTrackMenu } from "./FooterAudioTrackMenu";
import { FooterBatchProcessMenu } from "./FooterBatchProcessMenu";
import { FooterProjectMenu } from "./FooterProjectMenu";
import { FooterZoomMenu } from "./FooterZoomMenu";

/**
 * エディタビューの下部に表示するフッターメニュー
 *
 * 将来の拡張性を考慮してスクローラブルとし、原則アイコンボタンを用いる
 */
export const FooterMenu: React.FC<FooterMenuProps> = (props) => {
  const { t } = useTranslation();
  const { setNotes, notes, vb } = useMusicProjectStore();
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
  const [projectMenuAnchor, handleProjectMenuOpen, handleProjectMenuClose] =
    useMenu("FooterMenu.ProjectMenu");
  const [
    batchProcessMenuAnchor,
    handleBatchProcessMenuOpen,
    handleBatchProcessMenuClose,
  ] = useMenu("FooterMenu.BatchProcessMenu");
  const [
    audioTrackMenuAnchor,
    handleAudioTrackMenuOpen,
    handleAudioTrackMenuClose,
  ] = useMenu("FooterMenu.AudioTrackMenu");
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

  const handleAddClick = () => {
    LOG.debug("click AddTab", "FooterMenu");
    if (props.selectMode === "add") {
      props.setSelectMode("toggle");
    } else {
      props.setSelectMode("add");
    }
  };

  const handleUndoClick = () => {
    LOG.debug("click UndoTab", "FooterMenu");
    const allFlag = undoManager.undoAll;
    const undoResult = undoManager.undo();
    if (allFlag) {
      setNotes(undoResult);
    } else {
      const newNotes = notes.slice();
      undoResult.forEach((un) => {
        newNotes[un.index] = un;
      });
      setNotes(newNotes);
    }
  };
  const handleRedoClick = () => {
    LOG.debug("click RedoTab", "FooterMenu");
    const allFlag = undoManager.redoAll;
    const redoResult = undoManager.redo();
    if (allFlag) {
      setNotes(redoResult);
    } else {
      const newNotes = notes.slice();
      redoResult.forEach((un) => {
        newNotes[un.index] = un;
      });
      setNotes(newNotes);
    }
  };

  return (
    <>
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
          onClick={handleProjectMenuOpen}
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
          icon={props.selectMode !== "add" ? <AddBoxIcon /> : <ClearIcon />}
          label={
            props.selectMode !== "add"
              ? t("editor.footer.addNote")
              : t("editor.footer.selectCancel")
          }
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={batchProcessProgress || props.synthesisProgress}
          onClick={handleAddClick}
        />
        <Tab
          icon={
            props.selectMode === "toggle" ? <SelectAllIcon /> : <ClearIcon />
          }
          label={
            props.selectMode === "toggle"
              ? t("editor.footer.selectRange")
              : props.selectMode !== "range"
              ? t("editor.footer.selectCancel")
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
          icon={<UndoIcon />}
          label={t("editor.footer.undo")}
          onClick={handleUndoClick}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            undoManager.undoSummary === undefined || props.synthesisProgress
          }
        />
        <Tab
          icon={<RedoIcon />}
          label={t("editor.footer.redo")}
          onClick={handleRedoClick}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={
            undoManager.redoSummary === undefined || props.synthesisProgress
          }
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
          icon={<AudiotrackIcon />}
          label={t("editor.footer.audiotrack")}
          onClick={handleAudioTrackMenuOpen}
          sx={{ flex: 1, p: 0 }}
          value={0}
          disabled={batchProcessProgress}
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
      <FooterProjectMenu
        anchor={projectMenuAnchor}
        handleClose={handleProjectMenuClose}
        setUstLoadProgress={setUstLoadProgress}
      />
      <FooterAudioTrackMenu
        anchor={audioTrackMenuAnchor}
        handleClose={handleAudioTrackMenuClose}
        setBackgroundAudioWav={props.setBackgroundAudioWav}
        backgroundWavUrl={props.backgroundWavUrl}
        setBackgroundWavUrl={props.setBackgroundWavUrl}
        backgroundOffsetMs={props.backgroundOffsetMs}
        setBackgroundOffsetMs={props.setBackgroundOffsetMs}
        backgroundVolume={props.backgroundVolume}
        setBackgroundVolume={props.setBackgroundVolume}
        backgroundMuted={props.backgroundMuted}
        setBackgroundMuted={props.setBackgroundMuted}
      />
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
  selectMode: "toggle" | "range" | "pitch" | "add";
  /** 選択モードを更新するためのコールバック */
  setSelectMode: (mode: "toggle" | "range" | "pitch" | "add") => void;
  /** 伴奏音声のデータ */
  setBackgroundAudioWav: (wav: Wave) => void;
  /**伴奏音声のurl */
  backgroundWavUrl: string;
  /** 伴奏音声のURLを更新するためのコールバック */
  setBackgroundWavUrl: (url: string) => void;
  /** 伴奏音声のオフセット（ミリ秒） */
  backgroundOffsetMs: number;
  /** 伴奏音声のオフセットを更新するためのコールバック */
  setBackgroundOffsetMs: (offset: number) => void;
  /** 伴奏音声のボリューム（0.0 - 1.0） */
  backgroundVolume: number;
  /** 伴奏音声のボリュームを更新するためのコールバック */
  setBackgroundVolume: (volume: number) => void;
  /** 伴奏音声のミュート状態 */
  backgroundMuted: boolean;
  /** 伴奏音声のミュート状態を更新するためのコールバック */
  setBackgroundMuted: (muted: boolean) => void;
}
