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
  it("offsetMsとcutoffMsを指定してwavデータが取得できる", async () => {
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
  it("offsetMsと長さを指定してfrqデータが取得できる", async () => {
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
  it("velocity=100でパラメータが正しく伸長される", () => {
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
  it("velocity=0でパラメータが正しく伸長される", () => {
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
  it("velocity=100でパラメータが正しく縮小される", () => {
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
  it("velocity=200でパラメータが正しく縮小される", () => {
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
  it("velocity=200で縮小後に伸長してパラメータが正しく処理される", () => {
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

  it("modulation=0で音高が目標音高に変更される", () => {
    const p = resamp.pitchShift([435, 435, 435], 435, "A4", 0);
    expect(p).toEqual([440, 440, 440]);
    expect(resamp.pitchShift([435, 435, 435], 435, "A3", 0)).toEqual([
      220, 220, 220,
    ]);
  });
  it("modulationを指定して音高が正しく変更される", () => {
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

  it("ピッチデータが正しくf0に適用される", () => {
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

  it("intensityを指定して音量が正しく調整される", () => {
    const d = [0.5, 0.3, -0.3, -0.5, 0];
    expect(resamp.adjustVolume(d, 100, [1, 1, 1, 1, 1])).toEqual([
      0.5, 0.3, -0.3, -0.5, 0,
    ]);
    expect(resamp.adjustVolume(d, 200, [1, 1, 1, 1, 1])).toEqual([
      1, 0.6, -0.6, -1, 0,
    ]);
    expect(
      resamp.adjustVolume(d, 0, [1, 1, 1, 1, 1]).map((v) => (v === 0 ? 0 : v))
    ).toEqual([0, 0, 0, 0, 0]);
  });

  it("全パラメータを指定して合成が正しく実行される", async () => {
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

  it("Worker API用のメソッドで合成が正しく実行される", async () => {
    /**
     * vbをworkerに渡さないためにresampWorkerを作ったので実際はresamp.getWaveDataは使えないが、resampWorkerの確認のためにここは妥協
     */
    const iWav = await resamp.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200
    );
    /**
     * vbをworkerに渡さないためにresampWorkerを作ったので実際はresamp.getFrqDataは使えないが、resampWorkerの確認のためにここは妥協
     */
    const frq = await resamp.getFrqData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      (iWav.length / 44100) * 1000
    );
    const oWav = resamp.resampWorker({
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
      inputWavData: Float64Array.from(iWav),
      frqData: Float64Array.from(frq.frq),
      ampData: Float64Array.from(frq.amp),
      frqAverage: frq.frqAverage,
    });
    const wp = new WaveProcessing();
    const wav = GenerateWave(
      44100,
      16,
      wp.InverseLogicalNormalize(Array.from(oWav), 16)
    );
    const buf = wav.Output();
    fs.writeFileSync(
      "./__tests__/test_result/outputWorkerApi.wav",
      new DataView(buf)
    );
  });
});

describe("profilingResamp", () => {
  it("プロファイリング用テストで合成が正しく実行される", async () => {
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

describe("Resamp単体メソッド", () => {
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

  it("gFlag=0でスペクトルが変更されない", () => {
    const sp = [
      Float64Array.from([1, 2, 3, 4]),
      Float64Array.from([5, 6, 7, 8]),
    ];
    const result = resamp.applyGender(sp, 0);
    expect(result).toEqual(sp);
  });

  it("gFlag>0でスペクトルが変換される", () => {
    const sp = [
      Float64Array.from([1, 2, 3, 4, 5, 6, 7, 8]),
      Float64Array.from([1, 2, 3, 4, 5, 6, 7, 8]),
    ];
    const result = resamp.applyGender(sp, 50);
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(8);
    result.forEach((arr) => {
      arr.forEach((v) => expect(v).not.toBeNaN());
    });
  });

  it("BFlag=0,50,100で非周期性指標が変更されない", () => {
    const ap = [
      Float64Array.from([0.1, 0.2, 0.3]),
      Float64Array.from([0.4, 0.5, 0.6]),
    ];
    expect(resamp.applyBreath(ap, 0)).toEqual(ap);
    expect(resamp.applyBreath(ap, 50)).toEqual(ap);
    expect(resamp.applyBreath(ap, 100)).toEqual(ap);
  });

  it("BFlag<50で非周期性指標が減少する", () => {
    const ap = [Float64Array.from([0.5, 0.5, 0.5])];
    const result = resamp.applyBreath(ap, 25);
    expect(result[0][0]).toBeCloseTo(0.25);
    expect(result[0][1]).toBeCloseTo(0.25);
    expect(result[0][2]).toBeCloseTo(0.25);
  });

  it("BFlag>50で非周期性指標が増加する", () => {
    const ap = [Float64Array.from([0.5, 0.5, 0.5])];
    const result = resamp.applyBreath(ap, 75);
    expect(result[0][0]).toBeCloseTo(0.75);
    expect(result[0][1]).toBeCloseTo(0.75);
    expect(result[0][2]).toBeCloseTo(0.75);
  });
});
