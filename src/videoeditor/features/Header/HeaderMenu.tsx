import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderMenuLanguage } from "../../../features/Header/Menu/HeaderMenuLanguage";
import { HeaderMenuTheme } from "../../../features/Header/Menu/HeaderMenuTheme";

export const HeaderMenu: React.FC = () => {
  const { t } = useTranslation();
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
        <MenuItem component="a" href="./index.html" onClick={handleClose}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("videoEditor.headerBackToMain")}</ListItemText>
        </MenuItem>
        <HeaderMenuLanguage onMenuClose={handleClose} />
        <HeaderMenuTheme onMenuClose={handleClose} />
      </Menu>
    </>
  );
};
