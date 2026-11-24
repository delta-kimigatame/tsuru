import { describe, expect, it } from "vitest";
import { analyzeFrqByYin } from "../../src/lib/yin";

const SAMPLE_RATE = 44100;

/** 指定周波数の正弦波を作る */
const createSine = (frames: number, hz: number, amp = 0.4): Float64Array => {
  const data = new Float64Array(frames);
  for (let i = 0; i < frames; i++) {
    data[i] = amp * Math.sin((2 * Math.PI * hz * i) / SAMPLE_RATE);
  }
  return data;
};

describe("yin", () => {
  it("44.1kHzの正弦波からf0とampを推定できる", () => {
    const wav = createSine(Math.floor(SAMPLE_RATE * 0.8), 220, 0.35);
    const result = analyzeFrqByYin(wav);

    expect(result.frq.length).toBe(result.amp.length);
    expect(result.frq.length).toBeGreaterThan(0);

    const voiced = Array.from(result.frq).filter((v) => v > 0);
    expect(voiced.length).toBeGreaterThan(0);

    const meanF0 = voiced.reduce((acc, v) => acc + v, 0) / voiced.length;
    expect(meanF0).toBeGreaterThan(210);
    expect(meanF0).toBeLessThan(230);

    const meanAmp =
      Array.from(result.amp).reduce((acc, v) => acc + v, 0) / result.amp.length;
    expect(meanAmp).toBeGreaterThan(0.05);
    expect(result.frqAverage).toBeGreaterThan(210);
    expect(result.frqAverage).toBeLessThan(230);
  });

  it("無音では平均f0が0になり、ampもほぼ0になる", () => {
    const wav = new Float64Array(Math.floor(SAMPLE_RATE * 0.5)).fill(0);
    const result = analyzeFrqByYin(wav);

    expect(result.frqAverage).toBe(0);
    const maxAmp = Array.from(result.amp).reduce((m, v) => Math.max(m, v), 0);
    expect(maxAmp).toBe(0);
    expect(Array.from(result.frq).every((v) => v === 0)).toBe(true);
  });
});
