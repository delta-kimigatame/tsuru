import fs from "fs";
import JSZip from "jszip";
import { Blob } from "node:buffer";
import { describe, expect, it } from "vitest";

import { zipReader } from "../../src/services/zipReader";
import {
  EncodingOption,
  getTextDecoderEncoding,
} from "../../src/utils/EncodingMapping";

const fixtures = ["testVB.zip", "minimumTestVB.zip"] as const;

const createFile = (bytes: Uint8Array, name: string): File => {
  const blob = new Blob([bytes], { type: "application/zip" });

  return {
    size: blob.size,
    slice: blob.slice.bind(blob),
  } as File;
};

const createFixtureFile = (fixtureName: (typeof fixtures)[number]): File => {
  const bytes = fs.readFileSync(`./__tests__/__fixtures__/${fixtureName}`);
  return createFile(new Uint8Array(bytes), fixtureName);
};

const createSingleEntryZip = ({
  encrypted = false,
  validLocalHeader = true,
}: {
  encrypted?: boolean;
  validLocalHeader?: boolean;
} = {}): File => {
  const filename = new TextEncoder().encode("test.txt");
  const content = new Uint8Array([0x41]);
  const localHeaderLength = 30 + filename.length + content.length;
  const centralDirectoryLength = 46 + filename.length;
  const bytes = new Uint8Array(localHeaderLength + centralDirectoryLength + 22);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, validLocalHeader ? 0x04034b50 : 0, true);
  view.setUint16(26, filename.length, true);
  bytes.set(filename, 30);
  bytes.set(content, 30 + filename.length);

  const centralDirectoryOffset = localHeaderLength;
  view.setUint32(centralDirectoryOffset, 0x02014b50, true);
  view.setUint16(centralDirectoryOffset + 8, encrypted ? 0x0001 : 0, true);
  view.setUint16(centralDirectoryOffset + 10, 0, true);
  view.setUint32(centralDirectoryOffset + 20, content.length, true);
  view.setUint32(centralDirectoryOffset + 24, content.length, true);
  view.setUint16(centralDirectoryOffset + 28, filename.length, true);
  bytes.set(filename, centralDirectoryOffset + 46);

  const eocdOffset = centralDirectoryOffset + centralDirectoryLength;
  view.setUint32(eocdOffset, 0x06054b50, true);
  view.setUint16(eocdOffset + 8, 1, true);
  view.setUint16(eocdOffset + 10, 1, true);
  view.setUint32(eocdOffset + 12, centralDirectoryLength, true);
  view.setUint32(eocdOffset + 16, centralDirectoryOffset, true);

  return createFile(bytes, "generated.zip");
};

const createSingleEntryZip64 = (): File => {
  const filename = new TextEncoder().encode("zip64.txt");
  const content = new Uint8Array([0x5a]);
  const localHeaderLength = 30 + filename.length + content.length;
  const zip64ExtraFieldLength = 4 + 8 + 8 + 8;
  const centralDirectoryLength = 46 + filename.length + zip64ExtraFieldLength;
  const centralDirectoryOffset = localHeaderLength;
  const zip64EocdOffset = centralDirectoryOffset + centralDirectoryLength;
  const zip64LocatorOffset = zip64EocdOffset + 56;
  const eocdOffset = zip64LocatorOffset + 20;
  const bytes = new Uint8Array(eocdOffset + 22);
  const view = new DataView(bytes.buffer);

  // Local File Header
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 45, true);
  view.setUint16(8, 0, true);
  view.setUint32(18, content.length, true);
  view.setUint32(22, content.length, true);
  view.setUint16(26, filename.length, true);
  bytes.set(filename, 30);
  bytes.set(content, 30 + filename.length);

  // Central Directory File Header。サイズと Local File Header offset は ZIP64 Extra Field を参照する。
  view.setUint32(centralDirectoryOffset, 0x02014b50, true);
  view.setUint16(centralDirectoryOffset + 4, 45, true);
  view.setUint16(centralDirectoryOffset + 6, 45, true);
  view.setUint16(centralDirectoryOffset + 10, 0, true);
  view.setUint32(centralDirectoryOffset + 20, 0xffffffff, true);
  view.setUint32(centralDirectoryOffset + 24, 0xffffffff, true);
  view.setUint16(centralDirectoryOffset + 28, filename.length, true);
  view.setUint16(centralDirectoryOffset + 30, zip64ExtraFieldLength, true);
  view.setUint32(centralDirectoryOffset + 42, 0xffffffff, true);
  bytes.set(filename, centralDirectoryOffset + 46);

  const extraFieldOffset = centralDirectoryOffset + 46 + filename.length;
  view.setUint16(extraFieldOffset, 0x0001, true);
  view.setUint16(extraFieldOffset + 2, 24, true);
  view.setBigUint64(extraFieldOffset + 4, BigInt(content.length), true);
  view.setBigUint64(extraFieldOffset + 12, BigInt(content.length), true);
  view.setBigUint64(extraFieldOffset + 20, 0n, true);

  // ZIP64 End of Central Directory Record
  view.setUint32(zip64EocdOffset, 0x06064b50, true);
  view.setBigUint64(zip64EocdOffset + 4, 44n, true);
  view.setUint16(zip64EocdOffset + 12, 45, true);
  view.setUint16(zip64EocdOffset + 14, 45, true);
  view.setBigUint64(zip64EocdOffset + 24, 1n, true);
  view.setBigUint64(zip64EocdOffset + 32, 1n, true);
  view.setBigUint64(zip64EocdOffset + 40, BigInt(centralDirectoryLength), true);
  view.setBigUint64(zip64EocdOffset + 48, BigInt(centralDirectoryOffset), true);

  // ZIP64 End of Central Directory Locator
  view.setUint32(zip64LocatorOffset, 0x07064b50, true);
  view.setBigUint64(zip64LocatorOffset + 8, BigInt(zip64EocdOffset), true);
  view.setUint32(zip64LocatorOffset + 16, 1, true);

  // 通常 EOCD の ZIP64 sentinel 値
  view.setUint32(eocdOffset, 0x06054b50, true);
  view.setUint16(eocdOffset + 8, 0xffff, true);
  view.setUint16(eocdOffset + 10, 0xffff, true);
  view.setUint32(eocdOffset + 12, 0xffffffff, true);
  view.setUint32(eocdOffset + 16, 0xffffffff, true);

  return createFile(bytes, "generated-zip64.zip");
};

