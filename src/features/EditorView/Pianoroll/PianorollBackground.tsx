import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { LOG } from "../../../lib/Logging";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

/**
 * ピアノロールの背景部分
 */
export const PianorollBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { colorTheme, verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  const mode = useThemeMode();
  /**
   * svg幅を計算するためにノート長の合計を求める
   *
   * これは結局各canvasで必要になるので、後で親要素を作ったらpropsに変更する
   * */
  const totalLength = React.useMemo(() => {
    LOG.debug("notesの更新検知", "PianorollNotes");
    if (notes.length === 0) return 0;
    LOG.debug("totalLengthの再計算", "PianorollNotes");
    return notes.reduce((total, current) => total + current.length, 0);
  }, [notes]);

  /**
   * notesの実際の拍子数に最も近い4の倍数
   *
   * 実際の拍子数 = totalLength/480
   */
  const beatsCount = React.useMemo(() => {
    LOG.debug("totalLengthの更新検知", "PianorollNotes");
    return Math.ceil(totalLength / 480 / 4) * 4;
  }, [totalLength]);

  return (
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
      {[...new Array(PIANOROLL_CONFIG.KEY_COUNT)].map((_, i) => (
        <React.Fragment key={i}>
          <rect
            x={0}
            y={i * PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
            width="100%"
            height={PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom}
            fill={
              PIANOROLL_CONFIG.BLACK_KEY_REMAINDERS.includes(i % 12)
                ? COLOR_PALLET[colorTheme][mode]["blackKey"]
                : COLOR_PALLET[colorTheme][mode]["whiteKey"]
            }
          />
          <line
            x1={0}
            x2={
              totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom
            }
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
        x2={totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
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
      {[...new Array(beatsCount)].map((_, i) => (
        <line
          key={i}
          x1={i * 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
          x2={i * 480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
          y1={0}
          y2={PIANOROLL_CONFIG.TOTAL_HEIGHT}
          stroke={COLOR_PALLET[colorTheme][mode]["verticalSeparator"]}
          strokeWidth={
            i % 4 === 0
              ? PIANOROLL_CONFIG.VERTICAL_SEPARATOR_WIDTH_MEASURE
              : PIANOROLL_CONFIG.VERTICAL_SEPARATOR_WIDTH
          }
        />
      ))}
    </svg>
  );
};
