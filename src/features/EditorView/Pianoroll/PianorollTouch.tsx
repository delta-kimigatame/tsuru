import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { usePianorollTouch } from "../../../hooks/usePianorollToutch";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { Ust } from "../../../lib/Ust";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { last, range } from "../../../utils/array";
import { getFrqFromNotenum } from "../../../utils/pitch";

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
  const { ust, notes, setNotes, ustTempo, setUst } = useMusicProjectStore();
  const snackBarStore = useSnackBarStore();
  const [lastTapTime, setLastTapTime] = React.useState<number>(0);
  const [lastTapNoteIndex, setLastTapNoteIndex] = React.useState<
    number | undefined
  >(undefined);
  // ピッチ編集モード用のポインター追跡状態
  const [isPitchDragging, setIsPitchDragging] = React.useState<boolean>(false);
  const [pitchDragPointerId, setPitchDragPointerId] = React.useState<
    number | undefined
  >(undefined);
  const [hasPitchDragged, setHasPitchDragged] = React.useState<boolean>(false);

  // iOS対応: ピッチ編集時のbody全体のスクロール制御
  React.useEffect(() => {
    const shouldLockScroll =
      props.selectMode === "pitch" && props.targetPoltament !== undefined;

    if (shouldLockScroll) {
      // body要素のスクロールを無効化
      const originalBodyStyle = document.body.style.overflow;
      const originalBodyTouchAction = document.body.style.touchAction;
      const originalHtmlStyle = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";

      return () => {
        // クリーンアップ時に元のスタイルを復元
        document.body.style.overflow = originalBodyStyle;
        document.body.style.touchAction = originalBodyTouchAction;
        document.documentElement.style.overflow = originalHtmlStyle;
      };
    }
  }, [props.selectMode, props.targetPoltament]);

  /**
   * tap時の動作。props.selectModeにあわせてselectNotesIndexを更新する。
   * @param svgPoint
   * @returns
   */
  const handleTap = (coords: { x: number; y: number }, svgPoint: DOMPoint) => {
    const targetPoltamentIndex =
      props.selectMode !== "pitch" || props.poltaments === undefined
        ? undefined
        : getTargetPpltamentIndex(svgPoint, props.poltaments);
    const targetNoteIndex = getTargetNoteIndex(
      svgPoint,
      notes,
      props.notesLeft,
      horizontalZoom,
      verticalZoom
    );
    const tapTime = Date.now();
    const isDoubleTap =
      targetNoteIndex !== undefined &&
      targetNoteIndex === lastTapNoteIndex &&
      tapTime - lastTapTime <= EDITOR_CONFIG.DOUBLE_TAP_MS;
    setLastTapTime(tapTime);
    setLastTapNoteIndex(targetNoteIndex);
    if (
      targetNoteIndex === undefined &&
      targetPoltamentIndex === undefined &&
      props.selectMode !== "add"
    ) {
      return;
    }
    LOG.debug(
      `notes[${targetNoteIndex}] click,mode:${props.selectMode}`,
      "PianorollToutch"
    );
    if (props.selectMode === "pitch") {
      // ポルタメントは既にポインターダウン時に処理済み、ノートのみ処理
      if (targetPoltamentIndex === undefined && targetNoteIndex !== undefined) {
        handlePitchModeTap(
          notes,
          props.selectedNotesIndex,
          targetPoltamentIndex,
          targetNoteIndex,
          props.setTargetPoltament,
          props.setSelectedNotesIndex
        );
      }
    } else if (isDoubleTap) {
      handleDoubleTap(coords, targetNoteIndex);
    } else if (props.selectMode === "toggle") {
      handleToggleModeTap(
        props.selectedNotesIndex,
        targetNoteIndex,
        props.setSelectedNotesIndex
      );
    } else if (props.selectMode === "range") {
      handleRangeModeTap(
        startIndex,
        targetNoteIndex,
        setStartIndex,
        props.setSelectedNotesIndex,
        snackBarStore.setSeverity,
        snackBarStore.setValue,
        snackBarStore.setOpen,
        t("editor.selectRangeEnd")
      );
    } else if (props.selectMode === "add") {
      if (ust === null) {
        initialUst();
      }
      handleAddModeTap(
        svgPoint,
        notes,
        props.notesLeft,
        ustTempo,
        props.addNoteLength,
        props.addNoteLyric,
        verticalZoom,
        horizontalZoom,
        setNotes
      );
    }
  };

  const initialUst = () => {
    const initialUst = new Ust();
    initialUst.tempo = 120;
    initialUst.flags = "";
    setUst(initialUst);
  };

  const handleHold = (coords: { x: number; y: number }, svgPoint) => {
    // ピッチドラッグ中はホールドを無効にする
    if (isPitchDragging) {
      return;
    }

    const targetNoteIndex = getTargetNoteIndex(
      svgPoint,
      notes,
      props.notesLeft,
      horizontalZoom,
      verticalZoom
    );
    if (
      targetNoteIndex === undefined &&
      props.selectedNotesIndex.length !== 0
    ) {
      props.setMenuAnchor({ x: coords.x, y: coords.y });
    } else if (
      targetNoteIndex !== undefined &&
      props.selectedNotesIndex.includes(targetNoteIndex)
    ) {
      props.setMenuAnchor({ x: coords.x, y: coords.y });
    } else if (targetNoteIndex !== undefined) {
      props.setSelectedNotesIndex([targetNoteIndex]);
      props.setMenuAnchor({ x: coords.x, y: coords.y });
    }
  };

  const handleDoubleTap = (
    coords: { x: number; y: number },
    targetNoteIndex: number
  ) => {
    props.setLyricAnchor({ x: coords.x, y: coords.y });
    props.setLyricTargetIndex(targetNoteIndex);
  };

  const {
    handlePointerDown: originalHandlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    startIndex,
    setStartIndex,
  } = usePianorollTouch({
    selectMode: props.selectMode,
    holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
    onTap: handleTap,
    onHold: handleHold,
  });

  /**
   * ピッチ編集モード対応のポインターダウンハンドラー
   */
  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    // ピッチ編集モードの場合、ポインターダウン時に即座に判定
    if (props.selectMode === "pitch") {
      const pt = event.currentTarget.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgPoint = pt.matrixTransform(
        event.currentTarget.getScreenCTM()?.inverse()
      );

      const targetPoltamentIndex =
        props.poltaments === undefined
          ? undefined
          : getTargetPpltamentIndex(svgPoint, props.poltaments);

      // ポルタメント上でのポインターダウンの場合、即座にドラッグ開始
      if (targetPoltamentIndex !== undefined) {
        event.preventDefault();
        event.stopPropagation();
        // iOS対応: touchstart/touchmove/touchendイベントもキャンセル
        if (event.nativeEvent instanceof TouchEvent) {
          event.nativeEvent.preventDefault();
        }
        // ポインターキャプチャーを設定してドラッグ追跡を確実にする
        event.currentTarget.setPointerCapture(event.pointerId);
        setPitchDragPointerId(event.pointerId);
        setIsPitchDragging(true);

        // ポルタメント選択も同時に実行
        if (props.setTargetPoltament) {
          props.setTargetPoltament(targetPoltamentIndex);
        }
        return; // 元のハンドラーは実行せずに終了
      }
    }

    // 元のハンドラーを実行
    originalHandlePointerDown(event);
  };

  /**
   * ピッチ編集モード専用のポインター移動ハンドラー
   */
  const handlePitchPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    // ピッチ編集モードの場合
    if (props.selectMode === "pitch") {
      // ポルタメントが選択されている場合のみスクロールを防止
      if (props.targetPoltament !== undefined) {
        event.preventDefault();
        event.stopPropagation();
        // iOS対応: touchstart/touchmove/touchendイベントもキャンセル
        if (event.nativeEvent instanceof TouchEvent) {
          event.nativeEvent.preventDefault();
        }
      } else {
        // ポルタメントが選択されていない場合、ポインターキャプチャーをリリース
        if (pitchDragPointerId === event.pointerId) {
          event.currentTarget.releasePointerCapture(event.pointerId);
          setPitchDragPointerId(undefined);
          // ドラッグ状態も終了
          setIsPitchDragging(false);
          // ドラッグフラグもリセット
          setHasPitchDragged(false);
        }
        return; // ポルタメント未選択時は早期終了
      }
    }

    // ドラッグ中でない場合はここで終了
    if (!isPitchDragging) return;

    // 実際にマウス/タッチが動いたのでドラッグフラグをセット
    setHasPitchDragged(true);

    // ピッチ編集時のポインター移動処理を実装
    // SVG座標の取得
    const pt = event.currentTarget.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(
      event.currentTarget.getScreenCTM()?.inverse()
    );

    // ### ピッチ編集と時間編集の処理
    // ピッチ編集（上下方向）：pby配列またはpbs.heightを更新
    // 時間編集（左右方向）：pbs.timeまたはpbw配列を更新し、隣接するpbwを補正
    if (
      props.selectedNotesIndex.length === 1 &&
      props.targetPoltament !== undefined
    ) {
      const selectedNote = notes[props.selectedNotesIndex[0]];

      if (!selectedNote) return;

      let canEditPitch = true;
      let canEditTime = true;

      // ### ピッチ編集の変更可否のルール
      const isLastPortament = props.targetPoltament === selectedNote.pbw.length;
      const isFirstPortament = props.targetPoltament === 0;
      const canEditFirstPortament =
        selectedNote.prev === null || selectedNote.prev?.lyric === "R";

      // 最後のポルタメントはピッチ変更できない
      if (isLastPortament) {
        canEditPitch = false;
      }

      // 最初のポルタメントは条件付きでのみピッチ変更可能
      if (isFirstPortament && !canEditFirstPortament) {
        canEditPitch = false;
      }

      // 両方とも編集不可の場合は終了
      if (!canEditPitch && !canEditTime) return;

      const newNotes = notes.slice();
      const updatedNote = newNotes[props.selectedNotesIndex[0]].deepCopy();

      // ### ピッチ変更処理（上下方向）
      if (canEditPitch) {
        // 指し示している音高を小数点第一位まで求める
        const targetPitch =
          107 -
          (svgPoint.y - (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom) / 2) /
            (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom);
        // note.notenumを減じ、10倍した値をpbyの該当インデックスに設定
        const pitchBendValue = Math.round(
          (targetPitch - selectedNote.notenum) * 10
        );

        if (props.targetPoltament !== 0) {
          const newPby = [...selectedNote.pby];
          newPby[props.targetPoltament - 1] = pitchBendValue;
          updatedNote.setPby(newPby);
        } else {
          updatedNote.pbs.height = pitchBendValue;
        }
      }

      // ### 時間変更処理（左右方向）
      if (canEditTime) {
        // 指し示している時間を求める
        const selectedNoteStartX =
          props.notesLeft[props.selectedNotesIndex[0]] *
          PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
          horizontalZoom;
        const relativeX = svgPoint.x - selectedNoteStartX;

        // 対象ノートより右側ではnote.tempoを、左側では前ノート（またはustTempo）を用いる
        let tempo: number;
        if (relativeX >= 0) {
          tempo = selectedNote.tempo;
        } else {
          tempo = selectedNote.prev?.tempo ?? ustTempo;
        }

        // SVGをmsに変換（480tick = 1拍、1分 = 60秒）
        const relativeXTick =
          relativeX / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom;
        const targetTimeMs = (relativeXTick * (60000 / tempo)) / 480;
        // 閾値の計算（すべてノートの頭からの絶対時間で計算）
        let minTime: number;
        let maxTime: number;

        if (isFirstPortament) {
          // 最初のポルタメント：note.prev.msLengthを負の数とした値が最小値
          minTime = selectedNote.prev?.msLength
            ? -selectedNote.prev.msLength
            : Number.NEGATIVE_INFINITY;

          // 最大値：note.pbw[0]の値
          maxTime =
            selectedNote.pbw.length > 0
              ? selectedNote.pbw[0]
              : Number.POSITIVE_INFINITY;
        } else if (isLastPortament) {
          // 最後のポルタメント：pbs.time + 前のpbw値の合計値が最小値
          const previousPortamentTime =
            selectedNote.pbs.time +
            selectedNote.pbw
              .slice(0, props.targetPoltament - 1)
              .reduce((sum, val) => sum + val, 0);
          minTime = previousPortamentTime;

          // 最大値： note.msLength
          maxTime = selectedNote.msLength;
        } else {
          // それ以外のポルタメント：pbs.time + 前のpbw値の合計値が最小値
          const previousPortamentTime =
            selectedNote.pbs.time +
            selectedNote.pbw
              .slice(0, props.targetPoltament - 1)
              .reduce((sum, val) => sum + val, 0);
          minTime = previousPortamentTime;

          // 最大値：次のpbw値
          const nextPortamentTime =
            Math.abs(selectedNote.pbs.time) +
            selectedNote.pbw
              .slice(0, props.targetPoltament)
              .reduce((sum, val) => sum + val, 0);
          maxTime = nextPortamentTime;
        }

        // 閾値内に補正
        const clampedTime = Math.max(minTime, Math.min(maxTime, targetTimeMs));
        // 更新対象の決定と更新
        if (isFirstPortament) {
          // 最初のポルタメント：pbs.timeを更新
          const originalPbsTime = selectedNote.pbs.time;
          updatedNote.pbs.time = clampedTime;

          // pbs.timeの変更に合わせてpbw[0]を補正
          if (selectedNote.pbw.length > 0) {
            const newPbw = [...selectedNote.pbw];
            // 元のpbs.timeと新しいpbs.timeの差分をpbw[0]に加算
            const timeDifference = originalPbsTime - clampedTime;
            newPbw[0] = newPbw[0] + timeDifference;
            updatedNote.setPbw(newPbw);
          }
        } else {
          // 最初のポルタメント以外：pbw[targetPoltament-1]を更新
          const newPbw = [...selectedNote.pbw];

          // clampedTimeはノートの頭からの絶対時間なので、
          // pbw[targetPoltament-1]の値は、clampedTimeからpbs.timeと前のpbw値を引いた値
          const previousPbwSum = newPbw
            .slice(0, props.targetPoltament - 1)
            .reduce((sum, val) => sum + val, 0);
          const newPbwValue =
            clampedTime - selectedNote.pbs.time - previousPbwSum;

          // 元のpbw値との差分を計算
          const originalPbwValue = newPbw[props.targetPoltament - 1];
          const pbwDifference = newPbwValue - originalPbwValue;

          // 選択しているpbwを更新
          newPbw[props.targetPoltament - 1] = Math.max(0, newPbwValue);

          // 次のpbwがある場合は、差分を次のpbwに反映
          if (props.targetPoltament < newPbw.length) {
            newPbw[props.targetPoltament] = Math.max(
              0,
              newPbw[props.targetPoltament] - pbwDifference
            );
          }

          updatedNote.setPbw(newPbw);
        }
      }

      newNotes[props.selectedNotesIndex[0]] = updatedNote;
      setNotes(newNotes);
    }
  };

  /**
   * ピッチ編集モード専用のポインターアップハンドラー
   */
  const handlePitchPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    // ドラッグ後の場合はタップイベントをスキップ
    const shouldSkipTap = hasPitchDragged;

    // ピッチモードでポインターキャプチャーをリリース
    if (
      props.selectMode === "pitch" &&
      pitchDragPointerId === event.pointerId
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setPitchDragPointerId(undefined);
    }

    // ピッチドラッグを終了
    if (isPitchDragging) {
      setIsPitchDragging(false);
    }

    // ドラッグフラグをリセット
    setHasPitchDragged(false);

    // ドラッグ後の場合はタップイベントを発火させない
    if (shouldSkipTap) {
      return;
    }

    // 元のハンドラーも実行
    handlePointerUp(event);
  };

  /**
   * ピッチ編集モード専用のポインターキャンセルハンドラー
   */
  const handlePitchPointerCancel = (
    event: React.PointerEvent<SVGSVGElement>
  ) => {
    // ピッチモードでポインターキャプチャーをリリース
    if (
      props.selectMode === "pitch" &&
      pitchDragPointerId === event.pointerId
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setPitchDragPointerId(undefined);
    }

    // ピッチドラッグを終了
    if (isPitchDragging) {
      setIsPitchDragging(false);
    }

    // ドラッグフラグをリセット
    setHasPitchDragged(false);

    // 元のハンドラーも実行
    handlePointerCancel();
  };

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
        touchAction:
          props.selectMode === "pitch" &&
          (props.targetPoltament !== undefined || isPitchDragging)
            ? "none"
            : "auto",
        cursor: isPitchDragging ? "grabbing" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        // iOS対応: タッチ時のハイライト無効化
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      onPointerUp={handlePitchPointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePitchPointerMove}
      onPointerCancel={handlePitchPointerCancel}
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
 * クリックした座標を与えてタップしたポルタメントを返す
 * @param svgPoint svg空間における座標
 * @param poltaments ポルタメントの座標一覧
 * @returns クリックしたポルタメントのインデックスを返す。該当がなければundefinedを返す
 */
