import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { last, range } from "../../../utils/array";

/**
 * ピアノロール全体のタップイベントを検知するレイヤー
 *
 * 当初の機能として、notesの選択機能を提供する。
 * props.selectModeがtoggleの時は、クリックしたノートを選択したノート列に追加もしくは削除する
 *
 * props.selectModeがrangeの時は、1回目にクリックしたノートと2回目にクリックしたノートの間のノートを選択する。
 * なお、1つめのノート選択を促す処理は、モード切替時に実施する。
 * @param props
 * @returns
 */
export const PianorollToutch: React.FC<PianorollToutchProps> = (props) => {
  const { t } = useTranslation();
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  const snackBarStore = useSnackBarStore();
  const [touchStart, setTouchStart] = React.useState<number | undefined>(
    undefined
  );
  const [startIndex, setStartIndex] = React.useState<number | undefined>(
    undefined
  );
  const holdTimerRef = React.useRef<number | null>(null);

  const startHoldTimer = (coords: { x: number; y: number }) => {
    holdTimerRef.current = window.setTimeout(() => {
      // HOLD_THRESHOLD_MS後にホールド処理を実行
      hold(coords.x, coords.y);
      // タイマークリア
      holdTimerRef.current = null;
    }, EDITOR_CONFIG.HOLD_THRESHOLD_MS);
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  /**
   * レイヤーをタップしたときの動作。タイマーをスタートする。
   */
  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    setTouchStart(Date.now());
    // SVG上の座標を取得
    const svg = event.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    startHoldTimer({ x: pt.x, y: pt.y });
  };

  /**
   * レイヤータップが終了した際の動作
   */
  const handlePointerCancel = () => {
    clearHoldTimer();
    setTouchStart(undefined);
  };

  /**
   * レイヤーから手を離したときの動作。処理時間にあわせてtapとholdに振り分ける。
   * @param event
   */
  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    clearHoldTimer();
    // このイベントは頻繁に起こることが予想されるため、イベント起動時点ではログをとらない
    const svg = event.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    // SVGの座標系に変換する
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    if (touchStart === undefined) {
      //基本的にはそんなはずはないが……
      tap(svgPoint);
    } else if (Date.now() - touchStart < EDITOR_CONFIG.HOLD_THRESHOLD_MS) {
      tap(svgPoint);
    }
    setTouchStart(undefined);
  };

  /**
   * tap時の動作。props.selectModeにあわせてselectNotesIndexを更新する。
   * @param svgPoint
   * @returns
   */
  const tap = (svgPoint: DOMPoint) => {
    const targetNoteIndex = getTargetNoteIndex(
      svgPoint,
      notes,
      props.notesLeft,
      horizontalZoom,
      verticalZoom
    );
    if (targetNoteIndex === undefined) {
      return;
    }
    LOG.debug(
      `notes[${targetNoteIndex}] click,mode:${props.selectMode}`,
      "PianorollToutch"
    );
    if (props.selectMode === "toggle") {
      //toggleモードの場合
      if (!props.selectedNotesIndex.includes(targetNoteIndex)) {
        //未選択の場合
        LOG.debug(`${targetNoteIndex}を選択`, "PianorollToutch");
        const newSelectNotesIndex = props.selectedNotesIndex.slice();
        newSelectNotesIndex.push(targetNoteIndex);
        props.setSelectedNotesIndex(newSelectNotesIndex.sort((a, b) => a - b));
      } else {
        //選択済みの場合
        LOG.debug(`${targetNoteIndex}を選択解除`, "PianorollToutch");
        props.setSelectedNotesIndex(
          props.selectedNotesIndex.filter((n) => n != targetNoteIndex)
        );
      }
    } else if (props.selectMode === "range") {
      if (startIndex === undefined) {
        LOG.debug(`${targetNoteIndex}を始点にセット`, "PianorollToutch");
        setStartIndex(targetNoteIndex);
        snackBarStore.setSeverity("info");
        snackBarStore.setValue(t("editor.selectRangeEnd")); //範囲の終わりのノートを選択してください
        snackBarStore.setOpen(true);
      } else {
        LOG.debug(`${startIndex}～${targetNoteIndex}を選択`, "PianorollToutch");
        props.setSelectedNotesIndex(range(startIndex, targetNoteIndex));
      }
    }
  };

  const hold = (x: number, y: number) => {
    if (props.selectedNotesIndex.length !== 0) {
      props.setMenuAnchor({ x: x, y: y });
    }
  };

  React.useEffect(() => {
    LOG.debug(
      `selectModeの変更検知,mode:${props.selectMode}`,
      "PianorollToutch"
    );
    setStartIndex(undefined);
  }, [props.selectMode]);
  return (
    <svg
      width={
        (props.totalLength + 480 * 8) *
        PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
        horizontalZoom
      }
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9,
        pointerEvents: "all",
      }}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerCancel={handlePointerCancel}
    >
      <rect
        x={0}
        y={0}
        width={
          (props.totalLength + 480 * 8) *
          PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
          horizontalZoom
        }
        height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
        fill="transparent"
      />
    </svg>
  );
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
    return notes[targetNoteIndex].notenum === clickNotenum
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
      ? last(notesLeft) + last(notes).length <= targetX
        ? undefined
        : notes.length - 1
      : targetNoteIndex_;
  return targetNoteIndex;
};

export interface PianorollToutchProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex: (indexes: number[]) => void;
  notesLeft: Array<number>;
  totalLength: number;
  selectMode?: "toggle" | "range";
  setMenuAnchor: (anchor: { x: number; y: number }) => void;
}
