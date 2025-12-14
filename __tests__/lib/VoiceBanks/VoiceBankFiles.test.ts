import * as iconv from "iconv-lite";
import { describe, expect, it } from "vitest";
import { CharacterTxt } from "../../../src/lib/VoiceBanks/CharacterTxt";
import { VoiceBankFiles } from "../../../src/lib/VoiceBanks/VoiceBankFiles";

/**
 * webkitRelativePathとarrayBuffer()を持つFileオブジェクトを作成するヘルパー
 */
function createFileWithPath(
  content: BlobPart[],
  filename: string,
  relativePath: string,
  options?: FilePropertyBag
): File {
  const file = new File(content, filename, options);

  // webkitRelativePathは読み取り専用なので、Object.definePropertyで設定
  Object.defineProperty(file, "webkitRelativePath", {
    value: relativePath,
    writable: false,
    configurable: true,
  });

  // Node.js環境用にarrayBuffer()を実装
  Object.defineProperty(file, "arrayBuffer", {
    value: async function () {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(file);
      });
    },
    writable: false,
    configurable: true,
  });

  return file;
}

describe("VoiceBankFiles", () => {
  it("character.txtがない場合、エラーをスローする", async () => {
    const files: File[] = [];
    const vb = new VoiceBankFiles(files);
    await expect(async () => {
      await vb.initialize();
    }).rejects.toThrow("character.txt not found.");
  });

  it("最小構成のcharacter.txtで初期化できる", async () => {
    const c = new CharacterTxt({ name: "あ" });
    const c_output = createFileWithPath(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const files = [c_output];
    const vb = new VoiceBankFiles(files);
    await vb.initialize();
    expect(vb.name).toBe("あ");
    expect(vb.image).toBeUndefined();
    expect(vb.sample).toBeUndefined();
    expect(vb.author).toBeUndefined();
    expect(vb.web).toBeUndefined();
    expect(vb.version).toBeUndefined();
    expect(vb.readme).toBeUndefined();
  });

  it("全プロパティのcharacter.txtで初期化できる", async () => {
    const c = new CharacterTxt({
      name: "a",
      image: "b.bmp",
      sample: "c.wav",
      author: "d",
      web: "https://e.jp/",
      version: "f",
    });
    const c_output = createFileWithPath(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const iconBuf = new Uint8Array([0x01]);
    const iconFile = createFileWithPath([iconBuf], "b.bmp", "root/b.bmp");
    const sampleBuf = new Uint8Array([0x02]);
    const sampleFile = createFileWithPath([sampleBuf], "c.wav", "root/c.wav");

    const files = [c_output, iconFile, sampleFile];
    const vb = new VoiceBankFiles(files);
    await vb.initialize();
    expect(vb.name).toBe("a");
    expect(vb.image).toEqual(iconBuf.buffer);
    expect(vb.sample).toEqual(sampleBuf.buffer);
    expect(vb.author).toBe("d");
    expect(vb.web).toBe("https://e.jp/");
    expect(vb.version).toBe("f");
  });

  it("readme.txtを読み込める", async () => {
    const c = new CharacterTxt({ name: "a" });
    const c_output = createFileWithPath(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const r_output = createFileWithPath(
      [iconv.encode("test", "Windows-31j")],
      "readme.txt",
      "root/readme.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const files = [c_output, r_output];
    const vb = new VoiceBankFiles(files);
    await vb.initialize();
    expect(vb.readme).toBe("test");
  });

  it("getWaveでWAVファイルを取得できる", async () => {
    const c = new CharacterTxt({ name: "あ" });
    const c_output = createFileWithPath(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    // 最小限の有効なWAVヘッダーを作成（VoiceBank.test.tsと同様）
    const wavBuf = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0xe0, 0x07, 0x00, 0x57, 0x41, 0x56, 0x45,
      0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
      0x64, 0x61, 0x74, 0x61, 0x00, 0xe0, 0x07, 0x00,
    ]);
    const wavFile = createFileWithPath([wavBuf], "test.wav", "root/test.wav");
    const files = [c_output, wavFile];
    const vb = new VoiceBankFiles(files);
    await vb.initialize();
    const wave = await vb.getWave("test.wav");
    expect(wave).toBeDefined();
  });

  it("存在しないWAVファイルを取得しようとするとエラーをスローする", async () => {
    const c = new CharacterTxt({ name: "あ" });
    const c_output = createFileWithPath(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const files = [c_output];
    const vb = new VoiceBankFiles(files);
    await vb.initialize();
    await expect(async () => {
      await vb.getWave("notfound.wav");
    }).rejects.toThrow("root/notfound.wav not found.");
  });

  it("UTF-8エンコーディングのファイルを読み込める", async () => {
    const c = new CharacterTxt({ name: "あ" });
    const c_output = createFileWithPath(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "utf8")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=utf-8" }
    );
    const files = [c_output];
    const vb = new VoiceBankFiles(files);
    await vb.initialize("UTF-8");
    expect(vb.name).toBe("あ");
  });

  it("root未定義の場合、filesプロパティが全ファイルを返す", () => {
    const c_output = createFileWithPath(
      [new Uint8Array([0x01])],
      "test.txt",
      "test.txt"
    );
    const files = [c_output];
    const vb = new VoiceBankFiles(files);
    const result = vb.files;
    expect(Object.keys(result).length).toBe(1);
    expect(result["test.txt"]).toBeDefined();
  });

  it("root定義済みの場合、filesプロパティがroot以下のファイルのみを返す", async () => {
    const c_output = createFileWithPath(
      [iconv.encode("name=a", "Windows-31j")],
      "character.txt",
      "root/character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const other_output = createFileWithPath(
      [new Uint8Array([0x01])],
      "other.txt",
      "other/other.txt"
    );
    const root_output = createFileWithPath(
      [new Uint8Array([0x02])],
      "test.txt",
      "root/test.txt"
    );
    const files = [c_output, other_output, root_output];
    const vb = new VoiceBankFiles(files);
    await vb.initialize();
    const result = vb.files;
    expect(Object.keys(result).length).toBe(2);
    expect(result["character.txt"]).toBeDefined();
    expect(result["test.txt"]).toBeDefined();
    expect(result["other.txt"]).toBeUndefined();
  });
});
