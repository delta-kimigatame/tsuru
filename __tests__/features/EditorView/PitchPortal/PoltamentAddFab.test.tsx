import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AddPoltament,
  PoltamentAddFab,
} from "../../../../src/features/EditorView/PitchPortal/PoltamentAddFab";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBank";
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
    const prevNote = new Note();
    prevNote.tempo = 120;
    prevNote.length = 0;
    prevNote.lyric = "R";
    n.prev = prevNote;
    return n;
  };
  beforeEach(() => {
    undoManager.clear();
    vi.restoreAllMocks();
    const store = useMusicProjectStore.getState();
    store.setVb({
      oto: {},
      getOtoRecord: vi.fn().mockReturnValue(null),
    } as unknown as VoiceBank);
  });
  it("PoltamentAddFab: targetIndex===0の場合、最初のpbwを分割して先頭に要素を追加", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    const n2 = AddPoltament(0, n);
    expect(n2.pbw).toEqual([125, 125, 500]);
    expect(n2.pbm).toEqual(["", "", ""]);
    expect(n2.pby).toEqual([0, 100]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("PoltamentAddFab: targetIndex===0でprev.lyric !== 'R'の場合、pbsHeightは(prev.notenum - notenum) * 10で計算される", () => {
    const n = createNote();
    n.notenum = 60;
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    const prevNote = new Note();
    prevNote.notenum = 65; // 5半音上
    prevNote.lyric = "あ"; // Rではない
    n.prev = prevNote;
    const n2 = AddPoltament(0, n);
    // pbsHeightは (65-60)*10 = 50で計算される
    // newPbyは (100 - 50) / 2 + 50 = 75
    expect(n2.pby[0]).toBe(75);
  });
  it("PoltamentAddFab: targetIndex===0でpbyがundefinedの場合、新しいpbyは1つの値を持つ配列になる", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    // pbyをundefinedのままにする
    const n2 = AddPoltament(0, n);
    expect(n2.pbw).toEqual([125, 125, 500]);
    expect(n2.pby.length).toBe(1);
    expect(n2.pby[0]).toBeDefined();
  });
  it("PoltamentAddFab: targetIndexが最後のポルタメントを選択している場合、末尾にポルタメント追加", () => {
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
  it("PoltamentAddFab: targetIndexが最後のポルタメントを選択している場合、末尾にポルタメント追加。pbmがundefined", () => {
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
  it("PoltamentAddFab: targetIndexが最後のポルタメントを選択している場合、末尾にポルタメント追加。pbyがundefined", () => {
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
  it("PoltamentAddFab: targetIndexが最初でも最後でもない場合、選択したポルタメントの次を分割", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([100, 250, 500]);
    n.setPbm(["s", "s", "s"]);
    n.setPby([50, 100]);
    const n2 = AddPoltament(2, n);
    expect(n2.pbw).toEqual([100, 250, 250, 250]);
    expect(n2.pbm).toEqual(["s", "s", "", "s"]);
    expect(n2.pby).toEqual([50, 100, 50]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("PoltamentAddFab: 中間位置でpbyの計算が正しく行われる(absVal1 > absVal2のケース)", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([100, 250, 500]);
    n.setPbm(["s", "s", "s"]);
    n.setPby([80, 20]); // absVal1=80 > absVal2=20
    const n2 = AddPoltament(2, n);
    // pbwIndex = 1, val1 = pby[1] = 20, val2 = pby[2] ?? 0 = 0
    // absVal1 = 20, absVal2 = 0, absVal1 > absVal2なので diff = 20 - 0 = 20
    // newPby = abs(20/2) + min(20, 0) = 10 + 0 = 10
    expect(n2.pby).toEqual([80, 20, 10]);
  });
  it("PoltamentAddFab: targetIndexが最初でも最後でもない場合、選択したポルタメントの次を分割。pbmがundefined", () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([100, 250, 500]);
    n.setPby([50, 100]);
    const n2 = AddPoltament(2, n);
    expect(n2.pbw).toEqual([100, 250, 250, 250]);
    expect(n2.pbm).toEqual(["", "", "", ""]);
    expect(n2.pby).toEqual([50, 100, 50]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([n2]);
  });
  it("PoltamentAddFab: targetIndexがundefinedの時disabled", async () => {
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    render(<PoltamentAddFab targetIndex={undefined} note={n} />);
    const button = await screen.findByTestId("poltamentAdd");
    expect(button).toHaveAttribute("disabled");
  });
  it("PoltamentAddFab: clickでAddPoltamentが実行され、setNoteされる", async () => {
    const prevNote = createNote();
    prevNote.lyric = "R";
    const n = createNote();
    n.pbs = "-40;-30";
    n.setPbw([250, 500]);
    n.setPbm(["", ""]);
    n.setPby([100]);
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([prevNote, n]);
    render(<PoltamentAddFab targetIndex={0} note={n} />);
    const button = await screen.findByTestId("poltamentAdd");
    fireEvent.click(button);
    //notesが更新されているはず
    const n2 = useMusicProjectStore.getState().notes[1];
    expect(n2.pbw).toEqual([125, 125, 500]);
    expect(n2.pbm).toEqual(["", "", ""]);
    expect(n2.pby).toEqual([0, 100]);
  });
});
