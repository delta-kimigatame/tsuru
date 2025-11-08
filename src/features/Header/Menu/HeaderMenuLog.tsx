import CloseIcon from "@mui/icons-material/Close";
import SubjectIcon from "@mui/icons-material/Subject";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { LogPaper } from "../../../components/Logging/LogPaper";
import { LOG } from "../../../lib/Logging";
import { dumpNotes } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
export const HeaderMenuLog: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const { vb, ust, notes, ustTempo, ustFlags } = useMusicProjectStore();
  const { defaultNote } = useCookieStore();
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
    let dumpUst: string;
    try {
      const dumpResult = dumpNotes(notes, ustTempo, ustFlags);
      dumpUst = `\r\n----- UST DUMP -----\r\n${dumpResult}\r\n--------------------\r\n`;
    } catch (e) {
      LOG.error(`UST DUMP failed: ${e}`, "HeaderMenuLog");
      dumpUst = `\r\n----- UST DUMP -----\r\nDUMP ERROR: ${
        e instanceof Error ? e.message : String(e)
      }\r\n--------------------\r\n`;
    }
    let dumpResampler = `\r\n----- RESAMPLER INFO -----\r\n`;
    try {
      const requests = ust
        .getRequestParam(vb, defaultNote)
        .map((r) => JSON.stringify(r));
      dumpResampler += requests.join("\r\n");
    } catch (e) {
      LOG.error(`RESAMPLER INFO failed: ${e}`, "HeaderMenuLog");
      dumpResampler += `DUMP ERROR: ${
        e instanceof Error ? e.message : String(e)
      }\r\n`;
    }
    let dumpOto = `\r\n----- OTO DATA -----\r\n`;
    try {
      dumpOto += JSON.stringify(vb.oto.GetLines());
    } catch (e) {
      LOG.error(`OTO DUMP failed: ${e}`, "HeaderMenuLog");
      dumpOto += `DUMP ERROR: ${
        e instanceof Error ? e.message : String(e)
      }\r\n`;
    }
    console.log(text);
    const logFile = new File(
      [text + "\r\n" + dumpUst + "\r\n" + dumpResampler + "\r\n" + dumpOto],
      `log_${new Date().toJSON()}.txt`,
      {
        type: "text/plain;charset=utf-8",
      }
    );
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
        <DialogTitle>
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
        </DialogTitle>
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
