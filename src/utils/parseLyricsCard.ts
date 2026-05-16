/**
 * 歌詞カードテキストをリリックモーション区間に割り当てる単語リストへ変換する。
 *
 * @param text - 読み込んだテキストファイルの内容
 * @param splitByHalfSpace - 半角スペースでも分割するか（デフォルト: false）。
 *   日本語歌詞では半角スペースを分割対象にしないことを推奨する。
 *   西欧語歌詞（英語・フランス語等）でも半角スペースで分割すると
 *   1単語ずつ区間に割り当てられてしまうため、デフォルトはオフとする。
 * @returns 空文字を除いた分割済み単語配列
 */
export const parseLyricsCard = (
  text: string,
  splitByHalfSpace = false,
): string[] => {
  // 改行コードを統一(\r\n → \n)
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 分割パターン: 改行 + 全角スペース + (オプション)半角スペース
  const pattern = splitByHalfSpace ? /[\n\u3000 ]+/ : /[\n\u3000]+/;

  return normalized
    .split(pattern)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};
