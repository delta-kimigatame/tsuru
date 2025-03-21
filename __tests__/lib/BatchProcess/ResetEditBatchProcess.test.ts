import { beforeEach, describe, expect, it } from "vitest";
import { ResetEditBatchProcess } from "../../../src/lib/BatchProcess/ResetEditBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();
  // 最小構成のノートの追加
  notes.push(new Note());
  notes[0].index = 0;
  notes[0].notenum = 60;
  notes[0].lyric = "R";
  notes[0].length = 480;
  notes[0].tempo = 150;
  notes[0].hasTempo = false;
  notes.push(new Note());
  notes[1].index = 1;
  notes[1].notenum = 60;
  notes[1].lyric = "あ";
  notes[1].length = 480;
  notes[1].tempo = 150;
  notes[1].hasTempo = false;
  notes[1].preutter = 1.1;
  notes[1].overlap = 1.2;
  notes[1].stp = 1.3;
  notes[1].velocity = 120;
  notes[1].intensity = 121;
  notes[1].modulation = 122;
  notes[1].setPitches([0, 0]);
  notes[1].setPbw([100, 100]);
  notes[1].setPby([10, 10]);
  notes[1].setPbm(["", "j"]);
  notes[1].pbsHeight = 5;
  notes[1].pbsTime = -5;
  notes[1].flags = "g-1";
  notes[1].vibrato = "1,64,5,4,5,6,7,0";
  notes[1].setEnvelope({ point: [0, 5, 35], value: [0, 100, 100, 0] });
  notes[1].label = "ラベル1";
  notes[1].region = "region1";
  notes[1].regionEnd = "regionEnd1";
  notes.push(new Note());
  notes[2].index = 2;
  notes[2].notenum = 61;
  notes[2].lyric = "い";
  notes[2].length = 240;
  notes[2].tempo = 120;
  notes[2].hasTempo = true;
  notes[2].preutter = 2.1;
  notes[2].overlap = 2.2;
  notes[2].stp = 2.3;
  notes[2].velocity = 150;
  notes[2].intensity = 151;
  notes[2].modulation = 152;
  notes[2].setPitches([1, 1]);
  notes[2].setPbw([200, 200]);
  notes[2].setPby([20, 20]);
  notes[2].setPbm(["r", "s"]);
  notes[2].pbsHeight = 3;
  notes[2].pbsTime = -3;
  notes[2].flags = "g-2";
  notes[2].vibrato = "2,65,6,7,8,9,10,0";
  notes[2].setEnvelope({ point: [1, 6, 36], value: [1, 99, 99, 1] });
  notes[2].label = "ラベル2";
  notes[2].region = "region2";
  notes[2].regionEnd = "regionEnd2";
  return notes;
};

