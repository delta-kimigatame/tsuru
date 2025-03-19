import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useCookieStore } from "../../../store/cookieStore";

export const PianorollSeekbar: React.FC<PianorollSeekbarProps> = (props) => {
  const { colorTheme, verticalZoom, horizontalZoom } = useCookieStore();
  const mode = useThemeMode();

  return (
    <svg
      width={
        props.totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom
      }
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        pointerEvents: "none",
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 4,
      }}
    >
      <line
        x1={props.seekBarX}
        x2={props.seekBarX}
        y1={0}
        y2={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
        stroke={COLOR_PALLET[colorTheme][mode]["seekBar"]}
        strokeWidth={PIANOROLL_CONFIG.SEEKBAR_WIDTH}
      />
    </svg>
  );
};

export interface PianorollSeekbarProps {
  seekBarX: number;
  totalLength: number;
}
