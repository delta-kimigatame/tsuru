import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { useCookieStore } from "../../../store/cookieStore";
import { ThemeMenu } from "../ThemeMenu";
/**
 * ヘッダメニュー上でテーマ設定を扱う。
 * クリックするとテーマメニューを表示する。
 * @param props
 * @returns
 */
export const HeaderMenuTheme: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const { mode } = useCookieStore.getState();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setAnchor(e.currentTarget);
  };

  /**
   * テーマメニューの処理が完了した際の処理。
   * テーマメニューとヘッダーメニューの両方を閉じる
   */
  const handleMenuClose = () => {
    setAnchor(null);
    props.onMenuClose();
  };

  return (
    <>
      <HeaderMenuItemBase
        onClick={handleClick}
        icon={
          mode === "system" ? (
            <PhonelinkSetupIcon />
          ) : mode === "light" ? (
            <LightModeIcon />
          ) : (
            <DarkModeIcon />
          )
        }
        text={t("theme." + mode)}
      />
      <ThemeMenu anchor={anchor} onMenuClose={handleMenuClose} />
    </>
  );
};
