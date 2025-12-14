import { describe, expect, it } from "vitest";
import { Wavtool } from "../../src/lib/Wavtool";

describe("Wavtool", () => {
  it("休符の場合エンベロープが0になる", () => {
    const tool = new Wavtool();
    expect(tool.getEnvelope(100, { point: [0, 0], value: [] })).toEqual({
      framePoint: [0, 0],
      value: [0, 0],
    });
  });
  it("3点エンベロープ(p1=0)が正しく変換される", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, { point: [0, 10, 50], value: [0, 100, 100] })
    ).toEqual({
      framePoint: [0, 441, 2205, 4410],
      value: [0, 100, 100, 0],
    });
  });
  it("3点エンベロープ(p1≠0)が正しく変換される", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, { point: [10, 10, 50], value: [50, 100, 100] })
    ).toEqual({
      framePoint: [0, 441, 882, 2205, 4410],
      value: [0, 50, 100, 100, 0],
    });
  });
  it("3点エンベロープ(value=4要素)が正しく変換される", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, { point: [0, 10, 50], value: [0, 100, 100, 100] })
    ).toEqual({
      framePoint: [0, 441, 2205, 4410],
      value: [0, 100, 100, 100],
    });
  });
  it("4点エンベロープが正しく変換される", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, {
        point: [0, 10, 40, 10],
        value: [0, 100, 100, 100],
      })
    ).toEqual({
      framePoint: [0, 441, 2205, 3969, 4410],
      value: [0, 100, 100, 100, 0],
    });
  });
  it("4点エンベロープ(p4=0)が正しく変換される", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, {
        point: [0, 10, 50, 0],
        value: [0, 100, 100, 100],
      })
    ).toEqual({
      framePoint: [0, 441, 2205, 4410],
      value: [0, 100, 100, 100],
    });
  });
  it("5点エンベロープが正しく変換される", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, {
        point: [0, 10, 40, 10, 10],
        value: [0, 100, 100, 100, 50],
      })
    ).toEqual({
      framePoint: [0, 441, 882, 2205, 3969, 4410],
      value: [0, 100, 50, 100, 100, 0],
    });
  });

  it("休符のエンベロープ適用で全て0になる", () => {
    const tool = new Wavtool();
    expect(
      tool.applyEnvelope(new Array(4410).fill(100), {
        framePoint: [0, 0],
        value: [0, 0],
      })
    ).toEqual(new Array(4410).fill(0));
  });
  it("シンプルなエンベロープが正しく適用される", () => {
    const tool = new Wavtool();
    expect(
      tool.applyEnvelope(new Array(10).fill(100), {
        framePoint: [0, 5, 10],
        value: [0, 100, 0],
      })
    ).toEqual([0, 20, 40, 60, 80, 100, 80, 60, 40, 20]);
  });
  it("複雑なエンベロープが正しく適用される", () => {
    const tool = new Wavtool();
    expect(
      tool.applyEnvelope(new Array(20).fill(100), {
        framePoint: [0, 5, 10, 20],
        value: [0, 100, 90, 0],
      })
    ).toEqual([
      0, 20, 40, 60, 80, 100, 98, 96, 94, 92, 90, 81, 72, 63, 54, 45, 36, 27,
      18, 9,
    ]);
  });

  it("初回結合(overlap=0)で波形データが設定される", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(10).fill(100));
    expect(tool.data).toEqual(new Array(10).fill(100));
  });
  it("初回結合(overlap>0)で波形データが設定される", () => {
    const tool = new Wavtool();
    tool.concat(5, new Array(10).fill(100));
    expect(tool.data).toEqual(new Array(10).fill(100));
  });
  it("オーバーラップなし結合で波形が連結される", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(10).fill(100));
    tool.concat(0, new Array(10).fill(50));
    expect(tool.data).toEqual(
      new Array(10).fill(100).concat(new Array(10).fill(50))
    );
  });
  it("オーバーラップありで波形が加算合成される", () => {
    const tool = new Wavtool();
    tool.concat(0, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    tool.concat(5, new Array(10).fill(50));
    expect(tool.data).toEqual(
      [0, 10, 20, 30, 40, 100, 110, 120, 130, 140].concat(new Array(5).fill(50))
    );
  });
  it("オーバーラップが既存データより大きい場合正しく加算される", () => {
    const tool = new Wavtool();
    tool.concat(0, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    tool.concat(20, new Array(20).fill(50));
    expect(tool.data).toEqual(
      new Array(10)
        .fill(50)
        .concat([50, 60, 70, 80, 90, 100, 110, 120, 130, 140])
    );
  });
  it("オーバーラップが既存データを超える場合正しく処理される", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(10).fill(100));
    tool.concat(50, new Array(20).fill(50));
    expect(tool.data).toEqual(
      new Array(10).fill(50).concat(new Array(10).fill(150))
    );
  });
  it("負のオーバーラップで空白挿入後に波形が連結される", () => {
    const tool = new Wavtool();
    tool.concat(0, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    tool.concat(-5, new Array(10).fill(50));
    expect(tool.data).toEqual(
      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].concat(
        new Array(5).fill(0),
        new Array(10).fill(50)
      )
    );
  });

  it("appendで波形とエンベロープが正しく結合される", () => {
    const tool = new Wavtool();
    tool.append({
      stp: 0,
      length: 100,
      overlap: 0,
      inputData: new Array(4410).fill(100),
      envelope: { point: [0, 10, 50], value: [0, 100, 100] },
    });
    expect(tool.data.length).toBe(4410);
    expect(tool.data[0]).toBe(0);
    // エンベロープ適用により末尾は0に近い値になる
    expect(Math.abs(tool.data[tool.data.length - 1])).toBeLessThan(1);
  });

  it("outputでArrayBufferが正しく生成される", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(4410).fill(0.5));
    const buffer = tool.output();
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("mixBackgroundAudioで伴奏が正しくミックスされる", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(100).fill(0.5));
    const mockWave = {
      data: new Array(200).fill(100),
      sampleRate: 44100,
      bitDepth: 16,
    };
    tool.mixBackgroundAudio(mockWave, 0, 0.5);
    expect(tool.data.length).toBe(100);
    tool.data.forEach((v) => {
      expect(typeof v).toBe("number");
      expect(v).not.toBeNaN();
    });
  });
});
