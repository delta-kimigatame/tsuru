import React from "react";
import { LOG } from "../lib/Logging";

/**
 * Menuを使用する際のカスタムフック
 * @param logContext ログに表示するコンテキスト名。開くメニューのコンポーネント名などが望ましい
 */
export const useMenu = (
  logContext: string
): [
  /** メニューのanchor element */
  HTMLElement | null,
  /** メニューを開く処理 */
  (e: React.MouseEvent<HTMLElement>) => void,
  /** メニューを閉じる処理 */
  () => void
] => {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  /**
   * メニューを開く処理
   */
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    LOG.debug("メニューを開く", logContext);
    setAnchor(e.currentTarget);
  };
  /**
   * メニューを閉じる処理
   */
  const handleClose = () => {
    LOG.debug("メニューを閉じる", logContext);
    setAnchor(null);
  };
  return [anchor, handleOpen, handleClose];
};
