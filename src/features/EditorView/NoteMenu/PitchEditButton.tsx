import TimelineIcon from "@mui/icons-material/Timeline";
import { IconButton } from "@mui/material";
import React from "react";
import { LOG } from "../../../lib/Logging";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const PitchEditButton: React.FC<PitchEditButtonProps> = (props) => {
  const { notes } = useMusicProjectStore();

  const handlePitchButtonClick = () => {
    LOG.debug(
      `ピッチ編集モード。index:${props.selectedNotesIndex[0]}`,
      "PitchEditButton"
    );
    props.setPitchTargetIndex(props.selectedNotesIndex[0]);
    props.handleMenuClose();
  };

  return (
    <IconButton
      disabled={notes[props.selectedNotesIndex[0]].lyric === "R"}
      data-testid="pitchEditButton"
      onClick={handlePitchButtonClick}
    >
      <TimelineIcon />
    </IconButton>
  );
};
export interface PitchEditButtonProps {
  selectedNotesIndex: Array<number>;
  setPitchTargetIndex: (i: number | undefined) => void;
  handleMenuClose: () => void;
}
