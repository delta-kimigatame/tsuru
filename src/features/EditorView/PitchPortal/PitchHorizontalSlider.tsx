import { Box, Slider } from "@mui/material";
import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PitchPortalProps } from "./PitchPortal";

export const PitchHorizontalSlider: React.FC<
  PitchPortalProps & { setHasUpdate: (f: boolean) => void }
> = (props) => {
  const verticalMenu = useVerticalFooterMenu();
  const { setNote } = useMusicProjectStore();
  const handleChange = (e, newValue: number) => {
    props.setHasUpdate(true);
    const n = props.note.deepCopy();
    if (props.targetIndex === 0) {
      const dif = newValue - n.pbs.time;
      n.pbsTime = newValue;
      n.pbw[0] -= dif;
    } else {
      const dif = newValue - n.pbw[props.targetIndex - 1];
      n.pbw[props.targetIndex - 1] = newValue;
      if (props.targetIndex !== n.pbw.length) {
        n.pbw[props.targetIndex] -= dif;
      }
    }
    setNote(n.index, n);
  };

  return (
    <>
      {isHorizontalVisible(props.targetIndex, props.note) && (
        <Box
          sx={{
            position: "fixed",
            bottom: !verticalMenu
              ? EDITOR_CONFIG.FOOTER_MENU_SIZE + EDITOR_CONFIG.SLIDER_PADDING
              : EDITOR_CONFIG.SLIDER_PADDING,
            right: verticalMenu
              ? EDITOR_CONFIG.FOOTER_MENU_SIZE +
                EDITOR_CONFIG.SLIDER_PADDING * 2
              : EDITOR_CONFIG.SLIDER_PADDING * 2,
            left:
              EDITOR_CONFIG.SLIDER_PADDING * 2 +
              PIANOROLL_CONFIG.TONEMAP_WIDTH +
              EDITOR_CONFIG.SLIDER_SIZE,
            zIndex: 100,
          }}
        >
          <Slider
            color="error"
            step={0.1}
            min={horizontalMin(props.targetIndex, props.note)}
            max={horizontalMax(props.targetIndex, props.note)}
            aria-label="pitchHorizontalSlider"
            data-testid="pitchHorizontalSlider"
            value={
              props.targetIndex === 0
                ? props.note.pbs.time
                : props.note.pbw[props.targetIndex - 1]
            }
            onChange={handleChange}
          />
        </Box>
      )}
    </>
  );
};

const horizontalMin = (targetIndex: number, note: Note): number => {
  if (targetIndex === 0) {
    if (note.prev === null || note.prev === undefined) {
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
      note.pbw.slice(0, targetIndex - 1).reduce((s, c) => s + c, 0) +
      note.pbs.time;
    return note.msLength - total;
  } else {
    return note.pbw[targetIndex - 1] + note.pbw[targetIndex];
  }
};

const isHorizontalVisible = (targetIndex: number, note: Note): boolean => {
  return note !== undefined && targetIndex !== undefined;
};
