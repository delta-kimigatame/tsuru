import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import { useTranslation } from "react-i18next";
import { RESAMPLER_FLAGS } from "../../config/resamplerFlags";
import { ResampEngineName } from "../../lib/ResampEngine";
import { useCookieStore } from "../../store/cookieStore";
import { FlagKeys } from "../../utils/parseFlags";

export const ResamplerHelpDialog: React.FC<ResamplerHelpDialogProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { resampEngine } = useCookieStore();
  /** ヘルプを表示しているエンジンが現在選択中のエンジンか */
  const isCurrent = props.engine === resampEngine;

  /** 閉じる/このエンジンを使用するボタンの動作。いずれの場合もダイアログを閉じる */
  const handleButtonClick = () => {
    props.handleClose();
    if (!isCurrent) {
      props.handleSelectEngine(props.engine);
    }
  };

  /** フラグの範囲(既定値)欄の表示文字列 */
  const getRangeText = (flag: FlagKeys): string =>
    flag.type === "bool"
      ? t("resampler.flagTable.bool")
      : t("resampler.flagTable.rangeValue", {
          min: flag.min,
          max: flag.max,
          default: flag.default,
        });

  /** フラグの効果欄の表示文字列 */
  const getEffectText = (flag: FlagKeys): string =>
    t(`resampler.flagEffect.${props.engine}.${flag.name}`);

  return (
    <Dialog open={props.open} onClose={props.handleClose} fullScreen>
      <DialogTitle sx={{ pr: 7 }}>
        {t(`resampler.${props.engine}`)}
        <IconButton
          onClick={props.handleClose}
          aria-label="close"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 3 }}>
          {t(`resampler.description.${props.engine}`)}
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t("resampler.flagTable.title")}
        </Typography>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                whiteSpace: "nowrap",
                px: 1,
                fontSize: 12,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t("resampler.flagTable.name")}</TableCell>
                <TableCell>{t("resampler.flagTable.range")}</TableCell>
                <TableCell>{t("resampler.flagTable.effect")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {RESAMPLER_FLAGS[props.engine].map((flag) => (
                <TableRow key={flag.name}>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {flag.name}
                  </TableCell>
                  <TableCell>{getRangeText(flag)}</TableCell>
                  <TableCell>{getEffectText(flag)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          sx={{ mx: 1 }}
          onClick={handleButtonClick}
        >
          {isCurrent ? t("resampler.close") : t("resampler.useThisEngine")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface ResamplerHelpDialogProps {
  /** dialogの開閉状態 */
  open: boolean;
  /** ヘルプを表示するエンジンのkey */
  engine: ResampEngineName;
  /** dialogを閉じるためのコールバック。ボタンを押した場合も呼ばれる */
  handleClose: () => void;
  /** 現在選択されていないエンジンで「このエンジンを使用する」を押した際のコールバック */
  handleSelectEngine: (engine: ResampEngineName) => void;
}
