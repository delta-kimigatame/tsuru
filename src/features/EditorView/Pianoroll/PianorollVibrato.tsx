import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { makeTimeAxis } from "../../../utils/interp";
import { deciToneToPoint, msToPoint, notenumToPoint } from "./PianorollPitch";

export const PianorollVibrato: React.FC<PianorollVibratoProps> = (props) => {
  const { colorTheme, verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  const mode = useThemeMode();

  /**
   * UTAUのビブラート値を使ってボリライン描画用のpointsを取得する
   * @param n 対象ノート
   * @param leftOffset 対象ノートsvgのx軸上の開始位置
   * @param verticalZoom svgの垂直方向の拡大率
   * @param horizontalZoom svgの水平方向の拡大率
   * @returns ポリラインに渡す値。`x1,y1 x2,y2 x3,y3...`と言った形式で与えられる。
   */
  const vibratoToPoliline = (
    n: Note,
    leftOffset: number,
    verticalZoom: number,
    horizontalZoom
  ) => {
    if (n.vibrato === undefined) {
      LOG.warn(
        `vibratoが存在しないノートは処理しないはずなのに描画処理が呼ばれた。`,
        "PianorollVibrato"
      );
      return;
    }
    /** 5tick毎のピッチ点をms単位に変換したもの */
    const timeAxis = makeTimeAxis(n.pitchSpan, 0, n.targetLength / 1000);
    /** timeAxisに沿ったピッチ列。単位はcentTone */
    const vibratoPitches = n.getVibratoPitches(n, timeAxis, 0);
    const xAxis = timeAxis.map((t) =>
      msToPoint(t * 1000, n.tempo, horizontalZoom)
    );
    const yValues = vibratoPitches.map((c) =>
      deciToneToPoint(c / 10, verticalZoom)
    );
    if (xAxis.length !== yValues.length) {
      LOG.warn(
        `xAxisとyValuesの数が合わない。何かがおかしい`,
        "PianorollVibrato"
      );
      return;
    }
    const points = [];
    const topOffset = notenumToPoint(n.notenum, verticalZoom);
    let vibratoStartFlag = false;
    yValues.forEach((v, i) => {
      /** 最初に連続する0はビブラートが始まっていない証なので描画対象から外す */
      if (!vibratoStartFlag && v === 0) {
        return;
      } else if (!vibratoStartFlag) {
        /**1度0ではない値が出たら1つ前の値から描画を始める */
        vibratoStartFlag = true;
        if (i === 0) {
          points.push(`${leftOffset},${topOffset}`);
        } else {
          points.push(
            `${leftOffset + xAxis[i - 1]},${topOffset + yValues[i - 1]}`
          );
        }
      }
      points.push(`${leftOffset + xAxis[i]},${topOffset + v}`);
    });
    return points.join(" ");
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
          zIndex: 3,
        }}
      >
        {notes.map((n, i) => (
          <>
            {n.lyric !== "R" && n.vibrato !== undefined && (
              <polyline
                key={i}
                points={vibratoToPoliline(
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
            )}
          </>
        ))}
      </svg>
    </>
  );
};

export interface PianorollVibratoProps {
  selectedNotesIndex: Array<number>;
  notesLeft: Array<number>;
  totalLength: number;
}
