import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  RotateMode,
  RotateModeFab,
} from "../../../../src/features/EditorView/PitchPortal/RotateModeFab";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBank";
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
    n.prev = { tempo: 120, length: 0, lyric: "R" };
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
  it("RotateModeFab: pbmの値が''->'s'->'r'->'j'->''と順番に代わる", () => {
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
  it("RotateModeFab: pbmより大きいインデックスを与えられた場合、''を返す", () => {
    const n = createNote();
    const n2 = RotateMode(1, n);
    expect(n2.pbm[0]).toBe("");
    const n3 = RotateMode(2, n);
    expect(n3.pbm[1]).toBe("");
  });
  it("RotateModeFab: FABのテキスト表示が正しい('S'、'/'、pbmの値)", async () => {
    const n = createNote();
    n.setPbw([100, 200]);
    n.setPbm(["", "s"]);
    // pbm[0] === "" の場合、"S"を表示
    render(<RotateModeFab targetIndex={1} note={n} />);
    let button = await screen.findByTestId("rotateMode");
    expect(button.textContent).toBe("S");
    // pbm[1] === "s" の場合、"/"を表示
    const n2 = createNote();
    n2.setPbw([100, 200]);
    n2.setPbm(["s", "s"]);
    render(<RotateModeFab targetIndex={2} note={n2} />);
    button = await screen
      .findAllByTestId("rotateMode")
      .then((buttons) => buttons[1]);
    expect(button.textContent).toBe("/");
    // pbm[1] === "r" の場合、"r"を表示
    const n3 = createNote();
    n3.setPbw([100, 200]);
    n3.setPbm(["s", "r"]);
    render(<RotateModeFab targetIndex={2} note={n3} />);
    button = await screen
      .findAllByTestId("rotateMode")
      .then((buttons) => buttons[2]);
    expect(button.textContent).toBe("r");
  });

  it("RotateModeFab: targetIndexが0の時undefined", async () => {
    const n = createNote();
    n.setPbm([""]);
    render(<RotateModeFab targetIndex={0} note={n} />);
    const button = await screen.findByTestId("rotateMode");
    expect(button).toHaveAttribute("disabled");
  });

  it("RotateModeFab: clickした時RotateModeが呼ばれ、その結果がsetNoteされる", async () => {
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
