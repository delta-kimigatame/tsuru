import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EDITOR_CONFIG } from "../../src/config/editor";
import { usePianorollTouch } from "../../src/hooks/usePianorollToutch";

const createFakeSVG = () => {
  return {
    createSVGPoint: vi.fn(() => ({
      x: 0,
      y: 0,
      matrixTransform: vi.fn(() => ({ x: 100, y: 200 })),
    })),
    getScreenCTM: vi.fn(() => ({
      inverse: () => ({}),
    })),
  } as unknown as SVGSVGElement;
};

describe("usePianorollTouch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {});
  it("ポインターダウンするとSVGの座標取得とタイマーが起動する", () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    vi.useFakeTimers();
    // 擬似SVG要素の生成
    const fakeSVG = createFakeSVG();

    // 擬似のPointerEventを作成
    const fakeEvent = {
      clientX: 50,
      clientY: 60,
      currentTarget: fakeSVG,
    } as unknown as React.PointerEvent<SVGSVGElement>;
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result } = renderHook(() =>
      usePianorollTouch({
        selectMode: "toggle",
        holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
        onTap: onTapMock,
        onHold: onHoldMock,
      })
    );

    act(() => {
      result.current.handlePointerDown(fakeEvent);
    });

    // SVGの createSVGPoint が呼ばれていることを検証
    expect(fakeSVG.createSVGPoint).toHaveBeenCalled();

    // タイマーが起動している（setTimeout が呼ばれている）ことを確認
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it("ポインターダウン後にキャンセルするとタイマーがキャンセルされる", () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    vi.useFakeTimers();
    // 擬似SVG要素の生成
    const fakeSVG = createFakeSVG();

    // 擬似のPointerEventを作成
    const fakeEvent = {
      clientX: 50,
      clientY: 60,
      currentTarget: fakeSVG,
    } as unknown as React.PointerEvent<SVGSVGElement>;
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result } = renderHook(() =>
      usePianorollTouch({
        selectMode: "toggle",
        holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
        onTap: onTapMock,
        onHold: onHoldMock,
      })
    );

    act(() => {
      result.current.handlePointerDown(fakeEvent);
      // タイマーが1になっているはず
      expect(vi.getTimerCount()).toBe(1);
      result.current.handlePointerCancel();
    });

    // SVGの createSVGPoint が呼ばれていることを検証
    expect(fakeSVG.createSVGPoint).toHaveBeenCalled();

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    // タイマーが0になっているはず
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
  it("タップ後タイマーが進行するとholdイベントが呼ばれる", () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    vi.useFakeTimers();
    // 擬似SVG要素の生成
    const fakeSVG = createFakeSVG();

    // 擬似のPointerEventを作成
    const fakeEvent = {
      clientX: 50,
      clientY: 60,
      currentTarget: fakeSVG,
    } as unknown as React.PointerEvent<SVGSVGElement>;
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result } = renderHook(() =>
      usePianorollTouch({
        selectMode: "toggle",
        holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
        onTap: onTapMock,
        onHold: onHoldMock,
      })
    );

    act(() => {
      result.current.handlePointerDown(fakeEvent);
      expect(vi.getTimerCount()).toBe(1);
    });
    vi.advanceTimersByTime(EDITOR_CONFIG.HOLD_THRESHOLD_MS);

    //ホールドが呼ばれているはず
    expect(onHoldMock).toHaveBeenCalled();
    // タイマーが0になっているはず
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
  it("タップ後ポインターアップするとtapイベントが呼ばれる", () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    vi.useFakeTimers();
    // 擬似SVG要素の生成
    const fakeSVG = createFakeSVG();

    // 擬似のPointerEventを作成
    const fakeEvent = {
      clientX: 50,
      clientY: 60,
      currentTarget: fakeSVG,
    } as unknown as React.PointerEvent<SVGSVGElement>;
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result } = renderHook(() =>
      usePianorollTouch({
        selectMode: "toggle",
        holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
        onTap: onTapMock,
        onHold: onHoldMock,
      })
    );

    act(() => {
      result.current.handlePointerDown(fakeEvent);
      expect(vi.getTimerCount()).toBe(1);
      result.current.handlePointerUp(fakeEvent);
    });

    //タップが呼ばれているはず
    expect(onTapMock).toHaveBeenCalled();
    // タイマーが0になっているはず
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it("selectModeが変更されるとstartIndexがリセットされる", () => {
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result, rerender } = renderHook(
      ({ mode }) =>
        usePianorollTouch({
          selectMode: mode,
          holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
          onTap: onTapMock,
          onHold: onHoldMock,
        }),
      { initialProps: { mode: "toggle" as const } }
    );

    // startIndexを設定
    act(() => {
      result.current.setStartIndex(5);
    });
    expect(result.current.startIndex).toBe(5);

    // selectModeを変更
    rerender({ mode: "range" as const });

    // startIndexがリセットされる
    expect(result.current.startIndex).toBeUndefined();
  });

  it("setStartIndexでstartIndexが更新される", () => {
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result } = renderHook(() =>
      usePianorollTouch({
        selectMode: "toggle",
        holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
        onTap: onTapMock,
        onHold: onHoldMock,
      })
    );

    // 初期値はundefined
    expect(result.current.startIndex).toBeUndefined();

    // setStartIndexで値を設定
    act(() => {
      result.current.setStartIndex(10);
    });
    expect(result.current.startIndex).toBe(10);

    // undefined に戻す
    act(() => {
      result.current.setStartIndex(undefined);
    });
    expect(result.current.startIndex).toBeUndefined();
  });

  it("addモードの場合ポインターダウンでもtouchStartが記録されない", () => {
    vi.useFakeTimers();
    const fakeSVG = createFakeSVG();
    const fakeEvent = {
      clientX: 50,
      clientY: 60,
      currentTarget: fakeSVG,
    } as unknown as React.PointerEvent<SVGSVGElement>;
    const onTapMock = vi.fn();
    const onHoldMock = vi.fn();

    const { result } = renderHook(() =>
      usePianorollTouch({
        selectMode: "add",
        holdThreshold: EDITOR_CONFIG.HOLD_THRESHOLD_MS,
        onTap: onTapMock,
        onHold: onHoldMock,
      })
    );

    act(() => {
      result.current.handlePointerDown(fakeEvent);
    });

    // タイマーは起動する
    expect(vi.getTimerCount()).toBe(1);

    // しかし、PointerUpしてもtouchStartがundefinedなのでtapは呼ばれる
    act(() => {
      result.current.handlePointerUp(fakeEvent);
    });

    expect(onTapMock).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
