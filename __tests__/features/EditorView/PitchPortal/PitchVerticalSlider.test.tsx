import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PitchVerticalSlider } from "../../../../src/features/EditorView/PitchPortal/PitchVerticalSlider";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("PitchVerticalSlider", () => {
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
  });
  it("PitchVerticalSlider:targetIndexがundefinedの時表示されない", () => {
    const n = createNote();
    render(
      <PitchVerticalSlider
        targetIndex={undefined}
        note={n}
        setHasUpdate={() => {}}
      />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).toBeNull();
  });
  it("PitchVerticalSlider:noteがundefinedの時表示されない", () => {
    const n = createNote();
    render(
      <PitchVerticalSlider
        targetIndex={0}
        note={undefined}
        setHasUpdate={() => {}}
      />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).toBeNull();
  });
  it("PitchVerticalSlider:targetIndexが0でnote.prevがnullの時表示されない", () => {
    const n = createNote();
    render(
      <PitchVerticalSlider targetIndex={0} note={n} setHasUpdate={() => {}} />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).toBeNull();
  });
  it("PitchVerticalSlider:targetIndexが0でnote.prevが非nullで、lyricがR以外の時表示されない", () => {
    const n = createNote();
    const pn = createNote();
    n.prev = pn;
    render(
      <PitchVerticalSlider targetIndex={0} note={n} setHasUpdate={() => {}} />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).toBeNull();
  });
  it("PitchVerticalSlider:targetIndexが0でnote.prevが非nullで、lyricがRの時表示され、初期値はpbsHeight", () => {
    const n = createNote();
    n.pbs = "-40;-20";
    const pn = createNote();
    pn.lyric = "R";
    n.prev = pn;
    render(
      <PitchVerticalSlider targetIndex={0} note={n} setHasUpdate={() => {}} />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).not.toBeNull();
    const slider = screen.getByRole("slider", {
      name: /pitchVerticalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "-20");
  });
  it("PitchVerticalSlider:targetIndexが非0でnote.pbw.lengthと同値の時表示されない", () => {
    const n = createNote();
    n.pbs = "-40";
    n.setPbw([250, 250]);
    n.setPbm(["", ""]);
    n.setPby([50]);
    const pn = createNote();
    pn.lyric = "R";
    n.prev = pn;
    render(
      <PitchVerticalSlider targetIndex={2} note={n} setHasUpdate={() => {}} />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).toBeNull();
  });
  it("PitchVerticalSlider:targetIndexが非0かつ非末尾のとき、sliderが表示され、初期値はpby[targetIndex-1]", () => {
    const n = createNote();
    n.pbs = "-40";
    n.setPbw([250, 250]);
    n.setPbm(["", ""]);
    n.setPby([50]);
    const pn = createNote();
    pn.lyric = "R";
    n.prev = pn;
    render(
      <PitchVerticalSlider targetIndex={1} note={n} setHasUpdate={() => {}} />
    );
    expect(screen.queryByTestId("pitchVerticalSlider")).not.toBeNull();
    const slider = screen.getByRole("slider", {
      name: /pitchVerticalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });
  it("PitchVerticalSlider:targetIndexが0でnote.prevが非nullで、lyricがRの時操作するとpbsHeightが更新される", () => {
    const n = createNote();
    n.pbs = "-40;-20";
    const pn = createNote();
    pn.lyric = "R";
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const setHasUpdateSpy = vi.fn();
    render(
      <PitchVerticalSlider
        targetIndex={0}
        note={n}
        setHasUpdate={setHasUpdateSpy}
      />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchVerticalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "-20");
    fireEvent.change(slider, { target: { value: "40" } });
    // setHasUpdateが呼ばれているはず
    expect(setHasUpdateSpy).toHaveBeenCalledWith(true);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    expect(resultNote.pbs.height).toBe(40);
  });
  it("PitchVerticalSlider:targetIndexが非0かつ非末尾のとき、操作するとpby[targetIndex-1]が更新される", () => {
    const n = createNote();
    n.pbs = "-40";
    n.setPbw([250, 250]);
    n.setPbm(["", ""]);
    n.setPby([50]);
    const pn = createNote();
    pn.lyric = "R";
    n.prev = pn;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([pn, n]);
    const setHasUpdateSpy = vi.fn();
    render(
      <PitchVerticalSlider
        targetIndex={1}
        note={n}
        setHasUpdate={setHasUpdateSpy}
      />
    );
    const slider = screen.getByRole("slider", {
      name: /pitchVerticalSlider/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    fireEvent.change(slider, { target: { value: "40" } });
    // setHasUpdateが呼ばれているはず
    expect(setHasUpdateSpy).toHaveBeenCalledWith(true);
    //notesが更新されているはず
    const resultNote = useMusicProjectStore.getState().notes[1];
    expect(resultNote.pby).toEqual([40]);
  });
});