export const getTargetPpltamentIndex = (
  svgPoint: { x: number; y: number },
  poltaments: Array<{ x: number; y: number }>
) => {
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

export interface PianorollToutchProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex: (indexes: number[]) => void;
  notesLeft: Array<number>;
  totalLength: number;
  selectMode?: "toggle" | "range" | "pitch" | "add";
  setMenuAnchor: (anchor: { x: number; y: number }) => void;
  setLyricAnchor: (anchor: { x: number; y: number }) => void;
  poltaments?: Array<{ x: number; y: number }>;
  /** 現在選択されているポルタメントのインデックス */
  targetPoltament?: number | undefined;
  /** ピッチ編集モードで操作するポルタメントのインデックスを更新するためのコールバック */
  setTargetPoltament?: (index: number | undefined) => void;
  /** 歌詞編集更新のためのコールバック */
  setLyricTargetIndex: (index: number | undefined) => void;
  addNoteLength?: number;
  addNoteLyric?: string;
}

export const AddNote = (
  notes: Note[],
  index: number | undefined,
  notenum: number,
  addNoteLyric: string,
  addNoteLength: number,
  ustTempo: number
): Note[] => {
  const newNote = createNewNote(
    notes,
    index,
    notenum,
    addNoteLyric,
    addNoteLength,
    ustTempo
  );
  const newNotes =
    notes === undefined || notes.length === 0
      ? [newNote]
      : index === undefined
      ? notes.slice().concat([newNote])
      : notes.slice(0, index).concat([newNote], notes.slice(index));
  undoManager.register({
    undo: (oldNotes: Note[]): Note[] => oldNotes,
    undoArgs: notes === undefined ? [] : notes.map((n) => n.deepCopy()),
    redo: (newNotes: Note[]): Note[] => newNotes,
    redoArgs: newNotes.map((n) => n.deepCopy()),
    summary: `ノートの追加。追加位置${index},歌詞:${addNoteLyric},長さ:${addNoteLength}`,
    all: true,
  });
  return newNotes;
};

