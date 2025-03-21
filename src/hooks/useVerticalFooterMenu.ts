import React from "react";
import { EDITOR_CONFIG } from "../config/editor";
import { LOG } from "../lib/Logging";
import { useWindowSize } from "./useWindowSize";

/**
 * 現在の画面サイズでFooterMenuを縦配置にするか否か
 * @returns
 */
export const useVerticalFooterMenu = (): boolean => {
  const windowSize = useWindowSize();
  const [menuVertical, setMenuVertical] = React.useState<boolean>(
    windowSize.height < EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD
  );
  React.useEffect(() => {
    LOG.debug(
      `画面サイズ変更,${windowSize.height},縦メニュー:${
        windowSize.height < EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD
      }`,
      "useVerticalFooterMenu"
    );
    setMenuVertical(
      windowSize.height < EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD
    );
  }, [windowSize]);
  return menuVertical;
};