describe("ResetEditBatchProcess", () => {
  const bp = new ResetEditBatchProcess();
  beforeEach(() => {
    /** 各テスト実行前にundoManagerを初期化しておく */
    undoManager.clear();
  });

  it("全てのオプションがtrueの場合", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: true,
      pitch: true,
      intensity: true,
      flags: true,
      velocity: true,
      envelope: true,
      vibrato: true,
      modulation: true,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBeUndefined();
      expect(r.region).toBeUndefined();
      expect(r.regionEnd).toBeUndefined();
      /** pitch */
      expect(r.pitches).toBeUndefined();
      expect(r.pbStart).toBeUndefined();
      expect(r.pbs).toBeUndefined();
      expect(r.pbsTime).toBeUndefined();
      expect(r.pbsHeight).toBeUndefined();
      expect(r.pby).toBeUndefined();
      expect(r.pbm).toBeUndefined();
      expect(r.pbw).toBeUndefined();
      /** flags */
      expect(r.flags).toBeUndefined();
      /** intensity */
      expect(r.intensity).toBeUndefined();
      /** velocity */
      expect(r.velocity).toBeUndefined();
      /** envelope */
      expect(r.envelope).toBeUndefined();
      /** vibrato */
      expect(r.vibrato).toBeUndefined();
      expect(r.vibratoCycle).toBeUndefined();
      expect(r.vibratoDepth).toBeUndefined();
      expect(r.vibratoFadeInTime).toBeUndefined();
      expect(r.vibratoFadeOutTime).toBeUndefined();
      expect(r.vibratoHeight).toBeUndefined();
      expect(r.vibratoLength).toBeUndefined();
      expect(r.vibratoPhase).toBeUndefined();
      /** modulation */
      expect(r.modulation).toBeUndefined();
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("全てのオプションがfalseの場合", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: false,
      flags: false,
      velocity: false,
      envelope: false,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:infoのみがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: true,
      pitch: false,
      intensity: false,
      flags: false,
      velocity: false,
      envelope: false,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBeUndefined();
      expect(r.region).toBeUndefined();
      expect(r.regionEnd).toBeUndefined();
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:pitchのみがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: true,
      intensity: false,
      flags: false,
      velocity: false,
      envelope: false,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toBeUndefined();
      expect(r.pbStart).toBeUndefined();
      expect(r.pbs).toBeUndefined();
      expect(r.pbsTime).toBeUndefined();
      expect(r.pbsHeight).toBeUndefined();
      expect(r.pby).toBeUndefined();
      expect(r.pbm).toBeUndefined();
      expect(r.pbw).toBeUndefined();
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:flagsのみがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: false,
      flags: true,
      velocity: false,
      envelope: false,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBeUndefined();
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:intensityのみがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: true,
      flags: false,
      velocity: false,
      envelope: false,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBeUndefined();
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:velocityのみがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: false,
      flags: false,
      velocity: true,
      envelope: false,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBeUndefined();
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:envelopeがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: false,
      flags: false,
      velocity: false,
      envelope: true,
      vibrato: false,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toBeUndefined();
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:vibratoがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: false,
      flags: false,
      velocity: false,
      envelope: false,
      vibrato: true,
      modulation: false,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toBeUndefined();
      expect(r.vibratoCycle).toBeUndefined();
      expect(r.vibratoDepth).toBeUndefined();
      expect(r.vibratoFadeInTime).toBeUndefined();
      expect(r.vibratoFadeOutTime).toBeUndefined();
      expect(r.vibratoHeight).toBeUndefined();
      expect(r.vibratoLength).toBeUndefined();
      expect(r.vibratoPhase).toBeUndefined();
      /** modulation */
      expect(r.modulation).toBe(notes[i].modulation);
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
  it("オプション:modulationのみがtrue", () => {
    const notes = createTestNotes();
    const result = bp.process(notes, {
      info: false,
      pitch: false,
      intensity: false,
      flags: false,
      velocity: false,
      envelope: false,
      vibrato: false,
      modulation: true,
    });
    result.forEach((r, i) => {
      /** オプションに依存しない項目 */
      expect(r.index).toBe(notes[i].index);
      expect(r.lyric).toBe(notes[i].lyric);
      expect(r.length).toBe(notes[i].length);
      expect(r.tempo).toBe(notes[i].tempo);
      expect(r.hasTempo).toBe(notes[i].hasTempo);
      expect(r.preutter).toBeUndefined();
      expect(r.overlap).toBeUndefined();
      expect(r.stp).toBeUndefined();
      /** info */
      expect(r.label).toBe(notes[i].label);
      expect(r.region).toBe(notes[i].region);
      expect(r.regionEnd).toBe(notes[i].regionEnd);
      /** pitch */
      expect(r.pitches).toEqual(notes[i].pitches);
      expect(r.pbStart).toBe(notes[i].pbStart);
      expect(r.pbs).toEqual(notes[i].pbs);
      expect(r.pbsTime).toBe(notes[i].pbsTime);
      expect(r.pbsHeight).toBe(notes[i].pbsHeight);
      expect(r.pby).toEqual(notes[i].pby);
      expect(r.pbm).toEqual(notes[i].pbm);
      expect(r.pbw).toEqual(notes[i].pbw);
      /** flags */
      expect(r.flags).toBe(notes[i].flags);
      /** intensity */
      expect(r.intensity).toBe(notes[i].intensity);
      /** velocity */
      expect(r.velocity).toBe(notes[i].velocity);
      /** envelope */
      expect(r.envelope).toEqual(notes[i].envelope);
      /** vibrato */
      expect(r.vibrato).toEqual(notes[i].vibrato);
      expect(r.vibratoCycle).toBe(notes[i].vibratoCycle);
      expect(r.vibratoDepth).toBe(notes[i].vibratoDepth);
      expect(r.vibratoFadeInTime).toBe(notes[i].vibratoFadeInTime);
      expect(r.vibratoFadeOutTime).toBe(notes[i].vibratoFadeOutTime);
      expect(r.vibratoHeight).toBe(notes[i].vibratoHeight);
      expect(r.vibratoLength).toBe(notes[i].vibratoLength);
      expect(r.vibratoPhase).toBe(notes[i].vibratoPhase);
      /** modulation */
      expect(r.modulation).toBeUndefined();
    });
    const undo = undoManager.undo();
    expect(undo).toEqual(notes);
    const redo = undoManager.redo();
    expect(redo).toEqual(result);
  });
});
