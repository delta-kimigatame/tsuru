import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { usePianorollTouch } from "../../../hooks/usePianorollToutch";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { Ust } from "../../../lib/Ust";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { last, range } from "../../../utils/array";

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
export const PianorollToutch: React.FC<PianorollToutchProps> = (props) => {
  const { t } = useTranslation();
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { ust, notes, setNotes, ustTempo, setUst } = useMusicProjectStore();
  const snackBarStore = useSnackBarStore();

  /**
   * tap時の動作。props.selectModeにあわせてselectNotesIndexを更新する。
   * @param svgPoint
   * @returns
   */
  const handleTap = (svgPoint: DOMPoint) => {
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
    if (
      targetNoteIndex === undefined &&
      targetPoltamentIndex === undefined &&
      props.selectMode !== "add"
    ) {
      return;
    }
    LOG.debug(
      `notes[${targetNoteIndex}] click,mode:${props.selectMode}`,
      "PianorollToutch"
    );
    if (props.selectMode === "pitch") {
      handlePitchModeTap(
        notes,
        props.selectedNotesIndex,
        targetPoltamentIndex,
        targetNoteIndex,
        props.setTargetPoltament,
        props.setSelectedNotesIndex
      );
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
  const {
    handlePointerDown,
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
      }}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerCancel={handlePointerCancel}
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

/**
 * クリックした座標を与えてタップしたポルタメントを返す
 * @param svgPoint svg空間における座標
 * @param poltaments ポルタメントの座標一覧
 * @returns クリックしたポルタメントのインデックスを返す。該当がなければundefinedを返す
 */
export const getTargetPpltamentIndex = (
  svgPoint: { x: number; y: number },
  poltaments: Array<{ x: number; y: number }>
) => {
  let minIndex: number | undefined = undefined;
  let minDistance: number = EDITOR_CONFIG.PITCH_POLTAMENT_THRESHOLD;
  poltaments.forEach((p, i) => {
    const distance = Math.sqrt(
      (svgPoint.x - p.x) ** 2 + (svgPoint.y - p.y) ** 2
    );
    if (distance <= minDistance) {
      minDistance = distance;
      minIndex = i;
    }
  });
  return minIndex;
};

/**
 * クリックした座標を与えてクリックしたノートのインデックスを返す。ノート以外をクリックした場合はundefinedを返す
 * @param svgPoint svg空間における座標
 * @param notes globalなノート列
 * @param notesLeft 各ノートの始点までのlengthを累積した値
 * @param horizontalZoom 水平方向の拡大率
 * @param verticalZoom 垂直方向の拡大率
 * @returns クリックしたノートのインデックスを返す。ノート以外をクリックした場合はundefinedを返す
 */
export const getTargetNoteIndex = (
  svgPoint: { x: number; y: number },
  notes: Note[],
  notesLeft: number[],
  horizontalZoom: number,
  verticalZoom: number
): number | undefined => {
  /**
   * svg座標より大きいxの中で最小の要素のindex
   */
  const targetNoteIndex = getTargetNoteIndexFromX(
    svgPoint.x,
    notes,
    notesLeft,
    horizontalZoom
  );
  if (targetNoteIndex === undefined) {
    return undefined;
  } else {
    const clickNotenum =
      107 - Math.floor(svgPoint.y / PIANOROLL_CONFIG.KEY_HEIGHT / verticalZoom);
    return notes[targetNoteIndex] === undefined
      ? undefined
      : notes[targetNoteIndex].notenum === clickNotenum
      ? targetNoteIndex
      : undefined;
  }
};

/**
 * svg上のx座標から、該当する位置にあるノートのインデックスを求める。
 * @param x クリックしたX座標
 * @param notes ノート列
 * @param notesLeft ノートの左端列
 * @param horizontalZoom 水平方向の拡大率
 * @returns ノートのindex。ただし、最後のノートより右の座標が与えられた場合undefined
 */
export const getTargetNoteIndexFromX = (
  x: number,
  notes: Note[],
  notesLeft: number[],
  horizontalZoom: number
): number | undefined => {
  const targetX = x / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom;
  const targetNoteIndex_ = notesLeft.findIndex((x) => x > targetX) - 1;
  const targetNoteIndex =
    targetNoteIndex_ < 0
      ? last(notesLeft) +
          (last(notes) === undefined ? 0 : last(notes).length) <=
        targetX
        ? undefined
        : notes.length - 1
      : targetNoteIndex_;
  return targetNoteIndex;
};

export interface PianorollToutchProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex: (indexes: number[]) => void;
  notesLeft: Array<number>;
  totalLength: number;
  selectMode?: "toggle" | "range" | "pitch" | "add";
  setMenuAnchor: (anchor: { x: number; y: number }) => void;
  poltaments?: Array<{ x: number; y: number }>;
  /** ピッチ編集モードで操作するポルタメントのインデックスを更新するためのコールバック */
  setTargetPoltament?: (index: number | undefined) => void;
  addNoteLength?: number;
  addNoteLyric?: string;
}

export const AddNote = (
  notes: Note[],
  index: number | undefined,
  notenum: number,
  addNoteLyric: string,
  addNoteLength: number,
  ustTempo: number
): Note[] => {
  const newNote = createNewNote(
    notes,
    index,
    notenum,
    addNoteLyric,
    addNoteLength,
    ustTempo
  );
  const newNotes =
    notes === undefined || notes.length === 0
      ? [newNote]
      : index === undefined
      ? notes.slice().concat([newNote])
      : notes.slice(0, index).concat([newNote], notes.slice(index));
  undoManager.register({
    undo: (oldNotes: Note[]): Note[] => oldNotes,
    undoArgs: notes === undefined ? [] : notes.map((n) => n.deepCopy()),
    redo: (newNotes: Note[]): Note[] => newNotes,
    redoArgs: newNotes.map((n) => n.deepCopy()),
    summary: `ノートの追加。追加位置${index},歌詞:${addNoteLyric},長さ:${addNoteLength}`,
    all: true,
  });
  return newNotes;
};

/**
 * 追加されるノートを生成する処理
 * @param notes グローバルな状態ノート
 * @param index ノートを追加するindex。undefinedの際はノート列の末尾に追加される
 * @param notenum 追加する音高
 * @param addNoteLyric 追加する歌詞
 * @param addNoteLength 追加する長さ
 * @param ustTempo プロジェクトのテンポ
 * @returns 追加されるノート
 */
const createNewNote = (
  notes: Note[],
  index: number | undefined,
  notenum: number,
  addNoteLyric: string,
  addNoteLength: number,
  ustTempo: number
): Note => {
  const newNote = new Note();
  newNote.hasTempo = false;
  newNote.lyric = addNoteLyric;
  newNote.length = addNoteLength;
  newNote.notenum = notenum;
  newNote.tempo =
    notes === undefined || notes.length === 0
      ? ustTempo
      : index === undefined
      ? last(notes).tempo
      : notes[index].tempo;
  return newNote;
};

/**
 * Pitchモードでタップした際の処理
 * @param notes グローバルな状態ノート
 * @param selectedNotesIndex 選択しているノートの一覧。ピッチモードにおいては、長さ1の列であることが期待される。
 * @param targetPoltamentIndex 選択しているポルタメントのインデックス
 * @param targetNoteIndex 現在選択されているノート以外をタップした際の対象ノートのインデックス
 * @param setTargetPoltament 選択しているポルタメントを変更するためのコールバック
 * @param setSelectedNotesIndex 選択ノートの一覧を更新するためのコールバック
 */
export const handlePitchModeTap = (
  notes: Note[],
  selectedNotesIndex: number[],
  targetPoltamentIndex: number | undefined,
  targetNoteIndex: number | undefined,
  setTargetPoltament: (number) => void,
  setSelectedNotesIndex: (number) => void
) => {
  //ピッチモード
  if (targetPoltamentIndex !== undefined) {
    // ポルタメントをタップした場合
    LOG.debug(
      `${selectedNotesIndex[0]}のポルタメント${targetPoltamentIndex}`,
      "PianorollToutch"
    );
    setTargetPoltament(targetPoltamentIndex);
  } else if (notes[targetNoteIndex].lyric !== "R") {
    // ノートをタップした場合
    LOG.debug(`${targetNoteIndex}に切替`, "PianorollToutch");
    setSelectedNotesIndex([targetNoteIndex]);
  }
};

/**
 * Toggleモードで画面をタップした際の動作
 * @param selectedNotesIndex 現在選択しているノートのインデックスの一覧
 * @param targetNoteIndex タップしたノートのインデックス
 * @param setSelectedNotesIndex 現在選択しているノートのインデックスの一覧を更新するためのコールバック
 */
export const handleToggleModeTap = (
  selectedNotesIndex: number[],
  targetNoteIndex: number,
  setSelectedNotesIndex: (number) => void
) => {
  if (!selectedNotesIndex.includes(targetNoteIndex)) {
    //未選択の場合
    LOG.debug(`${targetNoteIndex}を選択`, "PianorollToutch");
    const newSelectNotesIndex = selectedNotesIndex.slice();
    newSelectNotesIndex.push(targetNoteIndex);
    setSelectedNotesIndex(newSelectNotesIndex.sort((a, b) => a - b));
  } else {
    //選択済みの場合
    LOG.debug(`${targetNoteIndex}を選択解除`, "PianorollToutch");
    setSelectedNotesIndex(
      selectedNotesIndex.filter((n) => n != targetNoteIndex)
    );
  }
};

/**
 * Rangeモードでノートをタップした際の処理
 * @param startIndex 範囲選択の始点のインデックス
 * @param targetNoteIndex 今回選択したノートのインデックス
 * @param setStartIndex 範囲選択の始点を更新するためのコールバック
 * @param setSelectedNotesIndex 選択ノートを更新するためのコールバック
 * @param setSeverity スナックバーの種類を設定するためのコールバック
 * @param setValue スナックバーに表示するテキストを設定するためのコールバック
 * @param setOpen スナックバーを表示するためのコールバック
 * @param snackBarText スナックバーに表示するテキスト
 */
export const handleRangeModeTap = (
  startIndex: number | undefined,
  targetNoteIndex: number,
  setStartIndex: (number) => void,
  setSelectedNotesIndex: (number) => void,
  setSeverity: (severity: "success" | "info" | "warning" | "error") => void,
  setValue: (string) => void,
  setOpen: (boolean) => void,
  snackBarText: string
) => {
  if (startIndex === undefined) {
    LOG.debug(`${targetNoteIndex}を始点にセット`, "PianorollToutch");
    setStartIndex(targetNoteIndex);
    setSeverity("info");
    setValue(snackBarText); //範囲の終わりのノートを選択してください
    setOpen(true);
  } else {
    LOG.debug(`${startIndex}～${targetNoteIndex}を選択`, "PianorollToutch");
    setSelectedNotesIndex(range(startIndex, targetNoteIndex));
  }
};

/**
 * Addモードで画面をタップした際の処理
 * @param svgPoint タップしたsvg座標
 * @param notes グローバルな状態ノート
 * @param notesLeft 各ノートの開始までの累積tick
 * @param ustTempo プロジェクトのテンポ
 * @param addNoteLength 追加するノートの長さ
 * @param addNoteLyric 追加するノートの歌詞
 * @param verticalZoom 音高方向の拡大率
 * @param horizontalZoom 時間方向の拡大率
 * @param setNotes グローバルな状態ノートを更新するためのコールバック
 */
export const handleAddModeTap = (
  svgPoint: DOMPoint,
  notes: Note[],
  notesLeft: number[],
  ustTempo: number,
  addNoteLength: number,
  addNoteLyric: string,
  verticalZoom: number,
  horizontalZoom: number,
  setNotes: (notes: Note[]) => void
) => {
  const clickNotenum =
    107 - Math.floor(svgPoint.y / PIANOROLL_CONFIG.KEY_HEIGHT / verticalZoom);
  const targetNoteIndexFromX = getTargetNoteIndexFromX(
    svgPoint.x,
    notes === undefined ? [] : notes,
    notesLeft,
    horizontalZoom
  );
  const newNotes = AddNote(
    notes,
    targetNoteIndexFromX,
    clickNotenum,
    addNoteLyric,
    addNoteLength,
    ustTempo
  );
  setNotes(newNotes);
};
