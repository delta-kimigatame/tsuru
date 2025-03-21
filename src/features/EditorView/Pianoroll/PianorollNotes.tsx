import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

/**
 * Pianorollにおいて音符や休符を描画する
 * @returns
 */
export const PianorollNotes: React.FC<PianorollNotesProps> = (props) => {
  const { colorTheme, verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  const mode = useThemeMode();

  return (
    <>
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
          zIndex: 1,
        }}
      >
        {notes.map((n, i) => (
          <>
            <rect
              key={i}
              x={
                props.notesLeft[i] *
                PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
                horizontalZoom
              }
              y={PIANOROLL_CONFIG.KEY_HEIGHT * (107 - n.notenum) * verticalZoom}
              width={
                n.length * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom
              }
              height={PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
              fill={
                COLOR_PALLET[colorTheme][mode][
                  n.lyric === "R"
                    ? props.selectedNotesIndex.includes(i)
                      ? "selectedRestNote"
                      : "restNote"
                    : props.selectedNotesIndex.includes(i)
                    ? "selectedNote"
                    : "note"
                ]
              }
              stroke={COLOR_PALLET[colorTheme][mode]["noteBorder"]}
              strokeWidth={PIANOROLL_CONFIG.NOTES_BORDER_WIDTH}
            />
            <text
              x={
                props.notesLeft[i] *
                  PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
                  horizontalZoom +
                PIANOROLL_CONFIG.LYRIC_PADDING_LEFT
              }
              y={
                PIANOROLL_CONFIG.KEY_HEIGHT * (107 - n.notenum) * verticalZoom +
                (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom) / 2
              }
              fontFamily='"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif'
              fill={COLOR_PALLET[colorTheme][mode]["lyric"]}
              fontSize={PIANOROLL_CONFIG.LYRIC_FONT_SIZE}
              pointerEvents="none"
              dominantBaseline="middle"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {n.lyric}
            </text>
          </>
        ))}
      </svg>
    </>
  );
};

export interface PianorollNotesProps {
  selectedNotesIndex: Array<number>;
  notesLeft: Array<number>;
  totalLength: number;
}
