import React from "react";
import { PIANOROLL_CONFIG } from "../config/pianoroll";
import { Note } from "../lib/Note";
import type { NoteSelectMode } from "../types/noteSelectMode";
import { getTargetPpltamentIndex } from "../utils/PianorollTouch/pianorollCoordinates";
import { applyPitchChange } from "../utils/PianorollTouch/pitchEditOperations";
import { validatePitchEditability } from "../utils/PianorollTouch/pitchEditValidation";
import { calculateTimeConstraints } from "../utils/PianorollTouch/pitchTimeConstraints";
import { applyTimeChange } from "../utils/PianorollTouch/pitchTimeOperations";
import { convertSvgXToTimeMs } from "../utils/PianorollTouch/svgToTimeConverter";

export interface UsePitchEditDragParams {
  /** 現在の選択モード */
  selectMode?: NoteSelectMode;
  /** ポルタメント座標配列 */
  poltaments?: Array<{ x: number; y: number }>;
  /** 現在選択されているポルタメントのインデックス */
  targetPoltament?: number | undefined;
  /** ポルタメント選択を更新するコールバック */
  setTargetPoltament?: (index: number | undefined) => void;
  /** 選択されているノートのインデックス配列 */
  selectedNotesIndex: Array<number>;
  /** ノートの配列 */
  notes: Array<Note>;
  /** ノートを更新するコールバック */
  setNotes: (notes: Array<Note>) => void;
  /** ノートの左端座標配列 */
  notesLeft: Array<number>;
  /** テンポ */
  ustTempo: number;
  /** 垂直ズーム */
  verticalZoom: number;
  /** 水平ズーム */
  horizontalZoom: number;
}

export interface UsePitchEditDragReturn {
  /** ドラッグ中かどうか */
  isPitchDragging: boolean;
  /** ドラッグ実行済みかどうか */
  hasPitchDragged: boolean;
  /** ポインターダウンハンドラー */
  handlePointerDown: (event: React.PointerEvent<SVGSVGElement>) => boolean;
  /** ポインタームーブハンドラー */
  handlePointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  /** ポインターアップハンドラー */
  handlePointerUp: (event: React.PointerEvent<SVGSVGElement>) => boolean;
  /** ポインターキャンセルハンドラー */
  handlePointerCancel: (event: React.PointerEvent<SVGSVGElement>) => void;
}

/**
 * ピッチ編集ドラッグ機能を提供するカスタムフック
 *
 * ピッチ編集モード時のポインタードラッグ処理を管理します。
 * - ポインターキャプチャーの管理
 * - ドラッグ状態の追跡
 * - iOS対応のスクロール制御
 * - ピッチ/時間編集の適用
 */
