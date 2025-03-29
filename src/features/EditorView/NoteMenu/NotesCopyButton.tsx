import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../../lib/Logging";
import { dumpNotes } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { getTargetNotes, NoteEditButtonProps } from "./NoteMenu";

export const NotesCopyButton: React.FC<NoteEditButtonProps> = (props) => {
  const { t } = useTranslation();
  const { notes, ustTempo, ustFlags } = useMusicProjectStore();
  const snackBarStore = useSnackBarStore();
  const handleClick = async () => {
    LOG.info("クリップボードにコピー", "NoteMenu");
    const targetNotes = getTargetNotes(notes, props.selectedNotesIndex);
    const copyText = dumpNotes(targetNotes, ustTempo, ustFlags);
    try {
      await navigator.clipboard.writeText(copyText);
      snackBarStore.setValue(t("editor.copySuccess"));
      snackBarStore.setSeverity("success");
      snackBarStore.setOpen(true);
    } catch {
      snackBarStore.setValue(t("editor.copyError"));
      snackBarStore.setSeverity("error");
      snackBarStore.setOpen(true);
    }
    props.handleMenuClose();
  };

  return (
    <IconButton onClick={handleClick} data-testid="NotesCopyButton">
      <ContentCopyIcon />
    </IconButton>
  );
};
