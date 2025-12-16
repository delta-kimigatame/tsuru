import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PitchPortal } from "../../../../src/features/EditorView/PitchPortal/PitchPortal";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBank";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import * as pitchPatternModule from "../../../../src/utils/pitchPattern";

describe("PitchPortal", () => {
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
    undoManager.clear();
    const store = useMusicProjectStore.getState();
    store.setVb({
      oto: {},
      getOtoRecord: vi.fn().mockReturnValue(null),
    } as unknown as VoiceBank);
  });
  it("PitchPortal: noteが渡されていない場合、ポータルは描画されない", () => {
    render(<PitchPortal note={undefined} targetIndex={0} />);
    expect(screen.queryByTestId("pitchPortal")).toBeNull();
  });
  it("PitchPortal: noteにpbwが無い場合、ポータルは描画されない", () => {
    const n = createNote();
    render(<PitchPortal note={n} targetIndex={0} />);
    expect(screen.queryByTestId("pitchPortal")).toBeNull();
  });
  it("PitchPortal: targetIndexがundefinedの場合、portalは描画されるがfabとsliderは描画されない", async () => {
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
  it("PitchPortal: targetIndexが非undefinedの場合、fabが描画される。sliderの描画は各スライダーで検証する", async () => {
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
  it("PitchPortal: コンポーネントマウント時点ではundoManagerは呼ばれない", async () => {
    //コンポーネントマウント時にはnote,targetIndex両方がundefinedのはず
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={undefined} targetIndex={undefined} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal: ピッチ編集モードに入った時点ではundoManagerは呼ばれない", async () => {
    //コンポーネントマウント時にはnoteは非undefined,targetIndexはundefinedのはず
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={n} targetIndex={undefined} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal: ポルタメント初回選択時、undoManagerは呼ばれない", async () => {
    //コンポーネントマウント時にはnote,targetIndexの両方が非undefinedで、内部状態のhasUpdateがfalse
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);
    render(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal: slider操作後ポルタメントを変更すると、undoManagerが呼ばれる", async () => {
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
    expect(redoResult[0].pbs.time).toBe(resultNote.pbs.time);
    expect(redoResult[0].pbw).toEqual(resultNote.pbw);
    expect(undoResult[0].pbs.time).toBe(n.pbs.time);
    expect(undoResult[0].pbw).toEqual(n.pbw);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal: slider操作後ノートを変更すると、undoManagerが呼ばれる", async () => {
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
    expect(redoResult[0].pbs.time).toBe(resultNote.pbs.time);
    expect(redoResult[0].pbw).toEqual(resultNote.pbw);
    expect(undoResult[0].pbs.time).toBe(n.pbs.time);
    expect(undoResult[0].pbw).toEqual(n.pbw);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal: slider操作後ピッチ編集モードを抜けると、undoManagerが呼ばれる", async () => {
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
    expect(redoResult[0].pbs.time).toBe(resultNote.pbs.time);
    expect(redoResult[0].pbw).toEqual(resultNote.pbw);
    expect(undoResult[0].pbs.time).toBe(n.pbs.time);
    expect(undoResult[0].pbw).toEqual(n.pbw);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
  it("PitchPortal: slider操作後ノートを変更すると、undoManagerが呼ばれる。verticalSliderの確認", async () => {
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
    expect(redoResult[0].pby).toEqual(resultNote.pby);
    expect(redoResult[0].pbw).toEqual(resultNote.pbw);
    expect(undoResult[0].pby).toEqual(n.pby);
    expect(undoResult[0].pbw).toEqual(n.pbw);
    undoManager.clear();
    //1度目の再描画フックでhasUpdateがfalseになるため、再描画してもundoManagerは呼ばれない
    rerender(<PitchPortal note={n} targetIndex={0} />);
    expect(undoManager.undoSummary).toBe(undefined);
  });
});

describe("PitchPortal - Pitch Pattern Buttons", () => {
  const createNote = (): Note => {
    const n = new Note();
    n.index = 0;
    n.length = 480;
    n.notenum = 60;
    n.lyric = "あ";
    n.hasTempo = false;
    n.tempo = 120;
    n.atPreutter = 50;
    n.prev = undefined;
    return n;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    const store = useMusicProjectStore.getState();
    store.setVb({
      oto: {},
      getOtoRecord: vi.fn().mockReturnValue(null),
    } as unknown as VoiceBank);
    store.setUst({} as Ust);
  });

  it("ピッチパターンボタン: noteにpbwがある場合、4つのピッチパターンボタンが表示される", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);

    render(<PitchPortal note={n} targetIndex={undefined} />);

    expect(screen.getByTestId("belowPitchButton")).toBeInTheDocument();
    expect(screen.getByTestId("abovePitchButton")).toBeInTheDocument();
    expect(screen.getByTestId("accentPitchButton")).toBeInTheDocument();
    expect(screen.getByTestId("reservePitchButton")).toBeInTheDocument();
  });

  it("ピッチパターンボタン: belowPitchボタンをクリックするとbelowPitch関数が呼ばれる", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);

    const store = useMusicProjectStore.getState();
    store.setNotes([n]);

    const belowPitchSpy = vi.spyOn(pitchPatternModule, "belowPitch");

    render(<PitchPortal note={n} targetIndex={undefined} />);

    const button = screen.getByTestId("belowPitchButton");
    fireEvent.click(button);

    expect(belowPitchSpy).toHaveBeenCalledTimes(1);
    expect(belowPitchSpy).toHaveBeenCalledWith(
      expect.any(Note),
      0, // tone
      false // isMinor
    );
  });

  it("ピッチパターンボタン: abovePitchボタンをクリックするとabovePitch関数が呼ばれる", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);

    const store = useMusicProjectStore.getState();
    store.setNotes([n]);

    const abovePitchSpy = vi.spyOn(pitchPatternModule, "abovePitch");

    render(<PitchPortal note={n} targetIndex={undefined} />);

    const button = screen.getByTestId("abovePitchButton");
    fireEvent.click(button);

    expect(abovePitchSpy).toHaveBeenCalledTimes(1);
    expect(abovePitchSpy).toHaveBeenCalledWith(
      expect.any(Note),
      0, // tone
      false // isMinor
    );
  });

  it("ピッチパターンボタン: accentPitchボタンをクリックするとaccentPitch関数が呼ばれる", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);

    const store = useMusicProjectStore.getState();
    store.setNotes([n]);

    const accentPitchSpy = vi.spyOn(pitchPatternModule, "accentPitch");

    render(<PitchPortal note={n} targetIndex={undefined} />);

    const button = screen.getByTestId("accentPitchButton");
    fireEvent.click(button);

    expect(accentPitchSpy).toHaveBeenCalledTimes(1);
    expect(accentPitchSpy).toHaveBeenCalledWith(
      expect.any(Note),
      0, // tone
      false // isMinor
    );
  });

  it("ピッチパターンボタン: reservePitchボタンをクリックするとreservePitch関数が呼ばれる", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);

    const store = useMusicProjectStore.getState();
    store.setNotes([n]);

    const reservePitchSpy = vi.spyOn(pitchPatternModule, "reservePitch");

    render(<PitchPortal note={n} targetIndex={undefined} />);

    const button = screen.getByTestId("reservePitchButton");
    fireEvent.click(button);

    expect(reservePitchSpy).toHaveBeenCalledTimes(1);
    expect(reservePitchSpy).toHaveBeenCalledWith(
      expect.any(Note),
      0, // tone
      false // isMinor
    );
  });

  it("ピッチパターンボタン: tone=5, isMinor=trueの状態でボタンをクリックすると正しいパラメータで呼ばれる", () => {
    const n = createNote();
    n.pbs = "-40;20";
    n.setPbw([100, 200]);
    n.setPby([50]);

    const store = useMusicProjectStore.getState();
    store.setNotes([n]);
    store.setTone(5);
    store.setIsMinor(true);

    const belowPitchSpy = vi.spyOn(pitchPatternModule, "belowPitch");

    render(<PitchPortal note={n} targetIndex={undefined} />);

    const button = screen.getByTestId("belowPitchButton");
    fireEvent.click(button);

    expect(belowPitchSpy).toHaveBeenCalledWith(
      expect.any(Note),
      5, // tone
      true // isMinor
    );
  });

  it("ピッチパターンボタン: noteがundefinedの場合、ボタンは表示されない", () => {
    render(<PitchPortal note={undefined} targetIndex={undefined} />);

    expect(screen.queryByTestId("belowPitchButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("abovePitchButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accentPitchButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reservePitchButton")).not.toBeInTheDocument();
  });

  it("ピッチパターンボタン: noteにpbwが無い場合、ボタンは表示されない", () => {
    const n = createNote();

    render(<PitchPortal note={n} targetIndex={undefined} />);

    expect(screen.queryByTestId("belowPitchButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("abovePitchButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accentPitchButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reservePitchButton")).not.toBeInTheDocument();
  });
});
