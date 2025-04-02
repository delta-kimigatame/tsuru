import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PitchPortal } from "../../../../src/features/EditorView/PitchPortal/PitchPortal";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("PitchPortal", () => {
  const createNote = (): Note => {
    const n = new Note();
    n.index = 0;
    n.length = 480;
    n.notenum = 60;
    n.lyric = "あ";
    n.hasTempo = false;
    n.tempo = 120;
    return n;
  };
  beforeEach(() => {
    vi.restoreAllMocks();
    undoManager.clear();
  });
  it("PitchPortal:noteが渡されていない場合、ポータルは描画されない", () => {
    render(<PitchPortal note={undefined} targetIndex={0} />);
    expect(screen.queryByTestId("pitchPortal")).toBeNull();
  });
  it("PitchPortal:noteにpbwが無い場合、ポータルは描画されない", () => {
    const n = createNote();
    render(<PitchPortal note={n} targetIndex={0} />);
    expect(screen.queryByTestId("pitchPortal")).toBeNull();
  });
  it("PitchPortal:targetIndexがundefinedの場合、portalは描画されるがfabとsliderは描画されない", async () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={n} targetIndex={undefined} />);
    await screen.findByTestId("pitchPortal"); //ここでこける
    expect(screen.queryByTestId("pitchHorizontalSlider")).toBeNull();
    expect(screen.queryByTestId("pitchVerticalSlider")).toBeNull();
    expect(screen.queryByTestId("poltamentRemove")).toBeNull();
    expect(screen.queryByTestId("poltamentAdd")).toBeNull();
    expect(screen.queryByTestId("rotateMode")).toBeNull();
  });
  it("PitchPortal:targetIndexが非undefinedの場合、fabが描画される。sliderの描画は各スライダーで検証する", async () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={n} targetIndex={0} />);
    await screen.findByTestId("pitchPortal"); //ここでこける
    expect(screen.queryByTestId("poltamentRemove")).not.toBeNull();
    expect(screen.queryByTestId("poltamentAdd")).not.toBeNull();
    expect(screen.queryByTestId("rotateMode")).not.toBeNull();
  });
  it("PitchPortal:コンポーネントマウント時点ではundoManagerは呼ばれない。", async () => {
    //コンポーネントマウント時にはnote,targetIndex両方がundefinedのはず
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={undefined} targetIndex={undefined} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal:ピッチ編集モードに入った時点ではundoManagerは呼ばれない。", async () => {
    //コンポーネントマウント時にはnoteは非undefined,targetIndexはundefinedのはず
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={n} targetIndex={undefined} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal:ポルタメント初回選択時、undoManagerは呼ばれない", async () => {
    //コンポーネントマウント時にはnote,targetIndexの両方が非undefinedで、内部状態のhasUpdateがfalse
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal:slider操作後ポルタメントを変更すると、undoManagerが呼ばれる", async () => {
    //コンポーネントマウント時にはnote,targetIndexの両方が非undefinedで、内部状態のhasUpdateがfalse
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const { rerender } = render(<PitchPortal note={n} targetIndex={0} />);
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    fireEvent.change(slider, { target: { value: "0" } });
    rerender(<PitchPortal note={n} targetIndex={1} />);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(resultNote.pbs.time).toBe(0);
    expect(redoResult).toEqual([resultNote]);
    expect(undoResult).toEqual([n]);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal:slider操作後ノートを変更すると、undoManagerが呼ばれる", async () => {
    //コンポーネントマウント時にはnote,targetIndexの両方が非undefinedで、内部状態のhasUpdateがfalse
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const { rerender } = render(<PitchPortal note={n} targetIndex={0} />);
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    fireEvent.change(slider, { target: { value: "0" } });
    rerender(<PitchPortal note={pn} targetIndex={undefined} />);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(resultNote.pbs.time).toBe(0);
    expect(redoResult).toEqual([resultNote]);
    expect(undoResult).toEqual([n]);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal:slider操作後ピッチ編集モードを抜けると、undoManagerが呼ばれる", async () => {
    //コンポーネントマウント時にはnote,targetIndexの両方が非undefinedで、内部状態のhasUpdateがfalse
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const { rerender } = render(<PitchPortal note={n} targetIndex={0} />);
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    fireEvent.change(slider, { target: { value: "0" } });
    rerender(<PitchPortal note={undefined} targetIndex={undefined} />);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(resultNote.pbs.time).toBe(0);
    expect(redoResult).toEqual([resultNote]);
    expect(undoResult).toEqual([n]);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal:slider操作後ノートを変更すると、undoManagerが呼ばれる。verticalSliderの確認", async () => {
    //コンポーネントマウント時にはnote,targetIndexの両方が非undefinedで、内部状態のhasUpdateがfalse
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const { rerender } = render(<PitchPortal note={n} targetIndex={1} />);
    const slider = screen.getByRole("slider", {
      name: /pitchVerticalSlider/i,
    });
    fireEvent.change(slider, { target: { value: "0" } });
    rerender(<PitchPortal note={pn} targetIndex={undefined} />);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(resultNote.pby).toEqual([0]);
    expect(redoResult).toEqual([resultNote]);
    expect(undoResult).toEqual([n]);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
});
