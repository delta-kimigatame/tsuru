import React from "react";
import { LOG } from "../lib/Logging";

export interface UsePianorollTouchOptions {
  selectMode?: "toggle" | "range" | "pitch" | "add";
  holdThreshold?: number;
  onTap?: (svgPoint: DOMPoint) => void;
  onHold?: (coords: { x: number; y: number }) => void;
}
export interface UsePianorollTouchReturn {
  handlePointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  handlePointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  handlePointerCancel: () => void;
  startIndex: number | undefined;
  setStartIndex: (index: number | undefined) => void;
}

export const usePianorollTouch = (
  options: UsePianorollTouchOptions
): UsePianorollTouchReturn => {
  const { selectMode, holdThreshold = 300, onTap, onHold } = options;
  const [touchStart, setTouchStart] = React.useState<number | undefined>(
    undefined
  );
  const [startIndex, setStartIndex] = React.useState<number | undefined>(
    undefined
  );
  const holdTimerRef = React.useRef<number | null>(null);

  /**
   * HOLDしている時間を管理するためのタイマーを開始する処理
   * @param coords ホールドを開始した画面上の座標
   */
  const startHoldTimer = (coords: { x: number; y: number }) => {
    holdTimerRef.current = window.setTimeout(() => {
      if (onHold) {
        onHold({ x: coords.x, y: coords.y });
      }
      holdTimerRef.current = null;
    }, holdThreshold);
  };

  /**
   * HOLDしている時間を管理するためのタイマーをクリア
   */
  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // ポインターダウンイベント
  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const pt = event.currentTarget.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    // 「add」以外の場合はタッチ開始時刻を記録
    if (selectMode !== "add") {
      setTouchStart(Date.now());
    }
    startHoldTimer({ x: pt.x, y: pt.y });
  };

  // ポインターアップイベント
  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    clearHoldTimer();
    const svgPoint = getSVGPoint(
      event.currentTarget,
      event.clientX,
      event.clientY
    );
    // タッチ開始時刻がなければ tap として処理（基本は起こらない）
    if (touchStart === undefined || Date.now() - touchStart < holdThreshold) {
      if (onTap) {
        onTap(svgPoint);
      }
    }
    setTouchStart(undefined);
  };

  // ポインターキャンセルイベント
  const handlePointerCancel = () => {
    clearHoldTimer();
    setTouchStart(undefined);
  };

  // selectMode が変化したときに startIndex をリセットする
  React.useEffect(() => {
    LOG.debug(`selectModeの変更検知,mode:${selectMode}`, "PianorollToutch");
    setStartIndex(undefined);
  }, [selectMode]);

  return {
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    startIndex,
    setStartIndex,
  };
};
const getSVGPoint = (
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): DOMPoint => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM()?.inverse());
};
