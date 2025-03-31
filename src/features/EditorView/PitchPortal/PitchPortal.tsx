import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Fab, Slider } from "@mui/material";
import Portal from "@mui/material/Portal";
import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

const SLIDER_PADDING = 16;
const SLIDER_SIZE = 45;

export const PitchPortal: React.FC<PitchPortal> = (props) => {
  const verticalMenu = useVerticalFooterMenu();
  const { setNote } = useMusicProjectStore();
  const handleChangeVerticalSlider = (e, newValue: number) => {
    const n = props.note.deepCopy();
    if (props.targetIndex === 0) {
      n.pbsHeight = newValue;
    } else {
      n.pby[props.targetIndex - 1] = newValue;
    }
    setNote(n.index, n);
  };

  const handleChangeHorizontalSlider = (e, newValue: number) => {
    const n = props.note.deepCopy();
    if (props.targetIndex === 0) {
      const dif = newValue - n.pbs.time;
      n.pbsTime = newValue;
      n.pbw[0] -= dif;
    } else {
      const dif = newValue - n.pbw[props.targetIndex - 1];
      console.log("PITCH_DEBUG", n.pbs.time, dif, n.pbw);
      n.pbw[props.targetIndex - 1] = newValue;
      if (props.targetIndex !== n.pbw.length) {
        n.pbw[props.targetIndex] -= dif;
      }
    }
    setNote(n.index, n);
  };

  const handleMinusClick = () => {
    const pbwIndex = props.targetIndex - 1;
    const n = props.note.deepCopy();
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
    setNote(n.index, n);
  };

  const handleAddClick = () => {
    const pbwIndex = props.targetIndex - 1;
    const n = props.note.deepCopy();
    const newPbw = n.pbw[pbwIndex < 0 ? 0 : pbwIndex] / 2;
    const newPby = n.pby[pbwIndex + 1] / 2;
    if (props.targetIndex === 0) {
      n.pbw[0] = newPbw;
      n.pbw.unshift(newPbw);
      n.pby.unshift(newPby);
      n.pbm.unshift("");
    } else if (pbwIndex === n.pbw.length - 1) {
      n.pbw.push(10);
      if (n.pby === undefined) {
        n.setPby([0]);
      } else {
        n.pby.push(0);
      }
      if (n.pbm === undefined) {
        n.setPbm([""]);
      } else {
        n.pbm.push("");
      }
    } else {
      n.pbw[pbwIndex] = newPbw;
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
    setNote(n.index, n);
  };

  /**
   * pbmを順送りする
   * @param props.note ノート
   * @param props.targetIndex 変更の対象となるpbmのインデックス
   */
  const handleRotatePbmClick = (): void => {
    const pbm = props.note.pbm.slice();
    if (pbm[props.targetIndex - 1] === "") {
      pbm[props.targetIndex - 1] = "s";
    } else if (pbm[props.targetIndex - 1] === "s") {
      pbm[props.targetIndex - 1] = "r";
    } else if (pbm[props.targetIndex - 1] === "r") {
      pbm[props.targetIndex - 1] = "j";
    } else {
      pbm[props.targetIndex - 1] = "";
    }
    props.note.setPbm(pbm);
    setNote(props.note.index, props.note);
  };

  return (
    <>
      {props.note !== undefined && props.note.pbw !== undefined && (
        <Portal>
          {isHorizontalVisible(props.targetIndex, props.note) && (
            <Box
              sx={{
                position: "fixed",
                bottom: !verticalMenu
                  ? EDITOR_CONFIG.FOOTER_MENU_SIZE + SLIDER_PADDING
                  : SLIDER_PADDING,
                right: verticalMenu
                  ? EDITOR_CONFIG.FOOTER_MENU_SIZE + SLIDER_PADDING * 2
                  : SLIDER_PADDING * 2,
                left:
                  SLIDER_PADDING * 2 +
                  PIANOROLL_CONFIG.TONEMAP_WIDTH +
                  SLIDER_SIZE,
                zIndex: 100,
              }}
            >
              <Slider
                color="error"
                step={0.1}
                min={horizontalMin(props.targetIndex, props.note)}
                max={horizontalMax(props.targetIndex, props.note)}
                value={
                  props.targetIndex === 0
                    ? props.note.pbs.time
                    : props.note.pbw[props.targetIndex - 1]
                }
                onChange={handleChangeHorizontalSlider}
              />
            </Box>
          )}
          <Box
            sx={{
              position: "fixed",
              bottom:
                (!verticalMenu ? EDITOR_CONFIG.FOOTER_MENU_SIZE : 0) +
                SLIDER_SIZE,
              right: verticalMenu
                ? EDITOR_CONFIG.FOOTER_MENU_SIZE + SLIDER_PADDING * 2
                : SLIDER_PADDING * 2,
              zIndex: 100,
            }}
          >
            <Fab
              size="small"
              color="default"
              aria-label="poltamentRemove"
              sx={{ m: 1, textTransform: "none" }}
              disabled={props.targetIndex === 0}
              onClick={handleRotatePbmClick}
            >
              {props.note.pbm[props.targetIndex - 1] === undefined ||
              props.note.pbm[props.targetIndex - 1] === ""
                ? "S"
                : props.note.pbm[props.targetIndex - 1] === "s"
                ? "/"
                : props.note.pbm[props.targetIndex - 1]}
            </Fab>
            <Fab
              size="small"
              color="default"
              aria-label="poltamentRemove"
              sx={{ m: 1 }}
              disabled={isMinusDisabled(props.targetIndex, props.note.pbw)}
              onClick={handleMinusClick}
            >
              <RemoveIcon />
            </Fab>
            <Fab
              size="small"
              color="default"
              aria-label="poltamentAdd"
              sx={{ m: 1 }}
              disabled={isAddDisabled(props.targetIndex)}
              onClick={handleAddClick}
            >
              <AddIcon />
            </Fab>
          </Box>
          {isVerticalVisible(props.targetIndex, props.note) && (
            <Box
              sx={{
                position: "fixed",
                top: EDITOR_CONFIG.HEADER_HEIGHT + SLIDER_PADDING,
                bottom:
                  (!verticalMenu ? EDITOR_CONFIG.FOOTER_MENU_SIZE : 0) +
                  SLIDER_SIZE +
                  SLIDER_PADDING,
                left: SLIDER_PADDING * 2 + PIANOROLL_CONFIG.TONEMAP_WIDTH,
                zIndex: 100,
              }}
            >
              <Slider
                color="error"
                step={0.1}
                orientation="vertical"
                min={-200}
                max={200}
                value={
                  props.targetIndex === 0
                    ? props.note.pbs.height
                    : props.note.pby[props.targetIndex - 1]
                }
                onChange={handleChangeVerticalSlider}
              />
            </Box>
          )}
        </Portal>
      )}
    </>
  );
};

const horizontalMin = (targetIndex: number, note: Note): number => {
  if (targetIndex === 0) {
    if (note.prev === null) {
      return 0;
    } else {
      return note.prev.msLength * -1;
    }
  } else {
    return 0;
  }
};
const horizontalMax = (targetIndex: number, note: Note): number => {
  if (targetIndex === 0) {
    //1点目
    return note.pbw[0];
  } else if (targetIndex === note.pbw.length) {
    //最後
    // 1つ手前のノートまでのpbwの累積
    const total =
      note.pbw.slice(0, targetIndex - 2).reduce((s, c) => s + c, 0) +
      note.pbs.time;
    return note.msLength - total;
  } else {
    return note.pbw[targetIndex - 1] + note.pbw[targetIndex];
  }
};

const isMinusDisabled = (targetIndex: number, pbw: number[]): boolean => {
  if (targetIndex === 0 || targetIndex === undefined) return true;
  return targetIndex === pbw.length;
};

const isAddDisabled = (targetIndex: number): boolean => {
  return targetIndex === undefined;
};

const isVerticalVisible = (targetIndex: number, note: Note): boolean => {
  if (note === undefined || targetIndex === undefined) return false;
  if (targetIndex === 0) return note.prev === null || note.prev.lyric === "R";
  return targetIndex !== note.pbw.length;
};

const isHorizontalVisible = (targetIndex: number, note: Note): boolean => {
  return note !== undefined && targetIndex !== undefined;
};

export interface PitchPortal {
  targetIndex: number | undefined;
  note: Note | undefined;
}
