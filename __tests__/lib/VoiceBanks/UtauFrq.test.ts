import { describe, test, expect } from 'vitest';
import { Frq } from "../../../src/lib/VoiceBanks/UtauFrq";

describe("エラーが帰る", () => {
  test("no_buf_and_no_frq", () => {
    const frqs = [440.0, 440.0];
    expect(
      () =>
        new Frq({
          perSamples: 257,
        })
    ).toThrow("bufもしくはfrqのどちらかが必要です。");
  });
  test("no_data_and_no_amp", () => {
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
  test("frq_and_amp", () => {
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
  test("frq_and_amp_and_persamples", () => {
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
  test("frq_and_amp_and_frqavg", () => {
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
  test("frq_and_amp_and_all", () => {
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
  test("frq_and_amp_and_allwith_data", () => {
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
  test("2value", () => {
    const frqs = [439.0, 441.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    frq.CalcAverageFrq();
    expect(frq.frqAverage).toBe(440);
  });
  test("3value", () => {
    const frqs = [439.0, 441.0, 442.0];
    const amp = [0.6, 0.5, 0.4];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    frq.CalcAverageFrq();
    expect(frq.frqAverage).toBeCloseTo(440.6666666666);
  });
  test("3value_with0", () => {
    const frqs = [439.0, 0, 441.0];
    const amp = [0.6, 0.5, 0.4];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    frq.CalcAverageFrq();
    expect(frq.frqAverage).toBe(440);
  });
});

describe("frqとdataからFrq生成", () => {
  test("frq_and_data", () => {
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
  test("frq_and_data_and_perSamples", () => {
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
  test("frq_and_dataand_frqAverage", () => {
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
  test("frq_and_data_surplus", () => {
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
  test("small_than_52byte", () => {
    const errorData = new Uint8Array([
      0x46, 0x52, 0x45, 0x51, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    expect(() => new Frq({ buf: errorData.buffer })).toThrow(
      "このデータはfrqファイルではありません。ファイルサイズが小さすぎます。"
    );
  });
  test("no_FREQ", () => {
    const errorData = new Uint8Array([
      0x46, 0x52, 0x45, 0x52, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    expect(() => new Frq({ buf: errorData.buffer })).toThrow(
      "このデータはfrqファイルではありません。FREQ識別子がありません。"
    );
  });
});

describe("バイナリを読み込み", () => {
  test("safe_data", () => {
    const data = new Uint8Array([
      0x46, 0x52, 0x45, 0x51, 0x30, 0x30, 0x30, 0x33, 0x00, 0x01, 0x00, 0x00,
      0x25, 0xf0, 0x46, 0xd7, 0x59, 0xde, 0x5d, 0x40, 0x44, 0xac, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    const frq=new Frq({ buf: data.buffer })
    expect(frq.perSamples).toBe(256);
    expect(frq.frqAverage).toBeCloseTo(119.47423345496698);
    expect(frq.frq[0]).toBe(0);
    expect(frq.amp[0]).toBe(0);
  });
});

describe("バイナリを書いて読む", () => {
  test("safe_data", () => {
    const frqs = [440.0, 440.0];
    const amp = [0.6, 0.5];
    const frq = new Frq({
      frq: Float64Array.from(frqs),
      amp: Float64Array.from(amp),
    });
    const outbuf = frq.Output()
    const newFrq = new Frq({buf:outbuf})
    expect(newFrq.perSamples).toBe(256);
    expect(newFrq.frqAverage).toBe(0);
    expect(newFrq.frq).toEqual(Float64Array.from(frqs));
    expect(newFrq.amp).toEqual(Float64Array.from(amp));
  });
});
