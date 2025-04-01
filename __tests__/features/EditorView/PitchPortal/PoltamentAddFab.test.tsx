import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AddPoltament,
  PoltamentAddFab,
} from "../../../../src/features/EditorView/PitchPortal/PoltamentAddFab";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("PoltamentAddFab", () => {
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
    undoManager.clear();
    vi.restoreAllMocks();
  });
  it("AddPoltament:targetIndex===0の場合、最初のpbwを分割して先頭に要素を追加", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    const n2 = AddPoltament(0, n);
    expect(n2.pbw).toEqual([125, 125, 500]);
    expect(n2.pbm).toEqual(["", "", ""]);
    expect(n2.pby).toEqual([50, 100]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("AddPoltament:targetIndexが最後のポルタメントを選択している場合、末尾にポルタメント追加", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["s", "s"]);
    n.setPby([100]);
    const n2 = AddPoltament(2, n);
    expect(n2.pbw).toEqual([250, 500, 10]);
    expect(n2.pbm).toEqual(["s", "s", ""]);
    expect(n2.pby).toEqual([100, 0]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("AddPoltament:targetIndexが最後のポルタメントを選択している場合、末尾にポルタメント追加。pbmがundefined", () => {
    // pbmは""が続く場合与えられない場合がある。
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPby([100]);
    const n2 = AddPoltament(2, n);
    expect(n2.pbw).toEqual([250, 500, 10]);
    expect(n2.pbm).toEqual(["", "", ""]);
    expect(n2.pby).toEqual([100, 0]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("AddPoltament:targetIndexが最後のポルタメントを選択している場合、末尾にポルタメント追加。pbyがundefined", () => {
    // pbyは必ずpbwより1つ短いので、pbwが1つの時undefinedになる
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250]);
    const n2 = AddPoltament(1, n);
    expect(n2.pbw).toEqual([250, 10]);
    expect(n2.pbm).toEqual(["", ""]);
    expect(n2.pby).toEqual([0]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("AddPoltament:targetIndexが最初でも最後でもない場合、選択したポルタメントの次を分割", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([100, 250, 500]);
    n.setPbm(["s", "s", "s"]);
    n.setPby([50, 100]);
    const n2 = AddPoltament(2, n);
    expect(n2.pbw).toEqual([100, 250, 250, 250]);
    expect(n2.pbm).toEqual(["s", "s", "", "s"]);
    expect(n2.pby).toEqual([50, 75, 100]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("AddPoltament:targetIndexが最初でも最後でもない場合、選択したポルタメントの次を分割。pbmがundefined", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([100, 250, 500]);
    n.setPby([50, 100]);
    const n2 = AddPoltament(2, n);
    expect(n2.pbw).toEqual([100, 250, 250, 250]);
    expect(n2.pbm).toEqual(["", "", "", ""]);
    expect(n2.pby).toEqual([50, 75, 100]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("PoltamentAddFab:targetIndexがundefinedの時disabled", async () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    render(<PoltamentAddFab targetIndex={undefined} note={n} />);
    const button = await screen.findByTestId("poltamentAdd");
    expect(button).toHaveAttribute("disabled");
  });
  it("PoltamentAddFab:clickでAddPoltamentが実行され、setNoteされる", async () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    render(<PoltamentAddFab targetIndex={0} note={n} />);
    const button = await screen.findByTestId("poltamentAdd");
    fireEvent.click(button);
    //notesが更新されているはず
    const n2 = useMusicProjectStore.getState().notes[0];
    expect(n2.pbw).toEqual([125, 125, 500]);
    expect(n2.pbm).toEqual(["", "", ""]);
    expect(n2.pby).toEqual([50, 100]);
  });
});
