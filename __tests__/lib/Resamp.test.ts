import fs from "fs";
import JSZip from "jszip";
import { GenerateWave, WaveProcessing } from "utauwav";
import { beforeAll, describe, expect, it } from "vitest";
import { Resamp } from "../../src/lib/Resamp";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { makeTimeAxis } from "../../src/utils/interp";

describe("Resamp", () => {
  let vb: VoiceBank;
  let resamp: Resamp;

  beforeAll(async () => {
    const buffer = fs.readFileSync("./__tests__/__fixtures__/testVB.zip");
    const zip = new JSZip();
    const td = new TextDecoder("shift-jis");
    await zip.loadAsync(buffer, {
      // @ts-expect-error 型の方がおかしい
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    vb = new VoiceBank(zip.files);
    await vb.initialize();
    resamp = new Resamp(vb);
    await resamp.initialize();
  });
  it("getWavData", async () => {
    const wav = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -100
    );
    expect(wav.length).toBe(4410);
    const wav2 = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200
    );
    expect(wav2.length).toBe(8820);
    /** wavの長さ5851.428571428572 */
    const wav3 = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1500,
      5851.428571428572 - 1600
    );
    expect(wav3.length).toBe(4410);
  });
  it("getFrq", async () => {
    const frq = await resamp.getFrqData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      100
    );
    expect(frq.frqAverage).toBeCloseTo(120.29838696728505);
    frq.frq.forEach((f) => expect(f).not.toBeNaN());
    frq.amp.forEach((f) => expect(f).not.toBeNaN());
    expect(frq.timeAxis.length).toBeCloseTo(21);
    expect(frq.frq.length).toBe(21);
    expect(frq.amp.length).toBe(21);
    const frq2 = await resamp.getFrqData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      200
    );
    expect(frq2.frqAverage).toBeCloseTo(120.29838696728505);
    expect(frq2.timeAxis.length).toBeCloseTo(41);
    expect(frq2.frq.length).toBe(41);
    expect(frq2.amp.length).toBe(41);
    frq2.frq.forEach((f) => expect(f).not.toBeNaN());
    frq2.amp.forEach((f) => expect(f).not.toBeNaN());
  });
  it("stretchSimple", () => {
    const s1 = resamp.stretch(
      [0, 1, 2, 3, 4],
      [
        Float64Array.from([0, 0]),
        Float64Array.from([1, 1]),
        Float64Array.from([2, 2]),
        Float64Array.from([3, 3]),
        Float64Array.from([4, 4]),
      ],
      [
        Float64Array.from([5, 5]),
        Float64Array.from([6, 6]),
        Float64Array.from([7, 7]),
        Float64Array.from([8, 8]),
        Float64Array.from([9, 9]),
      ],
      [5, 6, 7, 8, 9],
      50,
      10,
      100
    );
    expect(s1.f0.length).toBe(10);
    expect(s1.f0).toEqual([0, 1, 2, 2, 2, 3, 3, 3, 4, 4]);
    expect(s1.sp).toEqual([
      Float64Array.from([0, 0]),
      Float64Array.from([1, 1]),
      Float64Array.from([2, 2]),
      Float64Array.from([2, 2]),
      Float64Array.from([2, 2]),
      Float64Array.from([3, 3]),
      Float64Array.from([3, 3]),
      Float64Array.from([3, 3]),
      Float64Array.from([4, 4]),
      Float64Array.from([4, 4]),
    ]);
    expect(s1.ap).toEqual([
      Float64Array.from([5, 5]),
      Float64Array.from([6, 6]),
      Float64Array.from([7, 7]),
      Float64Array.from([7, 7]),
      Float64Array.from([7, 7]),
      Float64Array.from([8, 8]),
      Float64Array.from([8, 8]),
      Float64Array.from([8, 8]),
      Float64Array.from([9, 9]),
      Float64Array.from([9, 9]),
    ]);
    expect(s1.amp).toEqual([5, 6, 7, 7, 7, 8, 8, 8, 9, 9]);
  });
  it("stretchVelocity0", () => {
    const s1 = resamp.stretch(
      [0, 1, 2, 3, 4],
      [
        Float64Array.from([0, 0]),
        Float64Array.from([1, 1]),
        Float64Array.from([2, 2]),
        Float64Array.from([3, 3]),
        Float64Array.from([4, 4]),
      ],
      [
        Float64Array.from([5, 5]),
        Float64Array.from([6, 6]),
        Float64Array.from([7, 7]),
        Float64Array.from([8, 8]),
        Float64Array.from([9, 9]),
      ],
      [5, 6, 7, 8, 9],
      50,
      10,
      0
    );
    expect(s1.f0.length).toBe(10);
    expect(s1.f0).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(s1.sp).toEqual([
      Float64Array.from([0, 0]),
      Float64Array.from([0, 0]),
      Float64Array.from([1, 1]),
      Float64Array.from([1, 1]),
      Float64Array.from([2, 2]),
      Float64Array.from([2, 2]),
      Float64Array.from([3, 3]),
      Float64Array.from([3, 3]),
      Float64Array.from([4, 4]),
      Float64Array.from([4, 4]),
    ]);
    expect(s1.ap).toEqual([
      Float64Array.from([5, 5]),
      Float64Array.from([5, 5]),
      Float64Array.from([6, 6]),
      Float64Array.from([6, 6]),
      Float64Array.from([7, 7]),
      Float64Array.from([7, 7]),
      Float64Array.from([8, 8]),
      Float64Array.from([8, 8]),
      Float64Array.from([9, 9]),
      Float64Array.from([9, 9]),
    ]);
    expect(s1.amp).toEqual([5, 5, 6, 6, 7, 7, 8, 8, 9, 9]);
  });
  it("stretchSimpleShurink", () => {
    const s1 = resamp.stretch(
      [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
      [
        Float64Array.from([0, 0]),
        Float64Array.from([0, 0]),
        Float64Array.from([1, 1]),
        Float64Array.from([1, 1]),
        Float64Array.from([2, 2]),
        Float64Array.from([2, 2]),
        Float64Array.from([3, 3]),
        Float64Array.from([3, 3]),
        Float64Array.from([4, 4]),
        Float64Array.from([4, 4]),
      ],
      [
        Float64Array.from([5, 5]),
        Float64Array.from([5, 5]),
        Float64Array.from([6, 6]),
        Float64Array.from([6, 6]),
        Float64Array.from([7, 7]),
        Float64Array.from([7, 7]),
        Float64Array.from([8, 8]),
        Float64Array.from([8, 8]),
        Float64Array.from([9, 9]),
        Float64Array.from([9, 9]),
      ],
      [5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
      25,
      20,
      100
    );
    expect(s1.f0.length).toBe(5);
    expect(s1.f0).toEqual([0, 0, 1, 1, 2]);
    expect(s1.sp).toEqual([
      Float64Array.from([0, 0]),
      Float64Array.from([0, 0]),
      Float64Array.from([1, 1]),
      Float64Array.from([1, 1]),
      Float64Array.from([2, 2]),
    ]);
    expect(s1.ap).toEqual([
      Float64Array.from([5, 5]),
      Float64Array.from([5, 5]),
      Float64Array.from([6, 6]),
      Float64Array.from([6, 6]),
      Float64Array.from([7, 7]),
    ]);
    expect(s1.amp).toEqual([5, 5, 6, 6, 7]);
  });
  it("stretchSimpleShurinkVelocity", () => {
    const s1 = resamp.stretch(
      [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
      [
        Float64Array.from([0, 0]),
        Float64Array.from([0, 0]),
        Float64Array.from([1, 1]),
        Float64Array.from([1, 1]),
        Float64Array.from([2, 2]),
        Float64Array.from([2, 2]),
        Float64Array.from([3, 3]),
        Float64Array.from([3, 3]),
        Float64Array.from([4, 4]),
        Float64Array.from([4, 4]),
      ],
      [
        Float64Array.from([5, 5]),
        Float64Array.from([5, 5]),
        Float64Array.from([6, 6]),
        Float64Array.from([6, 6]),
        Float64Array.from([7, 7]),
        Float64Array.from([7, 7]),
        Float64Array.from([8, 8]),
        Float64Array.from([8, 8]),
        Float64Array.from([9, 9]),
        Float64Array.from([9, 9]),
      ],
      [5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
      25,
      20,
      200
    );
    expect(s1.f0.length).toBe(5);
    expect(s1.f0).toEqual([0, 1, 2, 3, 4]);
    expect(s1.sp).toEqual([
      Float64Array.from([0, 0]),
      Float64Array.from([1, 1]),
      Float64Array.from([2, 2]),
      Float64Array.from([3, 3]),
      Float64Array.from([4, 4]),
    ]);
    expect(s1.ap).toEqual([
      Float64Array.from([5, 5]),
      Float64Array.from([6, 6]),
      Float64Array.from([7, 7]),
      Float64Array.from([8, 8]),
      Float64Array.from([9, 9]),
    ]);
    expect(s1.amp).toEqual([5, 6, 7, 8, 9]);
  });
  it("stretchSimpleShurinkVelocityWithstretch", () => {
    const s1 = resamp.stretch(
      [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
      [
        Float64Array.from([0, 0]),
        Float64Array.from([0, 0]),
        Float64Array.from([1, 1]),
        Float64Array.from([1, 1]),
        Float64Array.from([2, 2]),
        Float64Array.from([2, 2]),
        Float64Array.from([3, 3]),
        Float64Array.from([3, 3]),
        Float64Array.from([4, 4]),
        Float64Array.from([4, 4]),
      ],
      [
        Float64Array.from([5, 5]),
        Float64Array.from([5, 5]),
        Float64Array.from([6, 6]),
        Float64Array.from([6, 6]),
        Float64Array.from([7, 7]),
        Float64Array.from([7, 7]),
        Float64Array.from([8, 8]),
        Float64Array.from([8, 8]),
        Float64Array.from([9, 9]),
        Float64Array.from([9, 9]),
      ],
      [5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
      50,
      20,
      200
    );
    expect(s1.f0.length).toBe(10);
    expect(s1.f0).toEqual([0, 1, 2, 2, 2, 2, 3, 3, 4, 4]);
    expect(s1.sp).toEqual([
      Float64Array.from([0, 0]),
      Float64Array.from([1, 1]),
      Float64Array.from([2, 2]),
      Float64Array.from([2, 2]),
      Float64Array.from([2, 2]),
      Float64Array.from([2, 2]),
      Float64Array.from([3, 3]),
      Float64Array.from([3, 3]),
      Float64Array.from([4, 4]),
      Float64Array.from([4, 4]),
    ]);
    expect(s1.ap).toEqual([
      Float64Array.from([5, 5]),
      Float64Array.from([6, 6]),
      Float64Array.from([7, 7]),
      Float64Array.from([7, 7]),
      Float64Array.from([7, 7]),
      Float64Array.from([7, 7]),
      Float64Array.from([8, 8]),
      Float64Array.from([8, 8]),
      Float64Array.from([9, 9]),
      Float64Array.from([9, 9]),
    ]);
    expect(s1.amp).toEqual([5, 6, 7, 7, 7, 7, 8, 8, 9, 9]);
  });

  it("pitchShift_mod0", () => {
    const p = resamp.pitchShift([435, 435, 435], 435, "A4", 0);
    expect(p).toEqual([440, 440, 440]);
    expect(resamp.pitchShift([435, 435, 435], 435, "A3", 0)).toEqual([
      220, 220, 220,
    ]);
  });
  it("pitchShift_mod", () => {
    const p = resamp.pitchShift([880, 880, 880], 440, "A4", 100);
    expect(p).toEqual([880, 880, 880]);
    expect(resamp.pitchShift([880, 880, 880], 440, "A4", 50)).toEqual([
      440 * 2 ** 0.5,
      440 * 2 ** 0.5,
      440 * 2 ** 0.5,
    ]);
    expect(resamp.pitchShift([880, 880, 880], 440, "A4", -100)).toEqual([
      220, 220, 220,
    ]);
  });

  it("applyPitch", () => {
    const p = resamp.pitchShift(new Array(100).fill(440), 440, "A4", 0);
    expect(
      resamp
        .applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "AA#96#", "!120")
        .map((v) => Math.round(v))
    ).toEqual(new Array(100).fill(440));
    expect(
      resamp.applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "AB#96#", "!120")
    ).toEqual(new Array(100).fill(440 * 2 ** (1 / 1200)));
    expect(
      resamp
        .applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "Sw#96#", "!120")
        .map((v) => Math.round(v))
    ).toEqual(new Array(100).fill(880));
    expect(
      resamp
        .applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "tQ#96#", "!120")
        .map((v) => Math.round(v))
    ).toEqual(new Array(100).fill(220));
    expect(
      resamp.applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "AB#96#", "120")
    ).toEqual(new Array(100).fill(440 * 2 ** (1 / 1200)));
    expect(
      resamp.applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "AB#48#", "!60")
    ).toEqual(new Array(100).fill(440 * 2 ** (1 / 1200)));
    expect(
      resamp
        .applyPitch(p, makeTimeAxis(5 / 1000, 0, 0.5), "Sw#193#", "!240")
        .map((v) => Math.round(v))
    ).toEqual(new Array(100).fill(880));
  });

  it("adjustIntensity", () => {
    const d = [0.5, 0.3, -0.3, -0.5, 0];
    expect(resamp.adjustVolume(d, 100)).toEqual([0.5, 0.3, -0.3, -0.5, 0]);
    expect(resamp.adjustVolume(d, 200)).toEqual([1, 0.6, -0.6, -1, 0]);
    expect(resamp.adjustVolume(d, 0).map((v) => (v === 0 ? 0 : v))).toEqual([
      0, 0, 0, 0, 0,
    ]);
  });

  it("resamp", async () => {
    const w = await resamp.resamp({
      inputWav: "denoise/01_あかきくけこ.wav",
      targetTone: "A3",
      velocity: 100,
      flags: "",
      offsetMs: 1538.32,
      targetMs: 600,
      fixedMs: 20,
      cutoffMs: -200,
      intensity: 100,
      modulation: 0,
      tempo: "!120",
      pitches: "AA#97#",
    });
    const wp = new WaveProcessing();
    const wav = GenerateWave(44100, 16, wp.InverseLogicalNormalize(w, 16));
    const buf = wav.Output();
    fs.writeFileSync("./__tests__/test_result/output.wav", new DataView(buf));
  });
});

describe("profilingResamp", () => {
  it("profilingResamp", async () => {
    const buffer = fs.readFileSync("./__tests__/__fixtures__/testVB.zip");
    const zip = new JSZip();
    const td = new TextDecoder("shift-jis");
    await zip.loadAsync(buffer, {
      // @ts-expect-error 型の方がおかしい
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    const vb = new VoiceBank(zip.files);
    await vb.initialize();
    const resamp = new Resamp(vb);
    await resamp.initialize();
    const w = await resamp.resamp({
      inputWav: "denoise/01_あかきくけこ.wav",
      targetTone: "A3",
      velocity: 100,
      flags: "",
      offsetMs: 1538.32,
      targetMs: 600,
      fixedMs: 20,
      cutoffMs: -200,
      intensity: 100,
      modulation: 0,
      tempo: "!120",
      pitches: "AA#97#",
    });
    expect(w.length).toBe(26240);
  });
});
