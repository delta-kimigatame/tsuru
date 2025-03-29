import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import React from "react";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { NoteMoveButtonProps } from "./NoteMenu";

export const NotesLeftButton: React.FC<NoteMoveButtonProps> = (props) => {
  const { notes, setNotes } = useMusicProjectStore();

  const handleClick = () => {
    const filteredSelectNotesIndex = props.selectedNotesIndex.filter(
      (idx) => idx >= 0 && idx < notes.length
    );
    if (
      filteredSelectNotesIndex.length === 0 ||
      filteredSelectNotesIndex.includes(0)
    ) {
      return;
    }
    const resultNotes = notesLeft(notes, filteredSelectNotesIndex);
    const newSelected = filteredSelectNotesIndex.map((i) => i - 1);
    setNotes(resultNotes);
    props.setSelectedNotesIndex(newSelected);
  };

  return (
    <IconButton
      onClick={handleClick}
      disabled={props.selectedNotesIndex.includes(0)}
      data-testid="NotesLeftButton"
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

/**
 * notesを1音左に移動する
 * @param notes
 * @param selectedNotesIndex
 * @returns
 */
export const notesLeft = (
  notes: Note[],
  selectedNotesIndex: number[]
): Note[] => {
  const oldNotes = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNotes,
    redo: notesLeftRedo,
    redoArgs: { notes: oldNotes, selectedNotesIndex: selectedNotesIndex },
    summary: `1音左へ`,
  });
  let tempIndex: number | undefined = undefined;
  const newNotes = notes.map((n, i) => {
    if (!selectedNotesIndex.includes(i + 1)) {
      const returnNote =
        tempIndex === undefined ? n.deepCopy() : notes[tempIndex].deepCopy();
      tempIndex = undefined;
      return returnNote;
    }
    if (tempIndex === undefined) {
      tempIndex = i;
    }
    return notes[i + 1].deepCopy();
  });
  return newNotes;
};

/**
 * ノートを1音左に移動する処理のredo用コマンド
 * @param args
 * @returns
 */
const notesLeftRedo = (args: {
  notes: Note[];
  selectedNotesIndex: number[];
}) => {
  return notesLeft(args.notes, args.selectedNotesIndex);
};
const undo = (notes: Note[]) => {
  return notes;
};
