import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { IconButton } from "@mui/material";
import React from "react";

export const NotePasteButton: React.FC<NotePasteButtonProps> = (props) => {
  return (
    <IconButton
      data-testid="notePasteButton"
      onClick={() => {
        props.setPasteTargetNote(props.selectedNotesIndex);
        props.handleMenuClose();
      }}
    >
      <ContentPasteIcon />
    </IconButton>
  );
};
export interface NotePasteButtonProps {
  selectedNotesIndex: Array<number>;
  setPasteTargetNote: (n: number[] | undefined) => void;
  handleMenuClose: () => void;
}
