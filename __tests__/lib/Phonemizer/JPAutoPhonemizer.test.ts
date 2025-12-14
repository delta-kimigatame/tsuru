import { beforeEach, describe, expect, it, vi } from "vitest";
import { Note } from "../../../src/lib/Note";
import { JPAutoPhonemizer } from "../../../src/lib/Phonemizer/JPAutoPhonemizer";
import { BaseVoiceBank } from "../../../src/lib/VoiceBanks/BaseVoiceBank";

describe("JPAutoPhonemizer", () => {
  const phonemizer = new JPAutoPhonemizer();
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

  describe("getLastPhoneme", () => {
    it("「あ」系の文字から母音「a」を抽出する", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("あ"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("か"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("さ"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("た"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("な"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("は"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("ま"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("や"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("ら"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("わ"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("が"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("ざ"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("だ"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("ば"))).toBe("a");
      expect(phonemizer.getLastPhoneme(createTestNote("ぱ"))).toBe("a");
    });

    it("「い」系の文字から母音「i」を抽出する", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("い"))).toBe("i");
      expect(phonemizer.getLastPhoneme(createTestNote("き"))).toBe("i");
      expect(phonemizer.getLastPhoneme(createTestNote("し"))).toBe("i");
      expect(phonemizer.getLastPhoneme(createTestNote("ち"))).toBe("i");
    });

    it("「う」系の文字から母音「u」を抽出する", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("う"))).toBe("u");
      expect(phonemizer.getLastPhoneme(createTestNote("く"))).toBe("u");
      expect(phonemizer.getLastPhoneme(createTestNote("す"))).toBe("u");
      expect(phonemizer.getLastPhoneme(createTestNote("つ"))).toBe("u");
    });

    it("「え」系の文字から母音「e」を抽出する", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("え"))).toBe("e");
      expect(phonemizer.getLastPhoneme(createTestNote("け"))).toBe("e");
      expect(phonemizer.getLastPhoneme(createTestNote("せ"))).toBe("e");
      expect(phonemizer.getLastPhoneme(createTestNote("て"))).toBe("e");
    });

    it("「お」系の文字から母音「o」を抽出する", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("お"))).toBe("o");
      expect(phonemizer.getLastPhoneme(createTestNote("こ"))).toBe("o");
      expect(phonemizer.getLastPhoneme(createTestNote("そ"))).toBe("o");
      expect(phonemizer.getLastPhoneme(createTestNote("と"))).toBe("o");
    });

    it("「ん」から「n」を抽出する", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("ん"))).toBe("n");
    });

    it("マッチしない場合は「-」を返す", () => {
      expect(phonemizer.getLastPhoneme(createTestNote("R"))).toBe("-");
      expect(phonemizer.getLastPhoneme(createTestNote(""))).toBe("-");
      expect(phonemizer.getLastPhoneme(undefined)).toBe("-");
    });
  });

  describe("getLastLength", () => {
    it("note.msLengthを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      // msLength = (60 / 120) * 480 / 480 * 1000 = 500ms
      expect(phonemizer.getLastLength(note)).toBe(500);
    });
  });

  describe("getNextConsonant", () => {
    it("CV文字から対応するConsonantParamを返す", () => {
      const note = createTestNote("か");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("k");
      expect(consonant?.type).toBe("stretch");
      expect(consonant?.lengthValue).toBe(100);
      expect(consonant?.crossfade).toBe(false);
    });

    it("「きゃ」から「ky」を抽出する", () => {
      const note = createTestNote("きゃ");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("ky");
      expect(consonant?.type).toBe("stretch");
      expect(consonant?.lengthValue).toBe(130);
    });

    it("「さ」から「s」を抽出する", () => {
      const note = createTestNote("さ");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("s");
      expect(consonant?.type).toBe("preutter");
      expect(consonant?.lengthValue).toBe(150);
      expect(consonant?.crossfade).toBe(true);
    });

    it("「ち」から「ch」を抽出する（preutter, crossfade=false）", () => {
      const note = createTestNote("ち");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("ch");
      expect(consonant?.type).toBe("preutter");
      expect(consonant?.lengthValue).toBe(150);
      expect(consonant?.crossfade).toBe(false);
    });

    it("「つ」から「ts」を抽出する", () => {
      const note = createTestNote("つ");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("ts");
      expect(consonant?.type).toBe("preutter");
      expect(consonant?.lengthValue).toBe(170);
    });

    it("「ば」から「b」を抽出する（stretch, crossfade=false）", () => {
      const note = createTestNote("ば");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("b");
      expect(consonant?.type).toBe("stretch");
      expect(consonant?.lengthValue).toBe(50);
      expect(consonant?.crossfade).toBe(false);
    });

    it("「ら」から「r」を抽出する（preutter, crossfade=true）", () => {
      const note = createTestNote("ら");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).not.toBeNull();
      expect(consonant?.consonant).toBe("r");
      expect(consonant?.type).toBe("preutter");
      expect(consonant?.lengthValue).toBe(70);
      expect(consonant?.crossfade).toBe(true);
    });

    it("VCV入力の場合はnullを返す", () => {
      const note = createTestNote("a か");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).toBeNull();
    });

    it("otoがVCV変換される場合はnullを返す", () => {
      const note = createTestNote("か");
      note.oto = {
        alias: "a か", // VCV変換済み
        pre: 100,
        overlap: 50,
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "aka.wav",
      };
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).toBeNull();
    });

    it("母音単独の場合はnullを返す", () => {
      const note = createTestNote("あ");
      const consonant = phonemizer.getNextConsonant(note);
      expect(consonant).toBeNull();
    });

    it("nullノートの場合はnullを返す", () => {
      const consonant = phonemizer.getNextConsonant(null as any);
      expect(consonant).toBeNull();
    });
  });

  describe("applyOto", () => {
    it("VCV音源でprevPhonemeからVCV化される", () => {
      const prevNote = createTestNote("あ");
      prevNote.phonemizer = phonemizer;

      const note = createTestNote("か");
      note.prev = prevNote;

      (vb.getOtoRecord as any).mockReturnValue({
        alias: "a か",
        pre: 120,
        overlap: 60,
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "test",
        filename: "test.wav",
      });

      phonemizer.applyOto(note, vb);

      // prevPhoneme = "a" なので "a か" を検索
      expect(vb.getOtoRecord).toHaveBeenCalled();
      expect(note.oto).not.toBeUndefined();
      expect(note.otoPreutter).toBe(120);
      expect(note.otoOverlap).toBe(60);
      expect(note.atAlias).toBe("a か");
      expect(note.atFilename).toBe("test/test.wav");
    });

    it("CV音源でフォールバックされる", () => {
      const prevNote = createTestNote("あ");
      prevNote.phonemizer = phonemizer;

      const note = createTestNote("か");
      note.prev = prevNote;

      // VCV検索: null, 母音結合: null, CV検索: 見つかる
      (vb.getOtoRecord as any)
        .mockReturnValueOnce(null) // suffix付きVCV
        .mockReturnValueOnce(null) // VCV
        .mockReturnValueOnce(null) // suffix付き母音結合
        .mockReturnValueOnce(null) // 母音結合
        .mockReturnValueOnce(null) // suffix付きCV
        .mockReturnValue({
          // CV
          alias: "か",
          pre: 100,
          overlap: 50,
          offset: 0,
          velocity: 150,
          blank: 0,
          dirpath: "",
          filename: "ka.wav",
        });

      phonemizer.applyOto(note, vb);

      expect(note.oto).not.toBeUndefined();
      expect(note.otoPreutter).toBe(100);
      expect(note.otoOverlap).toBe(50);
      expect(note.atAlias).toBe("か");
      expect(note.atFilename).toBe("ka.wav");
    });

    it("otoが見つからない場合、デフォルト値を設定する", () => {
      const note = createTestNote("未定義");
      (vb.getOtoRecord as any).mockReturnValue(null);

      phonemizer.applyOto(note, vb);

      expect(note.oto).toBeUndefined();
      expect(note.otoPreutter).toBe(0);
      expect(note.otoOverlap).toBe(0);
      expect(note.atAlias).toBe("R");
      expect(note.atFilename).toBe("");
    });

    it("voiceColorが設定されている場合、getOtoRecordに渡される", () => {
      const note = createTestNote("あ");
      note.voiceColor = "color1";

      (vb.getOtoRecord as any).mockReturnValue({
        alias: "あ",
        pre: 100,
        overlap: 50,
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "a.wav",
      });

      phonemizer.applyOto(note, vb);

      // voiceColorが渡されることを確認
      const calls = (vb.getOtoRecord as any).mock.calls;
      expect(calls.some((call: any[]) => call[2] === "color1")).toBe(true);
    });

    it("lyricがundefinedの場合、エラーをスローする", () => {
      const note = createTestNote("あ");
      (note as any)._lyric = undefined;

      expect(() => phonemizer.applyOto(note, vb)).toThrow(
        "lyric is not initial."
      );
    });

    it("notenumがundefinedの場合、エラーをスローする", () => {
      const note = createTestNote("あ");
      (note as any)._notenum = undefined;

      expect(() => phonemizer.applyOto(note, vb)).toThrow(
        "notenum is not initial."
      );
    });

    it("「!」マークがある場合、変換せずそのまま検索する", () => {
      const note = createTestNote("!あ");

      (vb.getOtoRecord as any).mockReturnValue({
        alias: "あ",
        pre: 100,
        overlap: 50,
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "a.wav",
      });

      phonemizer.applyOto(note, vb);

      // "!あ" → "あ" として検索される
      expect(vb.getOtoRecord).toHaveBeenCalled();
      expect(note.atAlias).toBe("あ");
    });
  });

  describe("autoFitParam", () => {
    it("prevがundefinedの場合、preutter/overlapをvelocityRateで調整する", () => {
      const note = createTestNote("あ");
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100;
      note.prev = undefined;

      phonemizer.autoFitParam(note);

      expect(note.atPreutter).toBe(100);
      expect(note.atOverlap).toBe(50);
      expect(note.atStp).toBe(0);
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

      // prevMsLength = 500ms * 0.5 = 250ms
      // realPreutter - realOverlap = 200 - 100 = 100
      // 250 > 100 なので調整されない
      expect(note.atPreutter).toBe(200);
      expect(note.atOverlap).toBe(100);
      expect(note.atStp).toBe(0);
    });

    it("prevMsLengthがrealPreutter - realOverlapより小さい場合、調整される", () => {
      const prevNote = createTestNote("か", 60, 120, 60);
      prevNote.phonemizer = phonemizer;
      const note = createTestNote("き");
      note.prev = prevNote;
      note.otoPreutter = 200;
      note.otoOverlap = 100;
      note.velocity = 100;
      note.stp = 10;

      phonemizer.autoFitParam(note);

      // length=60, tempo=120 → msLength = 62.5ms
      // prevMsLength = 62.5ms * 0.5 = 31.25ms
      // realPreutter - realOverlap = 200 - 100 = 100
      // 31.25 < 100 なので調整が必要
      expect(note.atPreutter).toBe(62.5);
      expect(note.atOverlap).toBe(31.25);
      expect(note.atStp).toBe(147.5);
    });

    it("自動クロスフェードが適用される(atOverlap >= 20)", () => {
      const prevNote = createTestNote("あ", 60, 120, 480);
      prevNote.phonemizer = phonemizer;
      prevNote.lyric = "あ"; // 非R

      const note = createTestNote("か");
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 60; // atOverlap = 60 >= 20
      note.velocity = 100;

      phonemizer.autoFitParam(note);

      // クロスフェードが適用される
      expect(prevNote.envelope).toBeDefined();
      expect(note.envelope).toBeDefined();
      expect(prevNote.envelope?.point[2]).toBe(60); // atOverlap
      expect(prevNote.envelope?.value[2]).toBe(100);
      expect(prevNote.envelope?.point[3]).toBe(0);
      expect(prevNote.envelope?.value[3]).toBe(0);
      expect(note.envelope?.point[1]).toBe(60);
      expect(note.envelope?.value[1]).toBe(100);
      expect(note.envelope?.point[0]).toBe(0);
      expect(note.envelope?.value[0]).toBe(0);
    });

    it("prev.lyricが「R」の場合、クロスフェードは適用されない", () => {
      const prevNote = createTestNote("R", 60, 120, 480);
      prevNote.phonemizer = phonemizer;

      const note = createTestNote("か");
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 60;
      note.velocity = 100;

      phonemizer.autoFitParam(note);

      // Rなのでクロスフェードは適用されない
      expect(prevNote.envelope).toBeUndefined();
      expect(note.envelope).toBeUndefined();
    });

    it("atOverlap < 20の場合、クロスフェードは適用されない", () => {
      const prevNote = createTestNote("あ", 60, 120, 480);
      prevNote.phonemizer = phonemizer;

      const note = createTestNote("か");
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 10; // atOverlap = 10 < 20
      note.velocity = 100;

      phonemizer.autoFitParam(note);

      // atOverlap < 20なのでクロスフェードは適用されない
      expect(prevNote.envelope).toBeUndefined();
      expect(note.envelope).toBeUndefined();
    });
  });

  describe("getNotesCount", () => {
    it("next.consonantが存在せず、VC音源がない場合は1を返す", () => {
      const note = createTestNote("あ");
      note.notenum = 60;

      // nextConsonantがnullの場合
      (vb.getOtoRecord as any).mockReturnValue(null);

      expect(phonemizer.getNotesCount(vb, note)).toBe(1);
    });

    it("next.consonantが存在し、VC音源がある場合は2を返す", () => {
      const note = createTestNote("あ");
      note.notenum = 60;

      const nextNote = createTestNote("か");
      note.next = nextNote;

      // VC音源が存在する
      (vb.getOtoRecord as any).mockReturnValue({
        alias: "a k",
        pre: 50,
        overlap: 25,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "ak.wav",
      });

      expect(phonemizer.getNotesCount(vb, note)).toBe(2);
    });

    it("next.consonantが存在するがVC音源がない場合は1を返す", () => {
      const note = createTestNote("あ");
      note.notenum = 60;

      const nextNote = createTestNote("か");
      note.next = nextNote;

      // VC音源が存在しない
      (vb.getOtoRecord as any).mockReturnValue(null);

      expect(phonemizer.getNotesCount(vb, note)).toBe(1);
    });
  });

  describe("getVCTargetLength", () => {
    it("type=stretchでblankが負の場合、blank絶対値 - preを返す", () => {
      const note = createTestNote("あ");
      const vcOtoRecord = {
        alias: "a k",
        pre: 50,
        overlap: 25,
        offset: 0,
        velocity: 100,
        blank: -200, // 負の場合: offsetからblankまでの長さ
        dirpath: "",
        filename: "ak.wav",
      };
      const consonantParam = {
        consonant: "k",
        cvs: ["k", "か", "く", "け", "こ"],
        type: "stretch" as const,
        lengthValue: 100,
        crossfade: false,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // |blank| - pre = 200 - 50 = 150
      expect(length).toBe(150);
    });

    it("type=stretchでnextが存在し、next.oto.overlapが負の場合", () => {
      const note = createTestNote("あ");
      const nextNote = createTestNote("か");
      nextNote.oto = {
        alias: "か",
        pre: 120,
        overlap: -30, // 負のoverlap
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "ka.wav",
      };
      note.next = nextNote;

      const vcOtoRecord = {
        alias: "a k",
        pre: 50,
        overlap: 25,
        offset: 0,
        velocity: 100,
        blank: 0, // 正の場合
        dirpath: "",
        filename: "ak.wav",
      };
      const consonantParam = {
        consonant: "k",
        cvs: ["k", "か", "く", "け", "こ"],
        type: "stretch" as const,
        lengthValue: 100,
        crossfade: false,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // next.oto.pre - next.oto.overlap = 120 - (-30) = 150
      expect(length).toBe(150);
    });

    it("type=stretchでnextが存在し、blankが正の場合、next.oto.preを返す", () => {
      const note = createTestNote("あ");
      const nextNote = createTestNote("か");
      nextNote.oto = {
        alias: "か",
        pre: 120,
        overlap: 50,
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "ka.wav",
      };
      note.next = nextNote;

      const vcOtoRecord = {
        alias: "a k",
        pre: 50,
        overlap: 25,
        offset: 0,
        velocity: 100,
        blank: 100, // 正の場合
        dirpath: "",
        filename: "ak.wav",
      };
      const consonantParam = {
        consonant: "k",
        cvs: ["k", "か", "く", "け", "こ"],
        type: "stretch" as const,
        lengthValue: 100,
        crossfade: false,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // next.oto.pre = 120
      expect(length).toBe(120);
    });

    it("type=preutterでnextが存在する場合、next.oto.preを返す", () => {
      const note = createTestNote("あ");
      const nextNote = createTestNote("さ");
      nextNote.oto = {
        alias: "さ",
        pre: 150,
        overlap: 60,
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "sa.wav",
      };
      note.next = nextNote;

      const vcOtoRecord = {
        alias: "a s",
        pre: 80,
        overlap: 40,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "as.wav",
      };
      const consonantParam = {
        consonant: "s",
        cvs: ["s", "さ", "すぃ", "す", "せ", "そ"],
        type: "preutter" as const,
        lengthValue: 150,
        crossfade: true,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // next.oto.pre = 150
      expect(length).toBe(150);
    });

    it("type=preutterでnext.oto.overlapが負の場合、pre - overlapを返す", () => {
      const note = createTestNote("あ");
      const nextNote = createTestNote("さ");
      nextNote.oto = {
        alias: "さ",
        pre: 150,
        overlap: -20, // 負のoverlap
        offset: 0,
        velocity: 150,
        blank: 0,
        dirpath: "",
        filename: "sa.wav",
      };
      note.next = nextNote;

      const vcOtoRecord = {
        alias: "a s",
        pre: 80,
        overlap: 40,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "as.wav",
      };
      const consonantParam = {
        consonant: "s",
        cvs: ["s", "さ", "すぃ", "す", "せ", "そ"],
        type: "preutter" as const,
        lengthValue: 150,
        crossfade: true,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // next.oto.pre - next.oto.overlap = 150 - (-20) = 170
      expect(length).toBe(170);
    });

    it("type=preutterでnextがない場合、lengthValueを返す", () => {
      const note = createTestNote("あ");
      // note.next = undefined

      const vcOtoRecord = {
        alias: "a s",
        pre: 80,
        overlap: 40,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "as.wav",
      };
      const consonantParam = {
        consonant: "s",
        cvs: ["s", "さ", "すぃ", "す", "せ", "そ"],
        type: "preutter" as const,
        lengthValue: 150,
        crossfade: true,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // lengthValue = 150
      expect(length).toBe(150);
    });

    it("type=valueの場合、consonantParamのlengthValueを返す", () => {
      const note = createTestNote("あ");

      const vcOtoRecord = {
        alias: "a x",
        pre: 80,
        overlap: 40,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "ax.wav",
      };
      const consonantParam = {
        consonant: "x",
        cvs: ["x", "xa"],
        type: "value" as const,
        lengthValue: 200,
        crossfade: false,
      };

      const length = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );
      // lengthValue = 200
      expect(length).toBe(200);
    });
  });

  describe("vcAutoFitParam", () => {
    it("prevMsLength >= realPreutter - realOverlapの場合、そのまま返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      // msLength = 500ms
      const vcOtoRecord = {
        alias: "a k",
        pre: 100,
        overlap: 50,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "ak.wav",
      };
      const vcTargetNoteLength = 200;

      const result = phonemizer.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );

      // prevMsLength = 500 - 200 = 300ms
      // realPreutter - realOverlap = 100 - 50 = 50ms
      // 300 >= 50 なので調整不要
      expect(result.preutter).toBe(100);
      expect(result.overlap).toBe(50);
      expect(result.stp).toBe(0);
    });

    it("prevMsLength < realPreutter - realOverlapの場合、比例計算される", () => {
      const note = createTestNote("あ", 60, 120, 480);
      // msLength = 500ms
      const vcOtoRecord = {
        alias: "a k",
        pre: 200,
        overlap: 100,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "ak.wav",
      };
      const vcTargetNoteLength = 450;

      const result = phonemizer.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );

      // prevMsLength = 500 - 450 = 50ms
      // realPreutter - realOverlap = 200 - 100 = 100ms
      // 50 < 100 なので調整必要
      // preutter = (200 / 100) * 50 = 100
      // overlap = (100 / 100) * 50 = 50
      // stp = 200 - 100 + 0 = 100
      expect(result.preutter).toBe(100);
      expect(result.overlap).toBe(50);
      expect(result.stp).toBe(100);
    });

    it("realPreutterまたはrealOverlapがNaNの場合、デフォルト値を返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      const vcOtoRecord = {
        alias: "a k",
        pre: NaN, // NaN
        overlap: 50,
        offset: 0,
        velocity: 100,
        blank: 0,
        dirpath: "",
        filename: "ak.wav",
      };
      const vcTargetNoteLength = 200;

      const result = phonemizer.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );

      // NaNなので何も設定されない
      expect(result.preutter).toBe(0);
      expect(result.overlap).toBe(0);
      expect(result.stp).toBe(0);
    });
  });
});