/**
 * 追加されるノートを生成する処理
 * @param notes グローバルな状態ノート
 * @param index ノートを追加するindex。undefinedの際はノート列の末尾に追加される
 * @param notenum 追加する音高
 * @param addNoteLyric 追加する歌詞
 * @param addNoteLength 追加する長さ
 * @param ustTempo プロジェクトのテンポ
 * @returns 追加されるノート
 */
const createNewNote = (
  notes: Note[],
  index: number | undefined,
  notenum: number,
  addNoteLyric: string,
  addNoteLength: number,
  ustTempo: number
): Note => {
  const newNote = new Note();
  newNote.hasTempo = false;
  newNote.lyric = addNoteLyric;
  newNote.length = addNoteLength;
  newNote.notenum = notenum;
  newNote.tempo =
    notes === undefined || notes.length === 0
      ? ustTempo
      : index === undefined
      ? last(notes).tempo
      : notes[index].tempo;
  return newNote;
};

/**
 * Pitchモードでタップした際の処理
 * @param notes グローバルな状態ノート
 * @param selectedNotesIndex 選択しているノートの一覧。ピッチモードにおいては、長さ1の列であることが期待される。
 * @param targetPoltamentIndex 選択しているポルタメントのインデックス
 * @param targetNoteIndex 現在選択されているノート以外をタップした際の対象ノートのインデックス
 * @param setTargetPoltament 選択しているポルタメントを変更するためのコールバック
 * @param setSelectedNotesIndex 選択ノートの一覧を更新するためのコールバック
 */
