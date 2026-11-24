import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import HelpIcon from "@mui/icons-material/Help";
import {
  Box,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../../lib/Logging";
import { ResampEngineName } from "../../../lib/ResampEngine";
import { useCookieStore } from "../../../store/cookieStore";
import { useSnackBarStore } from "../../../store/snackBarStore";

/** メニューに表示するエンジンの一覧 */
const RESAMP_ENGINES: ReadonlyArray<ResampEngineName> = ["resamp", "fave"];

export interface FooterResamplerMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
  /** エンジン変更後に新しいresamplerを読み込む。完了時に解決され、読込失敗(タイムアウト)時はrejectするコールバック */
  reloadResampler?: () => Promise<void>;
}

export const FooterResamplerMenu: React.FC<FooterResamplerMenuProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { resampEngine, setResampEngine } = useCookieStore();
  const snackBarStore = useSnackBarStore();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleClick = async (engine: ResampEngineName) => {
    props.handleClose();
    if (engine === resampEngine) {
      return;
    }
    const previousEngine = resampEngine;
    LOG.info(
      `resampエンジンを変更: ${previousEngine} -> ${engine}`,
      "FooterResamplerMenu",
    );
    setResampEngine(engine);
    if (!props.reloadResampler) {
      return;
    }
    setLoading(true);
    try {
      await props.reloadResampler();
    } catch (e) {
      LOG.error(
        `resampler(${engine})の読込に失敗しました。${previousEngine}に戻します。${e}`,
        "FooterResamplerMenu",
      );
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("resampler.loadError"));
      snackBarStore.setOpen(true);
      setResampEngine(previousEngine);
      try {
        await props.reloadResampler();
      } catch (e2) {
        LOG.error(
          `元のresampler(${previousEngine})の再読込にも失敗しました。${e2}`,
          "FooterResamplerMenu",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /** ヘルプアイコンの動作は未定義(dummy) */
  const handleHelpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Menu
        anchorEl={props.anchor}
        open={Boolean(props.anchor)}
        onClose={props.handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        {RESAMP_ENGINES.map((engine) => (
          <MenuItem key={engine} onClick={() => handleClick(engine)}>
            <ListItemIcon>
              {resampEngine === engine ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </ListItemIcon>
            <ListItemText>{t(`resampler.${engine}`)}</ListItemText>
            <HelpIcon
              aria-label={t("resampler.help")}
              onClick={handleHelpClick}
              sx={{ ml: 2 }}
            />
          </MenuItem>
        ))}
      </Menu>
      <Modal open={loading} aria-label={t("resampler.loading")}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            p: 4,
            bgcolor: "background.paper",
            borderRadius: 2,
            outline: "none",
          }}
        >
          <CircularProgress />
          <Typography>{t("resampler.loading")}</Typography>
        </Box>
      </Modal>
    </>
  );
};
