import { Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BaseBatchProcess } from "../../../lib/BaseBatchProcess";

export const FooterBatchProcessMenu: React.FC<FooterBatchProcessMenuProps> = (
  props
) => {
  const { t } = useTranslation();
  return (
    <Menu
      anchorEl={props.anchor}
      open={Boolean(props.anchor)}
      onClose={props.handleClose}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
    >
      {props.batchProcesses.map((bp, i) => {
        return (
          <MenuItem
            key={i}
            onClick={() => {
              props.process(i);
            }}
          >
            {t(bp.title)}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export interface FooterBatchProcessMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
  /** バッチプロセスの一覧 */
  batchProcesses: Array<{ title: string; cls: new () => BaseBatchProcess }>;
  /** バッチプロセスを実行するためのコールバック */
  process: (number) => void;
}
