/**
 * 仕様策定中。EditorViewの開発にあわせて拡張していく
 */
interface Pallet {
  /** ピアノロールの白鍵部分の色 */
  whiteKey: string;
  /** ピアノロールの黒鍵部分の色 */
  blackKey: string;
  /** ピアノロールの音高毎のセパレータの色 */
  horizontalSeparator: string;
  /** ピアノロールの拍子毎のセパレータの色 */
  verticalSeparator: string;
  /** 休符ノートの色 */
  restNote: string;
  /** 休符ノートの色(選択時) */
  selectedRestNote: string;
  /** ノートの色 */
  note: string;
  /** ノートの色(選択時) */
  selectedNote: string;
  /** ノートの枠線の色 */
  noteBorder: string;
  /** 歌詞の文字色 */
  lyric: string;
}

interface ColorPallet {
  light: Pallet;
  dark: Pallet;
}

/**
 * エディタビューで使用するカラーパレット。
 * cookieのcolorThemeとmodeを用いて色を決定する。
 */
export const COLOR_PALLET: { [key: string]: ColorPallet } = {
  default: {
    light: {
      whiteKey: "#FFFFFF",
      blackKey: "#F0F0F0",
      verticalSeparator: "#000090",
      horizontalSeparator: "#000000",
      restNote: "#D0D0D0",
      selectedRestNote: "#A0A0A0",
      note: "#F0D0F0",
      selectedNote: "#F090F0",
      noteBorder: "#000000",
      lyric: "#000000",
    },
    dark: {
      whiteKey: "#000000",
      blackKey: "#606060",
      verticalSeparator: "#C0C0FF",
      horizontalSeparator: "#FFFFFF",
      restNote: "#909090",
      selectedRestNote: "#C0C0C0",
      note: "#906090",
      selectedNote: "#F090F0",
      noteBorder: "#FFFFFF",
      lyric: "#FFFFFF",
    },
  },
};
