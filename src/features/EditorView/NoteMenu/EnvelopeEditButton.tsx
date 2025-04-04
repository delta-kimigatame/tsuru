import { IconButton } from "@mui/material";
import React from "react";
import { EnvelopeNoteIcon } from "../../../components/EditorView/NoteMenu/EnvelopeNoteIcon";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const EnvelopeEditButton: React.FC<EnvelopeEditButtonProps> = (
  props
) => {
  const { notes } = useMusicProjectStore();

  return (
    <IconButton
      disabled={notes[props.selectedNotesIndex[0]].lyric === "R"}
      data-testid="envelopeEditButton"
      onClick={() => {
        props.setEnvelopeTargetNote(notes[props.selectedNotesIndex[0]]);
        props.handleMenuClose();
      }}
    >
      <EnvelopeNoteIcon />
    </IconButton>
  );
};
export interface EnvelopeEditButtonProps {
  selectedNotesIndex: Array<number>;
  setEnvelopeTargetNote: (n: Note | undefined) => void;
  handleMenuClose: () => void;
}
