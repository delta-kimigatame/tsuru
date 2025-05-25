import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { LOG } from "../../../lib/Logging";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
export const HeaderMenuClearProject: React.FC<HeaderMenuItemProps> = (
  props
) => {
  const { clearUst } = useMusicProjectStore();
  const { t } = useTranslation();
  const handleClick = () => {
    LOG.debug("click", "HeaderMenuClearProject");
    LOG.info("プロジェクト初期化", "HeaderMenuClearProject");
    clearUst();
    props.onMenuClose();
  };

  return (
    <>
      <HeaderMenuItemBase
        onClick={handleClick}
        icon={<DeleteForeverIcon />}
        text={t("menu.clearProject")}
      />
    </>
  );
};
