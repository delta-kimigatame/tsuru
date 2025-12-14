import OtoRecord from "utauoto/dist/OtoRecord";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Note } from "../../../src/lib/Note";
import { DefaultPhonemizer } from "../../../src/lib/Phonemizer/DefaultPhonemizer";
import { BaseVoiceBank } from "../../../src/lib/VoiceBanks/BaseVoiceBank";

describe("DefaultPhonemizer", () => {
  const phonemizer = new DefaultPhonemizer();
  let vb: BaseVoiceBank;

  const createTestNote = (
    lyric: string,
    notenum: number = 60,
    tempo: number = 120,
    length: number = 480
  ): Note => {
    const note = new Note();
    note.lyric = lyric;
    note.tempo = tempo;
    note.notenum = notenum;
    note.length = length;
    note.phonemizer = phonemizer;
    return note;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vb = {
      getOtoRecord: vi.fn(),
    } as unknown as BaseVoiceBank;
  });

  describe("applyOto", () => {
    it("otoが見つかった場合、oto情報を設定する", () => {
      const note = createTestNote("あ");
      const mockOtoRecord = {
        alias: "あ",
        pre: 100,
        overlap: 50,
        offset: 10,
        velocity: 150,
        blank: 20,
        dirpath: "path/to",
        filename: "a.wav",
      } as OtoRecord;
      (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(
        mockOtoRecord
      );

      phonemizer.applyOto(note, vb);

      expect(vb.getOtoRecord).toHaveBeenCalledWith("あ", 60, "");
      expect(note.oto).toBe(mockOtoRecord);
      expect(note.otoPreutter).toBe(100);
      expect(note.otoOverlap).toBe(50);
      expect(note.atAlias).toBe("あ");
      expect(note.atFilename).toBe("path/to/a.wav");
    });

    it("otoが見つからなかった場合、デフォルト値を設定する", () => {
      const note = createTestNote("あ");
      (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(null);

      phonemizer.applyOto(note, vb);

      expect(note.oto).toBeUndefined();
      expect(note.otoPreutter).toBe(0);
      expect(note.otoOverlap).toBe(0);
      expect(note.atAlias).toBe("R");
      expect(note.atFilename).toBe("");
    });

    it("oto.aliasが空文字列の場合、lyricを使用する", () => {
      const note = createTestNote("い");
      const mockOtoRecord = {
        alias: "",
        pre: 100,
        overlap: 50,
        dirpath: "path/to",
        filename: "i.wav",
      } as OtoRecord;
      (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(
        mockOtoRecord
      );

      phonemizer.applyOto(note, vb);

      expect(note.atAlias).toBe("い");
    });

    it("voiceColorが設定されている場合、getOtoRecordに渡される", () => {
      const note = createTestNote("う");
      note.voiceColor = "power";
      const mockOtoRecord = {
        alias: "う",
        pre: 100,
        overlap: 50,
        dirpath: "",
        filename: "u.wav",
      } as OtoRecord;
      (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(
        mockOtoRecord
      );

      phonemizer.applyOto(note, vb);

      expect(vb.getOtoRecord).toHaveBeenCalledWith("う", 60, "power");
      expect(note.atFilename).toBe("u.wav");
    });

    it("lyricがundefinedの場合、エラーをスローする", () => {
      const note = createTestNote("あ");
      note.lyric = undefined;

      expect(() => phonemizer.applyOto(note, vb)).toThrow(
        "lyric is not initial."
      );
    });

    it("notenumがundefinedの場合、エラーをスローする", () => {
      const note = createTestNote("あ");
      (note as any)._notenum = undefined; // 内部プロパティを直接undefinedに設定

      expect(() => phonemizer.applyOto(note, vb)).toThrow(
        "notenum is not initial."
      );
    });
  });

  describe("autoFitParam", () => {
    it("prevがundefinedの場合、preutter/overlapをvelocityRateで調整する", () => {
      const note = createTestNote("あ");
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100; // velocityRate = 2^((100-100)/100) = 1.0

      phonemizer.autoFitParam(note);

      expect(note.atPreutter).toBe(100); // 100 * 1.0
      expect(note.atOverlap).toBe(50); // 50 * 1.0
      expect(note.atStp).toBe(0);
    });

    it("prevがundefinedでpreutter/overlapが設定されている場合、それを優先する", () => {
      const note = createTestNote("あ");
      note.preutter = 80;
      note.overlap = 40;
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer.autoFitParam(note);

      expect(note.atPreutter).toBe(80);
      expect(note.atOverlap).toBe(40);
    });

    it("prevがundefinedでstpが設定されている場合、atStpに反映される", () => {
      const note = createTestNote("あ");
      note.stp = 20;
      note.otoPreutter = 100;
      note.otoOverlap = 50;

      phonemizer.autoFitParam(note);

      expect(note.atStp).toBe(20);
    });

    it("prevがある場合、prevMsLengthに基づいて調整する", () => {
      const prevNote = createTestNote("か", 60, 120, 480);
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.prev = prevNote;
      note.otoPreutter = 200;
      note.otoOverlap = 100;
      note.velocity = 100;

      phonemizer.autoFitParam(note);

      // prevMsLength = 480ms * 0.5 = 240ms
      // realPreutter - realOverlap = 200 - 100 = 100
      // 240 < 100 は false なので、realPreutter/realOverlapをそのまま使用
      expect(note.atPreutter).toBe(200);
      expect(note.atOverlap).toBe(100);
      expect(note.atStp).toBe(0);
    });

    it("prevMsLengthがrealPreutter - realOverlapより小さい場合、調整される", () => {
      const prevNote = createTestNote("か", 60, 120, 60); // 短いノート
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.prev = prevNote;
      note.otoPreutter = 200;
      note.otoOverlap = 100;
      note.velocity = 100;
      note.stp = 10;

      phonemizer.autoFitParam(note);

      // length=60, tempo=120 → msLength = (60/120 * 60/480) * 1000 = 62.5ms
      // prevMsLength = 62.5ms * 0.5 = 31.25ms
      // realPreutter - realOverlap = 200 - 100 = 100
      // 31.25 < 100 なので調整が必要
      // atPreutter = (200 / 100) * 31.25 = 62.5
      // atOverlap = (100 / 100) * 31.25 = 31.25
      // atStp = 200 - 62.5 + 10 = 147.5
      expect(note.atPreutter).toBe(62.5);
      expect(note.atOverlap).toBe(31.25);
      expect(note.atStp).toBe(147.5);
    });

    it("prevが休符Rの場合、prevMsLengthの係数が1.0になる", () => {
      const prevNote = createTestNote("R", 60, 120, 480);
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.prev = prevNote;
      note.otoPreutter = 200;
      note.otoOverlap = 100;

      phonemizer.autoFitParam(note);

      // prevMsLength = 480ms * 1.0 = 480ms (休符なので係数1.0)
      expect(note.atPreutter).toBe(200);
      expect(note.atOverlap).toBe(100);
    });

    it("realPreutterまたはrealOverlapがNaNの場合、何も設定されない", () => {
      const prevNote = createTestNote("か", 60, 120, 480);
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.prev = prevNote;
      note.otoPreutter = undefined;
      note.otoOverlap = undefined;

      phonemizer.autoFitParam(note);

      // NaNの場合は何も設定されない
      expect(note.atPreutter).toBeUndefined();
      expect(note.atOverlap).toBeUndefined();
      expect(note.atStp).toBeUndefined();
    });

    it("prev.lengthがundefinedの場合、エラーをスローする", () => {
      const prevNote = createTestNote("か");
      (prevNote as any)._length = undefined; // 内部プロパティを直接undefinedに設定
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100;
      note.prev = prevNote;

      expect(() => phonemizer.autoFitParam(note)).toThrow(
        "prev length is not initial."
      );
    });

    it("prev.tempoがundefinedの場合、エラーをスローする", () => {
      const prevNote = createTestNote("か");
      (prevNote as any)._tempo = undefined; // 内部プロパティを直接undefinedに設定
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100;
      note.prev = prevNote;

      expect(() => phonemizer.autoFitParam(note)).toThrow(
        "prev tempo is not initial."
      );
    });

    it("prev.lyricがundefinedの場合、エラーをスローする", () => {
      const prevNote = createTestNote("か");
      prevNote.lyric = undefined;
      const note = createTestNote("き");
      note.prev = prevNote;

      expect(() => phonemizer.autoFitParam(note)).toThrow(
        "prev lyric is not initial."
      );
    });
  });

  describe("getLastPhoneme", () => {
    it("常に空文字列を返す", () => {
      const note = createTestNote("あ");
      expect(phonemizer.getLastPhoneme(note)).toBe("");
    });
  });

  describe("getLastLength", () => {
    it("note.msLengthを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      expect(phonemizer.getLastLength(note)).toBe(note.msLength);
    });
  });

  describe("getNotesCount", () => {
    it("常に1を返す", () => {
      const note = createTestNote("あ");
      expect(phonemizer.getNotesCount(vb, note)).toBe(1);
    });
  });
});
