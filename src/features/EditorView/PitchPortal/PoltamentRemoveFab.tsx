import RemoveIcon from "@mui/icons-material/Remove";
import { Fab } from "@mui/material";
import React from "react";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PitchPortalProps } from "./PitchPortal";

export const PoltamentRemoveFab: React.FC<PitchPortalProps> = (props) => {
  const { setNote } = useMusicProjectStore();
  const handleClick = () => {
    const n = RemovePoltament(props.targetIndex, props.note);
    setNote(n.index, n);
  };

  return (
    <Fab
      size="small"
      color="default"
      aria-label="poltamentRemove"
      data-testid="poltamentRemove"
      sx={{ m: 1 }}
      disabled={isMinusDisabled(props.targetIndex, props.note.pbw)}
      onClick={handleClick}
    >
      <RemoveIcon />
    </Fab>
  );
};

const isMinusDisabled = (targetIndex: number, pbw: number[]): boolean => {
  if (targetIndex === 0 || targetIndex === undefined) return true;
  return targetIndex === pbw.length;
};

export const RemovePoltament = (targetIndex: number, note: Note): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { targetIndex: targetIndex, note: oldNote },
    summary: `ポルタメントの削除`,
  });

  const n = RemovePoltamentCore(targetIndex, note.deepCopy());
  return n;
};
const undo = (note: Note): Note[] => {
  return [note];
};

const redo = (args: { targetIndex: number; note: Note }): Note[] => {
  return [RemovePoltamentCore(args.targetIndex, args.note.deepCopy())];
};

const RemovePoltamentCore = (targetIndex: number, n: Note): Note => {
  const pbwIndex = targetIndex - 1;
  const newPbw = n.pbw[pbwIndex] + n.pbw[pbwIndex + 1];
  n.setPbw(
    pbwIndex === 0
      ? n.pbw.slice(1)
      : n.pbw.slice(0, pbwIndex).concat(n.pbw.slice(pbwIndex + 1))
  );
  n.pbw[pbwIndex] = newPbw;
  n.setPby(
    pbwIndex === 0
      ? n.pby.slice(1)
      : n.pby.slice(0, pbwIndex).concat(n.pby.slice(pbwIndex + 1))
  );
  n.setPbm(
    pbwIndex === 0
      ? n.pbm.slice(1)
      : n.pbm.slice(0, pbwIndex).concat(n.pbm.slice(pbwIndex + 1))
  );
  return n;
};
