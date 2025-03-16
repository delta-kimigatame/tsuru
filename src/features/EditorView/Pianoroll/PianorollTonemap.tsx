import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useCookieStore } from "../../../store/cookieStore";
import { noteNumToTone } from "../../../utils/Notenum";

/**
 * ピアノロールの左側の音高名を表示する部分
 */
export const PianorollTonemap: React.FC = () => {
  const { colorTheme, verticalZoom, horizontalZoom } = useCookieStore();
  const mode = useThemeMode();

  return (
    <svg
      width={PIANOROLL_CONFIG.TONEMAP_WIDTH}
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
      {[...new Array(PIANOROLL_CONFIG.KEY_COUNT)].map((_, i) => (
        <React.Fragment key={i}>
          <rect
            x={0}
            y={i * PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
            width="100%"
            height={PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
            fill={
              PIANOROLL_CONFIG.BLACK_KEY_REMAINDERS.includes(i % 12)
                ? COLOR_PALLET[colorTheme][mode]["tonemapBlackKey"]
                : COLOR_PALLET[colorTheme][mode]["tonemapWhiteKey"]
            }
          />
          <text
            x={PIANOROLL_CONFIG.LYRIC_PADDING_LEFT}
            y={
              i * PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom +
              (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom) / 2
            }
            fontFamily='"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif'
            fill={COLOR_PALLET[colorTheme][mode]["lyric"]}
            fontSize={PIANOROLL_CONFIG.LYRIC_FONT_SIZE}
            pointerEvents="none"
            dominantBaseline="middle"
          >
            {noteNumToTone(107 - i)}
          </text>
          <line
            x1={0}
            x2={PIANOROLL_CONFIG.TONEMAP_WIDTH}
            y1={i * PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
            y2={i * PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
            stroke={COLOR_PALLET[colorTheme][mode]["horizontalSeparator"]}
            strokeWidth={
              i % 12 === 0
                ? PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH_OCTAVE
                : PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH
            }
          />
        </React.Fragment>
      ))}
      <line
        x1={0}
        x2={PIANOROLL_CONFIG.TONEMAP_WIDTH}
        y1={
          PIANOROLL_CONFIG.KEY_COUNT *
          PIANOROLL_CONFIG.KEY_HEIGHT *
          verticalZoom
        }
        y2={
          PIANOROLL_CONFIG.KEY_COUNT *
          PIANOROLL_CONFIG.KEY_HEIGHT *
          verticalZoom
        }
        stroke={COLOR_PALLET[colorTheme][mode]["horizontalSeparator"]}
        strokeWidth={PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH_OCTAVE}
      />
    </svg>
  );
};
