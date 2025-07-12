import Avatar from "@mui/material/Avatar";
import * as React from "react";
import { ColorTheme } from "../../types/colorTheme";
/**
 * 色設定メニューにサンプルで表示するアイコン
 * @param param0
 * @returns 色設定メニューにサンプルで表示するアイコン
 */
export const ColorAvatar: React.FC<{
  /** キャンバスの色設定*/
  color: string;
  colorTheme: ColorTheme;
}> = ({ color, colorTheme }) => {
  return (
    <Avatar
      sx={{
        background: color,
        color: color,
        width: 24,
        height: 24,
      }}
    >
      {colorTheme}
    </Avatar>
  );
};
