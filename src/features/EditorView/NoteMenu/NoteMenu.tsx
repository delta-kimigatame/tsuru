import { ButtonGroup, Menu } from "@mui/material";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { Note } from "../../../lib/Note";
import { NotesDownButton } from "./NotesDownButton";
import { NotesLeftButton } from "./NotesLeftButton";
import { NotesRightButton } from "./NotesRightButton";
import { NotesUpButton } from "./NotesUpButton";

export const NoteMenu: React.FC<NoteMenuProps> = (props) => {
  /**
   * メニューを閉じる動作
   */
  const handleMenuClose = () => {
    props.setMenuAnchor(null);
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
            <NotesLeftButton
              selectedNotesIndex={props.selectedNotesIndex}
              setSelectedNotesIndex={props.setSelectedNotesIndex}
            />
            <NotesUpButton selectedNotesIndex={props.selectedNotesIndex} />
            <NotesDownButton selectedNotesIndex={props.selectedNotesIndex} />
            <NotesRightButton
              selectedNotesIndex={props.selectedNotesIndex}
              setSelectedNotesIndex={props.setSelectedNotesIndex}
            />
          </ButtonGroup>
        </Menu>
      )}
    </>
  );
};
/**
 * 操作対象ノートを返す
 * @param notes 全ノート
 * @param selectedNotesIndex 操作対象ノートのインデックス
 * @returns
 */
export const getTargetNotes = (
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

export interface NoteMoveButtonProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex?: (indexes: number[]) => void;
}
