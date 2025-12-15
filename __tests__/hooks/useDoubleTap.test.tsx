import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDoubleTap } from "../../src/hooks/useDoubleTap";

describe("useDoubleTap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("初期状態ではlastTapTimeが0、lastTapTargetがundefined", () => {
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
      })
    );

    expect(result.current.lastTapTime).toBe(0);
    expect(result.current.lastTapTarget).toBeUndefined();
  });

  it("1回目のタップではダブルタップと判定されない", () => {
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
      })
    );

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap(1);
    });

    expect(isDoubleTap).toBe(false);
    expect(result.current.lastTapTarget).toBe(1);
  });

  it("同じターゲットを閾値時間内にタップするとダブルタップと判定される", () => {
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(1);
    });

    // 200ms後に2回目のタップ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap(1);
    });

    expect(isDoubleTap).toBe(true);
  });

  it("異なるターゲットをタップするとダブルタップと判定されない", () => {
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(1);
    });

    // 200ms後に別のターゲットをタップ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap(2);
    });

    expect(isDoubleTap).toBe(false);
    expect(result.current.lastTapTarget).toBe(2);
  });

  it("閾値時間を超えてタップするとダブルタップと判定されない", () => {
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(1);
    });

    // 350ms後に2回目のタップ（閾値を超える）
    act(() => {
      vi.advanceTimersByTime(350);
    });

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap(1);
    });

    expect(isDoubleTap).toBe(false);
  });

  it("undefinedターゲットを2回タップしてもダブルタップと判定されない（デフォルト）", () => {
    const { result } = renderHook(() =>
      useDoubleTap<number | undefined>({
        threshold: 300,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(undefined);
    });

    // 200ms後に2回目のタップ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap(undefined);
    });

    expect(isDoubleTap).toBe(false);
  });

  it("allowUndefinedがtrueの場合、undefinedターゲットを2回タップするとダブルタップと判定される", () => {
    const { result } = renderHook(() =>
      useDoubleTap<number | undefined>({
        threshold: 300,
        allowUndefined: true,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(undefined);
    });

    // 200ms後に2回目のタップ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap(undefined);
    });

    expect(isDoubleTap).toBe(true);
  });

  it("onDoubleTapコールバックが呼ばれる", () => {
    const onDoubleTap = vi.fn();
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
        onDoubleTap,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(1);
    });

    expect(onDoubleTap).not.toHaveBeenCalled();

    // 200ms後に2回目のタップ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.checkDoubleTap(1);
    });

    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).toHaveBeenCalledWith(1);
  });

  it("onSingleTapコールバックが呼ばれる", () => {
    const onSingleTap = vi.fn();
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
        onSingleTap,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(1);
    });

    expect(onSingleTap).toHaveBeenCalledTimes(1);
    expect(onSingleTap).toHaveBeenCalledWith(1);

    // 400ms後に別のターゲットをタップ（ダブルタップにならない）
    act(() => {
      vi.advanceTimersByTime(400);
    });

    act(() => {
      result.current.checkDoubleTap(2);
    });

    expect(onSingleTap).toHaveBeenCalledTimes(2);
    expect(onSingleTap).toHaveBeenCalledWith(2);
  });

  it("文字列型のターゲットでも動作する", () => {
    const { result } = renderHook(() =>
      useDoubleTap<string>({
        threshold: 300,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap("note-a");
    });

    // 200ms後に2回目のタップ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    let isDoubleTap = false;
    act(() => {
      isDoubleTap = result.current.checkDoubleTap("note-a");
    });

    expect(isDoubleTap).toBe(true);
  });

  it("連続して3回タップした場合、2回目と3回目の間がダブルタップと判定される", () => {
    const onDoubleTap = vi.fn();
    const { result } = renderHook(() =>
      useDoubleTap({
        threshold: 300,
        onDoubleTap,
      })
    );

    // 1回目のタップ
    act(() => {
      result.current.checkDoubleTap(1);
    });

    // 200ms後に2回目のタップ（ダブルタップ）
    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.checkDoubleTap(1);
    });

    expect(onDoubleTap).toHaveBeenCalledTimes(1);

    // さらに200ms後に3回目のタップ（ダブルタップ）
    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.checkDoubleTap(1);
    });

    expect(onDoubleTap).toHaveBeenCalledTimes(2);
  });
});
