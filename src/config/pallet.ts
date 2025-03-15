/**
 * 仕様策定中。EditorViewの開発にあわせて拡張していく
 */
interface Pallet {
  whiteKey: string;
  blackKey: string;
  horizontalSeparator: string;
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
      horizontalSeparator: "#000000",
    },
    dark: {
      whiteKey: "#000000",
      blackKey: "#606060",
      horizontalSeparator: "#FFFFFF",
    },
  },
};
