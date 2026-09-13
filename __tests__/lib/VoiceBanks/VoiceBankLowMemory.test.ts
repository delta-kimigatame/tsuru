import * as iconv from "iconv-lite";
import JSZip from "jszip";
import { Blob } from "node:buffer";
import { describe, expect, it } from "vitest";

import { CharacterTxt } from "../../../src/lib/VoiceBanks/CharacterTxt";
import { PrefixMap } from "../../../src/lib/VoiceBanks/PrefixMap";
import { VoiceBankLowMemory } from "../../../src/lib/VoiceBanks/VoiceBankLowMemory";
import { zipReader } from "../../../src/services/zipReader";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

const createFile = (bytes: Uint8Array): File => {
  const blob = new Blob([bytes], { type: "application/zip" });
  return {
    size: blob.size,
    slice: blob.slice.bind(blob),
  } as File;
};

const createVoiceBank = async (zip: JSZip): Promise<VoiceBankLowMemory> => {
  const bytes = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
  const reader = new zipReader(createFile(bytes));
  await reader.Initialize(EncodingOption.UTF8);
  return new VoiceBankLowMemory(reader);
};

const sjis = (text: string) => iconv.encode(text, "Windows-31j");

const addCharacterTxt = (
  zip: JSZip,
  character: CharacterTxt,
  path = "root/character.txt",
) => {
  zip.file(path, sjis(character.outputTxt()));
};

