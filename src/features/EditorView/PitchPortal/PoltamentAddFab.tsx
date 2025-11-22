import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import React from "react";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PitchPortalProps } from "./PitchPortal";

export const PoltamentAddFab: React.FC<PitchPortalProps> = (props) => {
  const { setNote } = useMusicProjectStore();
  const handleClick = () => {
    const n = AddPoltament(props.targetIndex, props.note);
    setNote(n.index, n);
  };

  return (
    <Fab
      size="small"
      color="default"
      aria-label="poltamentAdd"
      data-testid="poltamentAdd"
      sx={{ m: 1 }}
      disabled={isAddDisabled(props.targetIndex)}
      onClick={handleClick}
    >
      <AddIcon />
    </Fab>
  );
};

const isAddDisabled = (targetIndex: number): boolean => {
  return targetIndex === undefined;
};

export const AddPoltament = (targetIndex: number, note: Note): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { targetIndex: targetIndex, note: oldNote },
    summary: `ポルタメントの追加`,
  });

  const n = AddPoltamentCore(targetIndex, note.deepCopy());
  return n;
};
const undo = (note: Note): Note[] => {
  return [note];
};

const redo = (args: { targetIndex: number; note: Note }): Note[] => {
  return [AddPoltamentCore(args.targetIndex, args.note.deepCopy())];
};

const AddPoltamentCore = (targetIndex: number, n: Note): Note => {
  const pbwIndex = targetIndex - 1;
  const newPbw = n.pbw[pbwIndex < 0 ? 0 : pbwIndex + 1] / 2;
  const pbsHeight =
    n.prev === null || n.prev.lyric === "R"
      ? n.pbsHeight
      : (n.prev.notenum - n.notenum) * 10;
  const newPby =
    n.pby === undefined
      ? 0
      : pbwIndex < 0
      ? (n.pby[0] - pbsHeight) / 2 + pbsHeight
      : (() => {
          const val1 = n.pby[pbwIndex];
          const val2 = n.pby[pbwIndex + 1] ?? 0;
          const absVal1 = Math.abs(val1);
          const absVal2 = Math.abs(val2);
          const diff = absVal1 > absVal2 ? val1 - val2 : val2 - val1;
          return Math.abs(diff / 2) + Math.min(val1, val2);
        })();
  if (targetIndex === 0) {
    n.pbw[0] = newPbw;
    n.pbw.unshift(newPbw);
    if (n.pby === undefined) {
      n.setPby([newPby]);
    } else {
      n.pby.unshift(newPby);
    }
    n.pbm.unshift("");
  } else if (pbwIndex === n.pbw.length - 1) {
    n.pbw.push(10);
    if (n.pby === undefined) {
      n.setPby([0]);
    } else {
      n.pby.push(0);
    }
    if (n.pbm === undefined) {
      n.setPbm(Array(n.pbw.length).fill(""));
    } else {
      n.pbm.push("");
    }
  } else {
    n.pbw[pbwIndex + 1] = newPbw;
    n.setPbw(
      n.pbw.slice(0, pbwIndex + 1).concat([newPbw], n.pbw.slice(pbwIndex + 1))
    );
    n.setPby(
      n.pby.slice(0, pbwIndex + 1).concat([newPby], n.pby.slice(pbwIndex + 1))
    );
    if (n.pbm === undefined) {
      n.setPbm(Array(n.pbw.length).fill(""));
    } else {
      n.setPbm(
        n.pbm.slice(0, pbwIndex + 1).concat([""], n.pbm.slice(pbwIndex + 1))
      );
    }
  }
  return n;
};
