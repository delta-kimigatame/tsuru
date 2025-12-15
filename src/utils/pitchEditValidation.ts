import { Note } from "../lib/Note";

/**
 * ピッチ編集の可否を判定する
 * @param targetPoltament 対象のポルタメントインデックス
 * @param selectedNote 選択中のノート
 * @returns ピッチ編集可否と時間編集可否
 */
export const validatePitchEditability = (
  targetPoltament: number,
  selectedNote: Note
): { canEditPitch: boolean; canEditTime: boolean } => {
  const isLastPortament = targetPoltament === selectedNote.pbw.length;
  const isFirstPortament = targetPoltament === 0;
  const canEditFirstPortament =
    selectedNote.prev === null || selectedNote.prev?.lyric === "R";

  let canEditPitch = true;
  let canEditTime = true;

  // 最後のポルタメントはピッチ変更できない
  if (isLastPortament) {
    canEditPitch = false;
  }

  // 最初のポルタメントは条件付きでのみピッチ変更可能
  if (isFirstPortament && !canEditFirstPortament) {
    canEditPitch = false;
  }

  return { canEditPitch, canEditTime };
};
