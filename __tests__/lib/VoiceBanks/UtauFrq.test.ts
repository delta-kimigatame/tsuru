import { describe, expect, test } from "vitest";
import { Frq } from "../../../src/lib/VoiceBanks/UtauFrq";

describe("エラーが帰る", () => {
  test("bufもfrqも未指定の場合、エラーをスローする", () => {
    const frqs = [440.0, 440.0];
    expect(
      () =>
        new Frq({
          perSamples: 257,
        })
    ).toThrow("bufもしくはfrqのどちらかが必要です。");
  });
  test("dataもampも未指定の場合、エラーをスローする", () => {
    const frqs = [440.0, 440.0];
    expect(
      () =>
        new Frq({
          frq: Float64Array.from(frqs),
        })
    ).toThrow("dataもしくはampのどちらかが必要です。");
  });
});

describe("frqとampからFrq生成", () => {
  test("frqとampで生成できる", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBe(0);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp).toEqual(Float64Array.from(amp));
  });
  test("frqとampとperSamplesで生成できる", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      perSamples: 200,
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    expect(frq.perSamples).toBe(200);
    expect(frq.frqAverage).toBe(0);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp).toEqual(Float64Array.from(amp));
  });
  test("frqとampとfrqAverageで生成できる", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      frqAverage: 200,
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBe(200);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp).toEqual(Float64Array.from(amp));
  });
  test("frqとampと全パラメータで生成できる", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      perSamples: 300,
      frqAverage: 200,
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    expect(frq.perSamples).toBe(300);
    expect(frq.frqAverage).toBe(200);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp).toEqual(Float64Array.from(amp));
  });
  test("frqとampと全パラメータとdataで生成できる", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      perSamples: 300,
      frqAverage: 200,
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
      data: new Float64Array(512),
    });
    expect(frq.perSamples).toBe(300);
    expect(frq.frqAverage).toBe(200);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp).toEqual(Float64Array.from(amp));
  });
});

describe("frqAverage", () => {
  test("2個の値から平均周波数を計算できる", () => {
    const frqs = [439.0, 441.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    frq.calcAverageFrq();
    expect(frq.frqAverage).toBe(440);
  });
  test("3個の値から平均周波数を計算できる", () => {
    const frqs = [439.0, 441.0, 442.0];
    const amp = [0.6, 0.5, 0.4];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    frq.calcAverageFrq();
    expect(frq.frqAverage).toBeCloseTo(440.6666666666);
  });
  test("0を含む3個の値から平均周波数を計算できる", () => {
    const frqs = [439.0, 0, 441.0];
    const amp = [0.6, 0.5, 0.4];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    frq.calcAverageFrq();
    expect(frq.frqAverage).toBe(440);
  });
});

describe("frqとdataからFrq生成", () => {
  test("frqとdataで生成できる", () => {
    const frqs = [440.0, 440.0];
    const data = new Array<number>();
    for (let i = 0; i < 512; i++) {
      if (i < 256) {
        if (i % 2 === 0) {
          data.push(0.6);
        } else {
          data.push(-0.6);
        }
      } else {
        if (i % 2 === 0) {
          data.push(0.5);
        } else {
          data.push(-0.5);
        }
      }
    }
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      data: Float64Array.from(data),
    });
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBe(0);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp[0]).toBeCloseTo(0.6);
    expect(frq.amp[1]).toBeCloseTo(0.5);
  });
  test("frqとdataとperSamplesで生成できる", () => {
    const frqs = [440.0, 440.0];
    const data = new Array<number>();
    for (let i = 0; i < 20; i++) {
      if (i < 10) {
        if (i % 2 === 0) {
          data.push(0.6);
        } else {
          data.push(-0.6);
        }
      } else {
        if (i % 2 === 0) {
          data.push(0.5);
        } else {
          data.push(-0.5);
        }
      }
    }
    const frq = new Frq({
      perSamples: 10,
      frq: Float64Array.from(frqs),
      data: Float64Array.from(data),
    });
    expect(frq.perSamples).toBe(10);
    expect(frq.frqAverage).toBe(0);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp[0]).toBeCloseTo(0.6);
    expect(frq.amp[1]).toBeCloseTo(0.5);
  });
  test("frqとdataとfrqAverageで生成できる", () => {
    const frqs = [440.0, 440.0];
    const data = new Array<number>();
    for (let i = 0; i < 512; i++) {
      if (i < 256) {
        if (i % 2 === 0) {
          data.push(0.6);
        } else {
          data.push(-0.6);
        }
      } else {
        if (i % 2 === 0) {
          data.push(0.5);
        } else {
          data.push(-0.5);
        }
      }
    }
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      data: Float64Array.from(data),
      frqAverage: 300,
    });
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBe(300);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp[0]).toBeCloseTo(0.6);
    expect(frq.amp[1]).toBeCloseTo(0.5);
  });
  test("frqとdata（余剰あり）で生成できる", () => {
    const frqs = [440.0, 440.0];
    const data = new Array<number>();
    for (let i = 0; i < 257; i++) {
      if (i < 256) {
        if (i % 2 === 0) {
          data.push(0.6);
        } else {
          data.push(-0.6);
        }
      } else {
        data.push(0.5);
      }
    }
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      data: Float64Array.from(data),
    });
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBe(0);
    expect(frq.frq).toEqual(Float64Array.from(frqs));
    expect(frq.amp[0]).toBeCloseTo(0.6);
    expect(frq.amp[1]).toBeCloseTo(0.5);
  });
});

describe("バイナリを読み込みエラーが帰る", () => {
  test("52バイト未満の場合、エラーをスローする", () => {
    const errorData = new Uint8Array([
      0x46, 0x52, 0x45, 0x51, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    expect(() => new Frq({ buf: errorData.buffer })).toThrow(
      "このデータはfrqファイルではありません。ファイルサイズが小さすぎます。"
    );
  });
  test("FREQ識別子がない場合、エラーをスローする", () => {
    const errorData = new Uint8Array([
      0x46, 0x52, 0x45, 0x52, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    expect(() => new Frq({ buf: errorData.buffer })).toThrow(
      "このデータはfrqファイルではありません。FREQ識別子がありません。"
    );
  });
});

describe("バイナリを読み込み", () => {
  test("正常なデータを読み込める", () => {
    const data = new Uint8Array([
      0x46, 0x52, 0x45, 0x51, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    const frq = new Frq({ buf: data.buffer });
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBeCloseTo(119.47423345496698);
    expect(frq.frq[0]).toBe(0);
    expect(frq.amp[0]).toBe(0);
  });
});

describe("バイナリを書いて読む", () => {
  test("バイナリ出力して再読み込みできる", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    const outbuf = frq.output();
    const newFrq = new Frq({ buf: outbuf });
    expect(newFrq.perSamples).toBe(256);
    expect(newFrq.frqAverage).toBe(0);
    expect(newFrq.frq).toEqual(Float64Array.from(frqs));
    expect(newFrq.amp).toEqual(Float64Array.from(amp));
  });
});
