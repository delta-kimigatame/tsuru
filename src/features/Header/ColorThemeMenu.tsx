import { Menu } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { ColorAvatar } from "../../components/Header/ColorAvatar";
import { HeaderMenuItemBase } from "../../components/Header/HeaderMenuItemBase";
import { COLOR_PALLET } from "../../config/pallet";
import { useThemeMode } from "../../hooks/useThemeMode";
import { LOG } from "../../lib/Logging";
import { useCookieStore } from "../../store/cookieStore";
import { ColorTheme, colors } from "../../types/colorTheme";

/**
 * ヘッダメニュー上に表示される色設定メニュー
 * @param props
 * @returns
 */
export const ColorThemeMenu: React.FC<ColorThemeMenuProps> = (props) => {
  const { t } = useTranslation();
  const mode = useThemeMode();
  const { setColorTheme } = useCookieStore.getState();

  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    LOG.debug("click", "ColorThemeMenu");
    const value = e.currentTarget
      .querySelector(".MuiAvatar-root")
      ?.textContent?.trim() as ColorTheme;
    LOG.info(`色設定の更新:${value}`, "ColorThemeMenu");
    setColorTheme(value);
    props.onMenuClose();
  };
  return (
    <Menu
      anchorEl={props.anchor}
      open={Boolean(props.anchor)}
      onClose={props.onMenuClose}
    >
      {colors.map((c) => (
        <HeaderMenuItemBase
          icon={
            <ColorAvatar
              color={COLOR_PALLET[c][mode]["selectedNote"]}
              colorTheme={c}
            />
          }
          text={t("colorTheme." + c)}
          key={c}
          onClick={handleClick}
        />
      ))}
    </Menu>
  );
};

export interface ColorThemeMenuProps {
  onMenuClose: () => void;
  anchor: HTMLElement | null;
}
