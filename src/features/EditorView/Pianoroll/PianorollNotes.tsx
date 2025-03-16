import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { LOG } from "../../../lib/Logging";
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
  /** 各ノートのx座標描画位置を予め求めておく */
  const notesLeft = React.useMemo(() => {
    LOG.debug("notesの更新検知", "PianorollNotes");
    if (notes.length === 0) return [];
    LOG.debug("notesLeftの再計算", "PianorollNotes");
    const lefts = new Array<number>();
    let totalLength = 0;
    for (let i = 0; i < notes.length; i++) {
      lefts.push(totalLength);
      totalLength += notes[i].length;
    }
    return lefts;
  }, [notes]);

  /** svg幅を計算するためにノート長の合計を求める */
  const totalLength = React.useMemo(() => {
    LOG.debug("notesLeftの更新検知", "PianorollNotes");
    if (notes.length === 0) return 0;
    LOG.debug("totalLengthの再計算", "PianorollNotes");
    return notesLeft.slice(-1)[0] + notes.slice(-1)[0].length;
  }, [notesLeft]);

  return (
    <>
      <svg
        width={totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
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
                notesLeft[i] *
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
                notesLeft[i] *
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
}
