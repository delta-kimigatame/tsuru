import { Note } from "../lib/Note";

/**
 * SVGのX座標を時間（ms）に変換する
 * @param svgPoint SVG座標
 * @param selectedNoteStartX 選択ノートの開始X座標
 * @param selectedNote 選択中のノート
 * @param ustTempo プロジェクトのテンポ
 * @param horizontalZoom 水平方向の拡大率
 * @returns 時間（ms）
 */
export const convertSvgXToTimeMs = (
  svgPoint: { x: number; y: number },
  selectedNoteStartX: number,
  selectedNote: Note,
  ustTempo: number,
  horizontalZoom: number
): number => {
  const relativeX = svgPoint.x - selectedNoteStartX;

  // 対象ノートより右側ではnote.tempoを、左側では前ノート（またはustTempo）を用いる
  const tempo =
    relativeX >= 0 ? selectedNote.tempo : selectedNote.prev?.tempo ?? ustTempo;

  // SVGをmsに変換（480tick = 1拍、1分 = 60秒）
  // NOTES_WIDTH_RATE = (375 - 50) / 1920 = 325/1920
  const relativeXTick = relativeX / ((375 - 50) / 1920) / horizontalZoom;

  return (relativeXTick * (60000 / tempo)) / 480;
};
