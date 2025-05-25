import MenuIcon from "@mui/icons-material/Menu";
import { Divider, IconButton, Menu } from "@mui/material";
import React from "react";
import { LOG } from "../../lib/Logging";
import { HeaderMenuClearCache } from "./Menu/HeaderMenuClearCache";
import { HeaderMenuLanguage } from "./Menu/HeaderMenuLanguage";
import { HeaderMenuLog } from "./Menu/HeaderMenuLog";
import { HeaderMenuTheme } from "./Menu/HeaderMenuTheme";

export const HeaderMenu: React.FC = () => {
  /** メニューの表示を制御するアンカー */
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  /**
   * メニューを開く動作
   * @param e
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    LOG.debug("click", "HeaderMenu");
    LOG.info("ヘッダメニューを開く", "HeaderMenu");
    setAnchor(e.currentTarget);
  };
  /**
   * メニューを閉じる動作
   */
  const handleClose = () => {
    LOG.info("ヘッダメニューを閉じる", "HeaderMenu");
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
        <Divider />
        <HeaderMenuLog onMenuClose={handleClose} />
        <Divider />
        <HeaderMenuClearCache onMenuClose={handleClose} />
      </Menu>
    </>
  );
};
