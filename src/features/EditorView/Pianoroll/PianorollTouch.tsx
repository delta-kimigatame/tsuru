import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { usePianorollTouch } from "../../../hooks/usePianorollTouch";
import { usePitchEditDrag } from "../../../hooks/usePitchEditDrag";
import { LOG } from "../../../lib/Logging";
import { Ust } from "../../../lib/Ust";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { range } from "../../../utils/array";
import {
  getTargetNoteIndex,
  getTargetPpltamentIndex,
} from "../../../utils/PianorollTouch/pianorollCoordinates";
import {
  handleAddModeTap,
  handlePitchModeTap,
  handleRangeModeTap,
  handleToggleModeTap,
} from "../../../utils/PianorollTouch/pianorollModeHandlers";

/**
 * ピアノロール全体のタップイベントを検知するレイヤー
 *
 * 当初の機能として、notesの選択機能を提供する。
 * props.selectModeがtoggleの時は、クリックしたノートを選択したノート列に追加もしくは削除する
 *
 * props.selectModeがrangeの時は、1回目にクリックしたノートと2回目にクリックしたノートの間のノートを選択する。
 * なお、1つめのノート選択を促す処理は、モード切替時に実施する。
 * @param props
 * @returns
 */
export const PianorollTouch: React.FC<PianorollTouchProps> = (props) => {
  const { t } = useTranslation();
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { ust, notes, setNotes, ustTempo, setUst } = useMusicProjectStore();
  const snackBarStore = useSnackBarStore();
  const [lastTapTime, setLastTapTime] = React.useState<number>(0);
  const [lastTapNoteIndex, setLastTapNoteIndex] = React.useState<
    number | undefined
  >(undefined);

  // ピッチ編集ドラッグ機能を使用
  const pitchEditDrag = usePitchEditDrag({
    selectMode: props.selectMode,
    poltaments: props.poltaments,
    targetPoltament: props.targetPoltament,
    setTargetPoltament: props.setTargetPoltament,
    selectedNotesIndex: props.selectedNotesIndex,
    notes: notes,
    setNotes: setNotes,
    notesLeft: props.notesLeft,
    ustTempo: ustTempo,
    verticalZoom: verticalZoom,
    horizontalZoom: horizontalZoom,
  });

  /**
   * tap時の動作。props.selectModeにあわせてselectNotesIndexを更新する。
   * @param svgPoint
   * @returns
   */
  const handleTap = (coords: { x: number; y: number }, svgPoint: DOMPoint) => {
    const targetPoltamentIndex =
      props.selectMode !== "pitch" || props.poltaments === undefined
        ? undefined
        : getTargetPpltamentIndex(svgPoint, props.poltaments);
    const targetNoteIndex = getTargetNoteIndex(
      svgPoint,
      notes,
      props.notesLeft,
      horizontalZoom,
      verticalZoom
    );
    const tapTime = Date.now();
    /** 同じノートを2回タップしたときの判定 */
    const isDoubleTap =
      targetNoteIndex !== undefined &&
      targetNoteIndex === lastTapNoteIndex &&
      tapTime - lastTapTime <= EDITOR_CONFIG.DOUBLE_TAP_MS;
    /** ノート無しのダブルタップ判定 */
    const isDoubleTapNone =
      targetNoteIndex === undefined &&
      lastTapNoteIndex === undefined &&
      tapTime - lastTapTime <= EDITOR_CONFIG.DOUBLE_TAP_MS;
    setLastTapTime(tapTime);
    setLastTapNoteIndex(targetNoteIndex);
    if (
      targetNoteIndex === undefined &&
      targetPoltamentIndex === undefined &&
      props.selectMode !== "add" &&
      !isDoubleTapNone
    ) {
      return;
    }
    LOG.debug(
      `notes[${targetNoteIndex}] click,mode:${props.selectMode}`,
      "PianorollTouch"
    );
    if (isDoubleTapNone) {
      if (props.selectedNotesIndex.length !== 0) {
        props.setSelectedNotesIndex([]);
        snackBarStore.setSeverity("info");
        snackBarStore.setValue(t("editor.selectReset")); //ノートの選択解除
        snackBarStore.setOpen(true);
      } else {
        // すべてのノートのインデックスを選択
        props.setSelectedNotesIndex(range(0, notes.length - 1));
      }
    } else if (props.selectMode === "pitch") {
      // ポルタメントは既にポインターダウン時に処理済み、ノートのみ処理
      if (targetPoltamentIndex === undefined && targetNoteIndex !== undefined) {
        handlePitchModeTap(
          notes,
          props.selectedNotesIndex,
          targetPoltamentIndex,
          targetNoteIndex,
          props.setTargetPoltament,
          props.setSelectedNotesIndex
        );
      }
    } else if (isDoubleTap) {
      handleDoubleTap(coords, targetNoteIndex);
    } else if (props.selectMode === "toggle") {
      handleToggleModeTap(
        props.selectedNotesIndex,
        targetNoteIndex,
        props.setSelectedNotesIndex
      );
    } else if (props.selectMode === "range") {
      handleRangeModeTap(
        startIndex,
        targetNoteIndex,
        setStartIndex,
        props.setSelectedNotesIndex,
        snackBarStore.setSeverity,
        snackBarStore.setValue,
        snackBarStore.setOpen,
        t("editor.selectRangeEnd")
      );
    } else if (props.selectMode === "add") {
      if (ust === null) {
        initialUst();
      }
      handleAddModeTap(
        svgPoint,
        notes,
        props.notesLeft,
        ustTempo,
        props.addNoteLength,
        props.addNoteLyric,
        verticalZoom,
        horizontalZoom,
        setNotes
      );
    }
  };

  const initialUst = () => {
    const initialUst = new Ust();
    initialUst.tempo = 120;
    initialUst.flags = "";
    setUst(initialUst);
  };

  const handleHold = (coords: { x: number; y: number }, svgPoint) => {
    // ピッチドラッグ中はホールドを無効にする
    if (pitchEditDrag.isPitchDragging) {
      return;
    }

    const targetNoteIndex = getTargetNoteIndex(
      svgPoint,
      notes,
      props.notesLeft,
      horizontalZoom,
      verticalZoom
    );
    if (
      targetNoteIndex === undefined &&
      props.selectedNotesIndex.length !== 0
    ) {
      props.setMenuAnchor({ x: coords.x, y: coords.y });
    } else if (
      targetNoteIndex !== undefined &&
      props.selectedNotesIndex.includes(targetNoteIndex)
    ) {
      props.setMenuAnchor({ x: coords.x, y: coords.y });
    } else if (targetNoteIndex !== undefined) {
      props.setSelectedNotesIndex([targetNoteIndex]);
      props.setMenuAnchor({ x: coords.x, y: coords.y });
    }
  };

  const handleDoubleTap = (
    coords: { x: number; y: number },
    targetNoteIndex: number
  ) => {
    props.setLyricAnchor({ x: coords.x, y: coords.y });
    props.setLyricTargetIndex(targetNoteIndex);
  };

  const {
    handlePointerDown: originalHandlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    startIndex,
    setStartIndex,
  } = usePianorollTouch({
    selectMode: props.selectMode,
    holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
    onTap: handleTap,
    onHold: handleHold,
  });

  /**
   * ポインターダウンハンドラー（ピッチ編集対応）
   */
  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    // ピッチ編集のハンドラーを先に実行
    const pitchHandled = pitchEditDrag.handlePointerDown(event);

    // ピッチ編集でイベントが処理された場合は元のハンドラーをスキップ
    if (pitchHandled) {
      return;
    }

    // 元のハンドラーを実行
    originalHandlePointerDown(event);
  };

  /**
   * ポインターアップハンドラー（ピッチ編集対応）
   */
  const handlePitchPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    // ピッチ編集のハンドラーを実行し、タップをスキップすべきか確認
    const shouldSkipTap = pitchEditDrag.handlePointerUp(event);

    // ドラッグ後の場合はタップイベントを発火させない
    if (shouldSkipTap) {
      return;
    }

    // 元のハンドラーも実行
    handlePointerUp(event);
  };

  /**
   * ポインターキャンセルハンドラー（ピッチ編集対応）
   */
  const handlePitchPointerCancel = (
    event: React.PointerEvent<SVGSVGElement>
  ) => {
    // ピッチ編集のハンドラーを実行
    pitchEditDrag.handlePointerCancel(event);

    // 元のハンドラーも実行
    handlePointerCancel();
  };

  return (
    <svg
      width={
        (props.totalLength + 480 * 8) *
        PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
        horizontalZoom
      }
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9,
        pointerEvents: "all",
        touchAction:
          props.selectMode === "pitch" &&
          (props.targetPoltament !== undefined || pitchEditDrag.isPitchDragging)
            ? "none"
            : "auto",
        cursor: pitchEditDrag.isPitchDragging ? "grabbing" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        // iOS対応: タッチ時のハイライト無効化
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      onPointerUp={handlePitchPointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={pitchEditDrag.handlePointerMove}
      onPointerCancel={handlePitchPointerCancel}
    >
      <rect
        x={0}
        y={0}
        width={
          (props.totalLength + 480 * 8) *
          PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
          horizontalZoom
        }
        height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
        fill="transparent"
      />
    </svg>
  );
};

export interface PianorollTouchProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex: (indexes: number[]) => void;
  notesLeft: Array<number>;
  totalLength: number;
  selectMode?: "toggle" | "range" | "pitch" | "add";
  setMenuAnchor: (anchor: { x: number; y: number }) => void;
  setLyricAnchor: (anchor: { x: number; y: number }) => void;
  poltaments?: Array<{ x: number; y: number }>;
  /** 現在選択されているポルタメントのインデックス */
  targetPoltament?: number | undefined;
  /** ピッチ編集モードで操作するポルタメントのインデックスを更新するためのコールバック */
  setTargetPoltament?: (index: number | undefined) => void;
  /** 歌詞編集更新のためのコールバック */
  setLyricTargetIndex: (index: number | undefined) => void;
  addNoteLength?: number;
  addNoteLyric?: string;
}
