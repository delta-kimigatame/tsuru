import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePitchEditDrag } from "../../src/hooks/usePitchEditDrag";
import { Note } from "../../src/lib/Note";

describe("usePitchEditDrag", () => {
  let mockSetTargetPoltament: ReturnType<typeof vi.fn>;
  let mockSetNotes: ReturnType<typeof vi.fn>;
  let mockNotes: Note[];

  beforeEach(() => {
    mockSetTargetPoltament = vi.fn();
    mockSetNotes = vi.fn();

    // テスト用のノートを作成
    const note1 = new Note();
    note1.length = 480;
    note1.notenum = 60;
    note1.lyric = "あ";
    note1.pbs = "0;0";
    note1.pbw = "100,100";
    note1.pby = "0,0";

    mockNotes = [note1];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createFakeSVGElement = () => {
    return {
      createSVGPoint: vi.fn(() => ({
        x: 0,
        y: 0,
        matrixTransform: vi.fn((matrix) => ({
          x: 100,
          y: 200,
        })),
      })),
      getScreenCTM: vi.fn(() => ({
        inverse: vi.fn(() => ({})),
      })),
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
    } as unknown as SVGSVGElement;
  };

  const createPointerEvent = (
    pointerId: number,
    clientX = 100,
    clientY = 200
  ): React.PointerEvent<SVGSVGElement> => {
    const fakeSVG = createFakeSVGElement();
    return {
      pointerId,
      clientX,
      clientY,
      currentTarget: fakeSVG,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {
        preventDefault: vi.fn(),
      },
    } as unknown as React.PointerEvent<SVGSVGElement>;
  };

  it("ピッチ編集モード以外ではポインターダウン時に何もしない", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "toggle",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: undefined,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    const event = createPointerEvent(1);

    let handled = false;
    act(() => {
      handled = result.current.handlePointerDown(event);
    });

    expect(handled).toBe(false);
    expect(mockSetTargetPoltament).not.toHaveBeenCalled();
    expect(result.current.isPitchDragging).toBe(false);
  });

  it("ピッチ編集モードでポルタメント上をポインターダウンするとドラッグ開始", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: undefined,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    const event = createPointerEvent(1, 100, 200);

    let handled = false;
    act(() => {
      handled = result.current.handlePointerDown(event);
    });

    expect(handled).toBe(true);
    expect(mockSetTargetPoltament).toHaveBeenCalledWith(0);
    expect(result.current.isPitchDragging).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it("ピッチ編集モードでポルタメント外をポインターダウンしてもドラッグ開始しない", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: undefined, // poltamentsをundefinedにすることでポルタメント無しを表現
        targetPoltament: undefined,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    const event = createPointerEvent(1, 500, 500);

    let handled = false;
    act(() => {
      handled = result.current.handlePointerDown(event);
    });

    expect(handled).toBe(false);
    expect(mockSetTargetPoltament).not.toHaveBeenCalled();
    expect(result.current.isPitchDragging).toBe(false);
  });

  it("ドラッグ中にポインタームーブするとhasPitchDraggedがtrueになる", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: 0,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    // ドラッグ開始
    const downEvent = createPointerEvent(1, 100, 200);
    act(() => {
      result.current.handlePointerDown(downEvent);
    });

    expect(result.current.isPitchDragging).toBe(true);
    expect(result.current.hasPitchDragged).toBe(false);

    // ポインター移動
    const moveEvent = createPointerEvent(1, 110, 210);
    act(() => {
      result.current.handlePointerMove(moveEvent);
    });

    expect(result.current.hasPitchDragged).toBe(true);
    expect(mockSetNotes).toHaveBeenCalled();
  });

  it("ポインターアップするとドラッグ状態がリセットされる", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: 0,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    // ドラッグ開始
    const downEvent = createPointerEvent(1, 100, 200);
    act(() => {
      result.current.handlePointerDown(downEvent);
    });

    // ポインター移動
    const moveEvent = createPointerEvent(1, 110, 210);
    act(() => {
      result.current.handlePointerMove(moveEvent);
    });

    expect(result.current.isPitchDragging).toBe(true);
    expect(result.current.hasPitchDragged).toBe(true);

    // ポインターアップ
    const upEvent = createPointerEvent(1);
    let shouldSkipTap = false;
    act(() => {
      shouldSkipTap = result.current.handlePointerUp(upEvent);
    });

    expect(result.current.isPitchDragging).toBe(false);
    expect(result.current.hasPitchDragged).toBe(false);
    expect(shouldSkipTap).toBe(true);
    expect(upEvent.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it("ドラッグせずにポインターアップした場合はタップイベントをスキップしない", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: 0,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    // ドラッグ開始
    const downEvent = createPointerEvent(1, 100, 200);
    act(() => {
      result.current.handlePointerDown(downEvent);
    });

    // ムーブせずにアップ
    const upEvent = createPointerEvent(1);
    let shouldSkipTap = false;
    act(() => {
      shouldSkipTap = result.current.handlePointerUp(upEvent);
    });

    expect(shouldSkipTap).toBe(false);
  });

  it("ポインターキャンセル時にドラッグ状態がリセットされる", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: 0,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    // ドラッグ開始
    const downEvent = createPointerEvent(1, 100, 200);
    act(() => {
      result.current.handlePointerDown(downEvent);
    });

    // ポインター移動
    const moveEvent = createPointerEvent(1, 110, 210);
    act(() => {
      result.current.handlePointerMove(moveEvent);
    });

    expect(result.current.isPitchDragging).toBe(true);

    // ポインターキャンセル
    const cancelEvent = createPointerEvent(1);
    act(() => {
      result.current.handlePointerCancel(cancelEvent);
    });

    expect(result.current.isPitchDragging).toBe(false);
    expect(result.current.hasPitchDragged).toBe(false);
    expect(
      cancelEvent.currentTarget.releasePointerCapture
    ).toHaveBeenCalledWith(1);
  });

  it("targetPoltamentがundefinedの場合、ムーブ時にポインターキャプチャーがリリースされる", () => {
    const { result } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: undefined,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    // ドラッグ開始
    const downEvent = createPointerEvent(1, 100, 200);
    act(() => {
      result.current.handlePointerDown(downEvent);
    });

    // ポインター移動(targetPoltamentがundefined)
    const moveEvent = createPointerEvent(1, 110, 210);
    act(() => {
      result.current.handlePointerMove(moveEvent);
    });

    expect(result.current.isPitchDragging).toBe(false);
    expect(mockSetNotes).not.toHaveBeenCalled();
  });

  it("iOS対応: ピッチ編集時にbodyスクロールが無効化される", () => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    const { unmount } = renderHook(() =>
      usePitchEditDrag({
        selectMode: "pitch",
        poltaments: [{ x: 100, y: 200 }],
        targetPoltament: 0,
        setTargetPoltament: mockSetTargetPoltament,
        selectedNotesIndex: [0],
        notes: mockNotes,
        setNotes: mockSetNotes,
        notesLeft: [0],
        ustTempo: 120,
        verticalZoom: 1,
        horizontalZoom: 1,
      })
    );

    // スクロールが無効化されていることを確認
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.touchAction).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");

    // アンマウント後に復元されることを確認
    unmount();
    expect(document.body.style.overflow).toBe(originalBodyOverflow);
    expect(document.body.style.touchAction).toBe(originalBodyTouchAction);
    expect(document.documentElement.style.overflow).toBe(originalHtmlOverflow);
  });
});
