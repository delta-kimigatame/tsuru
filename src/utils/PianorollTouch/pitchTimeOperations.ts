import { Note } from "../../lib/Note";

/**
 * 時間変更を適用する
 * @param note 対象ノート
 * @param targetPoltament 対象ポルタメントインデックス
 * @param clampedTime クランプ済みの時間値（ms）
 * @returns 更新されたノート
 */
export const applyTimeChange = (
  note: Note,
  targetPoltament: number,
  clampedTime: number
): Note => {
  const updatedNote = note.deepCopy();
  const isFirstPortament = targetPoltament === 0;

  if (isFirstPortament) {
    // 最初のポルタメント：pbs.timeを更新
    const originalPbsTime = note.pbs.time;
    updatedNote.pbsTime = clampedTime;

    // pbs.timeの変更に合わせてpbw[0]を補正
    if (note.pbw.length > 0) {
      const newPbw = [...updatedNote.pbw];
      // 元のpbs.timeと新しいpbs.timeの差分をpbw[0]に加算
      const timeDifference = originalPbsTime - clampedTime;
      newPbw[0] = newPbw[0] + timeDifference;
      updatedNote.setPbw(newPbw);
    }
  } else {
    // 最初のポルタメント以外:pbw[targetPoltament-1]を更新
    const newPbw = [...updatedNote.pbw];
    // clampedTimeはノートの頭からの絶対時間なので、
    // pbw[targetPoltament-1]の値は、clampedTimeからpbs.timeと前のpbw値を引いた値
    // 元のnoteの値を使って計算
    const previousPbwSum = note.pbw
      .slice(0, targetPoltament - 1)
      .reduce((sum, val) => sum + val, 0);
    const newPbwValue = clampedTime - note.pbs.time - previousPbwSum;

    // 元のpbw値を保存
    const originalPbwValue = note.pbw[targetPoltament - 1];

    // 選択しているpbwを更新（クランプ適用）
    const clampedPbwValue = Math.max(0, newPbwValue);
    newPbw[targetPoltament - 1] = clampedPbwValue;

    // クランプ後の値との差分を計算
    const pbwDifference = clampedPbwValue - originalPbwValue;

    // 次のpbwがある場合は、差分を次のpbwに反映
    if (targetPoltament < newPbw.length) {
      newPbw[targetPoltament] = Math.max(
        0,
        newPbw[targetPoltament] - pbwDifference
      );
    }

    updatedNote.setPbw(newPbw);
  }

  return updatedNote;
};
