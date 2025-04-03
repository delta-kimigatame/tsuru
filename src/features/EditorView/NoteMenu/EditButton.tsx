import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import React from "react";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const EditButton: React.FC<EditButtonProps> = (props) => {
  const { notes } = useMusicProjectStore();

  const handleEditButtonClick = () => {
    // selectedNotesIndexの長さが1のはず
    LOG.debug(
      `プロパティダイアログ開く targetIndex:${props.selectedNotesIndex[0]}`,
      "EditButton"
    );
    props.setPropertyTargetNote(notes[props.selectedNotesIndex[0]]);
  };

  return (
    <IconButton
      disabled={props.selectedNotesIndex.length !== 1}
      onClick={handleEditButtonClick}
      data-testid="EditButton"
    >
      <EditIcon />
    </IconButton>
  );
};

export interface EditButtonProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex?: (indexes: number[]) => void;
  setPropertyTargetNote: (n: Note | undefined) => void;
}
