import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PitchHorizontalSlider } from "../../../../src/features/EditorView/PitchPortal/PitchHorizontalSlider";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBank";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("PitchHorizontalSlider", () => {
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
    vi.restoreAllMocks();
    const store = useMusicProjectStore.getState();
    store.setVb({
      oto: {},
      getOtoRecord: vi.fn().mockReturnValue(null),
    } as unknown as VoiceBank);
  });
  it("PitchHorizontalSlider: targetIndexがundefinedの時表示されない", () => {
    const n = createNote();
    render(
      <PitchHorizontalSlider
        targetIndex={undefined}
        note={n}
        setHasUpdate={() => {}}
      />
    );
    expect(screen.queryByTestId("pitchHorizontalSlider")).toBeNull();
  });
  it("PitchHorizontalSlider: noteがundefinedの時表示されない", () => {
    const n = createNote();
    render(
      <PitchHorizontalSlider
        targetIndex={undefined}
        note={n}
        setHasUpdate={() => {}}
      />
    );
    expect(screen.queryByTestId("pitchHorizontalSlider")).toBeNull();
  });
  it("PitchHorizontalSlider: targetIndexが0かつ、note.prev===nullの時、minは0", () => {
    const n = createNote();
    n.prev = null;
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    render(
      <PitchHorizontalSlider targetIndex={0} note={n} setHasUpdate={() => {}} />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
  });
  it("PitchHorizontalSlider: targetIndexが0かつ、note.prev===undefinedの時、minは0", () => {
    const n = createNote();
    n.prev = undefined;
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    render(
      <PitchHorizontalSlider targetIndex={0} note={n} setHasUpdate={() => {}} />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
  });
  it("PitchHorizontalSlider: targetIndexが0かつ、note.prevが定義されているとき、minは-prev.msLength", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    const pn = createNote();
    n.prev = pn;
    render(
      <PitchHorizontalSlider targetIndex={0} note={n} setHasUpdate={() => {}} />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuemin", "-500");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
  });
  it("PitchHorizontalSlider: targetIndex非0かつ非最後のとき、minは0でmaxは次のpbwと対象pbwの和", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    render(
      <PitchHorizontalSlider targetIndex={1} note={n} setHasUpdate={() => {}} />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "300");
  });
  it("PitchHorizontalSlider: targetIndex非0かつ最後のとき、minは0でmaxは直前までのpbwとpbsTimeの和とn.msLengthの差", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    render(
      <PitchHorizontalSlider targetIndex={2} note={n} setHasUpdate={() => {}} />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    //ノート長が500ms、pbsTimeが-40でpbw0が100のため、440が期待される
    expect(slider).toHaveAttribute("aria-valuemax", "440");
  });
  it("PitchHorizontalSlider: targetIndexが0かつ、slider操作はpbsTimeとpbw[0]を更新する", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const setHasUpdateSpy = vi.fn();
    render(
      <PitchHorizontalSlider
        targetIndex={0}
        note={n}
        setHasUpdate={setHasUpdateSpy}
      />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "-40");
    fireEvent.change(slider, { target: { value: "-60" } });
    expect(setHasUpdateSpy).toHaveBeenCalledWith(true);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    expect(resultNote.pbs.time).toBe(-60);
    expect(resultNote.pbw).toEqual([120, 200]);
  });
  it("PitchHorizontalSlider: targetIndexが非0かつ非最後の場合、slider操作はpbwと次のpbwを更新する", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const setHasUpdateSpy = vi.fn();
    render(
      <PitchHorizontalSlider
        targetIndex={1}
        note={n}
        setHasUpdate={setHasUpdateSpy}
      />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "100");
    fireEvent.change(slider, { target: { value: "120" } });
    expect(setHasUpdateSpy).toHaveBeenCalledWith(true);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    expect(resultNote.pbs.time).toBe(-40);
    expect(resultNote.pbw).toEqual([120, 180]);
  });
  it("PitchHorizontalSlider: targetIndexが最後の場合、slider操作は最後のpbwを更新する", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    const pn = createNote();
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const setHasUpdateSpy = vi.fn();
    render(
      <PitchHorizontalSlider
        targetIndex={2}
        note={n}
        setHasUpdate={setHasUpdateSpy}
      />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchHorizontalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "200");
    fireEvent.change(slider, { target: { value: "120" } });
    expect(setHasUpdateSpy).toHaveBeenCalledWith(true);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    expect(resultNote.pbs.time).toBe(-40);
    expect(resultNote.pbw).toEqual([100, 120]);
  });
});
