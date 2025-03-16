import { Box } from "@mui/material";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { LOG } from "../../../lib/Logging";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PianorollBackground } from "./PianorollBackground";
import { PianorollNotes } from "./PianorollNotes";
import { notenumToPoint, PianorollPitch } from "./PianorollPitch";
import { PianorollTonemap } from "./PianorollTonemap";
import { PianorollVibrato } from "./PianorollVibrato";

export const Pianoroll: React.FC = () => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes, vb } = useMusicProjectStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const c4Center = notenumToPoint(60, verticalZoom);
  const portraitUrl: string = React.useMemo(() => {
    LOG.debug("vbの更新検知", "Pianoroll");
    if (vb === null) return undefined;
    return vb.portrait === undefined
      ? undefined
      : URL.createObjectURL(new Blob([vb.portrait], { type: "image/png" }));
  }, [vb]);
  /**
   * 各ノートのx座標描画位置を予め求めておく
   */
  const notesLeft = React.useMemo(() => {
    LOG.debug("notesの更新検知", "Pianoroll");
    if (notes.length === 0) return [];
    LOG.debug("notesLeftの再計算", "Pianoroll");
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
    LOG.debug("notesLeftの更新検知", "Pianoroll");
    if (notes.length === 0) return 0;
    LOG.debug("totalLengthの再計算", "Pianoroll");
    return notesLeft.slice(-1)[0] + notes.slice(-1)[0].length;
  }, [notesLeft]);

  React.useEffect(() => {
    LOG.debug(`コンポーネントマウント、c4Center:${c4Center}`, "Pianoroll");
    window.scrollTo(0, c4Center - window.innerHeight / 2);
  }, [c4Center]);
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom + 40,
        overflowX: "hidden",
        overflowY: "auto",
        m: 0,
        p: 0,
      }}
      ref={containerRef}
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
      <Box sx={{ display: "block", overflowX: "scroll", position: "relative" }}>
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
      {portraitUrl !== undefined && (
        <img
          src={portraitUrl}
          style={{
            maxHeight: vb.portraitHeight,
            objectFit: "contain",
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 10,
            maxWidth: "50%",
            pointerEvents: "none",
            userSelect: "none",
            opacity: vb.portraitOpacity,
          }}
        />
      )}
    </Box>
  );
};
