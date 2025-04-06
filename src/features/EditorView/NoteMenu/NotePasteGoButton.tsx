import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import { IconButton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { Ust } from "../../../lib/Ust";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { NoteEditButtonProps } from "./NoteMenu";

export const NotePasteGoButton: React.FC<NoteEditButtonProps> = (props) => {
  const { t } = useTranslation();
  const snackBarStore = useSnackBarStore();
  const { notes, setNotes } = useMusicProjectStore();
  const handleClick = async () => {
    LOG.info("クリップボードから挿入", "NotesDownButton");
    const clipUst = new Ust();
    try {
      // clipboardの読込・loadTextのどちらでこけたかの区別は不要
      const clipText = await navigator.clipboard.readText();
      clipUst.loadText(clipText.replace(/\r\n/g, "\n").split("\n"));
    } catch {
      // 読み込みに失敗しているが、そもそも事前にクリップボードの状態をチェックできていないのでエラーとまでは言えない
      snackBarStore.setValue(t("editor.pasteError"));
      snackBarStore.setSeverity("warning");
      snackBarStore.setOpen(true);
      props.handleMenuClose();
      return;
    }
    setNotes(pasteGo(notes, clipUst.notes, props.selectedNotesIndex[0]));
    props.handleMenuClose();
  };

  return (
    <IconButton
      onClick={handleClick}
      disabled={props.selectedNotesIndex.length !== 1}
      data-testid="notePasteGoButton"
    >
      <ContentPasteGoIcon />
    </IconButton>
  );
};

export const pasteGo = (
  notes: Note[],
  insertNotes: Note[],
  index: number
): Note[] => {
  const oldNotes = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNotes,
    redo: redo,
    redoArgs: { notes: oldNotes, insertNotes: insertNotes, index: index },
    summary: `クリップボードから挿入`,
    all: true,
  });
  const newNotes = notes
    .slice(0, index + 1)
    .concat(insertNotes, notes.slice(index + 1));
  return newNotes.map((n) => n.deepCopy());
};
const undo = (notes: Note[]): Note[] => {
  return notes;
};
const redo = (args: {
  notes: Note[];
  insertNotes: Note[];
  index: number;
}): Note[] => {
  const newNotes = args.notes
    .slice(0, args.index + 1)
    .concat(args.insertNotes, args.notes.slice(args.index + 1));
  return newNotes;
};
