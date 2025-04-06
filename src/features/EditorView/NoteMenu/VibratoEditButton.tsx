import { IconButton } from "@mui/material";
import React from "react";
import { VibratoIcon } from "../../../components/EditorView/NoteMenu/VibratoIcon";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const VibratoEditButton: React.FC<VibratoEditButtonProps> = (props) => {
  const { notes } = useMusicProjectStore();

  return (
    <IconButton
      disabled={notes[props.selectedNotesIndex[0]].lyric === "R"}
      data-testid="vibratoEditButton"
      onClick={() => {
        props.setVibratoTargetNote(notes[props.selectedNotesIndex[0]]);
        props.handleMenuClose();
      }}
    >
      <VibratoIcon />
    </IconButton>
  );
};
export interface VibratoEditButtonProps {
  selectedNotesIndex: Array<number>;
  setVibratoTargetNote: (n: Note | undefined) => void;
  handleMenuClose: () => void;
}
