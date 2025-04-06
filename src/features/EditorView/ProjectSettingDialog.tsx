import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { useMusicProjectStore } from "../../store/musicProjectStore";

export const ProjectSettingDialog: React.FC<ProjectSettingDialogProps> = (
  props
) => {
  const { t } = useTranslation();
  const { ustTempo, ustFlags, setUstTempo, setUstFlags } =
    useMusicProjectStore();

  const [tempo, setTempo] = React.useState<number>(120);
  const [flags, setFlags] = React.useState<string>("");
  React.useEffect(() => {
    setTempo(ustTempo);
  }, [ustTempo]);
  React.useEffect(() => {
    setFlags(ustFlags);
  }, [ustFlags]);

  const handleButtonClick = () => {
    LOG.info(
      `USTのパラメータ変更。tempo:${tempo}、フラグ:${flags}`,
      "ProjectSettingDialog"
    );
    setUstTempo(tempo);
    setUstFlags(flags);
    props.handleClose();
  };
  return (
    <>
      {props.open && (
        <Dialog open={props.open} onClose={props.handleClose} fullWidth>
          <DialogTitle>
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
            <Box sx={{ m: 1 }}>
              <TextField
                fullWidth
                type="number"
                variant="outlined"
                sx={{
                  m: 1,
                }}
                label={t("editor.ustSetting.tempo")}
                data-testid="ustTempo"
                value={tempo}
                onChange={(e) => setTempo(parseFloat(e.target.value))}
              />
              <TextField
                fullWidth
                variant="outlined"
                sx={{
                  m: 1,
                }}
                type="text"
                label={t("editor.ustSetting.flags")}
                data-testid="ustFlags"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
              size="large"
              sx={{ mx: 1 }}
            >
              {t("editor.ustSetting.submitButton")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export interface ProjectSettingDialogProps {
  open: boolean;
  handleClose: () => void;
}
