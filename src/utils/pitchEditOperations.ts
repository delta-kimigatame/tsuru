import { PIANOROLL_CONFIG } from "../config/pianoroll";
import { Note } from "../lib/Note";

/**
 * ピッチ値の変更を適用する
 * @param note 対象ノート
 * @param targetPoltament 対象ポルタメントインデックス
 * @param svgPoint SVG座標
 * @param verticalZoom 垂直方向の拡大率
 * @returns 更新されたノート
 */
export const applyPitchChange = (
  note: Note,
  targetPoltament: number,
  svgPoint: { x: number; y: number },
  verticalZoom: number
): Note => {
  const updatedNote = note.deepCopy();

  // 指し示している音高を小数点第一位まで求める
  const targetPitch =
    107 -
    (svgPoint.y - (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom) / 2) /
      (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom);

  // note.notenumを減じ、10倍した値をpbyの該当インデックスに設定
  const pitchBendValue = Math.round((targetPitch - note.notenum) * 10);

  if (targetPoltament !== 0) {
    // 元のnoteのpby配列をコピーして更新
    const newPby = [...updatedNote.pby];
    newPby[targetPoltament - 1] = pitchBendValue;
    updatedNote.setPby(newPby);
  } else {
    updatedNote.pbsHeight = pitchBendValue;
  }

  return updatedNote;
};
