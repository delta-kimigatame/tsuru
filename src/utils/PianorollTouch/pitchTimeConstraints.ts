import { Note } from "../../lib/Note";

/**
 * 時間変更の制約（最小値・最大値）を計算する
 * @param targetPoltament 対象ポルタメントインデックス
 * @param selectedNote 選択中のノート
 * @returns 最小時間と最大時間
 */
export const calculateTimeConstraints = (
  targetPoltament: number,
  selectedNote: Note
): { minTime: number; maxTime: number } => {
  const isFirstPortament = targetPoltament === 0;
  const isLastPortament = targetPoltament === selectedNote.pbw.length;

  let minTime: number;
  let maxTime: number;

  if (isFirstPortament) {
    // 最初のポルタメント：note.prev.msLengthを負の数とした値が最小値
    minTime = selectedNote.prev?.msLength
      ? -selectedNote.prev.msLength
      : Number.NEGATIVE_INFINITY;

    // 最大値：note.pbw[0]の値
    maxTime =
      selectedNote.pbw.length > 0
        ? selectedNote.pbw[0]
        : Number.POSITIVE_INFINITY;
  } else if (isLastPortament) {
    // 最後のポルタメント：pbs.time + 最後から1つ前までのpbw値の合計値が最小値
    const previousPortamentTime =
      selectedNote.pbs.time +
      selectedNote.pbw.slice(0, -1).reduce((sum, val) => sum + val, 0);
    minTime = previousPortamentTime;

    // 最大値： note.msLength
    maxTime = selectedNote.msLength;
  } else {
    // それ以外のポルタメント：pbs.time + 前のpbw値の合計値が最小値
    const previousPortamentTime =
      selectedNote.pbs.time +
      selectedNote.pbw
        .slice(0, targetPoltament - 1)
        .reduce((sum, val) => sum + val, 0);
    minTime = previousPortamentTime;
    // 最大値：次のpbw値
    const nextPortamentTime =
      Math.abs(selectedNote.pbs.time) +
      selectedNote.pbw
        .slice(0, targetPoltament)
        .reduce((sum, val) => sum + val, 0);
    maxTime = nextPortamentTime;
  }

  return { minTime, maxTime };
};
