import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import { Menu } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderMenuItemBase } from "../../components/Header/HeaderMenuItemBase";
import { LOG } from "../../lib/Logging";
import { useCookieStore } from "../../store/cookieStore";
import { Mode } from "../../types/mode";

export const ThemeMenu: React.FC<ThemeMenuProps> = (props) => {
  const { t } = useTranslation();
  const { setMode } = useCookieStore.getState();

  /**
   * テーマを変更し、メニューを閉じる
   * @param value "light"か"dark"か"system"
   */
  const handleClick = (value: Mode) => {
    LOG.debug("click", "ThemeMenu");
    setMode(value);
    LOG.info(`modeの変更:${value}`, "ThemeMenu");
    props.onMenuClose();
  };
  return (
    <Menu
      anchorEl={props.anchor}
      open={Boolean(props.anchor)}
      onClose={props.onMenuClose}
    >
      <HeaderMenuItemBase
        icon={<PhonelinkSetupIcon />}
        text={t("theme.system")}
        onClick={() => {
          handleClick("system");
        }}
      />
      <HeaderMenuItemBase
        icon={<LightModeIcon />}
        text={t("theme.light")}
        onClick={() => {
          handleClick("light");
        }}
      />
      <HeaderMenuItemBase
        icon={<DarkModeIcon />}
        text={t("theme.dark")}
        onClick={() => {
          handleClick("dark");
        }}
      />
    </Menu>
  );
};
export interface ThemeMenuProps {
  onMenuClose: () => void;
  anchor: HTMLElement | null;
}
