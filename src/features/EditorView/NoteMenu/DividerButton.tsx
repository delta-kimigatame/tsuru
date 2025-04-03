import { IconButton } from "@mui/material";
import React from "react";
import { DividerNoteIcon } from "../../../components/EditorView/NoteMenu/DividerNoteIcon";
import { LOG } from "../../../lib/Logging";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const DividerButton: React.FC<DividerButtonProps> = (props) => {
  const { notes } = useMusicProjectStore();

  const handleClick = () => {
    // selectedNotesIndexの長さが1のはず
    LOG.debug(
      `ノート分割ダイアログ開く targetIndex:${props.selectedNotesIndex[0]}`,
      "DividerButton"
    );
    props.setDividerTargetIndex(props.selectedNotesIndex[0]);
  };

  return (
    <IconButton onClick={handleClick} data-testid="DividerButton">
      <DividerNoteIcon />
    </IconButton>
  );
};

export interface DividerButtonProps {
  selectedNotesIndex: Array<number>;
  setDividerTargetIndex: (n: number | undefined) => void;
}
