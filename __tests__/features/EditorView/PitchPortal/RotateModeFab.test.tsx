import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  RotateMode,
  RotateModeFab,
} from "../../../../src/features/EditorView/PitchPortal/RotateModeFab";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("RotateModeFab", () => {
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
  it("RotateMode:pbmの値が''->'s'->'r'->'j'->''と順番に代わる", () => {
    const n = createNote();
    n.setPbm([""]);
    const n2 = RotateMode(1, n);
    const n3 = RotateMode(1, n2);
    const n4 = RotateMode(1, n3);
    const n5 = RotateMode(1, n4);
    expect(n2.pbm[0]).toBe("s");
    expect(n3.pbm[0]).toBe("r");
    expect(n4.pbm[0]).toBe("j");
    expect(n5.pbm[0]).toBe("");
    const un4 = undoManager.undo();
    const un3 = undoManager.undo();
    const un2 = undoManager.undo();
    const un = undoManager.undo();
    const rn2 = undoManager.redo();
    const rn3 = undoManager.redo();
    const rn4 = undoManager.redo();
    const rn5 = undoManager.redo();
    expect(un).toEqual([n]);
    expect(un2).toEqual([n2]);
    expect(un3).toEqual([n3]);
    expect(un4).toEqual([n4]);
    expect(rn2).toEqual([n2]);
    expect(rn3).toEqual([n3]);
    expect(rn4).toEqual([n4]);
    expect(rn5).toEqual([n5]);
  });
  it("RotateMode:pbmより大きいインデックスを与えられた場合、''を返す", () => {
    const n = createNote();
    const n2 = RotateMode(1, n);
    expect(n2.pbm[0]).toBe("");
    const n3 = RotateMode(2, n);
    expect(n3.pbm[1]).toBe("");
  });

  it("RotateModeFab:targetIndexが0の時udnefined", async () => {
    const n = createNote();
    n.setPbm([""]);
    render(<RotateModeFab targetIndex={0} note={n} />);
    const button = await screen.findByTestId("rotateMode");
    expect(button).toHaveAttribute("disabled");
  });

  it("RotateModeFab:clickした時RotateModeが呼ばれ、その結果がsetNoteされる。", async () => {
    const n = createNote();
    n.setPbm([""]);
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    render(<RotateModeFab targetIndex={1} note={n} />);
    const button = await screen.findByTestId("rotateMode");
    fireEvent.click(button);
    //notesが更新されているはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes[0].pbm).toEqual(["s"]);
  });
});