const loadFixtureWithJSZip = async (fixtureName: (typeof fixtures)[number]) => {
  const bytes = fs.readFileSync(`./__tests__/__fixtures__/${fixtureName}`);
  const decoder = new TextDecoder(
    getTextDecoderEncoding(EncodingOption.SHIFT_JIS),
  );

  return JSZip.loadAsync(bytes, {
    decodeFileName: (filenameBytes) =>
      decoder.decode(filenameBytes as Uint8Array),
  });
};

describe("zipReader", () => {
  it("EOCD を含まないバイト列は初期化時に拒否する", async () => {
    const reader = new zipReader(
      createFile(new Uint8Array([0x00, 0x01, 0x02, 0x03]), "invalid.zip"),
    );

    await expect(reader.Initialize()).rejects.toThrow("EOCD not found");
  });

  it("暗号化フラグを持つエントリを初期化時に拒否する", async () => {
    const reader = new zipReader(createSingleEntryZip({ encrypted: true }));

    await expect(reader.Initialize()).rejects.toThrow(
      "Encrypted ZIP entries are unsupported: test.txt",
    );
  });

  it("Local File Header のシグネチャが不正なエントリを拒否する", async () => {
    const reader = new zipReader(
      createSingleEntryZip({ validLocalHeader: false }),
    );
    await reader.Initialize();

    await expect(reader.LoadFile("test.txt")).rejects.toThrow(
      "signature error :test.txt",
    );
  });

  it("ZIP64 の一覧を取得し、ZIP64 Extra Field を使ってファイルを取り出せる", async () => {
    const reader = new zipReader(createSingleEntryZip64());

    await reader.Initialize();

    expect(reader.GetFileList()).toEqual(["zip64.txt"]);
    expect(reader.HasFile("zip64.txt")).toBe(true);
    expect(new Uint8Array(await reader.LoadFile("zip64.txt"))).toEqual(
      new Uint8Array([0x5a]),
    );
  });

  it.each(fixtures)(
    "フィクスチャ %s の一覧を取得できる",
    async (fixtureName) => {
      const reader = new zipReader(createFixtureFile(fixtureName));

      await reader.Initialize(EncodingOption.SHIFT_JIS);

      const filenames = reader.GetFileList();
      expect(filenames.length).toBeGreaterThan(0);
      expect(
        filenames.some((filename) => filename.endsWith("character.txt")),
      ).toBe(true);

      const zip = await loadFixtureWithJSZip(fixtureName);
      expect(filenames).toEqual(Object.keys(zip.files));
    },
  );

  it.each(fixtures)(
    "フィクスチャ %s 内の character.txt を取り出せる",
    async (fixtureName) => {
      const reader = new zipReader(createFixtureFile(fixtureName));
      await reader.Initialize(EncodingOption.SHIFT_JIS);
      const zip = await loadFixtureWithJSZip(fixtureName);

      const filename = reader
        .GetFileList()
        .find((entryName) => entryName.endsWith("character.txt"));

      expect(filename).toBeDefined();
      expect(reader.HasFile(filename!)).toBe(true);

      const data = await reader.LoadFile(filename!);
      expect(new Uint8Array(data)).toEqual(
        new Uint8Array(await zip.files[filename!].async("arraybuffer")),
      );
    },
  );
});
