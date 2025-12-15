import React from "react";

export interface UseDoubleTapParams<T> {
  /** ダブルタップとみなす時間間隔（ミリ秒） */
  threshold: number;
  /** ダブルタップ時のコールバック */
  onDoubleTap?: (target: T) => void;
  /** シングルタップ時のコールバック（オプション） */
  onSingleTap?: (target: T) => void;
  /** undefinedのダブルタップを許可するか（デフォルト: false） */
  allowUndefined?: boolean;
}

export interface UseDoubleTapReturn<T> {
  /** タップを記録し、ダブルタップかどうかを判定する */
  checkDoubleTap: (target: T) => boolean;
  /** 最後のタップ時刻 */
  lastTapTime: number;
  /** 最後のタップターゲット */
  lastTapTarget: T | undefined;
}

/**
 * ダブルタップ判定機能を提供するカスタムフック
 *
 * 汎用的なダブルタップ検出ロジックを提供します。
 * - 指定した時間間隔内に同じターゲットを2回タップした場合にダブルタップと判定
 * - ターゲットは任意の型（number, string, objectなど）をサポート
 *
 * @example
 * ```typescript
 * const { checkDoubleTap } = useDoubleTap({
 *   threshold: 300,
 *   onDoubleTap: (noteIndex) => console.log('Double tap!', noteIndex)
 * });
 *
 * // タップイベントで呼び出す
 * const isDouble = checkDoubleTap(noteIndex);
 * ```
 */
export const useDoubleTap = <T = number | undefined>({
  threshold,
  onDoubleTap,
  onSingleTap,
  allowUndefined = false,
}: UseDoubleTapParams<T>): UseDoubleTapReturn<T> => {
  const [lastTapTime, setLastTapTime] = React.useState<number>(0);
  const [lastTapTarget, setLastTapTarget] = React.useState<T | undefined>(
    undefined
  );

  /**
   * タップを記録し、ダブルタップかどうかを判定する
   * @param target タップされたターゲット
   * @returns ダブルタップの場合true、それ以外はfalse
   */
  const checkDoubleTap = React.useCallback(
    (target: T): boolean => {
      const tapTime = Date.now();
      const timeDiff = tapTime - lastTapTime;

      // 同じターゲットを閾値時間内にタップした場合はダブルタップ
      let isDoubleTap = false;
      if (allowUndefined) {
        // undefinedのダブルタップも許可する場合
        isDoubleTap = lastTapTarget === target && timeDiff <= threshold;
      } else {
        // undefinedのダブルタップを許可しない場合（デフォルト）
        isDoubleTap =
          lastTapTarget !== undefined &&
          target !== undefined &&
          lastTapTarget === target &&
          timeDiff <= threshold;
      }

      // 状態を更新
      setLastTapTime(tapTime);
      setLastTapTarget(target);

      // コールバックを呼び出す
      if (isDoubleTap && onDoubleTap) {
        onDoubleTap(target);
      } else if (!isDoubleTap && onSingleTap) {
        onSingleTap(target);
      }

      return isDoubleTap;
    },
    [
      lastTapTime,
      lastTapTarget,
      threshold,
      onDoubleTap,
      onSingleTap,
      allowUndefined,
    ]
  );

  return {
    checkDoubleTap,
    lastTapTime,
    lastTapTarget,
  };
};
