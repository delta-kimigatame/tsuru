import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Menu } from "@mui/material";
import React from "react";
import { HeaderMenuLanguage } from "../../../features/Header/Menu/HeaderMenuLanguage";
import { HeaderMenuTheme } from "../../../features/Header/Menu/HeaderMenuTheme";

export const HeaderMenu: React.FC = () => {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchor(e.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} aria-label="Open menu" color="inherit">
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        <HeaderMenuLanguage onMenuClose={handleClose} />
        <HeaderMenuTheme onMenuClose={handleClose} />
      </Menu>
    </>
  );
};
