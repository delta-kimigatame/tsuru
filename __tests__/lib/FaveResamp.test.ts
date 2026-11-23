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
      flags: "B80g10s20P86",
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
});
