import React from "react";
import { useTranslation } from "react-i18next";
import { ColorAvatar } from "../../../components/Header/ColorAvatar";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { COLOR_PALLET } from "../../../config/pallet";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { LOG } from "../../../lib/Logging";
import { useCookieStore } from "../../../store/cookieStore";
import { ColorThemeMenu } from "../ColorThemeMenu";

/**
 * ヘッダメニュー上で言語設定を扱う。
 * クリックすると色設定メニューを表示する。
 * @param props
 * @returns
 */
export const HeaderMenuColorTheme: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const mode = useThemeMode();
  const { colorTheme } = useCookieStore.getState();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    LOG.debug("click", "HeaderMenuColorTheme");
    LOG.info("色設定メニューの表示", "HeaderMenuColorTheme");
    setAnchor(e.currentTarget);
  };
  /**
   * 色設定メニューの処理が完了した際の処理。
   * 色設定メニューとヘッダーメニューの両方を閉じる
   */
  const handleMenuClose = () => {
    LOG.info("色設定メニューを閉じる", "HeaderMenuColorTheme");
    setAnchor(null);
    props.onMenuClose();
  };

  return (
    <>
      <HeaderMenuItemBase
        onClick={handleClick}
        icon={
          <ColorAvatar
            color={COLOR_PALLET[colorTheme][mode]["selectedNote"]}
            colorTheme={colorTheme}
          />
        }
        text={t("colorTheme." + colorTheme)}
      />
      <ColorThemeMenu anchor={anchor} onMenuClose={handleMenuClose} />
    </>
  );
};
