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
  it("createKeyが正しいキー文字列を生成する", () => {
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
});
