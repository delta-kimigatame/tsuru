import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { ButtonGroup, IconButton, Menu } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { EnvelopeDialog } from "../EnvelopeDialog/EnvelopeDialog";
import { NoteDividerDialog } from "../NoteDividerDialog";
import { NotePropertyDialog } from "../NotePropertyDialog";
import { VibratoDialog } from "../VibratoDialog";
import { DividerButton } from "./DividerButton";
import { EditButton } from "./EditButton";
import { EnvelopeEditButton } from "./EnvelopeEditButton";
import { NotePasteGoButton } from "./NotePasteGoButton";
import { NotesCopyButton } from "./NotesCopyButton";
import { NotesDeleteButton } from "./NotesDeleteButton";
import { NotesDownButton } from "./NotesDownButton";
import { NotesLeftButton } from "./NotesLeftButton";
import { NotesRightButton } from "./NotesRightButton";
import { NotesUpButton } from "./NotesUpButton";
import { PitchEditButton } from "./PitchEditButton";
import { VibratoEditButton } from "./VibratoEditButton";

export const NoteMenu: React.FC<NoteMenuProps> = (props) => {
  const { t } = useTranslation();
  const windowSize = useWindowSize();
  const [propertyTargetNote, setPropertyTargetNote] = React.useState<
    Note | undefined
  >(undefined);
  const [dividerTargetIndex, setDividerTargetIndex] = React.useState<
    number | undefined
  >(undefined);
  const [envelopeTargetNote, setEnvelopeTargetNote] = React.useState<
    Note | undefined
  >(undefined);
  const [vibratoTargetNote, setVibratoTargetNote] = React.useState<
    Note | undefined
  >(undefined);
  /**
   * メニューを閉じる動作
   */
  const handleMenuClose = () => {
    props.setMenuAnchor(null);
  };

  const handlePropertyDialogClose = () => {
    LOG.debug("プロパティダイアログ閉じる", "NoteMenu");
    setPropertyTargetNote(undefined);
  };

  const handleDividerDialogClose = () => {
    LOG.debug("ノート分割ダイアログを閉じる", "NoteMenu");
    setDividerTargetIndex(undefined);
  };

  const handleEnvelopeDialogClose = () => {
    LOG.debug("エンベロープダイアログを閉じる", "NoteMenu");
    setEnvelopeTargetNote(undefined);
  };

  const handleVibratoDialogClose = () => {
    LOG.debug("ビブラートダイアログを閉じる", "NoteMenu");
    setVibratoTargetNote(undefined);
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
          sx={{ userSelect: "none" }}
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
                <EditButton
                  selectedNotesIndex={props.selectedNotesIndex}
                  setSelectedNotesIndex={props.setSelectedNotesIndex}
                  setPropertyTargetNote={setPropertyTargetNote}
                  handleMenuClose={handleMenuClose}
                />
                <DividerButton
                  selectedNotesIndex={props.selectedNotesIndex}
                  setDividerTargetIndex={setDividerTargetIndex}
                  handleMenuClose={handleMenuClose}
                />
                <EnvelopeEditButton
                  selectedNotesIndex={props.selectedNotesIndex}
                  setEnvelopeTargetNote={setEnvelopeTargetNote}
                  handleMenuClose={handleMenuClose}
                />
                <PitchEditButton
                  selectedNotesIndex={props.selectedNotesIndex}
                  setPitchTargetIndex={props.setPitchTargetIndex}
                  handleMenuClose={handleMenuClose}
                />
                <VibratoEditButton
                  selectedNotesIndex={props.selectedNotesIndex}
                  setVibratoTargetNote={setVibratoTargetNote}
                  handleMenuClose={handleMenuClose}
                />
              </ButtonGroup>
              <br />
            </>
          )}
          <ButtonGroup variant="contained">
            <NotesCopyButton
              selectedNotesIndex={props.selectedNotesIndex}
              setSelectedNotesIndex={props.setSelectedNotesIndex}
              handleMenuClose={handleMenuClose}
            />
            <IconButton disabled data-testid="NotesPasteButton">
              <ContentPasteIcon />
            </IconButton>
            <NotePasteGoButton
              selectedNotesIndex={props.selectedNotesIndex}
              setSelectedNotesIndex={props.setSelectedNotesIndex}
              handleMenuClose={handleMenuClose}
            />
            <NotesDeleteButton
              selectedNotesIndex={props.selectedNotesIndex}
              setSelectedNotesIndex={props.setSelectedNotesIndex}
              handleMenuClose={handleMenuClose}
            />
          </ButtonGroup>
        </Menu>
      )}
      {propertyTargetNote !== undefined && (
        <NotePropertyDialog
          open={propertyTargetNote !== undefined}
          note={propertyTargetNote}
          handleClose={handlePropertyDialogClose}
        />
      )}
      {dividerTargetIndex !== undefined && (
        <NoteDividerDialog
          open={dividerTargetIndex !== undefined}
          noteIndex={dividerTargetIndex}
          handleClose={handleDividerDialogClose}
        />
      )}
      {envelopeTargetNote !== undefined && (
        <EnvelopeDialog
          open={envelopeTargetNote !== undefined}
          note={envelopeTargetNote}
          handleClose={handleEnvelopeDialogClose}
        />
      )}
      {vibratoTargetNote !== undefined && (
        <VibratoDialog
          open={vibratoTargetNote !== undefined}
          note={vibratoTargetNote}
          handleClose={handleVibratoDialogClose}
        />
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
  /** ピッチターゲット更新のためのコールバック */
  setPitchTargetIndex?: (index: number | undefined) => void;
}

export interface NoteMoveButtonProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex?: (indexes: number[]) => void;
}

export interface NoteEditButtonProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex?: (indexes: number[]) => void;
  handleMenuClose: () => void;
}
