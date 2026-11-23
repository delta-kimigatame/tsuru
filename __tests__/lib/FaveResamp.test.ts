import fs from "fs";
import JSZip from "jszip";
import { GenerateWave, WaveProcessing } from "utauwav";
import { beforeAll, describe, expect, it } from "vitest";
import { Fave } from "../../src/lib/FaveResamp";
import { Resamp } from "../../src/lib/Resamp";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";

describe("FaveResamp", () => {
  let vb: VoiceBank;
  let resamp: Resamp;
  let fave: Fave;

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

    fave = new Fave(vb);
    await fave.initialize();
  });

  it("Worker APIで全体処理が実行できてwavを書き出せる", async () => {
    const iWav = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200,
    );
    const frq = await resamp.getFrqData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      (iWav.length / 44100) * 1000,
    );

    const oWav = fave.resampWorker({
      withFrq: true,
      inputWav: "denoise/01_あかきくけこ.wav",
      targetTone: "A3",
      velocity: 100,
      flags: "B51",
      offsetMs: 1538.32,
      targetMs: 600,
      fixedMs: 20,
      cutoffMs: -200,
      intensity: 100,
      modulation: 0,
      tempo: "!120",
      pitches: "AA#97#",
      inputWavData: Float64Array.from(iWav),
      frqData: Float64Array.from(frq.frq),
      ampData: Float64Array.from(frq.amp),
      frqAverage: frq.frqAverage,
    });

    expect(oWav.length).toBeGreaterThan(0);
    expect(oWav.some((v) => Number.isFinite(v))).toBe(true);
    const maxAbs = oWav.reduce(
      (acc, v) => Math.max(acc, Number.isFinite(v) ? Math.abs(v) : 0),
      0,
    );
    expect(maxAbs).toBeGreaterThan(0);

    const normalized = Array.from(oWav, (v) => {
      if (!Number.isFinite(v)) return 0;
      return Math.max(-1, Math.min(1, v));
    });

    const wp = new WaveProcessing();
    const wav = GenerateWave(
      44100,
      16,
      wp.InverseLogicalNormalize(normalized, 16),
    );
    const buf = wav.Output();
    fs.writeFileSync(
      "./__tests__/test_result/outputFaveWorkerApi.wav",
      new DataView(buf),
    );
  }, 30000);

  it("gフラグでスペクトル包絡が変化する", async () => {
    const iWav = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200,
    );
    const frq = await resamp.getFrqData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      (iWav.length / 44100) * 1000,
    );

    const baseRequest = {
      withFrq: true,
      inputWav: "denoise/01_あかきくけこ.wav",
      targetTone: "A3",
      velocity: 100,
      offsetMs: 1538.32,
      targetMs: 600,
      fixedMs: 20,
      cutoffMs: -200,
      intensity: 100,
      modulation: 0,
      tempo: "!120",
      pitches: "AA#97#",
      inputWavData: Float64Array.from(iWav),
      frqData: Float64Array.from(frq.frq),
      ampData: Float64Array.from(frq.amp),
      frqAverage: frq.frqAverage,
    };

    const gMinus = fave.resampWorker({
      ...baseRequest,
      flags: "B50g-30",
    });
    const gPlus = fave.resampWorker({
      ...baseRequest,
      flags: "B50g30",
    });

    expect(gMinus.length).toBe(gPlus.length);

    let diffSum = 0;
    for (let i = 0; i < gMinus.length; i++) {
      const a = Number.isFinite(gMinus[i]) ? gMinus[i] : 0;
      const b = Number.isFinite(gPlus[i]) ? gPlus[i] : 0;
      diffSum += Math.abs(a - b);
    }
    const meanDiff = diffSum / Math.max(1, gMinus.length);
    expect(meanDiff).toBeGreaterThan(1e-5);
  }, 30000);

  it("Sフラグとbフラグでスペクトル包絡が変化する", async () => {
    const iWav = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200,
    );
    const frq = await resamp.getFrqData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      (iWav.length / 44100) * 1000,
    );

    const baseRequest = {
      withFrq: true,
      inputWav: "denoise/01_あかきくけこ.wav",
      targetTone: "A3",
      velocity: 100,
      offsetMs: 1538.32,
      targetMs: 600,
      fixedMs: 20,
      cutoffMs: -200,
      intensity: 100,
      modulation: 0,
      tempo: "!120",
      pitches: "AA#97#",
      inputWavData: Float64Array.from(iWav),
      frqData: Float64Array.from(frq.frq),
      ampData: Float64Array.from(frq.amp),
      frqAverage: frq.frqAverage,
    };

    const neutral = fave.resampWorker({
      ...baseRequest,
      flags: "B50",
    });
    const sharped = fave.resampWorker({
      ...baseRequest,
      flags: "B50S50",
    });
    const brighted = fave.resampWorker({
      ...baseRequest,
      flags: "B50b50",
    });

    const calcMeanDiff = (a: Float64Array, b: Float64Array): number => {
      let diffSum = 0;
      const length = Math.min(a.length, b.length);
      for (let i = 0; i < length; i++) {
        const va = Number.isFinite(a[i]) ? a[i] : 0;
        const vb = Number.isFinite(b[i]) ? b[i] : 0;
        diffSum += Math.abs(va - vb);
      }
      return diffSum / Math.max(1, length);
    };

    expect(calcMeanDiff(neutral, sharped)).toBeGreaterThan(1e-5);
    expect(calcMeanDiff(neutral, brighted)).toBeGreaterThan(1e-5);
  }, 30000);
});
