import CloseIcon from "@mui/icons-material/Close";
import SubjectIcon from "@mui/icons-material/Subject";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { LogPaper } from "../../../components/Logging/LogPaper";
import { LOG } from "../../../lib/Logging";
export const HeaderMenuLog: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState<boolean>(false);
  const handleClick = () => {
    LOG.debug("click", "HeaderMenuLog");
    LOG.info("ログダイアログの表示", "HeaderMenuLog");
    setOpen(true);
  };

  const handleClose = () => {
    LOG.info("ログダイアログのクローズ", "HeaderMenuLog");
    setOpen(true);
    props.onMenuClose();
  };
  return (
    <>
      <HeaderMenuItemBase
        onClick={handleClick}
        icon={<SubjectIcon />}
        text={t("menu.showLog")}
      />

      <Dialog open={open} onClose={handleClose} fullScreen>
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <LogPaper />
        </DialogContent>
      </Dialog>
    </>
  );
};
