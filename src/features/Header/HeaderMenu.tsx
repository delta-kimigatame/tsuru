import MenuIcon from "@mui/icons-material/Menu";
import { Divider, IconButton, Menu } from "@mui/material";
import React from "react";
import { LOG } from "../../lib/Logging";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { HeaderMenuClearCache } from "./Menu/HeaderMenuClearCache";
import { HeaderMenuClearProject } from "./Menu/HeaderMenuClearProject";
import { HeaderMenuColorTheme } from "./Menu/HeaderMenuColorTheme";
import { HeaderMenuLanguage } from "./Menu/HeaderMenuLanguage";
import { HeaderMenuLog } from "./Menu/HeaderMenuLog";
import { HeaderMenuTheme } from "./Menu/HeaderMenuTheme";
import { HeaderMenuWorkers } from "./Menu/HeaderMenuWorkers";

export const HeaderMenu: React.FC = () => {
  /** メニューの表示を制御するアンカー */
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const { vb } = useMusicProjectStore();

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
    LOG.debug("ヘッダメニューを閉じる", "HeaderMenu");
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
        <HeaderMenuColorTheme onMenuClose={handleClose} />
        {vb === null && <HeaderMenuWorkers onMenuClose={handleClose} />}
        <Divider />
        <HeaderMenuLog onMenuClose={handleClose} />
        <Divider />
        <HeaderMenuClearProject onMenuClose={handleClose} />
        <HeaderMenuClearCache onMenuClose={handleClose} />
      </Menu>
    </>
  );
};
