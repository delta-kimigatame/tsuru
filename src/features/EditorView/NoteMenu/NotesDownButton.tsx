import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { IconButton } from "@mui/material";
import React from "react";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { getTargetNotes, NoteMoveButtonProps } from "./NoteMenu";

export const NotesDownButton: React.FC<NoteMoveButtonProps> = (props) => {
  const { notes, setNotes } = useMusicProjectStore();
  const handleClick = () => {
    const filteredSelectNotesIndex = props.selectedNotesIndex.filter(
      (idx) => idx >= 0 && idx < notes.length
    );
    if (filteredSelectNotesIndex.length === 0) {
      return;
    }
    const targetNotes = getTargetNotes(notes, filteredSelectNotesIndex);
    const resultNotes = notesDown(targetNotes);
    const updatedNotes = [...notes];
    filteredSelectNotesIndex.forEach((idx, i) => {
      updatedNotes[idx] = resultNotes[i];
    });
    setNotes(updatedNotes);
  };

  return (
    <IconButton onClick={handleClick} data-testid="NotesDownButton">
      <ArrowDownwardIcon />
    </IconButton>
  );
};

/**
 * 渡されたノートを半音下げ、undoManagerを更新する。
 * @param notes 更新対象ノート
 * @returns 半音上がったノート
 */
export const notesDown = (notes: Note[]): Note[] => {
  const oldNotes = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNotes,
    redo: notesDown,
    redoArgs: oldNotes,
    summary: `半音下げる`,
  });
  const newNotes = notes.map((n) => {
    const newNote = n.deepCopy();
    newNote.notenum = newNote.notenum - 1;
    return newNote;
  });
  return newNotes;
};
const undo = (notes: Note[]) => {
  return notes;
};
