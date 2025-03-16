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

export const PianorollVibrato: React.FC = () => {
  const { colorTheme, verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  const mode = useThemeMode();
  /**
   * 各ノートのx座標描画位置を予め求めておく
   *
   * TODO 親コンポーネントで実行しpropsとしてもらうようにする
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

  /** svg幅を計算するためにノート長の合計を求める
   *
   * TODO 親コンポーネントで実行しpropsとしてもらうようにする
   */
  const totalLength = React.useMemo(() => {
    LOG.debug("notesLeftの更新検知", "PianorollVibrato");
    if (notes.length === 0) return 0;
    LOG.debug("totalLengthの再計算", "PianorollVibrato");
    return notesLeft.slice(-1)[0] + notes.slice(-1)[0].length;
  }, [notesLeft]);

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
    console.log(points.join(" "));
    return points.join(" ");
  };

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
          zIndex: 3,
        }}
      >
        {notes.map((n, i) => (
          <>
            {
              /** pbsが存在しないノートはピッチの描画無し */
              n.lyric !== "R" && n.vibrato !== undefined && (
                <polyline
                  key={i}
                  points={vibratoToPoliline(
                    n,
                    notesLeft[i] *
                      PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
                      horizontalZoom,
                    verticalZoom,
                    horizontalZoom
                  )}
                  stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                  fill="none"
                />
              )
            }
          </>
        ))}
      </svg>
    </>
  );
};
