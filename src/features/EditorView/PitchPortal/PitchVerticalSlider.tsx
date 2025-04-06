import { Box, Slider } from "@mui/material";
import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { Note } from "../../../lib/Note";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PitchPortalProps } from "./PitchPortal";

export const PitchVerticalSlider: React.FC<
  PitchPortalProps & { setHasUpdate: (f: boolean) => void }
> = (props) => {
  const verticalMenu = useVerticalFooterMenu();
  const { setNote } = useMusicProjectStore();
  const handleChange = (e, newValue: number) => {
    props.setHasUpdate(true);
    const n = props.note.deepCopy();
    if (props.targetIndex === 0) {
      n.pbsHeight = newValue;
    } else {
      n.pby[props.targetIndex - 1] = newValue;
    }
    setNote(n.index, n);
  };

  return (
    <>
      {isVerticalVisible(props.targetIndex, props.note) && (
        <Box
          sx={{
            position: "fixed",
            top: EDITOR_CONFIG.HEADER_HEIGHT + EDITOR_CONFIG.SLIDER_PADDING,
            bottom:
              (!verticalMenu ? EDITOR_CONFIG.FOOTER_MENU_SIZE : 0) +
              EDITOR_CONFIG.SLIDER_SIZE +
              EDITOR_CONFIG.SLIDER_PADDING,
            left:
              EDITOR_CONFIG.SLIDER_PADDING * 2 + PIANOROLL_CONFIG.TONEMAP_WIDTH,
            zIndex: 100,
          }}
        >
          <Slider
            color="error"
            step={0.1}
            orientation="vertical"
            aria-label="pitchVerticalSlider"
            data-testid="pitchVerticalSlider"
            min={-200}
            max={200}
            value={
              props.targetIndex === 0
                ? props.note.pbs.height
                : props.note.pby[props.targetIndex - 1]
            }
            onChange={handleChange}
          />
        </Box>
      )}
    </>
  );
};

const isVerticalVisible = (targetIndex: number, note: Note): boolean => {
  if (note === undefined || targetIndex === undefined) return false;
  if (targetIndex === 0 && !note.prev) return false;
  if (targetIndex === 0) return note.prev.lyric === "R";
  return targetIndex !== note.pbw.length;
};
