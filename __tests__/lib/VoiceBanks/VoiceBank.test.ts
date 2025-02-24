import * as iconv from "iconv-lite";
import yaml from "js-yaml";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { CharacterTxt } from "../../../src/lib/VoiceBanks/CharacterTxt";
import { PrefixMap } from "../../../src/lib/VoiceBanks/PrefixMap";
import { VoiceBank } from "../../../src/lib/VoiceBanks/VoiceBank";

describe("VoiceBank", () => {
  it("not_found_character.txt", async () => {
    const z = new JSZip();
    const vb = new VoiceBank(z.files);
    await expect(async () => {
      await vb.initialize();
    }).rejects.toThrow("character.txt not found.");
  });

  it("simple_character_txt", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    const vb = new VoiceBank(z.files);
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

  it("simple_character_all", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({
      name: "a",
      image: "b.bmp",
      sample: "c.wav",
      author: "d",
      web: "https://e.jp/",
      version: "f",
    });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    const iconBuf = new Uint8Array([0x01]).buffer;
    z.file("root/b.bmp", iconBuf);
    const sampleBuf = new Uint8Array([0x02]).buffer;
    z.file("root/c.wav", sampleBuf);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(vb.name).toBe("a");
    expect(vb.image).toEqual(iconBuf);
    expect(vb.sample).toEqual(sampleBuf);
    expect(vb.author).toBe("d");
    expect(vb.web).toBe("https://e.jp/");
    expect(vb.version).toBe("f");
  });

  it("readme", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "a" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const r_output = new File(
      [iconv.encode("test", "Windows-31j")],
      "readme.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("root/readme.txt", r_output);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(vb.readme).toBe("test");
  });

  it("yaml", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "a" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    const y = yaml.dump({
      voice: "hoge",
      portrait: "g.png",
      portrait_opacity: 0.5,
      portrait_height: 300,
      subbanks: [
        {
          color: "",
          prefix: "",
          suffix: "_",
          tone_ranges: ["C1-B7"],
        },
        {
          color: "a",
          prefix: "",
          suffix: "_A",
          tone_ranges: ["C1-B4", "C6-B7"],
        },
        { color: "b", prefix: "", suffix: "_B", tone_ranges: ["C1-B7"] },
      ],
    });
    const y_output = new File(
      [iconv.encode(y, "Windows-31j")],
      "character.yaml",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.yaml", y_output);
    const portraitBuf = new Uint8Array([0x03]).buffer;
    z.file("root/g.png", portraitBuf);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(vb.voice).toBe("hoge");
    expect(vb.portrait).toEqual(portraitBuf);
    expect(vb.portraitOpacity).toBe(0.5);
    expect(vb.portraitHeight).toBe(300);
    expect(Object.keys(vb.prefixmaps).includes("")).toBeTruthy();
    expect(vb.prefixmaps[""].getValue("B4").suffix).toBe("_");
    expect(Object.keys(vb.prefixmaps).includes("a")).toBeTruthy();
    expect(vb.prefixmaps["a"].getValue("B4").suffix).toBe("_A");
    expect(vb.prefixmaps["a"].getValue("C5").suffix).toBe("");
    expect(vb.prefixmaps["a"].getValue("C6").suffix).toBe("_A");
    expect(Object.keys(vb.prefixmaps).includes("b")).toBeTruthy();
    expect(vb.prefixmaps["b"].getValue("B4").suffix).toBe("_B");
  });

  it("yaml_portraitHeightEqual0", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "a" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    const y = yaml.dump({
      voice: "hoge",
      portrait: "g.png",
      portrait_opacity: 0.5,
      portrait_height: 0,
      subbanks: [
        {
          color: "a",
          prefix: "",
          suffix: "_A",
          tone_ranges: ["C1-B4", "C6-B7"],
        },
        { color: "b", prefix: "", suffix: "_B", tone_ranges: ["C1-B7"] },
      ],
    });
    const y_output = new File(
      [iconv.encode(y, "Windows-31j")],
      "character.yaml",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.yaml", y_output);
    const portraitBuf = new Uint8Array([0x03]).buffer;
    z.file("root/g.png", portraitBuf);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(vb.voice).toBe("hoge");
    expect(vb.portrait).toEqual(portraitBuf);
    expect(vb.portraitOpacity).toBe(0.5);
    expect(vb.portraitHeight).toBe(800);
  });

  it("prefixmap", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "a" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const p = new PrefixMap();
    p.setRangeValues("C5-B7", "", "p");
    const p_output = new File(
      [iconv.encode(p.outputMap(), "Windows-31j")],
      "prefix.map",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("root/prefix.map", p_output);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(Object.keys(vb.prefixmaps).includes("")).toBeTruthy();
    expect(vb.prefixmaps[""].getValue("C5").suffix).toBe("p");
  });

  it("prefixmapWithYaml", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "a" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const p = new PrefixMap();
    p.setRangeValues("C5-B7", "", "p");
    const p_output = new File(
      [iconv.encode(p.outputMap(), "Windows-31j")],
      "prefix.map",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("root/prefix.map", p_output);
    const y = yaml.dump({
      voice: "hoge",
      portrait: "g.png",
      portrait_opacity: 0.5,
      portrait_height: 300,
      subbanks: [
        {
          color: "",
          prefix: "",
          suffix: "_",
          tone_ranges: ["C1-B7"],
        },
        {
          color: "a",
          prefix: "",
          suffix: "_A",
          tone_ranges: ["C1-B4", "C6-B7"],
        },
        { color: "b", prefix: "", suffix: "_B", tone_ranges: ["C1-B7"] },
      ],
    });
    const y_output = new File(
      [iconv.encode(y, "Windows-31j")],
      "character.yaml",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.yaml", y_output);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(Object.keys(vb.prefixmaps).includes("")).toBeTruthy();
    expect(vb.prefixmaps[""].getValue("C5").suffix).toBe("p");
    expect(Object.keys(vb.prefixmaps).includes("a")).toBeTruthy();
    expect(vb.prefixmaps["a"].getValue("B4").suffix).toBe("_A");
    expect(vb.prefixmaps["a"].getValue("C5").suffix).toBe("");
    expect(vb.prefixmaps["a"].getValue("C6").suffix).toBe("_A");
    expect(Object.keys(vb.prefixmaps).includes("b")).toBeTruthy();
    expect(vb.prefixmaps["b"].getValue("B4").suffix).toBe("_B");
  });

  it("oto", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const o_output1 = new File(
      [iconv.encode("_あ.wav=あ,1,2,3,4,5", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );
    const o_output2 = new File(
      [iconv.encode("_い.wav=い,6,7,8,9,10", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );
    const o_output3 = new File(
      [iconv.encode("_う.wav=う,11,12,13,14,15", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("oto.ini", o_output1);
    z.file("root/oto.ini", o_output2);
    z.file("root/test/oto.ini", o_output3);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(vb.oto.GetRecordFromAlias("あ")).toBeNull();
    expect(vb.oto.GetRecordFromAlias("い")?.dirpath).toBe("");
    expect(vb.oto.GetRecordFromAlias("う")?.dirpath).toBe("test");
  });

  it("getOtoRecord", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const y = yaml.dump({
      voice: "hoge",
      portrait: "g.png",
      portrait_opacity: 0.5,
      portrait_height: 300,
      subbanks: [
        {
          color: "",
          prefix: "",
          suffix: "_",
          tone_ranges: ["C1-B7"],
        },
        {
          color: "a",
          prefix: "",
          suffix: "_A",
          tone_ranges: ["C1-B4", "C6-B7"],
        },
        { color: "b", prefix: "", suffix: "_B", tone_ranges: ["C1-B7"] },
      ],
    });
    const y_output = new File(
      [iconv.encode(y, "Windows-31j")],
      "character.yaml",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.yaml", y_output);
    const o_output = new File(
      [
        iconv.encode(
          "_あ.wav=あ,1,2,3,4,5\r\n_あ.wav=あ_,6,7,8,9,10\r\n_あ.wav=あ_A,11,12,13,14,15",
          "Windows-31j"
        ),
      ],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("root/oto.ini", o_output);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    expect(vb.getOtoRecord("あ", 60, "").offset).toBe(6);
    expect(vb.getOtoRecord("?あ", 60, "").offset).toBe(1);
    expect(vb.getOtoRecord("あ", 72, "a").offset).toBe(1);
    expect(vb.getOtoRecord("あ", 60, "a").offset).toBe(11);
    expect(vb.getOtoRecord("あ_A", 60, "").offset).toBe(11);
    expect(vb.getOtoRecord("あ_B", 60, "")).toBeNull();
  });

  it("GetWav", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    const wavBuf = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0xe0, 0x07, 0x00, 0x57, 0x41, 0x56, 0x45,
      0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x01, 0x00, 0x08, 0x00,
      0x64, 0x61, 0x74, 0x61, 0x00, 0xe0, 0x07, 0x00, 0x00, 0x01, 0xff, 0x03,
    ]).buffer;
    z.file("root/あ.wav", wavBuf);
    const vb = new VoiceBank(z.files);
    await vb.initialize();
    const wav = await vb.getWave("あ.wav");
    expect(wav.data).toEqual([0, 1, -1, 3]);
    await expect(async () => {
      await vb.getWave("い.wav");
    }).rejects.toThrow("root/い.wav not found.");
  });

  it("GetFrq", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    const feqBuf = new Uint8Array([
      0x46, 0x52, 0x45, 0x51, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]).buffer;
    z.file("root/あ_wav.frq", feqBuf);
    const vb = new VoiceBank(z.files);
    expect(vb.initialized).toBeFalsy();
    await vb.initialize();
    expect(vb.initialized).toBeTruthy();
    const frq = await vb.getFrq("あ.wav");
    expect(frq.frqAverage).toBeCloseTo(119.47423345496698);
    await expect(async () => {
      await vb.getFrq("い.wav");
    }).rejects.toThrow("root/い_wav.frq not found.");
  });

  it("utf8", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "utf-8")],
      "character.txt",
      { type: "text/plane;charset=utf-8" }
    );
    z.file("root/character.txt", c_output);
    const r_output = new File([iconv.encode("い", "utf-8")], "readme.txt", {
      type: "text/plane;charset=utf-8",
    });
    z.file("root/readme.txt", r_output);
    const p = new PrefixMap();
    p.setRangeValues("C5-B7", "", "試");
    const p_output = new File(
      [iconv.encode(p.outputMap(), "utf-8")],
      "prefix.map",
      { type: "text/plane;charset=utf-8" }
    );
    z.file("root/prefix.map", p_output);
    const vb = new VoiceBank(z.files);
    expect(vb.initialized).toBeFalsy();
    await vb.initialize("UTF8");
    expect(vb.initialized).toBeTruthy();
    expect(vb.name).toBe("あ");
    expect(vb.readme).toBe("い");
    expect(Object.keys(vb.prefixmaps).includes("")).toBeTruthy();
    expect(vb.prefixmaps[""].getValue("C5").suffix).toBe("試");
  });
});
