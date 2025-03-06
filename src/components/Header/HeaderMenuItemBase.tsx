import { Avatar } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

/**
 * ヘッダメニューの各項目における共通のレイアウトを規定する
 * @param props
 * @returns
 */
export const HeaderMenuItemBase: React.FC<HeadermenuItemBaseProps> = (
  props
) => {
  return (
    <MenuItem onClick={props.onClick}>
      <ListItemIcon>
        {typeof props.icon === "string" ? (
          <Avatar sx={{ width: 24, height: 24 }}>{props.icon}</Avatar>
        ) : (
          props.icon
        )}
      </ListItemIcon>
      <ListItemText>{props.text}</ListItemText>
    </MenuItem>
  );
};

export interface HeadermenuItemBaseProps {
  /** メニューをクリックした際の操作を行うコールバック */
  onClick: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
  /** メニューに表示するアイコン。 */
  icon: React.ReactElement | string;
  /** メニューのテキスト */
  text: string;
}

export interface HeaderMenuItemProps {
  onMenuClose: () => void;
}
