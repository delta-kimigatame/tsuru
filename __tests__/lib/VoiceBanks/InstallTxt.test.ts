import { describe, expect, it } from "vitest";
import { InstallTxt } from "../../../src/lib/VoiceBanks/InstallTxt";

describe("InstallTxt", () => {
  it("txtもfolderも未指定の場合、エラーをスローする", () => {
    expect(() => {
      new InstallTxt({});
    }).toThrow("txtかfolderのどちらかが必要です");
  });
  it("folder最小構成で初期化できる", () => {
    const install = new InstallTxt({ folder: "foo" });
    expect(install.folder).toBe("foo");
  });
  it("folder全プロパティで初期化できる", () => {
    const install = new InstallTxt({
      folder: "foo",
      contentsDir: "bar",
      description: "test",
    });
    expect(install.folder).toBe("foo");
    expect(install.contentsDir).toBe("bar");
    expect(install.description).toBe("test");
  });
  it("txt最小構成で初期化できる", () => {
    const install = new InstallTxt({ txt: "type=voiceset\r\nfolder=foo\r\n" });
    expect(install.folder).toBe("foo");
  });
  it("txt全プロパティで初期化できる", () => {
    const install = new InstallTxt({
      txt: "type=voiceset\r\nfolder=foo\r\ncontentsdir=bar\r\ndescription=test",
    });
    expect(install.folder).toBe("foo");
    expect(install.contentsDir).toBe("bar");
    expect(install.description).toBe("test");
  });
  it("最小構成でtxt出力できる", () => {
    const install = new InstallTxt({ folder: "foo" });
    const output = install.outputTxt();
    expect(output).toBe("type=voiceset\r\nfolder=foo\r\n");
  });
  it("contentsdirありでtxt出力できる", () => {
    const install = new InstallTxt({ folder: "foo", contentsDir: "bar" });
    const output = install.outputTxt();
    expect(output).toBe("type=voiceset\r\nfolder=foo\r\ncontentsdir=bar\r\n");
  });
  it("descriptionありでtxt出力できる", () => {
    const install = new InstallTxt({ folder: "foo", description: "test" });
    const output = install.outputTxt();
    expect(output).toBe("type=voiceset\r\nfolder=foo\r\ndescription=test\r\n");
  });
  it("全プロパティでtxt出力できる", () => {
    const install = new InstallTxt({
      folder: "foo",
      contentsDir: "bar",
      description: "test",
    });
    const output = install.outputTxt();
    expect(output).toBe(
      "type=voiceset\r\nfolder=foo\r\ncontentsdir=bar\r\ndescription=test\r\n"
    );
  });
});
