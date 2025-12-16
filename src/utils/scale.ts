/**
 * 音高がスケール内の音かどうかを判定するユーティリティ関数
 */

/**
 * メジャースケールの音程パターン（半音単位）
 * 0: ルート, 2: 長2度, 4: 長3度, 5: 完全4度, 7: 完全5度, 9: 長6度, 11: 長7度
 */
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

/**
 * マイナースケールの音程パターン（半音単位・自然短音階）
 * 0: ルート, 2: 長2度, 3: 短3度, 5: 完全4度, 7: 完全5度, 8: 短6度, 10: 短7度
 */
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

/**
 * 音高がスケール内の音かどうかを判定する
 *
 * @param notenum - MIDI音高番号（24-107、C4=60）
 * @param tone - 調のルート音（0=C, 1=C#, ..., 11=B）
 * @param isMinor - 短調かどうか
 * @returns スケール内の音であればtrue、そうでなければfalse
 *
 * @example
 * // C Major (C, D, E, F, G, A, B)
 * isNoteInScale(60, 0, false); // C4 -> true
 * isNoteInScale(61, 0, false); // C#4 -> false
 * isNoteInScale(62, 0, false); // D4 -> true
 *
 * @example
 * // A Minor (A, B, C, D, E, F, G)
 * isNoteInScale(69, 9, true); // A4 -> true
 * isNoteInScale(70, 9, true); // A#4 -> false
 * isNoteInScale(71, 9, true); // B4 -> true
 */
export const isNoteInScale = (
  notenum: number,
  tone: number,
  isMinor: boolean
): boolean => {
  // notenumを0-11の範囲に正規化（オクターブ内の相対位置）
  const noteInOctave = notenum % 12;

  // toneを基準とした相対的な音程を計算
  const relativeInterval = (noteInOctave - tone + 12) % 12;

  // スケールのパターンを選択
  const scaleIntervals = isMinor
    ? MINOR_SCALE_INTERVALS
    : MAJOR_SCALE_INTERVALS;

  // 相対音程がスケール内に含まれているかチェック
  return scaleIntervals.includes(relativeInterval);
};
