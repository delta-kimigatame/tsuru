import { describe, expect, it } from "vitest";
import { CharacterTxt } from "../../../src/lib/VoiceBanks/CharacterTxt";

describe("CharacterTxt", () => {
  it("txtもnameも未指定の場合、エラーをスローする", () => {
    expect(() => {
      new CharacterTxt({});
    }).toThrow("txtかnameのどちらかが必要です");
  });

  it("name最小構成で初期化できる", () => {
    const character = new CharacterTxt({ name: "a" });
    expect(character.name).toBe("a");
  });

  it("name全プロパティで初期化できる", () => {
    const character = new CharacterTxt({
      name: "a",
      image: "b.bmp",
      sample: "c.wav",
      author: "d",
      web: "https://e.jp/",
      version: "f",
    });
    expect(character.name).toBe("a");
    expect(character.image).toBe("b.bmp");
    expect(character.sample).toBe("c.wav");
    expect(character.author).toBe("d");
    expect(character.web).toBe("https://e.jp/");
    expect(character.version).toBe("f");
  });

  it("txt最小構成で初期化できる", () => {
    const character = new CharacterTxt({ txt: "name=a" });
    expect(character.name).toBe("a");
  });

  it("txt全プロパティで初期化できる", () => {
    const character = new CharacterTxt({
      txt: "name=a\r\nimage=b.bmp\r\nsample=c.wav\r\nauthor=d\r\nweb=https://e.jp/\r\nversion=f",
    });
    expect(character.name).toBe("a");
    expect(character.image).toBe("b.bmp");
    expect(character.sample).toBe("c.wav");
    expect(character.author).toBe("d");
    expect(character.web).toBe("https://e.jp/");
    expect(character.version).toBe("f");
  });

  it("txtコロン区切りで初期化できる", () => {
    const character = new CharacterTxt({
      txt: "name:a\r\nimage:b.bmp\r\nsample:c.wav\r\nauthor:d\r\nweb:https://e.jp/\r\nversion:f",
    });
    expect(character.name).toBe("a");
    expect(character.image).toBe("b.bmp");
    expect(character.sample).toBe("c.wav");
    expect(character.author).toBe("d");
    expect(character.web).toBe("https://e.jp/");
    expect(character.version).toBe("f");
  });

  it("最小構成でtxt出力できる", () => {
    const character = new CharacterTxt({ txt: "name:a" });
    expect(character.outputTxt()).toBe("name=a\r\n");
  });

  it("全プロパティでtxt出力できる", () => {
    const character = new CharacterTxt({
      name: "a",
      image: "b.bmp",
      sample: "c.wav",
      author: "d",
      web: "https://e.jp/",
      version: "f",
    });
    expect(character.outputTxt()).toBe(
      "name=a\r\nimage=b.bmp\r\nsample=c.wav\r\nauthor=d\r\nweb=https://e.jp/\r\nversion=f\r\n"
    );
  });
});
