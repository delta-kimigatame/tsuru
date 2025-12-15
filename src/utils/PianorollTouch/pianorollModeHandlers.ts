import { PIANOROLL_CONFIG } from "../../config/pianoroll";
import { LOG } from "../../lib/Logging";
import { Note } from "../../lib/Note";
import { range } from "../array";
import { AddNote, playPreviewTone } from "./noteOperations";
import { getTargetNoteIndexFromX } from "./pianorollCoordinates";

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
      "PianorollTouch"
    );
    setTargetPoltament(targetPoltamentIndex);
  } else if (notes[targetNoteIndex].lyric !== "R") {
    // ノートをタップした場合
    LOG.debug(`${targetNoteIndex}に切替`, "PianorollTouch");
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
    LOG.debug(`${targetNoteIndex}を選択`, "PianorollTouch");
    const newSelectNotesIndex = selectedNotesIndex.slice();
    newSelectNotesIndex.push(targetNoteIndex);
    setSelectedNotesIndex(newSelectNotesIndex.sort((a, b) => a - b));
  } else {
    //選択済みの場合
    LOG.debug(`${targetNoteIndex}を選択解除`, "PianorollTouch");
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
    LOG.debug(`${targetNoteIndex}を始点にセット`, "PianorollTouch");
    setStartIndex(targetNoteIndex);
    setSeverity("info");
    setValue(snackBarText); //範囲の終わりのノートを選択してください
    setOpen(true);
  } else {
    LOG.debug(`${startIndex}～${targetNoteIndex}を選択`, "PianorollTouch");
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
  if (addNoteLyric !== "R") {
    playPreviewTone(clickNotenum);
  }
};
