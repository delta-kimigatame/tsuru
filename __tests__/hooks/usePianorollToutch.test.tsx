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
  it("handlePointerDown:SVGの座標取得とタイマーが起動する", () => {
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
  it("handlePointerCancel:タイマーがキャンセルされる", () => {
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
  it("handleHold:タップ後タイマーが進行するとholdが呼ばれる", () => {
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
  it("PointerUp:タップ後ポインターアップすると、tapイベントが呼ばれる", () => {
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
});