export const handlePitchModeTap = (
  notes: Note[],
  selectedNotesIndex: number[],
  targetPoltamentIndex: number | undefined,
  targetNoteIndex: number | undefined,
  setTargetPoltament: (number) => void,
  setSelectedNotesIndex: (number) => void
) => {
  //ピッチモード
  if (targetPoltamentIndex !== undefined) {
    // ポルタメントをタップした場合
    LOG.debug(
      `${selectedNotesIndex[0]}のポルタメント${targetPoltamentIndex}`,
      "PianorollToutch"
    );
    setTargetPoltament(targetPoltamentIndex);
  } else if (notes[targetNoteIndex].lyric !== "R") {
    // ノートをタップした場合
    LOG.debug(`${targetNoteIndex}に切替`, "PianorollToutch");
    setSelectedNotesIndex([targetNoteIndex]);
  }
};

/**
 * Toggleモードで画面をタップした際の動作
 * @param selectedNotesIndex 現在選択しているノートのインデックスの一覧
 * @param targetNoteIndex タップしたノートのインデックス
 * @param setSelectedNotesIndex 現在選択しているノートのインデックスの一覧を更新するためのコールバック
 */
export const handleToggleModeTap = (
  selectedNotesIndex: number[],
  targetNoteIndex: number,
  setSelectedNotesIndex: (number) => void
) => {
  if (!selectedNotesIndex.includes(targetNoteIndex)) {
    //未選択の場合
    LOG.debug(`${targetNoteIndex}を選択`, "PianorollToutch");
    const newSelectNotesIndex = selectedNotesIndex.slice();
    newSelectNotesIndex.push(targetNoteIndex);
    setSelectedNotesIndex(newSelectNotesIndex.sort((a, b) => a - b));
  } else {
    //選択済みの場合
    LOG.debug(`${targetNoteIndex}を選択解除`, "PianorollToutch");
    setSelectedNotesIndex(
      selectedNotesIndex.filter((n) => n != targetNoteIndex)
    );
  }
};