describe("VoiceBankLowMemory", () => {
  it("character.txtがない場合、エラーをスローする", async () => {
    const vb = await createVoiceBank(new JSZip());

    await expect(vb.initialize()).rejects.toThrow("character.txt not found.");
  });

  it("最小構成のcharacter.txtで初期化できる", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "あ" }));
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.name).toBe("あ");
    expect(vb.image).toBeUndefined();
    expect(vb.sample).toBeUndefined();
    expect(vb.author).toBeUndefined();
    expect(vb.web).toBeUndefined();
    expect(vb.version).toBeUndefined();
    expect(vb.readme).toBeUndefined();
    expect(vb.voice).toBeUndefined();
    expect(vb.portrait).toBeUndefined();
    expect(vb.portraitOpacity).toBe(0.67);
    expect(vb.portraitHeight).toBe(800);
    expect(vb.prefixmaps).toEqual({ "": new PrefixMap() });
  });

  it("全プロパティのcharacter.txtで初期化できる", async () => {
    const zip = new JSZip();
    addCharacterTxt(
      zip,
      new CharacterTxt({
        name: "a",
        image: "b.bmp",
        sample: "c.wav",
        author: "d",
        web: "https://e.jp/",
        version: "f",
      }),
    );
    const icon = new Uint8Array([0x01]);
    const sample = new Uint8Array([0x02]);
    zip.file("root/b.bmp", icon);
    zip.file("root/c.wav", sample);
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.name).toBe("a");
    expect(new Uint8Array(vb.image!)).toEqual(icon);
    expect(new Uint8Array(vb.sample!)).toEqual(sample);
    expect(vb.author).toBe("d");
    expect(vb.web).toBe("https://e.jp/");
    expect(vb.version).toBe("f");
  });

  it("readme.txtを読み込める", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "a" }));
    zip.file("root/readme.txt", sjis("test"));
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.readme).toBe("test");
  });

  it("character.yamlとportraitを読み込める", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "a" }));
    zip.file(
      "root/character.yaml",
      "voice: hoge\nportrait: g.png\nportrait_opacity: 0.5\nportrait_height: 300\nsubbanks:\n  - color: ''\n    prefix: ''\n    suffix: _\n    tone_ranges: [C1-B7]\n  - color: a\n    prefix: ''\n    suffix: _A\n    tone_ranges: [C1-B4, C6-B7]\n  - color: b\n    prefix: ''\n    suffix: _B\n    tone_ranges: [C1-B7]",
    );
    const portrait = new Uint8Array([0x03]);
    zip.file("root/g.png", portrait);
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.voice).toBe("hoge");
    expect(new Uint8Array(vb.portrait!)).toEqual(portrait);
    expect(vb.portraitOpacity).toBe(0.5);
    expect(vb.portraitHeight).toBe(300);
    expect(vb.prefixmaps[""]?.getValue("B4").suffix).toBe("_");
    expect(vb.prefixmaps.a.getValue("B4").suffix).toBe("_A");
    expect(vb.prefixmaps.a.getValue("C5").suffix).toBe("");
    expect(vb.prefixmaps.b.getValue("B4").suffix).toBe("_B");
  });

  it("character.yamlのportrait_heightが0の場合、デフォルト値を使用する", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "a" }));
    zip.file("root/character.yaml", "voice: hoge\nportrait_height: 0");
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.voice).toBe("hoge");
    expect(vb.portraitHeight).toBe(800);
  });

  it("prefix.mapを読み込める", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "a" }));
    const prefixMap = new PrefixMap();
    prefixMap.setRangeValues("C5-B7", "", "p");
    zip.file("root/prefix.map", sjis(prefixMap.outputMap()));
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.prefixmaps[""].getValue("C5").suffix).toBe("p");
  });

  it("prefix.mapとcharacter.yamlを両方読み込める", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "a" }));
    const prefixMap = new PrefixMap();
    prefixMap.setRangeValues("C5-B7", "", "p");
    zip.file("root/prefix.map", sjis(prefixMap.outputMap()));
    zip.file(
      "root/character.yaml",
      "subbanks:\n  - color: a\n    prefix: ''\n    suffix: _A\n    tone_ranges: [C1-B4]",
    );
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.prefixmaps[""].getValue("C5").suffix).toBe("p");
    expect(vb.prefixmaps.a.getValue("B4").suffix).toBe("_A");
  });

  it("音源ルート以下のoto.iniを読み込める", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "あ" }));
    zip.file("oto.ini", sjis("_あ.wav=あ,1,2,3,4,5"));
    zip.file("root/oto.ini", sjis("_い.wav=い,6,7,8,9,10"));
    zip.file("root/test/oto.ini", sjis("_う.wav=う,11,12,13,14,15"));
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.oto.GetRecordFromAlias("あ")).toBeNull();
    expect(vb.oto.GetRecordFromAlias("い")?.dirpath).toBe("");
    expect(vb.oto.GetRecordFromAlias("う")?.dirpath).toBe("test");
  });

  it("getOtoRecordでoto.iniレコードを取得できる", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "あ" }));
    zip.file(
      "root/oto.ini",
      sjis(
        "_あ.wav=あ,1,2,3,4,5\r\n_あ.wav=あ_,6,7,8,9,10\r\n_あ.wav=あ_A,11,12,13,14,15",
      ),
    );
    zip.file(
      "root/character.yaml",
      "subbanks:\n  - color: ''\n    prefix: ''\n    suffix: _\n    tone_ranges: [C1-B7]\n  - color: a\n    prefix: ''\n    suffix: _A\n    tone_ranges: [C1-B7]",
    );
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.getOtoRecord("あ", 60, "").offset).toBe(6);
    expect(vb.getOtoRecord("?あ", 60, "").offset).toBe(1);
    expect(vb.getOtoRecord("あ", 60, "a").offset).toBe(11);
  });

  it("getWaveでWAVファイルを取得できる", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "あ" }));
    const wav = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0xe0, 0x07, 0x00, 0x57, 0x41, 0x56, 0x45,
      0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x01, 0x00, 0x08, 0x00,
      0x64, 0x61, 0x74, 0x61, 0x00, 0xe0, 0x07, 0x00, 0x00, 0x01, 0xff, 0x03,
    ]);
    zip.file("root/あ.wav", wav);
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect((await vb.getWave("あ.wav")).data).toEqual([0, 1, -1, 3]);
    await expect(vb.getWave("い.wav")).rejects.toThrow(
      "root/い.wav not found.",
    );
  });

  it("getFrqでFRQファイルを取得できる", async () => {
    const zip = new JSZip();
    addCharacterTxt(zip, new CharacterTxt({ name: "あ" }));
    const frq = new Uint8Array([
      0x46, 0x52, 0x45, 0x51, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    zip.file("root/あ_wav.frq", frq);
    const vb = await createVoiceBank(zip);

    await vb.initialize();

    expect(vb.initialized).toBe(true);
    expect((await vb.getFrq("あ.wav")).frqAverage).toBeCloseTo(
      119.47423345496698,
    );
    await expect(vb.getFrq("い.wav")).rejects.toThrow(
      "root/い_wav.frq not found.",
    );
  });

  it("UTF-8エンコーディングのファイルを読み込める", async () => {
    const zip = new JSZip();
    zip.file(
      "root/character.txt",
      iconv.encode(new CharacterTxt({ name: "あ" }).outputTxt(), "utf-8"),
    );
    zip.file("root/readme.txt", iconv.encode("い", "utf-8"));
    const prefixMap = new PrefixMap();
    prefixMap.setRangeValues("C5-B7", "", "試");
    zip.file("root/prefix.map", iconv.encode(prefixMap.outputMap(), "utf-8"));
    const vb = await createVoiceBank(zip);

    await vb.initialize("UTF8");

    expect(vb.name).toBe("あ");
    expect(vb.readme).toBe("い");
    expect(vb.prefixmaps[""].getValue("C5").suffix).toBe("試");
  });
});
