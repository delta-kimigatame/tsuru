import CloseIcon from "@mui/icons-material/Close";
import SubjectIcon from "@mui/icons-material/Subject";
import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
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
  /**
   * ダウンロードボタンを押した際の動作
   */
  const handleButtonClick = () => {
    const text = LOG.datas.join("\r\n");
    console.log(text);
    const logFile = new File([text], `log_${new Date().toJSON()}.txt`, {
      type: "text/plane;charset=utf-8",
    });
    const url = URL.createObjectURL(logFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = logFile.name;
    a.click();
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
          <Button
            fullWidth
            variant="contained"
            onClick={handleButtonClick}
            size="large"
            sx={{ mx: 1 }}
            color="inherit"
          >
            {t("error.download")}
          </Button>
          <LogPaper />
        </DialogContent>
      </Dialog>
    </>
  );
};
