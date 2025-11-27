import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { IconButton } from "@mui/material";
import React from "react";
import { LOG } from "../../../lib/Logging";
import { resampCache } from "../../../lib/ResampCache";
import { NoteEditButtonProps } from "./NoteMenu";

export const NotesCacheClearButton: React.FC<NoteEditButtonProps> = (props) => {
  const handleClick = () => {
    LOG.info("選択ノートのキャッシュをクリア", "NotesCacheClearButton");
    resampCache.clearByIndices(props.selectedNotesIndex);
    props.handleMenuClose();
  };

  return (
    <IconButton onClick={handleClick} data-testid="NotesCacheClearButton">
      <CleaningServicesIcon />
    </IconButton>
  );
};
