import { beforeEach, describe, expect, it } from "vitest";
import { Note } from "../../src/lib/Note";
import { resampCache } from "../../src/lib/ResampCache";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { ResampRequest } from "../../src/types/request";

// ダミーのwpの変換関数を設定
beforeEach(() => {
  resampCache.clear();
});

describe("ResampCache", () => {
  it("createKeyで正しいキー文字列が生成される", () => {
    const dummyRequest: ResampRequest = {
      inputWav: "path/to/wav",
      targetTone: "C4",
      velocity: 100,
      flags: "flag",
      offsetMs: 0,
      targetMs: 1000,
      fixedMs: 0,
      cutoffMs: 50,
      intensity: 80,
      modulation: 20,
      tempo: "120",
      pitches: "abc",
    };
    const key = resampCache.createKey(dummyRequest);
    expect(key).toBe("path/to/wav|C4|100|flag|0|1000|0|50|80|20|120|abc");
  });

  it("checkKeyはキャッシュ未登録の場合falseを返す", () => {
    expect(resampCache.checkKey(0, "anykey")).toBe(false);
  });

  it("setとgetでデータが正しく保存・取得される", () => {
    const dummyRequest: ResampRequest = {
      inputWav: "path/to/wav",
      targetTone: "C4",
      velocity: 100,
      flags: "flag",
      offsetMs: 0,
      targetMs: 1000,
      fixedMs: 0,
      cutoffMs: 50,
      intensity: 80,
      modulation: 20,
      tempo: "120",
      pitches: "abc",
    };
    const key = resampCache.createKey(dummyRequest);
    const inputData = new Float64Array([0.5, -0.5]);
    resampCache.set(0, key, inputData);
    expect(
      resampCache.checkKey(
        0,
        "path/to/wav|C4|100|flag|0|1000|0|50|80|20|120|abc"
      )
    ).toBe(true);
    // getでLogicalNormalizeが働き、結果が [0.5, -0.5] に戻ることを確認
    const retrieved = resampCache.get(0, key);
    expect(Array.from(retrieved!)).toEqual([0.5, -0.5]);
  });

  it("checkNoteはresampが存在しない場合falseを返す", () => {
    const note = new Note();
    // simulate getRequestParam returning resamp: undefined
    note.getRequestParam = () => [{ resamp: undefined }];
    const dummyVB = {} as VoiceBank;
    const dummyDefault = {} as any;
    expect(resampCache.checkNote(note, dummyVB, "", dummyDefault)).toBe(false);
  });

  it("clearでキャッシュが全て削除される", () => {
    const dummyRequest: ResampRequest = {
      inputWav: "path/to/wav",
      targetTone: "C4",
      velocity: 100,
      flags: "flag",
      offsetMs: 0,
      targetMs: 1000,
      fixedMs: 0,
      cutoffMs: 50,
      intensity: 80,
      modulation: 20,
      tempo: "120",
      pitches: "abc",
    };
    const key = resampCache.createKey(dummyRequest);
    resampCache.set(0, key, new Float64Array([0.5, -0.5]));
    expect(resampCache.checkKey(0, key)).toBe(true);
    resampCache.clear();
    expect(resampCache.checkKey(0, key)).toBe(false);
  });

  it("clearByIndicesで指定したインデックスのキャッシュのみ削除される", () => {
    const dummyRequest1: ResampRequest = {
      inputWav: "path/to/wav1",
      targetTone: "C4",
      velocity: 100,
      flags: "flag",
      offsetMs: 0,
      targetMs: 1000,
      fixedMs: 0,
      cutoffMs: 50,
      intensity: 80,
      modulation: 20,
      tempo: "120",
      pitches: "abc",
    };
    const dummyRequest2: ResampRequest = {
      inputWav: "path/to/wav2",
      targetTone: "D4",
      velocity: 100,
      flags: "flag",
      offsetMs: 0,
      targetMs: 1000,
      fixedMs: 0,
      cutoffMs: 50,
      intensity: 80,
      modulation: 20,
      tempo: "120",
      pitches: "def",
    };
    const key1 = resampCache.createKey(dummyRequest1);
    const key2 = resampCache.createKey(dummyRequest2);
    resampCache.set(0, key1, new Float64Array([0.5, -0.5]));
    resampCache.set(1, key2, new Float64Array([0.3, -0.3]));
    resampCache.set(2, key1, new Float64Array([0.7, -0.7]));

    expect(resampCache.checkKey(0, key1)).toBe(true);
    expect(resampCache.checkKey(1, key2)).toBe(true);
    expect(resampCache.checkKey(2, key1)).toBe(true);

    resampCache.clearByIndices([0, 2]);

    expect(resampCache.checkKey(0, key1)).toBe(false);
    expect(resampCache.checkKey(1, key2)).toBe(true);
    expect(resampCache.checkKey(2, key1)).toBe(false);
  });

  it("getByIndexで指定したインデックスのキャッシュデータを取得できる", () => {
    const dummyRequest: ResampRequest = {
      inputWav: "path/to/wav",
      targetTone: "C4",
      velocity: 100,
      flags: "flag",
      offsetMs: 0,
      targetMs: 1000,
      fixedMs: 0,
      cutoffMs: 50,
      intensity: 80,
      modulation: 20,
      tempo: "120",
      pitches: "abc",
    };
    const key = resampCache.createKey(dummyRequest);
    const inputData = new Float64Array([0.5, -0.5]);
    resampCache.set(0, key, inputData);

    const result = resampCache.getByIndex(0);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Int16Array);
    // Int16Arrayとして格納されているので、元のFloat64Arrayとは異なる
    expect(result!.length).toBeGreaterThan(0);
  });

  it("getByIndexで存在しないインデックスの場合undefinedを返す", () => {
    const result = resampCache.getByIndex(999);
    expect(result).toBeUndefined();
  });
});
