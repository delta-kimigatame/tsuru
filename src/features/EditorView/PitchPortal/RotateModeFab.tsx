import { Fab } from "@mui/material";
import React from "react";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PitchPortalProps } from "./PitchPortal";

export const RotateModeFab: React.FC<PitchPortalProps> = (props) => {
  const { setNote } = useMusicProjectStore();
  const handleClick = () => {
    const n = RotateMode(props.targetIndex, props.note);
    setNote(n.index, n);
  };

  return (
    <Fab
      size="small"
      color="default"
      aria-label="rotateMode"
      data-testid="rotateMode"
      sx={{ m: 1, textTransform: "none" }}
      disabled={props.targetIndex === 0}
      onClick={handleClick}
    >
      {props.note.pbm[props.targetIndex - 1] === undefined ||
      props.note.pbm[props.targetIndex - 1] === ""
        ? "S"
        : props.note.pbm[props.targetIndex - 1] === "s"
        ? "/"
        : props.note.pbm[props.targetIndex - 1]}
    </Fab>
  );
};

export const RotateMode = (targetIndex: number, note: Note): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { targetIndex: targetIndex, note: oldNote },
    summary: `ポルタメントの種類変更`,
  });

  const n = RotateModeCore(targetIndex, note.deepCopy());
  return n;
};
const undo = (note: Note): Note[] => {
  return [note];
};

const redo = (args: { targetIndex: number; note: Note }): Note[] => {
  return [RotateModeCore(args.targetIndex, args.note.deepCopy())];
};

const RotateModeCore = (targetIndex: number, n: Note): Note => {
  const pbm = n.pbm === undefined ? [] : n.pbm.slice();
  if (pbm[targetIndex - 1] === "") {
    pbm[targetIndex - 1] = "s";
  } else if (pbm[targetIndex - 1] === "s") {
    pbm[targetIndex - 1] = "r";
  } else if (pbm[targetIndex - 1] === "r") {
    pbm[targetIndex - 1] = "j";
  } else {
    pbm[targetIndex - 1] = "";
  }
  n.setPbm(pbm);
  return n;
};
