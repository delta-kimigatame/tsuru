import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { ButtonGroup, IconButton, Menu } from "@mui/material";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const NoteMenu: React.FC<NoteMenuProps> = (props) => {
  const { notes, setNotes } = useMusicProjectStore();
  /**
   * メニューを閉じる動作
   */
  const handleMenuClose = () => {
    props.setMenuAnchor(null);
  };

  const handleNotesUpClick = () => {
    const filteredSelectNotesIndex = props.selectedNotesIndex.filter(
      (idx) => idx >= 0 && idx < notes.length
    );
    if (filteredSelectNotesIndex.length === 0) {
      return;
    }
    const targetNotes = getTargetNotes(notes, filteredSelectNotesIndex);
    const resultNotes = notesUp(targetNotes);
    const updatedNotes = [...notes];
    filteredSelectNotesIndex.forEach((idx, i) => {
      updatedNotes[idx] = resultNotes[i];
    });
    setNotes(updatedNotes);
  };

  const handleNotesDownClick = () => {
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

  const handleNotesLeftClick = () => {
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

  const handleNotesRightClick = () => {
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
    <>
      {props.menuAnchor !== null && (
        <Menu
          open={Boolean(props.menuAnchor)}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: props.menuAnchor.y - PIANOROLL_CONFIG.KEY_HEIGHT * 2,
            left: props.menuAnchor.x,
          }}
          onClose={handleMenuClose}
        >
          <ButtonGroup variant="contained">
            <IconButton
              onClick={handleNotesLeftClick}
              disabled={props.selectedNotesIndex.includes(0)}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleNotesUpClick}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton onClick={handleNotesDownClick}>
              <ArrowDownwardIcon />
            </IconButton>
            <IconButton
              onClick={handleNotesRightClick}
              disabled={props.selectedNotesIndex.includes(notes.length - 1)}
            >
              <ArrowForwardIcon />
            </IconButton>
          </ButtonGroup>
        </Menu>
      )}
    </>
  );
};

/**
 * 渡されたノートを半音上げ、undoManagerを更新する。
 * @param notes 更新対象ノート
 * @returns 半音上がったノート
 */
export const notesUp = (notes: Note[]): Note[] => {
  const oldNotes = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNotes,
    redo: notesUp,
    redoArgs: oldNotes,
    summary: `半音上げる`,
  });
  const newNotes = notes.map((n) => {
    const newNote = n.deepCopy();
    newNote.notenum = newNote.notenum + 1;
    return newNote;
  });
  return newNotes;
};
/**
 * 渡されたノートを半音下げ、undoManagerを更新する。
 * @param notes 更新対象ノート
 * @returns 半音下がったノート
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
  console.log(newNotes);
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

/**
 * 操作対象ノートを返す
 * @param notes 全ノート
 * @param selectedNotesIndex 操作対象ノートのインデックス
 * @returns
 */
const getTargetNotes = (
  notes: Note[],
  selectedNotesIndex?: number[]
): Note[] => {
  const targetNotes =
    selectedNotesIndex.length > 0
      ? selectedNotesIndex.map((idx) => notes[idx])
      : notes;
  return targetNotes;
};

export interface NoteMenuProps {
  menuAnchor: {
    x: number;
    y: number;
  } | null;
  setMenuAnchor: (anchor: { x: number; y: number } | null) => void;
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex: (indexes: number[]) => void;
}
