import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { IconButton } from "@mui/material";
import React from "react";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { NoteEditButtonProps } from "./NoteMenu";

export const NotesDeleteButton: React.FC<NoteEditButtonProps> = (props) => {
  const { notes, setNotes } = useMusicProjectStore();
  const handleClick = () => {
    LOG.info("選択ノートを削除", "NoteDeleteButton");
    setNotes(deleteNote(notes, props.selectedNotesIndex));
    props.setSelectedNotesIndex([]);
    props.handleMenuClose();
  };

  return (
    <IconButton onClick={handleClick} data-testid="NotesDeleteButton">
      <DeleteForeverIcon />
    </IconButton>
  );
};

const undo = (notes: Note[]): Note[] => {
  return notes;
};

export const deleteNote = (notes: Note[], selectedNotesIndex: number[]) => {
  const oldNotes = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNotes,
    redo: deleteNoteCore,
    redoArgs: {
      notes: oldNotes,
      selectedNotesIndex: selectedNotesIndex.slice(),
    },
    summary: `選択ノートを削除`,
  });
  return deleteNoteCore({
    notes: notes,
    selectedNotesIndex: selectedNotesIndex,
  });
};

const deleteNoteCore = (args: {
  notes: Note[];
  selectedNotesIndex: number[];
}): Note[] => {
  const filterNotes = args.notes.filter(
    (_, i) => !args.selectedNotesIndex.includes(i)
  );
  return filterNotes.map((n) => n.deepCopy());
};
