import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PoltamentRemoveFab,
  RemovePoltament,
} from "../../../../src/features/EditorView/PitchPortal/PoltamentRemoveFab";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBank";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("PoltamentRemoveFab", () => {
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
  it("PoltamentRemoveFab: ポルタメントが削除され、pbwは1つ次の値と合算される", () => {
    const n = createNote();
    n.setPbw([150, 250, 350]);
    n.setPbm(["", "s", "r"]);
    n.setPby([50, 100]);
    const resultNote = RemovePoltament(2, n);
    expect(resultNote.pbw).toEqual([150, 600]);
    expect(resultNote.pbm).toEqual(["", "r"]);
    expect(resultNote.pby).toEqual([50]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([resultNote]);
  });
  it("PoltamentRemoveFab: ポルタメントが削除され、pbwは1つ次の値と合算される。targetIndex===1の場合", () => {
    const n = createNote();
    n.setPbw([150, 250, 350]);
    n.setPbm(["", "s", "r"]);
    n.setPby([50, 100]);
    const resultNote = RemovePoltament(1, n);
    expect(resultNote.pbw).toEqual([400, 350]);
    expect(resultNote.pbm).toEqual(["s", "r"]);
    expect(resultNote.pby).toEqual([100]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(undoResult).toEqual([n]);
    expect(redoResult).toEqual([resultNote]);
  });
  it("PoltamentRemoveFab: pbwIndex !== 0の場合、配列操作が正しく行われる", () => {
    const n = createNote();
    n.setPbw([100, 200, 300, 400]);
    n.setPbm(["", "s", "r", "j"]);
    n.setPby([50, 60, 70]);
    const resultNote = RemovePoltament(3, n); // pbwIndex = 2
    // pbw[2]とpbw[3]が合算されて600になり、pbw[2]の位置に配置される
    expect(resultNote.pbw).toEqual([100, 200, 700]);
    expect(resultNote.pbm).toEqual(["", "s", "j"]);
    expect(resultNote.pby).toEqual([50, 60]);
  });
  it("PoltamentRemoveFab: targetIndex===0の時disabled", async () => {
    const n = createNote();
    n.setPbw([150, 250, 350]);
    n.setPbm(["", "s", "r"]);
    n.setPby([50, 100]);
    render(<PoltamentRemoveFab note={n} targetIndex={0} />);
    const button = await screen.findByTestId("poltamentRemove");
    expect(button).toHaveAttribute("disabled");
  });
  it("PoltamentRemoveFab: targetIndexがポルタメント末尾の時disabled", async () => {
    const n = createNote();
    n.setPbw([150, 250, 350]);
    n.setPbm(["", "s", "r"]);
    n.setPby([50, 100]);
    render(<PoltamentRemoveFab note={n} targetIndex={3} />);
    const button = await screen.findByTestId("poltamentRemove");
    expect(button).toHaveAttribute("disabled");
  });
  it("PoltamentRemoveFab: clickするとRemovePoltamentが実行され、setNoteされる", async () => {
    const n = createNote();
    n.setPbw([150, 250, 350]);
    n.setPbm(["", "s", "r"]);
    n.setPby([50, 100]);
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    render(<PoltamentRemoveFab note={n} targetIndex={2} />);
    const button = await screen.findByTestId("poltamentRemove");
    fireEvent.click(button);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[0];
    expect(resultNote.pbw).toEqual([150, 600]);
    expect(resultNote.pbm).toEqual(["", "r"]);
    expect(resultNote.pby).toEqual([50]);
  });
});
