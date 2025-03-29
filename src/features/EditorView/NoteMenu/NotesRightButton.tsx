import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { IconButton } from "@mui/material";
import React from "react";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { NoteMoveButtonProps } from "./NoteMenu";

export const NotesRightButton: React.FC<NoteMoveButtonProps> = (props) => {
  const { notes, setNotes } = useMusicProjectStore();

  const handleClick = () => {
    const filteredSelectNotesIndex = props.selectedNotesIndex.filter(
      (idx) => idx >= 0 && idx < notes.length
    );
    if (
      filteredSelectNotesIndex.length === 0 ||
      filteredSelectNotesIndex.includes(notes.length - 1)
    ) {
      return;
    }
    const resultNotes = notesRight(notes, filteredSelectNotesIndex);
    const newSelected = filteredSelectNotesIndex.map((i) => i + 1);
    setNotes(resultNotes);
    props.setSelectedNotesIndex(newSelected);
  };

  return (
    <IconButton
      onClick={handleClick}
      disabled={props.selectedNotesIndex.includes(notes.length - 1)}
      data-testid="NotesRightButton"
    >
      <ArrowForwardIcon />
    </IconButton>
  );
};

/**
 * notesを1音右に移動する
 * @param notes
 * @param selectedNotesIndex
 * @returns
 */
export const notesRight = (
  notes: Note[],
  selectedNotesIndex: number[]
): Note[] => {
  const oldNotes = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNotes,
    redo: notesRightRedo,
    redoArgs: { notes: oldNotes, selectedNotesIndex: selectedNotesIndex },
    summary: `1音右へ`,
  });
  const newNotes = new Array<Note>();
  let tempNotes = new Array<Note>();
  notes.forEach((n, i) => {
    if (selectedNotesIndex.includes(i)) {
      tempNotes.push(n.deepCopy());
    } else {
      newNotes.push(n.deepCopy());
      if (tempNotes.length !== 0) {
        tempNotes.forEach((tn) => {
          newNotes.push(tn);
        });
        tempNotes = [];
      }
    }
  });
  return newNotes;
};

/**
 * ノートを1音左に移動する処理のredo用コマンド
 * @param args
 * @returns
 */
const notesRightRedo = (args: {
  notes: Note[];
  selectedNotesIndex: number[];
}) => {
  return notesRight(args.notes, args.selectedNotesIndex);
};
const undo = (notes: Note[]) => {
  return notes;
};
