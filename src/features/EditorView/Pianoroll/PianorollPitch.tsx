import React from "react";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { last } from "../../../utils/array";

export const PianorollPitch: React.FC<PianorollPitchProps> = (props) => {
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
          zIndex: 2,
        }}
      >
        {notes.map((n, i) => (
          <>
            {
              /** pbsが存在しないノートはピッチの描画無し */
              n.lyric !== "R" && n.pbs !== undefined && (
                <path
                  key={i}
                  d={getPathD(
                    n,
                    i,
                    props.notesLeft[i] *
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
export interface PianorollPitchProps {
  selectedNotesIndex: Array<number>;
  notesLeft: Array<number>;
  totalLength: number;
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
/**
 * ピッチ関係のパラメータに基づきsvgのpathのd要素を求める
 * @param n ノート
 * @param index ノートのインデックス
 * @param leftOffset svgにおけるノートのx軸の開始位置
 * @param verticalZoom svgにおける垂直方向の拡大率
 * @param horizontalZoom svgにおける水平方向の拡大率
 * @returns pathのd要素文字列
 */
export const getPathD = (
  n: Note,
  index: number,
  leftOffset: number,
  verticalZoom: number,
  horizontalZoom: number
): string => {
  if (n.pbs === undefined) {
    LOG.warn(
      `pbsが存在しないノートは処理しないはずなのにピッチ描画処理が呼ばれた。note.index:${index}`,
      "PianorollPitch"
    );
    return "";
  } else if (n.pbw === undefined) {
    LOG.warn(
      `ポルタメント関連パラメータ不整合。pbsが存在するにも関わらずpbwが存在しない。note.index:${index}`,
      "PianorollPitch"
    );
    return "";
  } else if (
    n.pbw.length >= 2 &&
    (n.pby === undefined || n.pby.length < n.pbw.length - 1)
  ) {
    LOG.warn(
      `ポルタメント関連パラメータが不整合。pbwの設定とpbyの設定が合わない。note.index:${index}`,
      "PianorollPitch"
    );
    return "";
  }
  const pbm = n.pbm ?? [];
  const pby = n.pby ?? [];
  pby.slice(0, n.pbw.length - 1);
  while (pbm.length < n.pbw.length) {
    pbm.push("");
  }
  //** UTAUのポルタメントをsvgにおける座標系に直す */
  const points = UtauPitchToPoints(
    n,
    pby,
    leftOffset,
    verticalZoom,
    horizontalZoom
  );
  const m = `M${points[0].x},${points[0].y}`;
  const c = new Array<string>();
  pbm.forEach((method, i) => {
    const xRange = points[i + 1].x - points[i].x;
    const yRange = points[i + 1].y - points[i].y;
    if (method === "") {
      c.push(svgCInterp(points, xRange, yRange, i));
    } else if (method === "s") {
      /** 線形補間 */
      c.push(svgCInterpS(points, xRange, yRange, i));
    } else if (method === "r") {
      c.push(svgCInterpR(points, xRange, yRange, i));
    } else if (method === "j") {
      c.push(svgCInterpJ(points, xRange, yRange, i));
    }
  });
  return `${m} ${c.join(" ")}`;
};

/**
 * UTAUのピッチパラメータをsvg座標上のポルタメントに変換する
 * @param n 変換元ノート。事前にpbsTimeとpbwが非undefinedであることを確認している
 * @param pby deciTone単位の音高列
 * @param leftOffset svg座標におけるノートのx軸開始位置
 * @param verticalZoom svgにおける垂直方向の拡大率
 * @param horizontalZoom svgにおける水平方向の拡大率
 * @returns
 */
export const UtauPitchToPoints = (
  n: Note,
  pby: Array<number>,
  leftOffset: number,
  verticalZoom: number,
  horizontalZoom: number
): Array<{ x: number; y: number }> => {
  const points = new Array<{ x: number; y: number }>();

  /** 始点はノートの位置とpbsTime(ms),pbsHeight(deciCent)によって与えられる。 */
  points.push({
    x: leftOffset + msToPoint(n.pbs.time, n.tempo, horizontalZoom),
    y:
      n.prev !== undefined && n.prev.lyric !== "R"
        ? notenumToPoint(n.prev.notenum, verticalZoom)
        : notenumToPoint(n.notenum, verticalZoom) -
          deciToneToPoint(n.pbs.height ?? 0, verticalZoom), //UTAUでは上が正、svgでは下が正のためポルタメントによる差分は引算
  });
  /**
   * 2点目以降。
   * xは1つ前の座標 + pbwをmsに変換したもの
   * yはnotenumToPoint(n.notenum) - deciToPoint(n.pby)となる。
   */
  /** 条件分岐を少なくするためまずpbyでループ */
  pby.forEach((y, i) => {
    points.push({
      x: last(points).x + msToPoint(n.pbw[i], n.tempo, horizontalZoom),
      y:
        notenumToPoint(n.notenum, verticalZoom) -
        deciToneToPoint(y ?? 0, verticalZoom),
    });
  });

  /**
   * 最後の点
   * pbyの点数は必ずpbwの点数より少ない。
   * xは1つ前の座標 + pbwをmsに変換したもの
   * yはnotenumToPoint(n.notenum)となる。
   */
  points.push({
    x: last(points).x + msToPoint(last(n.pbw), n.tempo, horizontalZoom),
    y: notenumToPoint(n.notenum, verticalZoom),
  });
  return points;
};

/**
 * ポルタメントをS字補完(cosπ -> cos2π)するための三次ベジエ曲線のCパラメータを返す
 * @param points ポルタメントの座標列
 * @param xRange 次のポルタメントまでのx距離
 * @param yRange 次のポルタメントまでのy距離
 * @param i ポルタメント始点のインデックス
 * @returns
 */
export const svgCInterp = (
  points: Array<{ x: number; y: number }>,
  xRange: number,
  yRange: number,
  i: number
): string => {
  /** xが1/6のときyが1/8、xが1/3のときyが1/4、xが1/2のときyが1/2、xが2/3のときyが3/4、xが5/6のときyが7/8 */
  const c1 = `C ${points[i].x + xRange / 6},${points[i].y + yRange / 8} ${
    points[i].x + xRange / 3
  },${points[i].y + yRange / 4} ${points[i].x + xRange / 2},${
    points[i].y + yRange / 2
  }`;
  const c2 = `C ${points[i].x + (xRange / 3) * 2},${
    points[i].y + (yRange / 4) * 3
  } ${points[i].x + (xRange / 6) * 5},${points[i].y + (yRange * 7) / 8} ${
    points[i + 1].x
  },${points[i + 1].y}`;
  return `${c1} ${c2}`;
};

/**
 * ポルタメントを線形するための三次ベジエ曲線のCパラメータを返す
 * @param points ポルタメントの座標列
 * @param xRange 次のポルタメントまでのx距離
 * @param yRange 次のポルタメントまでのy距離
 * @param i ポルタメント始点のインデックス
 * @returns
 */
export const svgCInterpS = (
  points: Array<{ x: number; y: number }>,
  xRange: number,
  yRange: number,
  i: number
): string => {
  return `C ${points[i].x + xRange / 3},${points[i].y + yRange / 3} ${
    points[i].x + (xRange / 3) * 2
  },${points[i].y + (yRange / 3) * 2} ${points[i + 1].x},${points[i + 1].y}`;
};

/**
 * ポルタメントをr字補完(sin0 -> sin(π/2))するための三次ベジエ曲線のCパラメータを返す
 * @param points ポルタメントの座標列
 * @param xRange 次のポルタメントまでのx距離
 * @param yRange 次のポルタメントまでのy距離
 * @param i ポルタメント始点のインデックス
 * @returns
 */
export const svgCInterpR = (
  points: Array<{ x: number; y: number }>,
  xRange: number,
  yRange: number,
  i: number
): string => {
  /** sin0 -> sin(π/2)なので、xが1/3のときyが1/2進み、xが2/3のときyが√3/2進んでいる。 */
  return `C ${points[i].x + xRange / 3},${points[i].y + yRange / 2} ${
    points[i].x + (xRange / 3) * 2
  },${points[i].y + (yRange / 2) * Math.sqrt(3)} ${points[i + 1].x},${
    points[i + 1].y
  }`;
};

/**
 * ポルタメントをj字補完(-cos(π/2) -> cos0)するための三次ベジエ曲線のCパラメータを返す
 * @param points ポルタメントの座標列
 * @param xRange 次のポルタメントまでのx距離
 * @param yRange 次のポルタメントまでのy距離
 * @param i ポルタメント始点のインデックス
 * @returns
 */
export const svgCInterpJ = (
  points: Array<{ x: number; y: number }>,
  xRange: number,
  yRange: number,
  i: number
): string => {
  /** -cos(π/2) -> cos0なので、xが1/3のときyが1-√3/2進み、xが2/3のときyが1/2進んでいる。 */
  return `C ${points[i].x + xRange / 3},${
    points[i].y + yRange * (1 - Math.sqrt(3) / 2)
  } ${points[i].x + (xRange / 3) * 2},${points[i].y + yRange / 2} ${
    points[i + 1].x
  },${points[i + 1].y}`;
};
