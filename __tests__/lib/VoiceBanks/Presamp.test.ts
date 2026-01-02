import { beforeEach, describe, expect, it } from "vitest";
import { Presamp } from "../../../src/lib/VoiceBanks/Presamp";

describe("Presamp", () => {
  let presamp: Presamp;

  beforeEach(() => {
    presamp = new Presamp();
  });

  describe("コンストラクタ", () => {
    it("デフォルト値で初期化される", () => {
      expect(presamp.vowels).toHaveLength(7);
      expect(presamp.consonants).toHaveLength(30);
      expect(presamp.priority).toHaveLength(16);
      expect(presamp.replacements).toEqual({});
      expect(presamp.alias.vcv).toBe("%v%%VCVPAD%%CV%");
      expect(presamp.alias.beginingCv).toBe("-%VCVPAD%%CV%");
      expect(presamp.alias.crossCv).toBe("*%VCVPAD%%CV%");
      expect(presamp.alias.vc).toBe("%v%%vcpad%%c%,%c%%vcpad%%c%");
      expect(presamp.alias.cv).toBe("%CV%,%c%%V%");
      expect(presamp.alias.longV).toBe("%V%ー");
      expect(presamp.alias.vcPad).toBe(" ");
      expect(presamp.alias.vcvPad).toBe(" ");
      expect(presamp.alias.endingRest).toBe("%v%%VCPAD%R");
      expect(presamp.alias.endingFinal).toBe("-");
      expect(presamp.normalPriority).toEqual([
        "VCV",
        "CVVC",
        "crossCV",
        "CV",
        "beginingCV",
      ]);
      expect(presamp.differentVoiceColorPriority).toEqual([
        "CVVC",
        "VCV",
        "crossCV",
        "CV",
        "beginingCV",
      ]);
      expect(presamp.differentPrefixMapPriority).toEqual([
        "CVVC",
        "VCV",
        "crossCV",
        "CV",
        "beginingCV",
      ]);
      expect(presamp.consonantFlags).toBe("P0");
      expect(presamp.endingType).toBe("none");
    });
  });

  describe("parseIni", () => {
    it("BOMサインが削除される", () => {
      const iniText = "\ufeff[VOWEL]\na=あ=あ,か,が=100";
      presamp.parseIni(iniText);
      expect(presamp.vowels).toHaveLength(1);
      expect(presamp.vowels[0].symbol).toBe("a");
    });

    it("VOWELセクションを正しく解析する", () => {
      const iniText = `[VOWEL]
a=あ=あ,か,が=100
i=い=い,き,ぎ=95`;
      presamp.parseIni(iniText);
      expect(presamp.vowels).toHaveLength(2);
      expect(presamp.vowels[0]).toEqual({
        symbol: "a",
        representative: "あ",
        CVs: ["あ", "か", "が"],
        volume: 100,
      });
      expect(presamp.vowels[1]).toEqual({
        symbol: "i",
        representative: "い",
        CVs: ["い", "き", "ぎ"],
        volume: 95,
      });
    });

    it("CONSONANTセクションを正しく解析する", () => {
      const iniText = `[CONSONANT]
k=か,く,け,こ=1=0
s=さ,す,せ,そ=0=1`;
      presamp.parseIni(iniText);
      expect(presamp.consonants).toHaveLength(2);
      expect(presamp.consonants[0]).toEqual({
        symbol: "k",
        CVs: ["か", "く", "け", "こ"],
        crossfade: true,
        useCVLength: false,
      });
      expect(presamp.consonants[1]).toEqual({
        symbol: "s",
        CVs: ["さ", "す", "せ", "そ"],
        crossfade: false,
        useCVLength: true,
      });
    });

    it("PRIORITYセクションを正しく解析する", () => {
      const iniText = `[PRIORITY]
k,g,s,z`;
      presamp.parseIni(iniText);
      expect(presamp.priority).toEqual(["k", "g", "s", "z"]);
    });

    it("REPLACEセクションを正しく解析する", () => {
      const iniText = `[REPLACE]
きゃ=kya
しゃ=sha`;
      presamp.parseIni(iniText);
      expect(presamp.replacements).toEqual({
        きゃ: "kya",
        しゃ: "sha",
      });
    });

    it("ALIASセクションを正しく解析する", () => {
      const iniText = `[ALIAS]
VCV=%v% %CV%
BEGINING_CV=- %CV%
CROSS_CV=* %CV%
VC=%v% %c%
CV=%CV%
LONG_V=%V% -
VCPAD=_
VCVPAD=-
ENDING1=%v% R
ENDING2=- -`;
      presamp.parseIni(iniText);
      expect(presamp.alias.vcv).toBe("%v% %CV%");
      expect(presamp.alias.beginingCv).toBe("- %CV%");
      expect(presamp.alias.crossCv).toBe("* %CV%");
      expect(presamp.alias.vc).toBe("%v% %c%");
      expect(presamp.alias.cv).toBe("%CV%");
      expect(presamp.alias.longV).toBe("%V% -");
      expect(presamp.alias.vcPad).toBe("_");
      expect(presamp.alias.vcvPad).toBe("-");
      expect(presamp.alias.endingRest).toBe("%v% R");
      expect(presamp.alias.endingFinal).toBe("- -");
    });

    it("ALIAS_PRIORITYセクションを正しく解析する", () => {
      const iniText = `[ALIAS_PRIORITY]
VCV
CV`;
      presamp.parseIni(iniText);
      expect(presamp.normalPriority).toEqual(["VCV", "CV"]);
    });

    it("ALIAS_PRIORITY_DIFAPPENDセクションを正しく解析する", () => {
      const iniText = `[ALIAS_PRIORITY_DIFAPPEND]
CVVC
VCV`;
      presamp.parseIni(iniText);
      expect(presamp.differentVoiceColorPriority).toEqual(["CVVC", "VCV"]);
    });

    it("ALIAS_PRIORITY_DIFPITCHセクションを正しく解析する", () => {
      const iniText = `[ALIAS_PRIORITY_DIFPITCH]
CV
VCV`;
      presamp.parseIni(iniText);
      expect(presamp.differentPrefixMapPriority).toEqual(["CV", "VCV"]);
    });

    it("CFLAGSセクションを正しく解析する", () => {
      const iniText = `[CFLAGS]
P86`;
      presamp.parseIni(iniText);
      expect(presamp.consonantFlags).toBe("P86");
    });

    it("VCLENGTHセクションが1の時すべての子音のuseCVLengthがtrueになる", () => {
      const iniText = `[CONSONANT]
k=か,く,け,こ=1=0
[VCLENGTH]
1`;
      presamp.parseIni(iniText);
      expect(presamp.consonants[0].useCVLength).toBe(true);
    });

    it("ENDINGTYPE1セクションを正しく解析する", () => {
      const iniText = `[ENDINGTYPE1]
%v% R2`;
      presamp.parseIni(iniText);
      expect(presamp.alias.endingRest).toBe("%v% R2");
    });

    it("ENDINGTYPE2セクションを正しく解析する", () => {
      const iniText = `[ENDINGTYPE2]
- F`;
      presamp.parseIni(iniText);
      expect(presamp.alias.endingFinal).toBe("- F");
    });

    it("ENDINGTYPEセクションを正しく解析する", () => {
      const iniText = `[ENDINGTYPE]
%v% End`;
      presamp.parseIni(iniText);
      expect(presamp.alias.endingRest).toBe("%v% End");
    });

    it("VCPADセクションを正しく解析する", () => {
      const iniText = `[VCPAD]
-`;
      presamp.parseIni(iniText);
      expect(presamp.alias.vcPad).toBe("-");
    });

    it("ENDFLAGが0の時endingTypeがnoneになる", () => {
      const iniText = `[ENDFLAG]
0`;
      presamp.parseIni(iniText);
      expect(presamp.endingType).toBe("none");
    });

    it("ENDFLAGが1の時endingTypeがrestになる", () => {
      const iniText = `[ENDFLAG]
1`;
      presamp.parseIni(iniText);
      expect(presamp.endingType).toBe("rest");
    });

    it("ENDFLAGが2の時endingTypeがfinalになる", () => {
      const iniText = `[ENDFLAG]
2`;
      presamp.parseIni(iniText);
      expect(presamp.endingType).toBe("final");
    });

    it("ENDFLAGが3の時endingTypeがautoになる", () => {
      const iniText = `[ENDFLAG]
3`;
      presamp.parseIni(iniText);
      expect(presamp.endingType).toBe("auto");
    });

    it("無視するセクションが含まれていてもエラーにならない", () => {
      const iniText = `[PRE]
test
[SU]
test
[NUM]
test
[APPEND]
test
[PITCH]
test
[SPLIT]
test
[MUSTVC]
test`;
      expect(() => presamp.parseIni(iniText)).not.toThrow();
    });
  });

  describe("CVVowels", () => {
    it("母音単体ノートを判別する正規表現を返す", () => {
      const regex = presamp.CVVowels;
      expect(regex.test("あ")).toBe(true);
      expect(regex.test("い")).toBe(true);
      expect(regex.test("う")).toBe(true);
      expect(regex.test("え")).toBe(true);
      expect(regex.test("お")).toBe(true);
      expect(regex.test("ん")).toBe(true);
      expect(regex.test("ン")).toBe(true);
      expect(regex.test("か")).toBe(false);
      expect(regex.test("き")).toBe(false);
    });
  });

  describe("CVRegex", () => {
    it("CVに該当する部分を特定する正規表現を返す", () => {
      const regex = presamp.CVRegex;
      expect(regex.test("か")).toBe(true);
      expect(regex.test("き")).toBe(true);
      expect(regex.test("ちゃ")).toBe(true);
      expect(regex.test("しゃ")).toBe(true);
    });
  });

  describe("vowelRegs", () => {
    it("母音の正規表現と対応する母音記号の一覧を返す", () => {
      const vowelRegs = presamp.vowelRegs;
      expect(vowelRegs).toHaveLength(7);
      expect(vowelRegs[0].symbol).toBe("a");
      expect(vowelRegs[0].reg.test("か")).toBe(true);
      expect(vowelRegs[0].reg.test("が")).toBe(true);
      expect(vowelRegs[0].reg.test("さ")).toBe(true);
      expect(vowelRegs[1].symbol).toBe("e");
      expect(vowelRegs[1].reg.test("け")).toBe(true);
      expect(vowelRegs[1].reg.test("げ")).toBe(true);
    });
  });

  describe("VCVRegExp", () => {
    it("VCV判定用の正規表現を返す", () => {
      const regex = presamp.VCVRegExp;
      // デフォルトのvcvPadは" "なので、"a か"のような形式
      expect(regex.test("a か")).toBe(true);
      expect(regex.test("i き")).toBe(true);
      expect(regex.test("u く")).toBe(true);
      expect(regex.test("e け")).toBe(true);
      expect(regex.test("o こ")).toBe(true);
    });
  });
});