/**
 * Rangeモードでノートをタップした際の処理
 * @param startIndex 範囲選択の始点のインデックス
 * @param targetNoteIndex 今回選択したノートのインデックス
 * @param setStartIndex 範囲選択の始点を更新するためのコールバック
 * @param setSelectedNotesIndex 選択ノートを更新するためのコールバック
 * @param setSeverity スナックバーの種類を設定するためのコールバック
 * @param setValue スナックバーに表示するテキストを設定するためのコールバック
 * @param setOpen スナックバーを表示するためのコールバック
 * @param snackBarText スナックバーに表示するテキスト
 */
export const handleRangeModeTap = (
  startIndex: number | undefined,
  targetNoteIndex: number,
  setStartIndex: (number) => void,
  setSelectedNotesIndex: (number) => void,
  setSeverity: (severity: "success" | "info" | "warning" | "error") => void,
  setValue: (string) => void,
  setOpen: (boolean) => void,
  snackBarText: string
) => {
  if (startIndex === undefined) {
    LOG.debug(`${targetNoteIndex}を始点にセット`, "PianorollToutch");
    setStartIndex(targetNoteIndex);
    setSeverity("info");
    setValue(snackBarText); //範囲の終わりのノートを選択してください
    setOpen(true);
  } else {
    LOG.debug(`${startIndex}～${targetNoteIndex}を選択`, "PianorollToutch");
    setSelectedNotesIndex(range(startIndex, targetNoteIndex));
  }
};

