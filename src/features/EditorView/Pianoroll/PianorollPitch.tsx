import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { makeTimeAxis } from "../../../utils/interp";

export const PianorollPitch: React.FC<PianorollPitchProps> = (props) => {
  const { colorTheme, verticalZoom, horizontalZoom, mode } = useCookieStore();
  const { notes } = useMusicProjectStore();
  const pitchToPoliline = (
    n: Note,
    leftOffset: number,
    verticalZoom: number,
    horizontalZoom
  ) => {
    const offset = n.pbs.time === undefined ? 0 : n.pbs.time;
    /** 5tick毎のピッチ点をms単位に変換したもの */
    const timeAxis = makeTimeAxis(
      n.pitchSpan,
      offset / 1000,
      (n.msLength - offset) / 1000
    );
    /** timeAxisに沿ったピッチ列。単位はcentTone */
    const interpPitches = n.getInterpPitch(n, timeAxis, offset / 1000);
    const xAxis = timeAxis.map((t) =>
      msToPoint(t * 1000, n.tempo, horizontalZoom)
    );
    const yValues = interpPitches.map((c, i) =>
      deciToneToPoint(c / 10, verticalZoom)
    );
    if (xAxis.length !== yValues.length) {
      LOG.warn(
        `xAxisとyValuesの数が合わない。何かがおかしい`,
        "PianorollPitch"
      );
      return;
    }
    const points = [];
    const xOffset = msToPoint(offset, n.tempo, horizontalZoom);
    const topOffset = notenumToPoint(n.notenum, verticalZoom);
    removeTrailingZeros(yValues).forEach((v, i) => {
      if (i === 0) {
        points.push(`${leftOffset + xOffset},${topOffset - yValues[0]}`);
      } else {
        points.push(
          `${leftOffset + xAxis[i - 1]},${topOffset - yValues[i - 1]}`
        );
      }
      points.push(`${leftOffset + xAxis[i]},${topOffset - v}`);
    });
    return points.join(" ");
  };

  const removeTrailingZeros = (arr: number[]): number[] => {
    let lastNonZero = arr.length - 1;
    while (lastNonZero >= 0 && arr[lastNonZero] === 0) {
      lastNonZero--;
    }
    return arr.slice(0, lastNonZero + 1);
  };
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
          zIndex: 2,
        }}
      >
        {notes.map((n, i) => (
          <>
            {
              /** pbsが存在しないノートはピッチの描画無し */
              n.lyric !== "R" && n.pbs !== undefined && (
                <>
                  <polyline
                    key={i}
                    points={pitchToPoliline(
                      n,
                      props.notesLeft[i] *
                        PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
                        horizontalZoom,
                      verticalZoom,
                      horizontalZoom
                    )}
                    stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                    fill="none"
                  />
                  {props.poltaments !== undefined &&
                    props.poltaments.map((p, i) => (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={10}
                        stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                        fill="none"
                        strokeWidth={props.targetPoltament === i ? 2 : 1}
                      />
                    ))}
                </>
              )
            }
          </>
        ))}
      </svg>
    </>
  );
};
export interface PianorollPitchProps {
  selectedNotesIndex: Array<number>;
  notesLeft: Array<number>;
  totalLength: number;
  poltaments?: Array<{ x: number; y: number }>;
  /** ピッチ編集モードで操作するポルタメントのインデックス */
  targetPoltament?: number | undefined;
}

/**
 * ピッチのポルタメント(ms)を座標に変換する。
 * @param ms 変換元ms
 * @param tempo ノートのbpm
 * @param horizontalZoom svgの水平方向の拡大率
 * @returns svgのx座標
 */
export const msToPoint = (
  ms: number,
  tempo: number,
  horizontalZoom: number
): number => {
  /** 1lengthあたりのpixel */
  const pixelPerTick = PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom;
  /** 1tickあたりの時間(ms) 1分間はtempo(bpm)*480tickで1分間は60,000ms */
  const msPerTick = 60000 / (tempo * 480);
  /** 1msあたりのpixel数 */
  const pixelPerMs = pixelPerTick / msPerTick;
  return ms * pixelPerMs;
};

/**
 * notenumをsvgのy座標に変換する。
 * @param notenum 音高番号。C1が24でB7が107
 * @param verticalZoom svgの垂直方向の拡大率
 * @returns 各ノートの中心のy座標
 */
export const notenumToPoint = (notenum: number, verticalZoom: number) => {
  return (
    PIANOROLL_CONFIG.KEY_HEIGHT * (107 - notenum) * verticalZoom +
    (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom) / 2
  );
};

/**
 * ピッチのポルタメント(deciTone)をsvgのy座標に変換する
 * @param cent notenumの1/10分の音高
 * @param verticalZoom svgの垂直方向の拡大率
 * @returns y座標
 */
export const deciToneToPoint = (cent: number, verticalZoom: number) => {
  return (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom * cent) / 10;
};
