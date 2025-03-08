import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Menu } from "@mui/material";
import React from "react";
import { HeaderMenuLanguage } from "./Menu/HeaderMenuLanguage";
import { HeaderMenuTheme } from "./Menu/HeaderMenuTheme";

export const HeaderMenu: React.FC = () => {
  /** メニューの表示を制御するアンカー */
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  /**
   * メニューを開く動作
   * @param e
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchor(e.currentTarget);
  };
  /**
   * メニューを閉じる動作
   */
  const handleClose = () => {
    setAnchor(null);
  };
  return (
    <>
      <IconButton onClick={handleClick} aria-label="メニューを開く">
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        <HeaderMenuLanguage onMenuClose={handleClose} />
        <HeaderMenuTheme onMenuClose={handleClose} />
      </Menu>
    </>
  );
};
