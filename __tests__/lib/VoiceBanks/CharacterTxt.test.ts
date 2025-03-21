import { describe, expect, it } from "vitest";
import { CharacterTxt } from "../../../src/lib/VoiceBanks/CharacterTxt";

describe("CharacterTxt", () => {
  it("throw error", () => {
    expect(() => {
      new CharacterTxt({});
    }).toThrow("txtかnameのどちらかが必要です");
  });

  it("values_minimum", () => {
    const character = new CharacterTxt({ name: "a" });
    expect(character.name).toBe("a");
  });
  it("values_all", () => {
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
  it("text_minimum", () => {
    const character = new CharacterTxt({ txt: "name=a" });
    expect(character.name).toBe("a");
  });
  it("text_all", () => {
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
  it("text_all_cologne", () => {
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
  it("output_minimum", () => {
    const character = new CharacterTxt({ txt: "name:a" });
    expect(character.outputTxt()).toBe("name=a\r\n");
  });
  it("output_all", () => {
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