/**
 * Addモードで画面をタップした際の処理
 * @param svgPoint タップしたsvg座標
 * @param notes グローバルな状態ノート
 * @param notesLeft 各ノートの開始までの累積tick
 * @param ustTempo プロジェクトのテンポ
 * @param addNoteLength 追加するノートの長さ
 * @param addNoteLyric 追加するノートの歌詞
 * @param verticalZoom 音高方向の拡大率
 * @param horizontalZoom 時間方向の拡大率
 * @param setNotes グローバルな状態ノートを更新するためのコールバック
 */
export const handleAddModeTap = (
  svgPoint: DOMPoint,
  notes: Note[],
  notesLeft: number[],
  ustTempo: number,
  addNoteLength: number,
  addNoteLyric: string,
  verticalZoom: number,
  horizontalZoom: number,
  setNotes: (notes: Note[]) => void
) => {
  const clickNotenum =
    107 - Math.floor(svgPoint.y / PIANOROLL_CONFIG.KEY_HEIGHT / verticalZoom);
  const targetNoteIndexFromX = getTargetNoteIndexFromX(
    svgPoint.x,
    notes === undefined ? [] : notes,
    notesLeft,
    horizontalZoom
  );
  const newNotes = AddNote(
    notes,
    targetNoteIndexFromX,
    clickNotenum,
    addNoteLyric,
    addNoteLength,
    ustTempo
  );
  setNotes(newNotes);
  if (addNoteLyric !== "R") {
    playPreviewTone(clickNotenum);
  }
};
/**
 * 440Hz 1秒のサイン波を再生する
 */
const playPreviewTone = (notenum: number) => {
  const frequency = getFrqFromNotenum(notenum);
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(
    PIANOROLL_CONFIG.PREVIEW_TONE_VOLUME,
    audioContext.currentTime
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(
    audioContext.currentTime + PIANOROLL_CONFIG.PREVIEW_TONE_DURATION
  );
};
