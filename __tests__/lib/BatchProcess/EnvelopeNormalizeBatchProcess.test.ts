import { beforeEach, describe, expect, it } from "vitest";
import { EnvelopeNormalizeBatchProcess } from "../../../src/lib/BatchProcess/EnvelopeNormalizeBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

/**
 * outputMsを返すために最低限必要なパラメータの規定
 * length=480,tempo=120,atPreutter=undefined,next=undefinedの場合500が返る
 * */
const createBaseNote = (): Note => {
  const n = new Note();
  n.length = 480;
  n.tempo = 120;
  return n;
};

describe("EnvelopeNormalizeBatchProcess", () => {
  const bp = new EnvelopeNormalizeBatchProcess();
  beforeEach(() => {
    undoManager.clear();
  });
  it("エンベロープの破綻を正規化", () => {
    const notes = new Array<Note>();
    notes.push(createBaseNote());
    notes.push(createBaseNote());
    notes.push(createBaseNote());
    // 3点エンベロープで合計が1000
    notes[0].setEnvelope({ point: [250, 250, 500], value: [0, 100, 100, 0] });
    // 4点エンベロープで合計が1000
    notes[1].setEnvelope({
      point: [100, 200, 300, 400],
      value: [0, 100, 100, 0],
    });
    // 5点エンベロープで合計が1000
    notes[2].setEnvelope({
      point: [100, 200, 300, 200, 200],
      value: [0, 100, 100, 0, 100],
    });
    const result = bp.process(notes);
    expect(result[0].envelope.point).toEqual([125, 125, 250]);
    expect(result[1].envelope.point).toEqual([50, 100, 150, 200]);
    expect(result[2].envelope.point).toEqual([50, 100, 150, 100, 100]);
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("エンベロープ正規化しないパターン", () => {
    const notes = new Array<Note>();
    notes.push(createBaseNote());
    notes.push(createBaseNote());
    notes.push(createBaseNote());
    // 3点エンベロープで合計が1000であるが、歌詞が休符
    notes[0].setEnvelope({ point: [250, 250, 500], value: [0, 100, 100, 0] });
    notes[0].lyric = "R";
    // notes[1]エンベロープが未定義
    // 5点エンベロープで合計が500
    notes[2].setEnvelope({
      point: [50, 100, 150, 100, 100],
      value: [0, 100, 100, 0, 100],
    });
    const result = bp.process(notes);
    expect(result[0].envelope.point).toEqual([250, 250, 500]);
    expect(result[1].envelope).toBeUndefined();
    expect(result[2].envelope.point).toEqual([50, 100, 150, 100, 100]);
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
});
