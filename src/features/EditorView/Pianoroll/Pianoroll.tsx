import { Box } from "@mui/material";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { LOG } from "../../../lib/Logging";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PianorollBackground } from "./PianorollBackground";
import { PianorollNotes } from "./PianorollNotes";
import { PianorollPitch } from "./PianorollPitch";
import { PianorollTonemap } from "./PianorollTonemap";
import { PianorollVibrato } from "./PianorollVibrato";

export const Pianoroll: React.FC = () => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  /**
   * 各ノートのx座標描画位置を予め求めておく
   */
  const notesLeft = React.useMemo(() => {
    LOG.debug("notesの更新検知", "PianorollVibrato");
    if (notes.length === 0) return [];
    LOG.debug("notesLeftの再計算", "PianorollVibrato");
    const lefts = new Array<number>();
    let totalLength = 0;
    for (let i = 0; i < notes.length; i++) {
      lefts.push(totalLength);
      totalLength += notes[i].length;
    }
    return lefts;
  }, [notes]);

  /**
   * svg幅を計算するためにノート長の合計を求める
   */
  const totalLength = React.useMemo(() => {
    LOG.debug("notesLeftの更新検知", "PianorollVibrato");
    if (notes.length === 0) return 0;
    LOG.debug("totalLengthの再計算", "PianorollVibrato");
    return notesLeft.slice(-1)[0] + notes.slice(-1)[0].length;
  }, [notesLeft]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        m: 0,
        p: 0,
      }}
    >
      <Box sx={{ display: "block", width: PIANOROLL_CONFIG.TONEMAP_WIDTH }}>
        <svg
          width={PIANOROLL_CONFIG.TONEMAP_WIDTH}
          height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
          style={{
            display: "block",
            position: "relative",
          }}
        >
          <PianorollTonemap />
        </svg>
      </Box>
      <Box sx={{ display: "block", overflowX: "scroll" }}>
        <svg
          width={
            totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom
          }
          height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
          style={{
            display: "block",
            position: "relative",
          }}
        >
          <g id="background">
            <PianorollBackground totalLength={totalLength} />
          </g>
          <g id="notes">
            <PianorollNotes
              selectedNotesIndex={[]}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="pitch">
            <PianorollPitch
              selectedNotesIndex={[]}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="vibrato">
            <PianorollVibrato
              selectedNotesIndex={[]}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
        </svg>
      </Box>
    </Box>
  );
};
