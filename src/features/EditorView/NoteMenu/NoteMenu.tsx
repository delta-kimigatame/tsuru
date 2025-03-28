import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import TimelineIcon from "@mui/icons-material/Timeline";
import { ButtonGroup, IconButton, Menu } from "@mui/material";
import React from "react";
import { DividerNoteIcon } from "../../../components/EditorView/NoteMenu/DividerNoteIcon";
import { EnvelopeNoteIcon } from "../../../components/EditorView/NoteMenu/EnvelopeNoteIcon";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { NotePropertyDialog } from "../NotePropertyDialog";
import { NotesDownButton } from "./NotesDownButton";
import { NotesLeftButton } from "./NotesLeftButton";
import { NotesRightButton } from "./NotesRightButton";
import { NotesUpButton } from "./NotesUpButton";

export const NoteMenu: React.FC<NoteMenuProps> = (props) => {
  const { notes } = useMusicProjectStore();
  const windowSize = useWindowSize();
  const [propertyTargetNote, setPropertyTargetNote] = React.useState<
    Note | undefined
  >(undefined);
  /**
   * メニューを閉じる動作
   */
  const handleMenuClose = () => {
    props.setMenuAnchor(null);
  };

  const handleEditButtonClick = () => {
    // selectedNotesIndexの長さが1のはず
    LOG.debug(
      `プロパティダイアログ開く targetIndex:${props.selectedNotesIndex[0]}`,
      "NoteMenu"
    );
    setPropertyTargetNote(notes[props.selectedNotesIndex[0]]);
  };

  const handlePropertyDialogClose = () => {
    LOG.debug("プロパティダイアログ閉じる", "NoteMenu");
    setPropertyTargetNote(undefined);
  };

  return (
    <>
      {props.menuAnchor !== null && (
        <Menu
          open={Boolean(props.menuAnchor)}
          anchorReference="anchorPosition"
          anchorPosition={{
            top:
              props.menuAnchor.y * 2 >= windowSize.height
                ? props.menuAnchor.y -
                  PIANOROLL_CONFIG.KEY_HEIGHT *
                    (props.selectedNotesIndex.length === 1 ? 4 : 3)
                : props.menuAnchor.y + PIANOROLL_CONFIG.KEY_HEIGHT,
            left: props.menuAnchor.x - 80,
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
          <br />
          {props.selectedNotesIndex.length === 1 && (
            <>
              <ButtonGroup variant="contained">
                <IconButton
                  disabled={props.selectedNotesIndex.length !== 1}
                  onClick={handleEditButtonClick}
                >
                  <EditIcon />
                </IconButton>
                <IconButton disabled>
                  <DividerNoteIcon />
                </IconButton>
                <IconButton disabled>
                  <EnvelopeNoteIcon />
                </IconButton>
                <IconButton disabled>
                  <TimelineIcon />
                </IconButton>
              </ButtonGroup>
              <br />
            </>
          )}
          <ButtonGroup variant="contained">
            <IconButton disabled>
              <ContentCopyIcon />
            </IconButton>
            <IconButton disabled>
              <ContentPasteIcon />
            </IconButton>
            <IconButton disabled>
              <ContentPasteGoIcon />
            </IconButton>
            <IconButton disabled>
              <DeleteForeverIcon />
            </IconButton>
          </ButtonGroup>
        </Menu>
      )}
      <NotePropertyDialog
        open={propertyTargetNote !== undefined}
        note={propertyTargetNote}
        handleClose={handlePropertyDialogClose}
      />
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
