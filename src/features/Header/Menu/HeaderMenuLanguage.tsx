import React from "react";
import { useTranslation } from "react-i18next";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { useCookieStore } from "../../../store/cookieStore";
import { LanguageMenu } from "../LanguageMenu";

/**
 * ヘッダメニュー上で言語設定を扱う。
 * クリックすると言語メニューを表示する。
 * @param props
 * @returns
 */
export const HeaderMenuLanguage: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const { language } = useCookieStore.getState();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setAnchor(e.currentTarget);
  };

  /**
   * 言語メニューの処理が完了した際の処理。
   * 言語メニューとヘッダーメニューの両方を閉じる
   */
  const handleMenuClose = () => {
    setAnchor(null);
    props.onMenuClose();
  };

  return (
    <>
      <HeaderMenuItemBase
        onClick={handleClick}
        icon={language}
        text={t("language." + language)}
      />
      <LanguageMenu anchor={anchor} onMenuClose={handleMenuClose} />
    </>
  );
};
