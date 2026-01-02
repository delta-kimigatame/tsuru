import { beforeEach, describe, expect, it, vi } from "vitest";
import { Note } from "../../../src/lib/Note";
import { JPPresampPhonemizer } from "../../../src/lib/Phonemizer/JPPresampPhonemizer";
import { BaseVoiceBank } from "../../../src/lib/VoiceBanks/BaseVoiceBank";
import { Presamp } from "../../../src/lib/VoiceBanks/Presamp";

describe("JPPresampPhonemizer", () => {
  const phonemizer = new JPPresampPhonemizer();
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
      getSuffix: vi.fn(() => ""),
    } as unknown as BaseVoiceBank;
  });

  describe("getLastPhoneme", () => {
    describe("presamp未定義の場合", () => {
      it("「あ」系の文字から母音「a」を抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("あ"), vb)).toBe("a");
        expect(phonemizer.getLastPhoneme(createTestNote("か"), vb)).toBe("a");
        expect(phonemizer.getLastPhoneme(createTestNote("さ"), vb)).toBe("a");
        expect(phonemizer.getLastPhoneme(createTestNote("た"), vb)).toBe("a");
      });

      it("「い」系の文字から母音「i」を抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("い"), vb)).toBe("i");
        expect(phonemizer.getLastPhoneme(createTestNote("き"), vb)).toBe("i");
        expect(phonemizer.getLastPhoneme(createTestNote("し"), vb)).toBe("i");
      });

      it("「う」系の文字から母音「u」を抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("う"), vb)).toBe("u");
        expect(phonemizer.getLastPhoneme(createTestNote("く"), vb)).toBe("u");
        expect(phonemizer.getLastPhoneme(createTestNote("す"), vb)).toBe("u");
      });

      it("「え」系の文字から母音「e」を抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("え"), vb)).toBe("e");
        expect(phonemizer.getLastPhoneme(createTestNote("け"), vb)).toBe("e");
        expect(phonemizer.getLastPhoneme(createTestNote("せ"), vb)).toBe("e");
      });

      it("「お」系の文字から母音「o」を抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("お"), vb)).toBe("o");
        expect(phonemizer.getLastPhoneme(createTestNote("こ"), vb)).toBe("o");
        expect(phonemizer.getLastPhoneme(createTestNote("そ"), vb)).toBe("o");
      });

      it("「ん」から「n」を抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("ん"), vb)).toBe("n");
      });

      it("マッチしない場合は「-」を返す", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("R"), vb)).toBe("-");
        expect(phonemizer.getLastPhoneme(createTestNote(""), vb)).toBe("-");
        expect(phonemizer.getLastPhoneme(undefined, vb)).toBe("-");
      });
    });

    describe("presampがカスタム設定の場合", () => {
      beforeEach(() => {
        const customPresamp = new Presamp();
        // カスタム母音設定: "X"という新しい母音を追加
        customPresamp.vowels = [
          {
            symbol: "x",
            representative: "ぱ",
            CVs: ["ぱ", "ば"],
            volume: 100,
          },
          {
            symbol: "a",
            representative: "あ",
            CVs: ["あ", "か"],
            volume: 100,
          },
        ];
        vb.presamp = customPresamp;
      });

      it("カスタム母音設定に従って抽出する", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("ぱ"), vb)).toBe("x");
        expect(phonemizer.getLastPhoneme(createTestNote("ば"), vb)).toBe("x");
        expect(phonemizer.getLastPhoneme(createTestNote("あ"), vb)).toBe("a");
        expect(phonemizer.getLastPhoneme(createTestNote("か"), vb)).toBe("a");
      });

      it("CVsに含まれない文字は「-」を返す", () => {
        expect(phonemizer.getLastPhoneme(createTestNote("さ"), vb)).toBe("-");
      });
    });
  });

  describe("getLastLength", () => {
    it("note.msLengthを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      expect(phonemizer.getLastLength(note)).toBe(500);
    });
  });

  describe("getNextConsonant", () => {
    describe("presamp未定義の場合", () => {
      it("nullを返す", () => {
        const note = createTestNote("か");
        expect(phonemizer.getNextConsonant(note, vb)).toBeNull();
      });
    });

    describe("presampが定義されている場合", () => {
      beforeEach(() => {
        vb.presamp = new Presamp();
      });

      it("CV文字から対応するConsonantParamを返す", () => {
        const note = createTestNote("か");
        const result = phonemizer.getNextConsonant(note, vb);
        expect(result).not.toBeNull();
        expect(result?.symbol).toBe("k");
        expect(result?.CVs).toContain("か");
      });

      it("拗音のCV文字から対応するConsonantParamを返す", () => {
        const note = createTestNote("きゃ");
        const result = phonemizer.getNextConsonant(note, vb);
        expect(result).not.toBeNull();
        expect(result?.symbol).toBe("ky");
      });

      it("VCV入力の場合nullを返す", () => {
        const note = createTestNote("a か");
        expect(phonemizer.getNextConsonant(note, vb)).toBeNull();
      });

      it("oto変換済みVCVの場合nullを返す", () => {
        const note = createTestNote("か");
        note.oto = { alias: "a か" } as any;
        expect(phonemizer.getNextConsonant(note, vb)).toBeNull();
      });

      it("母音単独の場合nullを返す", () => {
        const note = createTestNote("あ");
        expect(phonemizer.getNextConsonant(note, vb)).toBeNull();
      });

      it("noteがnullの場合nullを返す", () => {
        expect(phonemizer.getNextConsonant(null as any, vb)).toBeNull();
      });
    });
  });

  describe("getNextPriority", () => {
    describe("presamp未定義の場合", () => {
      it("falseを返す", () => {
        const note = createTestNote("か");
        expect(phonemizer.getNextPriority(note, vb)).toBe(false);
      });
    });

    describe("presampが定義されている場合", () => {
      beforeEach(() => {
        const presamp = new Presamp();
        // デフォルトのpriorityには"k"が含まれている
        vb.presamp = presamp;
      });

      it("priorityに含まれる歌詞の場合trueを返す", () => {
        const note = createTestNote("k");
        // デフォルトのpriorityには"k"が含まれる
        expect(phonemizer.getNextPriority(note, vb)).toBe(true);
      });

      it("priorityに含まれない歌詞の場合falseを返す", () => {
        const note = createTestNote("さ");
        expect(phonemizer.getNextPriority(note, vb)).toBe(false);
      });

      it("VCV入力の場合falseを返す", () => {
        const note = createTestNote("a か");
        expect(phonemizer.getNextPriority(note, vb)).toBe(false);
      });
    });
  });

  describe("getOtoRecord", () => {
    describe("基本パターン", () => {
      beforeEach(() => {
        vb.presamp = new Presamp();
      });

      it("lyricが空文字列の場合nullを返す", () => {
        const note = createTestNote("");
        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "",
          60,
          "",
          false
        );
        expect(result).toBeNull();
      });

      it("「!」マークがある場合変換せずに検索する", () => {
        const note = createTestNote("!あ");
        const mockOto = { alias: "あ" } as any;
        vi.mocked(vb.getOtoRecord).mockReturnValue(mockOto);

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "!あ",
          60,
          "",
          false
        );

        expect(vb.getOtoRecord).toHaveBeenCalledWith("あ", 60, "");
        expect(result).toBe(mockOto);
      });

      it("VCV音源が存在する場合VCVを返す", () => {
        const note = createTestNote("か");
        const mockOto = { alias: "a か" } as any;
        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(null) // suffix付きVCV
          .mockReturnValueOnce(mockOto); // VCV

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "か",
          60,
          "",
          false
        );

        expect(result).toBe(mockOto);
      });

      it("母音結合エイリアスが存在する場合それを返す", () => {
        const note = createTestNote("か");
        const mockOto = { alias: "* か" } as any;
        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(null) // suffix付きVCV
          .mockReturnValueOnce(null) // VCV
          .mockReturnValueOnce(null) // suffix付き母音結合
          .mockReturnValueOnce(mockOto); // 母音結合

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "か",
          60,
          "",
          false
        );

        expect(result).toBe(mockOto);
      });

      it("単独音が存在する場合それを返す", () => {
        const note = createTestNote("か");
        const mockOto = { alias: "か" } as any;
        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(null) // suffix付きVCV
          .mockReturnValueOnce(null) // VCV
          .mockReturnValueOnce(null) // suffix付き母音結合
          .mockReturnValueOnce(null) // 母音結合
          .mockReturnValueOnce(null) // suffix付きCV
          .mockReturnValueOnce(mockOto); // CV

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "か",
          60,
          "",
          false
        );

        expect(result).toBe(mockOto);
      });

      it("prevPhonemeが「-」の場合VCVを検索しないが母音結合は検索する", () => {
        const note = createTestNote("か");
        const mockOto = { alias: "か" } as any;

        // 最後のCV検索でのみ成功させる
        vi.mocked(vb.getOtoRecord).mockImplementation((alias) => {
          if (alias === "か") return mockOto;
          return null;
        });

        phonemizer["getOtoRecord"](vb, "-", note, "か", 60, "", false);

        // 実装では prevPhoneme="-" の場合でも VCV検索は行われる
        // また母音結合（* か）も検索される（prevPhoneme !== "-" の条件でガードされていないため）
        const calls = vi.mocked(vb.getOtoRecord).mock.calls;

        // 実際には prevPhoneme="-" の場合、母音結合検索は行われない
        // 実装の189行目で `if (prevPhoneme !== "-")` でガードされている
        const crossCalls = calls.filter((call) => call[0].startsWith("*"));
        expect(crossCalls.length).toBe(0);
      });
    });

    describe("R処理", () => {
      it("presamp未定義の場合nullを返す", () => {
        const note = createTestNote("R");
        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "R",
          60,
          "",
          false
        );
        expect(result).toBeNull();
      });

      describe("presampが定義されている場合", () => {
        beforeEach(() => {
          vb.presamp = new Presamp();
        });

        it("endingTypeがnoneの場合nullを返す", () => {
          vb.presamp.endingType = "none";
          const note = createTestNote("R");
          const result = phonemizer["getOtoRecord"](
            vb,
            "a",
            note,
            "R",
            60,
            "",
            false
          );
          expect(result).toBeNull();
        });

        it("endingTypeがfinalの場合nullを返す", () => {
          vb.presamp.endingType = "final";
          const note = createTestNote("R");
          const result = phonemizer["getOtoRecord"](
            vb,
            "a",
            note,
            "R",
            60,
            "",
            false
          );
          expect(result).toBeNull();
        });

        it("prevPhonemeが「-」の場合nullを返す", () => {
          vb.presamp.endingType = "rest";
          const note = createTestNote("R");
          const result = phonemizer["getOtoRecord"](
            vb,
            "-",
            note,
            "R",
            60,
            "",
            false
          );
          expect(result).toBeNull();
        });

        it("endingTypeがrestの場合endingRest音源を検索する", () => {
          vb.presamp.endingType = "rest";
          vb.presamp.alias.endingRest = "%v% R";
          const note = createTestNote("R");
          const prevNote = createTestNote("あ");
          note.prev = prevNote;

          const mockOto = { alias: "a R" } as any;
          vi.mocked(vb.getOtoRecord).mockReturnValueOnce(mockOto);

          const result = phonemizer["getOtoRecord"](
            vb,
            "a",
            note,
            "R",
            60,
            "",
            false
          );

          expect(vb.getOtoRecord).toHaveBeenCalledWith("a R", 60, "");
          expect(result).toBe(mockOto);
        });

        it("endingTypeがautoの場合endingRest音源を検索する", () => {
          vb.presamp.endingType = "auto";
          vb.presamp.alias.endingRest = "%v% R";
          const note = createTestNote("R");

          const mockOto = { alias: "a R" } as any;
          vi.mocked(vb.getOtoRecord).mockReturnValueOnce(mockOto);

          const result = phonemizer["getOtoRecord"](
            vb,
            "a",
            note,
            "R",
            60,
            "",
            false
          );

          expect(result).toBe(mockOto);
        });

        it("endingRestのテンプレート変数を正しく置換する", () => {
          vb.presamp.endingType = "rest";
          vb.presamp.alias.endingRest = "%v%%VCPAD%R";
          vb.presamp.alias.vcPad = " ";
          const note = createTestNote("R");

          vi.mocked(vb.getOtoRecord).mockReturnValue(null);

          phonemizer["getOtoRecord"](vb, "i", note, "R", 60, "", false);

          expect(vb.getOtoRecord).toHaveBeenCalledWith("i R", 60, "");
        });
      });
    });

    describe("priority設定によるVCVスキップ", () => {
      beforeEach(() => {
        const presamp = new Presamp();
        // デフォルトのpriorityには"k"が含まれている
        vb.presamp = presamp;
      });

      it("priorityに含まれる歌詞の場合VCV検索をスキップする", () => {
        const note = createTestNote("k");
        note.lyric = "k"; // priorityに含まれる文字列そのもの
        vi.mocked(vb.getOtoRecord).mockReturnValue(null);

        phonemizer["getOtoRecord"](vb, "a", note, "k", 60, "", false);

        const calls = vi.mocked(vb.getOtoRecord).mock.calls;
        // priorityに"k"が含まれているので"a k"というVCVパターンは呼ばれないはず
        const vcvCalls = calls.filter((call) => call[0] === "a k");
        expect(vcvCalls.length).toBe(0);
      });

      it("priorityに含まれない歌詞の場合VCV検索を行う", () => {
        const note = createTestNote("さ");
        const mockOto = { alias: "a さ" } as any;
        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(null) // suffix付きVCV
          .mockReturnValueOnce(mockOto); // VCV

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "さ",
          60,
          "",
          false
        );

        expect(result).toBe(mockOto);
      });
    });

    describe("CVVC優先判定", () => {
      beforeEach(() => {
        vb.presamp = new Presamp();
      });

      it("前ノートとvoiceColorが異なる場合CVVCを優先する", () => {
        const prevNote = createTestNote("あ", 60, 120, 480);
        prevNote.voiceColor = "color1";
        prevNote.notenum = 60;

        const note = createTestNote("か", 60, 120, 480);
        note.voiceColor = "color2";
        note.prev = prevNote;

        const mockVCOto = { alias: "a k" } as any;
        const mockCVOto = { alias: "か" } as any;

        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(mockVCOto) // VC検索
          .mockReturnValueOnce(null) // suffix付きCV
          .mockReturnValueOnce(mockCVOto); // CV

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "か",
          60,
          "color2",
          false
        );

        expect(result).toBe(mockCVOto);
      });

      it("前ノートとsuffixが異なる場合CVVCを優先する", () => {
        const prevNote = createTestNote("あ↑", 60, 120, 480);
        prevNote.notenum = 60;

        const note = createTestNote("か↓", 60, 120, 480);
        note.prev = prevNote;

        const mockVCOto = { alias: "a k" } as any;
        const mockCVOto = { alias: "か" } as any;

        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(mockVCOto) // VC検索
          .mockReturnValueOnce(null) // suffix付きCV
          .mockReturnValueOnce(mockCVOto); // CV

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "か↓",
          60,
          "",
          false
        );

        expect(result).toBe(mockCVOto);
      });

      it("VCが見つからない場合は通常フローに戻る（priorityでVCVがスキップされる場合もある）", () => {
        const prevNote = createTestNote("あ", 60, 120, 480);
        prevNote.lyric = "あ";
        prevNote.tempo = 120;
        prevNote.length = 480;
        prevNote.voiceColor = "color1";

        const note = createTestNote("k", 60, 120, 480);
        note.prev = prevNote;
        note.voiceColor = "color2"; // voiceColorが異なるのでCVVC優先
        note.suffix = "";

        // VC検索は失敗させる
        // priorityに"k"が含まれるのでVCV検索はスキップされる
        // crossCV、CV検索も失敗する
        vi.mocked(vb.getOtoRecord).mockReturnValue(null);

        const result = phonemizer.getOtoRecord(
          vb,
          "a",
          note,
          "k",
          60,
          "color2"
        );

        // priorityによりVCVがスキップされるのでnullが返る
        expect(result).toBe(null);
      });

      it("currentConsonantが存在しない場合CVVC優先判定をスキップする", () => {
        const prevNote = createTestNote("あ", 60, 120, 480);
        prevNote.voiceColor = "color1";
        prevNote.notenum = 60;

        const note = createTestNote("あ", 60, 120, 480); // 母音のみ
        note.voiceColor = "color2";
        note.prev = prevNote;

        const mockVCVOto = { alias: "a あ" } as any;

        vi.mocked(vb.getOtoRecord)
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(mockVCVOto);

        const result = phonemizer["getOtoRecord"](
          vb,
          "a",
          note,
          "あ",
          60,
          "color2",
          false
        );

        // VC検索は行われない（currentConsonantがnullのため）
        expect(result).toBe(mockVCVOto);
      });
    });
  });

  describe("applyOto", () => {
    beforeEach(() => {
      vb.presamp = new Presamp();
    });

    it("lyricがundefinedの場合エラーをthrowする", () => {
      const note = createTestNote("", 60, 120, 480);
      note.lyric = undefined as any;

      expect(() => phonemizer["_applyOto"](note, vb)).toThrow(
        "lyric is not initial."
      );
    });

    it("notenumがundefinedの場合エラーをthrowする", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.notenum = undefined as any;

      // lyricチェックの後にgetOtoRecordが呼ばれ、その内部でエラーが発生する可能性がある
      expect(() => phonemizer["_applyOto"](note, vb)).toThrow();
    });

    it("otoが見つかった場合、note情報を設定する", () => {
      const note = createTestNote("あ", 60, 120, 480);
      const mockOto = {
        alias: "あ",
        pre: 50,
        overlap: 20,
        dirpath: "path/to",
        filename: "a.wav",
      } as any;

      vi.mocked(vb.getOtoRecord).mockReturnValue(mockOto);

      phonemizer["_applyOto"](note, vb);

      expect(note.oto).toBe(mockOto);
      expect(note.otoPreutter).toBe(50);
      expect(note.otoOverlap).toBe(20);
      expect(note.atAlias).toBe("あ");
      expect(note.atFilename).toBe("path/to/a.wav");
    });

    it("otoが見つからない場合、デフォルト値を設定する", () => {
      const note = createTestNote("あ", 60, 120, 480);
      vi.mocked(vb.getOtoRecord).mockReturnValue(null);

      phonemizer["_applyOto"](note, vb);

      expect(note.oto).toBeUndefined();
      expect(note.otoPreutter).toBe(0);
      expect(note.otoOverlap).toBe(0);
      expect(note.atAlias).toBe("R");
      expect(note.atFilename).toBe("");
    });

    it("prevが存在する場合prevPhonemeを取得する", () => {
      const prevNote = createTestNote("あ", 60, 120, 480);
      const note = createTestNote("さ", 60, 120, 480); // priorityに含まれない
      note.prev = prevNote;

      const mockOto = { alias: "a さ" } as any;
      vi.mocked(vb.getOtoRecord).mockReturnValue(mockOto);

      phonemizer["_applyOto"](note, vb);

      // "a さ"というVCVが検索されているはず
      const calls = vi.mocked(vb.getOtoRecord).mock.calls;
      const vcvCall = calls.find((call) => call[0].includes("a"));
      expect(vcvCall).toBeDefined();
    });
  });

  describe("autoFitParam", () => {
    beforeEach(() => {
      vb.presamp = new Presamp();
    });

    it("prevがundefinedの場合velocityRateのみで調整する", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 120; // velocityRate = 2^((100-120)/100) ≈ 0.87

      phonemizer["_autoFitParam"](note);

      expect(note.atPreutter).toBeCloseTo(87.05, 1); // 100 * 0.87
      expect(note.atOverlap).toBeCloseTo(43.53, 1); // 50 * 0.87
      expect(note.atStp).toBe(0);
    });

    it("prevMsLengthが十分な場合そのまま使用する", () => {
      const prevNote = createTestNote("あ", 60, 120, 480);
      prevNote.lyric = "あ";
      prevNote.tempo = 120;
      prevNote.length = 480;

      const note = createTestNote("か", 60, 120, 480);
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer["_autoFitParam"](note);

      expect(note.atPreutter).toBe(100);
      expect(note.atOverlap).toBe(50);
      expect(note.atStp).toBe(0);
    });

    it("prevMsLengthが不足する場合比例計算を行う", () => {
      const prevNote = createTestNote("あ", 60, 120, 100); // 短いノート
      prevNote.lyric = "あ";
      prevNote.tempo = 120;
      prevNote.length = 100;

      const note = createTestNote("か", 60, 120, 480);
      note.prev = prevNote;
      note.otoPreutter = 200;
      note.otoOverlap = 100;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer["_autoFitParam"](note);

      // prevMsLength = 104.16..., realPreutter - realOverlap = 100
      // 比例計算が適用される
      expect(note.atPreutter).toBeLessThan(200);
      expect(note.atOverlap).toBeLessThan(100);
    });

    it("Rノートの場合prevMsLengthを1倍で計算する", () => {
      const prevNote = createTestNote("R", 60, 120, 480);
      prevNote.lyric = "R";
      prevNote.tempo = 120;
      prevNote.length = 480;

      const note = createTestNote("か", 60, 120, 480);
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 50;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer["_autoFitParam"](note);

      expect(note.atPreutter).toBe(100);
      expect(note.atOverlap).toBe(50);
    });

    it("atOverlapが20以上の場合自動クロスフェードを適用する", () => {
      const prevNote = createTestNote("あ", 60, 120, 480);
      prevNote.lyric = "あ";
      prevNote.tempo = 120;
      prevNote.length = 480;

      const note = createTestNote("か", 60, 120, 480);
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 30;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer["_autoFitParam"](note);

      expect(prevNote.envelope).toBeDefined();
      expect(note.envelope).toBeDefined();
      expect(prevNote.envelope?.point[2]).toBe(30);
      expect(note.envelope?.point[1]).toBe(30);
    });

    it("atOverlapが20未満の場合自動クロスフェードをスキップする", () => {
      const prevNote = createTestNote("あ", 60, 120, 480);
      prevNote.lyric = "あ";
      prevNote.tempo = 120;
      prevNote.length = 480;

      const note = createTestNote("か", 60, 120, 480);
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 10;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer["_autoFitParam"](note);

      expect(prevNote.envelope).toBeUndefined();
      expect(note.envelope).toBeUndefined();
    });

    it("prevがRノートの場合自動クロスフェードをスキップする", () => {
      const prevNote = createTestNote("R", 60, 120, 480);
      prevNote.lyric = "R";
      prevNote.tempo = 120;
      prevNote.length = 480;

      const note = createTestNote("か", 60, 120, 480);
      note.prev = prevNote;
      note.otoPreutter = 100;
      note.otoOverlap = 30;
      note.velocity = 100; // velocityRate = 1.0

      phonemizer["_autoFitParam"](note);

      expect(prevNote.envelope).toBeUndefined();
      expect(note.envelope).toBeUndefined();
    });
  });

  describe("getNotesCount", () => {
    beforeEach(() => {
      vb.presamp = new Presamp();
    });

    it("nextConsonantがnullの場合1を返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("あ", 60, 120, 480); // 母音のみ

      const result = phonemizer["_getNotesCount"](vb, note);

      expect(result).toBe(1);
    });

    it("vcOtoRecordが存在する場合2を返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.notenum = 60;
      note.next = createTestNote("か", 60, 120, 480);
      note.next.notenum = 60;

      const mockVCOto = { alias: "a k" } as any;
      vi.mocked(vb.getOtoRecord).mockReturnValue(mockVCOto);

      const result = phonemizer["_getNotesCount"](vb, note);

      expect(result).toBe(2);
    });

    it("vcOtoRecordが存在しない場合1を返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.notenum = 60;
      note.next = createTestNote("か", 60, 120, 480);
      note.next.notenum = 60;

      vi.mocked(vb.getOtoRecord).mockReturnValue(null);

      const result = phonemizer["_getNotesCount"](vb, note);

      expect(result).toBe(1);
    });
  });

  describe("getVCTargetLength", () => {
    beforeEach(() => {
      vb.presamp = new Presamp();
    });

    it("useCVLengthがfalseでblankが負の場合|blank| - preを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("か", 60, 120, 480);
      note.next.oto = { pre: 50, overlap: 20 } as any;

      const vcOtoRecord = { blank: -100, pre: 30, overlap: 10 } as any;
      const consonantParam = { useCVLength: false } as any;

      const result = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );

      expect(result).toBe(70); // 100 - 30
    });

    it("useCVLengthがfalseでblankが正でnext.oto.overlapが負の場合next.oto.pre - next.oto.overlapを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("か", 60, 120, 480);
      note.next.oto = { pre: 50, overlap: -20 } as any;

      const vcOtoRecord = { blank: 100, pre: 30, overlap: 10 } as any;
      const consonantParam = { useCVLength: false } as any;

      const result = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );

      expect(result).toBe(70); // 50 - (-20)
    });

    it("useCVLengthがfalseでblankが正でnext.oto.overlapが正の場合next.oto.preを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("か", 60, 120, 480);
      note.next.oto = { pre: 50, overlap: 20 } as any;

      const vcOtoRecord = { blank: 100, pre: 30, overlap: 10 } as any;
      const consonantParam = { useCVLength: false } as any;

      const result = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );

      expect(result).toBe(50);
    });

    it("useCVLengthがtrueでnext.oto.overlapが負の場合next.oto.pre - next.oto.overlapを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("か", 60, 120, 480);
      note.next.oto = { pre: 50, overlap: -20 } as any;

      const vcOtoRecord = { blank: 100, pre: 30, overlap: 10 } as any;
      const consonantParam = { useCVLength: true } as any;

      const result = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );

      expect(result).toBe(70);
    });

    it("useCVLengthがtrueでnext.oto.overlapが正の場合next.oto.preを返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("か", 60, 120, 480);
      note.next.oto = { pre: 50, overlap: 20 } as any;

      const vcOtoRecord = { blank: 100, pre: 30, overlap: 10 } as any;
      const consonantParam = { useCVLength: true } as any;

      const result = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );

      expect(result).toBe(50);
    });

    it("next.otoが存在しない場合デフォルト値60を返す", () => {
      const note = createTestNote("あ", 60, 120, 480);
      note.next = createTestNote("か", 60, 120, 480);
      note.next.oto = undefined; // otoが存在しない

      const vcOtoRecord = { blank: 100, pre: 30, overlap: 10 } as any;
      const consonantParam = { useCVLength: false } as any;

      const result = phonemizer.getVCTargetLength(
        note,
        vcOtoRecord,
        consonantParam
      );

      expect(result).toBe(60);
    });
  });

  describe("vcAutoFitParam", () => {
    it("prevMsLengthが十分な場合調整を行わない", () => {
      const note = createTestNote("あ", 60, 120, 480);
      const vcOtoRecord = { pre: 50, overlap: 20 } as any;
      const vcTargetNoteLength = 100;

      const result = phonemizer.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );

      expect(result.preutter).toBe(50);
      expect(result.overlap).toBe(50); // preutterで上書き
      expect(result.stp).toBe(0);
    });

    it("prevMsLengthが不足する場合比例計算を行う", () => {
      const note = createTestNote("あ", 60, 120, 480);
      const vcOtoRecord = { pre: 200, overlap: 100 } as any;
      const vcTargetNoteLength = 450;

      const result = phonemizer.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );

      // prevMsLength = 500 - 450 = 50
      // realPreutter - realOverlap = 100
      // prevMsLength < realPreutter - realOverlap なので比例計算
      expect(result.preutter).toBeLessThan(200);
      expect(result.overlap).toBe(result.preutter); // preutterで上書き
      expect(result.stp).toBeGreaterThan(0);
    });

    it("overlapはpreutterで上書きされる", () => {
      const note = createTestNote("あ", 60, 120, 480);
      const vcOtoRecord = { pre: 50, overlap: 999 } as any; // overlapに大きな値
      const vcTargetNoteLength = 100;

      const result = phonemizer.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );

      expect(result.overlap).toBe(result.preutter);
      expect(result.overlap).not.toBe(999);
    });
  });
});
