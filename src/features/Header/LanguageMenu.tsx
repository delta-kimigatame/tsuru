import { Menu } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderMenuItemBase } from "../../components/Header/HeaderMenuItemBase";
import { LOG } from "../../lib/Logging";
import { useCookieStore } from "../../store/cookieStore";
import { Language, languages } from "../../types/language";

/**
 * ヘッダメニュー上に表示される言語メニュー
 * @param props
 * @returns
 */
export const LanguageMenu: React.FC<LanguageMenuProps> = (props) => {
  const { t } = useTranslation();
  const { setLanguage } = useCookieStore.getState();

  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    LOG.debug("click", "LanguageMenu");
    const value = e.currentTarget
      .querySelector(".MuiAvatar-root")
      ?.textContent?.trim() as Language;
    LOG.info(`言語設定の更新:${value}`, "LanguageMenu");
    setLanguage(value);
    props.onMenuClose();
  };
  return (
    <Menu
      anchorEl={props.anchor}
      open={Boolean(props.anchor)}
      onClose={props.onMenuClose}
    >
      {languages.map((l) => (
        <HeaderMenuItemBase
          icon={l}
          text={t("language." + l)}
          key={l}
          onClick={handleClick}
        />
      ))}
    </Menu>
  );
};

export interface LanguageMenuProps {
  onMenuClose: () => void;
  anchor: HTMLElement | null;
}
