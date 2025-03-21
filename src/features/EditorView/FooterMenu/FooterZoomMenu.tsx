import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../../lib/Logging";
import { useCookieStore } from "../../../store/cookieStore";
import { last } from "../../../utils/array";

export const VERTICAL_ZOOM: Array<number> = [0.25, 0.5, 0.75, 1] as const;
export const HORIZONTAL_ZOOM: Array<number> = [
  0.01, 0.1, 0.25, 0.5, 1, 2, 4,
] as const;

export const FooterZoomMenu: React.FC<FooterZoomMenuProps> = ({
  anchor,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { horizontalZoom, verticalZoom, setHorizontalZoom, setVerticalZoom } =
    useCookieStore();

  /**
   * エディタを水平方向に縮小する。
   */
  const handleHorizontalZoomOutClick = () => {
    LOG.debug("handleHorizontalZoomInClick", "FooterZoomMenu");
    const zoomIns = HORIZONTAL_ZOOM.filter((z) => z < horizontalZoom);
    const result = zoomIns.length === 0 ? last(HORIZONTAL_ZOOM) : last(zoomIns);
    LOG.debug(`水平方向の拡大率:${result}`, "FooterZoomMenu");
    setHorizontalZoom(result);
    handleClose();
  };
  /**
   * エディタを水平方向に拡大する。
   */
  const handleHorizontalZoomInClick = () => {
    LOG.debug("handleHorizontalZoomOutClick", "FooterZoomMenu");
    const zoomOuts = HORIZONTAL_ZOOM.filter((z) => z > horizontalZoom);
    const result = zoomOuts.length === 0 ? last(HORIZONTAL_ZOOM) : zoomOuts[0];
    LOG.debug(`水平方向の拡大率:${result}`, "FooterZoomMenu");
    setHorizontalZoom(result);
    handleClose();
  };
  /**
   * エディタを垂直方向に縮小する。
   */
  const handleVerticalZoomOutClick = () => {
    LOG.debug("handleVerticalZoomInClick", "FooterZoomMenu");
    const zoomIns = VERTICAL_ZOOM.filter((z) => z < verticalZoom);
    const result = zoomIns.length === 0 ? last(VERTICAL_ZOOM) : last(zoomIns);
    LOG.debug(`垂直方向の拡大率:${result}`, "FooterZoomMenu");
    setVerticalZoom(result);
    handleClose();
  };
  /**
   * エディタを垂直方向に拡大する。
   */
  const handleVerticalZoomInClick = () => {
    LOG.debug("handleVerticalZoomOutClick", "FooterZoomMenu");
    const zoomOuts = VERTICAL_ZOOM.filter((z) => z > verticalZoom);
    const result = zoomOuts.length === 0 ? last(VERTICAL_ZOOM) : zoomOuts[0];
    LOG.debug(`垂直方向の拡大率:${result}`, "FooterZoomMenu");
    setVerticalZoom(result);
    handleClose();
  };

  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={handleClose}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
    >
      <MenuItem
        onClick={handleHorizontalZoomInClick}
        disabled={horizontalZoom === last(HORIZONTAL_ZOOM)}
      >
        <ListItemIcon>
          <KeyboardArrowLeftIcon />
          <KeyboardArrowRightIcon />
        </ListItemIcon>
        <ListItemText>{t("editor.footer.horizontalZoomIn")}</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={handleHorizontalZoomOutClick}
        disabled={horizontalZoom === HORIZONTAL_ZOOM[0]}
      >
        <ListItemIcon>
          <KeyboardArrowRightIcon />
          <KeyboardArrowLeftIcon />
        </ListItemIcon>
        <ListItemText>{t("editor.footer.horizontalZoomOut")}</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={handleVerticalZoomInClick}
        disabled={verticalZoom === last(VERTICAL_ZOOM)}
      >
        <ListItemIcon>
          <UnfoldMoreIcon />
        </ListItemIcon>
        <ListItemText>{t("editor.footer.verticalZoomIn")}</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={handleVerticalZoomOutClick}
        disabled={verticalZoom === VERTICAL_ZOOM[0]}
      >
        <ListItemIcon>
          <UnfoldLessIcon />
        </ListItemIcon>
        <ListItemText>{t("editor.footer.verticalZoomOut")}</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export interface FooterZoomMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
}