export const usePitchEditDrag = (
  params: UsePitchEditDragParams
): UsePitchEditDragReturn => {
  const {
    selectMode,
    poltaments,
    targetPoltament,
    setTargetPoltament,
    selectedNotesIndex,
    notes,
    setNotes,
    notesLeft,
    ustTempo,
    verticalZoom,
    horizontalZoom,
  } = params;

  // ピッチ編集モード用のポインター追跡状態
  const [isPitchDragging, setIsPitchDragging] = React.useState<boolean>(false);
  const [pitchDragPointerId, setPitchDragPointerId] = React.useState<
    number | undefined
  >(undefined);
  const [hasPitchDragged, setHasPitchDragged] = React.useState<boolean>(false);

  // iOS対応: ピッチ編集時のbody全体のスクロール制御
  React.useEffect(() => {
    const shouldLockScroll =
      selectMode === "pitch" && targetPoltament !== undefined;

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
  }, [selectMode, targetPoltament]);

  /**
   * ピッチ編集モード対応のポインターダウンハンドラー
   * @returns イベントを処理した場合true、処理しなかった場合false
   */
  const handlePointerDown = (
    event: React.PointerEvent<SVGSVGElement>
  ): boolean => {
    // ピッチ編集モードの場合、ポインターダウン時に即座に判定
    if (selectMode === "pitch") {
      const pt = event.currentTarget.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgPoint = pt.matrixTransform(
        event.currentTarget.getScreenCTM()?.inverse()
      );

      const targetPoltamentIndex =
        poltaments === undefined
          ? undefined
          : getTargetPpltamentIndex(svgPoint, poltaments);

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
        if (setTargetPoltament) {
          setTargetPoltament(targetPoltamentIndex);
        }
        return true; // イベントを処理した
      }
    }
    return false; // イベントを処理しなかった
  };

  /**
   * ピッチ編集モード専用のポインター移動ハンドラー
   */
  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    // ピッチ編集モードの場合
    if (selectMode === "pitch") {
      // ポルタメントが選択されている場合のみスクロールを防止
      if (targetPoltament !== undefined) {
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
    if (selectedNotesIndex.length === 1 && targetPoltament !== undefined) {
      const selectedNote = notes[selectedNotesIndex[0]];

      if (!selectedNote) return;

      // ピッチ編集の可否を判定
      const { canEditPitch, canEditTime } = validatePitchEditability(
        targetPoltament,
        selectedNote
      );

      // 両方とも編集不可の場合は終了
      if (!canEditPitch && !canEditTime) return;

      const newNotes = notes.slice();
      let updatedNote = newNotes[selectedNotesIndex[0]].deepCopy();

      // ### ピッチ変更処理（上下方向）
      if (canEditPitch) {
        updatedNote = applyPitchChange(
          updatedNote,
          targetPoltament,
          svgPoint,
          verticalZoom
        );
      }

      // ### 時間変更処理（左右方向）
      if (canEditTime) {
        // 指し示している時間を求める
        const selectedNoteStartX =
          notesLeft[selectedNotesIndex[0]] *
          PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
          horizontalZoom;

        // SVG座標を時間(ms)に変換
        const targetTimeMs = convertSvgXToTimeMs(
          svgPoint,
          selectedNoteStartX,
          selectedNote,
          ustTempo,
          horizontalZoom
        );

        // 時間制約を計算
        const { minTime, maxTime } = calculateTimeConstraints(
          targetPoltament,
          selectedNote
        );

        // 閾値内に補正
        const clampedTime = Math.max(minTime, Math.min(maxTime, targetTimeMs));
        // 時間変更を適用
        updatedNote = applyTimeChange(
          updatedNote,
          targetPoltament,
          clampedTime
        );
      }

      newNotes[selectedNotesIndex[0]] = updatedNote;
      setNotes(newNotes);
    }
  };

  /**
   * ピッチ編集モード専用のポインターアップハンドラー
   * @returns タップイベントをスキップすべきかどうか
   */
  const handlePointerUp = (
    event: React.PointerEvent<SVGSVGElement>
  ): boolean => {
    // ドラッグ後の場合はタップイベントをスキップ
    const shouldSkipTap = hasPitchDragged;

    // ピッチモードでポインターキャプチャーをリリース
    if (selectMode === "pitch" && pitchDragPointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setPitchDragPointerId(undefined);
    }

    // ピッチドラッグを終了
    if (isPitchDragging) {
      setIsPitchDragging(false);
    }

    // ドラッグフラグをリセット
    setHasPitchDragged(false);

    return shouldSkipTap;
  };

  /**
   * ピッチ編集モード専用のポインターキャンセルハンドラー
   */
  const handlePointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    // ピッチモードでポインターキャプチャーをリリース
    if (selectMode === "pitch" && pitchDragPointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setPitchDragPointerId(undefined);
    }

    // ピッチドラッグを終了
    if (isPitchDragging) {
      setIsPitchDragging(false);
    }

    // ドラッグフラグをリセット
    setHasPitchDragged(false);
  };

  return {
    isPitchDragging,
    hasPitchDragged,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
};
