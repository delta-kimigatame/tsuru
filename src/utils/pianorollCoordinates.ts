import { EDITOR_CONFIG } from "../config/editor";
import { PIANOROLL_CONFIG } from "../config/pianoroll";
import { Note } from "../lib/Note";
import { last } from "./array";

/**
 * クライアント座標をSVG座標に変換する
 * @param svg SVG要素
 * @param clientX クライアントX座標
 * @param clientY クライアントY座標
 * @returns SVG座標空間でのDOMPoint
 */
export const getSVGPoint = (
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): DOMPoint => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM()?.inverse());
};

/**
 * クリックした座標を与えてタップしたポルタメントを返す
 * @param svgPoint svg空間における座標
 * @param poltaments ポルタメントの座標一覧
 * @returns クリックしたポルタメントのインデックスを返す。該当がなければundefinedを返す
 */
export const getTargetPpltamentIndex = (
  svgPoint: { x: number; y: number },
  poltaments: Array<{ x: number; y: number }>
): number | undefined => {
  let minIndex: number | undefined = undefined;
  let minDistance: number = EDITOR_CONFIG.PITCH_POLTAMENT_THRESHOLD;
  poltaments.forEach((p, i) => {
    const distance = Math.sqrt(
      (svgPoint.x - p.x) ** 2 + (svgPoint.y - p.y) ** 2
    );
    if (distance <= minDistance) {
      minDistance = distance;
      minIndex = i;
    }
  });
  return minIndex;
};

/**
 * クリックした座標を与えてクリックしたノートのインデックスを返す。ノート以外をクリックした場合はundefinedを返す
 * @param svgPoint svg空間における座標
 * @param notes globalなノート列
 * @param notesLeft 各ノートの始点までのlengthを累積した値
 * @param horizontalZoom 水平方向の拡大率
 * @param verticalZoom 垂直方向の拡大率
 * @returns クリックしたノートのインデックスを返す。ノート以外をクリックした場合はundefinedを返す
 */
export const getTargetNoteIndex = (
  svgPoint: { x: number; y: number },
  notes: Note[],
  notesLeft: number[],
  horizontalZoom: number,
  verticalZoom: number
): number | undefined => {
  /**
   * svg座標より大きいxの中で最小の要素のindex
   */
  const targetNoteIndex = getTargetNoteIndexFromX(
    svgPoint.x,
    notes,
    notesLeft,
    horizontalZoom
  );
  if (targetNoteIndex === undefined) {
    return undefined;
  } else {
    const clickNotenum =
      107 - Math.floor(svgPoint.y / PIANOROLL_CONFIG.KEY_HEIGHT / verticalZoom);
    return notes[targetNoteIndex] === undefined
      ? undefined
      : notes[targetNoteIndex].notenum === clickNotenum
      ? targetNoteIndex
      : undefined;
  }
};

/**
 * svg上のx座標から、該当する位置にあるノートのインデックスを求める。
 * @param x クリックしたX座標
 * @param notes ノート列
 * @param notesLeft ノートの左端列
 * @param horizontalZoom 水平方向の拡大率
 * @returns ノートのindex。ただし、最後のノートより右の座標が与えられた場合undefined
 */
export const getTargetNoteIndexFromX = (
  x: number,
  notes: Note[],
  notesLeft: number[],
  horizontalZoom: number
): number | undefined => {
  const targetX = x / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom;
  const targetNoteIndex_ = notesLeft.findIndex((x) => x > targetX) - 1;
  const targetNoteIndex =
    targetNoteIndex_ < 0
      ? last(notesLeft) +
          (last(notes) === undefined ? 0 : last(notes).length) <=
        targetX
        ? undefined
        : notes.length - 1
      : targetNoteIndex_;
  return targetNoteIndex;
};
