import fs from "fs";
import JSZip from "jszip";
import { GenerateWave, WaveProcessing } from "utauwav";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Fave } from "../../src/lib/FaveResamp";
import type { BaseVoiceBank } from "../../src/lib/VoiceBanks/BaseVoiceBank";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import type { ResampWorkerRequest } from "../../src/types/request";
import { encodePitch, getFrqFromTone } from "../../src/utils/pitch";

const SAMPLE_RATE = 44100;

/** サンプル数をmsへ変換する */
const samplesToMs = (samples: number): number => (samples / SAMPLE_RATE) * 1000;

/** 指定周波数の正弦波を作る */
const createSine = (frames: number, hz: number, amp = 0.3): Float64Array => {
  const data = new Float64Array(frames);
  for (let i = 0; i < frames; i++) {
    data[i] = amp * Math.sin((2 * Math.PI * hz * i) / SAMPLE_RATE);
  }
  return data;
};

/** 基本周波数hzの倍音を「1/倍音番号」の振幅で重ねた波形を作る */
const createHarmonic = (
  frames: number,
  hz: number,
  harmonics = 20,
): Float64Array => {
  const data = new Float64Array(frames);
  for (let k = 1; k <= harmonics; k++) {
    for (let i = 0; i < frames; i++) {
      data[i] += (0.3 / k) * Math.sin((2 * Math.PI * hz * k * i) / SAMPLE_RATE);
    }
  }
  return data;
};

/** 正方向のゼロクロス回数から[start,end)区間の周波数(Hz)を推定する */
const estimateFrequency = (
  data: Float64Array,
  start: number,
  end: number,
): number => {
  let crossings = 0;
  for (let i = start + 1; i < end; i++) {
    if (data[i - 1] < 0 && data[i] >= 0) {
      crossings++;
    }
  }
  return (crossings * SAMPLE_RATE) / (end - start);
};

/** [start,end)区間のhz成分の振幅を求める */
const magnitudeAt = (
  data: Float64Array,
  hz: number,
  start: number,
  end: number,
): number => {
  let re = 0;
  let im = 0;
  for (let i = start; i < end; i++) {
    const phase = (2 * Math.PI * hz * i) / SAMPLE_RATE;
    re += data[i] * Math.cos(phase);
    im -= data[i] * Math.sin(phase);
  }
  return Math.hypot(re, im) / (end - start);
};

/** 2つの波形の[start,end)区間での最大絶対差を求める */
const maxAbsDiff = (
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  start = 0,
  end = Math.min(a.length, b.length),
): number => {
  let max = 0;
  for (let i = start; i < end; i++) {
    max = Math.max(max, Math.abs(a[i] - b[i]));
  }
  return max;
};

/** getFrqのみを持つスタブのVoiceBankを作る */
const createFrqVoiceBank = (
  frq: number[],
  amp: number[],
  perSamples = 256,
  frqAverage = 220,
) => {
  const getFrq = vi.fn(async (_inputWav: string) => ({
    perSamples,
    frq: Float64Array.from(frq),
    amp: Float64Array.from(amp),
    frqAverage,
  }));
  return { vb: { getFrq } as unknown as BaseVoiceBank, getFrq };
};

/** getWaveのみを持つスタブのVoiceBankを作る。波形の値はインデックスと同じにする */
const createWaveVoiceBank = (frames: number) => {
  const data = Array.from({ length: frames }, (_, i) => i);
  const getWave = vi.fn(async (_inputWav: string) => ({
    data,
    sampleRate: SAMPLE_RATE,
    LogicalNormalize: (_factor: number) => data,
  }));
  return { vb: { getWave } as unknown as BaseVoiceBank, getWave };
};

describe("FaveResamp", () => {
  let vb: VoiceBank;
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

    fave = new Fave(vb);
    await fave.initialize();
  });

  it("Worker APIで全体処理が実行できてwavを書き出せる", async () => {
    const iWav = await fave.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200,
    );
    const frq = await fave.getFrqData(
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
    const iWav = await fave.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200,
    );
    const frq = await fave.getFrqData(
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
    const iWav = await fave.getWaveData(
      "denoise/01_あかきくけこ.wav",
      1538.32,
      -200,
    );
    const frq = await fave.getFrqData(
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

  describe("initialize", () => {
    it("即座に解決する", async () => {
      await expect(fave.initialize()).resolves.toBeUndefined();
    });
  });

  describe("getWaveData", () => {
    it("offsetMsとcutoffMs(負の値)の範囲を切り出す", async () => {
      const { vb: stubVb, getWave } = createWaveVoiceBank(SAMPLE_RATE);
      const result = await new Fave(stubVb).getWaveData("a.wav", 10, -20);

      // 10ms=441frame, 10+20ms=30ms=1323frame
      expect(getWave).toHaveBeenCalledWith("a.wav");
      expect(result.length).toBe(882);
      expect(result[0]).toBe(441);
      expect(result[result.length - 1]).toBe(1322);
    });

    it("cutoffMsが正の値のときはwav末尾からcutoffMs手前までを切り出す", async () => {
      const { vb: stubVb } = createWaveVoiceBank(SAMPLE_RATE);
      const result = await new Fave(stubVb).getWaveData("a.wav", 10, 100);

      // wav長1000ms-100ms=900ms=39690frame
      expect(result.length).toBe(39690 - 441);
      expect(result[0]).toBe(441);
    });
  });

  describe("getFrqData(スタブ)", () => {
    const frq = Array.from({ length: 200 }, (_, i) => i);
    const amp = Array.from({ length: 200 }, (_, i) => i * 10);

    it("offsetMsに対応するフレームから、wavMsに対応する長さを切り出す", async () => {
      const { vb: stubVb, getFrq } = createFrqVoiceBank(frq, amp);
      const result = await new Fave(stubVb).getFrqData("a.wav", 0, 100);

      // ceil(44100*100/256/1000)+1 = 19
      expect(getFrq).toHaveBeenCalledWith("a.wav");
      expect(getFrq).toHaveBeenCalledTimes(1);
      expect(result.frq).toEqual(frq.slice(0, 19));
      expect(result.amp).toEqual(amp.slice(0, 19));
    });

    it("offsetMsに対応するフレームは切り捨てる", async () => {
      const { vb: stubVb } = createFrqVoiceBank(frq, amp);
      // 25ms = 4.3フレーム -> 4
      const result = await new Fave(stubVb).getFrqData("a.wav", 25, 100);

      expect(result.frq[0]).toBe(4);
      expect(result.amp[0]).toBe(40);
    });

    it("perSamplesに応じてフレーム数とtimeAxisの間隔が変わる", async () => {
      const { vb: stubVb } = createFrqVoiceBank(frq, amp, 128);
      const result = await new Fave(stubVb).getFrqData("a.wav", 0, 100);

      // ceil(44100*100/128/1000)+1 = 36
      expect(result.frq.length).toBe(36);
      expect(result.timeAxis[0]).toBe(0);
      expect(result.timeAxis[1]).toBeCloseTo(128 / SAMPLE_RATE, 12);
      expect(result.timeAxis[35]).toBeCloseTo((35 * 128) / SAMPLE_RATE, 12);
    });

    it("frqファイルの末尾を超える範囲は、存在する分だけ返す", async () => {
      const { vb: stubVb } = createFrqVoiceBank(
        frq.slice(0, 10),
        amp.slice(0, 10),
      );
      const result = await new Fave(stubVb).getFrqData("a.wav", 0, 1000);

      expect(result.frq.length).toBe(10);
      expect(result.amp.length).toBe(10);
    });

    it("frqファイルの末尾より後ろから始まる場合は空を返す", async () => {
      const { vb: stubVb } = createFrqVoiceBank(
        frq.slice(0, 10),
        amp.slice(0, 10),
      );
      const result = await new Fave(stubVb).getFrqData("a.wav", 1000, 100);

      expect(result.frq).toEqual([]);
      expect(result.amp).toEqual([]);
      expect(result.timeAxis).toEqual([]);
    });

    it("frqAverageをそのまま返す", async () => {
      const { vb: stubVb } = createFrqVoiceBank(frq, amp, 256, 123.4);
      const result = await new Fave(stubVb).getFrqData("a.wav", 0, 100);

      expect(result.frqAverage).toBe(123.4);
    });

    it("frqの読込に失敗した場合はエラーを伝える", async () => {
      const failingVb = {
        getFrq: async () => {
          throw new Error("frq not found");
        },
      } as unknown as BaseVoiceBank;

      await expect(
        new Fave(failingVb).getFrqData("a.wav", 0, 100),
      ).rejects.toThrow("frq not found");
    });
  });

  describe("CalcF0Step", () => {
    it("5tick分の長さをフレーム数で返す(120bpmで229.6875フレーム)", () => {
      expect(fave.CalcF0Step(120)).toBeCloseTo(229.6875, 6);
    });

    it("bpmに反比例する", () => {
      expect(fave.CalcF0Step(240)).toBeCloseTo(fave.CalcF0Step(120) / 2, 9);
      expect(fave.CalcF0Step(60)).toBeCloseTo(fave.CalcF0Step(120) * 2, 9);
    });
  });

  describe("CalcTargetPitch", () => {
    const f0Steps = 229.6875;
    const targetFrames = 22050;
    const zeroPitch = encodePitch([0, 0, 0]);

    it("点数は出力フレーム数とf0間隔から決まる", () => {
      const f0 = fave.CalcTargetPitch(
        "A4",
        0,
        0,
        zeroPitch,
        f0Steps,
        targetFrames,
      );
      expect(f0.length).toBe(Math.ceil(targetFrames / f0Steps));
    });

    it("ピッチ列が無変化なら、音高名の周波数が全点に入る", () => {
      const f0 = fave.CalcTargetPitch(
        "A4",
        0,
        0,
        zeroPitch,
        f0Steps,
        targetFrames,
      );
      expect(f0.every((v) => Math.abs(v - 440) < 1e-9)).toBe(true);
      expect(f0[0]).toBeCloseTo(getFrqFromTone("A4"), 9);
    });

    it("ピッチ列の値はcent単位で先頭から反映され、列の外は音高名のまま", () => {
      const pitches = encodePitch([0, 100, -100]);
      const f0 = fave.CalcTargetPitch(
        "A4",
        0,
        0,
        pitches,
        f0Steps,
        targetFrames,
      );
      expect(f0[0]).toBeCloseTo(440, 9);
      expect(f0[1]).toBeCloseTo(440 * 2 ** (1 / 12), 9);
      expect(f0[2]).toBeCloseTo(440 * 2 ** (-1 / 12), 9);
      expect(f0[3]).toBeCloseTo(440, 9);
    });

    it("tフラグはcent単位で全点に加算される", () => {
      const f0 = fave.CalcTargetPitch(
        "A4",
        100,
        0,
        zeroPitch,
        f0Steps,
        targetFrames,
      );
      expect(f0[0]).toBeCloseTo(440 * 2 ** (1 / 12), 9);
      expect(f0[f0.length - 1]).toBeCloseTo(440 * 2 ** (1 / 12), 9);
    });

    it("wフラグが0ならビブラートは掛からず、正ならf0が揺れる", () => {
      const plain = fave.CalcTargetPitch(
        "A4",
        0,
        0,
        zeroPitch,
        f0Steps,
        targetFrames,
      );
      const growl = fave.CalcTargetPitch(
        "A4",
        0,
        50,
        zeroPitch,
        f0Steps,
        targetFrames,
      );
      expect(new Set(plain).size).toBe(1);
      expect(new Set(growl).size).toBeGreaterThan(1);
      // 揺れの幅は元周波数の±50%以内
      expect(growl.every((v) => v >= 220 - 1e-9 && v <= 660 + 1e-9)).toBe(true);
    });
  });

  describe("InterpolateOutputF0(境界)", () => {
    it("点が無い場合は55Hzを返す", () => {
      expect(fave.InterpolateOutputF0(new Float64Array(0), 100, 10)).toBe(55);
    });

    it("点が1つの場合はその値を返す", () => {
      expect(fave.InterpolateOutputF0(new Float64Array([330]), 100, 500)).toBe(
        330,
      );
    });

    it("負のフレームは先頭の値を返す", () => {
      expect(
        fave.InterpolateOutputF0(new Float64Array([220, 440]), 100, -50),
      ).toBeCloseTo(220, 9);
    });
  });

  describe("CalcStretchParams", () => {
    it("固定範囲を除いた入出力の長さと伸縮率を返す", () => {
      const result = fave.CalcStretchParams(1000, 200, 2000, 400);
      expect(result.inputStretchFrames).toBe(800);
      expect(result.outputStretchFrames).toBe(1600);
      expect(result.stretchRate).toBe(2);
    });

    it("出力のほうが短ければ伸縮率は1未満になる", () => {
      const result = fave.CalcStretchParams(1000, 0, 500, 0);
      expect(result.stretchRate).toBe(0.5);
    });

    it("伸縮範囲の入力が0なら伸縮率は無限大になる", () => {
      const result = fave.CalcStretchParams(500, 500, 1000, 500);
      expect(result.inputStretchFrames).toBe(0);
      expect(result.stretchRate).toBe(Infinity);
    });
  });

  describe("Bフラグ関連の係数", () => {
    const LAST_BIN = 512;

    it("CalcBreathGain: 50は中立で、bin位置によらず1", () => {
      for (const bin of [0, 10, 100, LAST_BIN]) {
        expect(fave.CalcBreathGain(bin, 1024, 50)).toBe(1);
      }
    });

    it("CalcBreathGain: 50より大きいと低域ほど強く抑える", () => {
      const low = fave.CalcBreathGain(0, 1024, 100);
      const high = fave.CalcBreathGain(LAST_BIN, 1024, 100);
      expect(low).toBeCloseTo(10 ** (-12 / 20), 3);
      expect(high).toBeCloseTo(10 ** (-3 / 20), 3);
      expect(low).toBeLessThan(high);
    });

    it("CalcBreathGain: 50より小さいと高域ほど強く抑える", () => {
      const low = fave.CalcBreathGain(0, 1024, 0);
      const high = fave.CalcBreathGain(LAST_BIN, 1024, 0);
      expect(low).toBeCloseTo(10 ** (-3 / 20), 3);
      expect(high).toBeCloseTo(10 ** (-12 / 20), 3);
      expect(low).toBeGreaterThan(high);
    });

    it("CalcBreathGain: 範囲外の値は0..100にクランプし、非有限値は中立として扱う", () => {
      expect(fave.CalcBreathGain(100, 1024, 150)).toBe(
        fave.CalcBreathGain(100, 1024, 100),
      );
      expect(fave.CalcBreathGain(100, 1024, -20)).toBe(
        fave.CalcBreathGain(100, 1024, 0),
      );
      expect(fave.CalcBreathGain(100, 1024, NaN)).toBe(1);
    });

    it("CalcBreathNoiseRatio: 50以下ではノイズを加えない", () => {
      expect(fave.CalcBreathNoiseRatio(100, 1024, 50)).toBe(0);
      expect(fave.CalcBreathNoiseRatio(100, 1024, 0)).toBe(0);
      expect(fave.CalcBreathNoiseRatio(100, 1024, NaN)).toBe(0);
    });

    it("CalcBreathNoiseRatio: 高域ほど大きく、Bに比例する", () => {
      const low = fave.CalcBreathNoiseRatio(0, 1024, 100);
      const high = fave.CalcBreathNoiseRatio(LAST_BIN, 1024, 100);
      expect(low).toBeCloseTo(0.005, 6);
      expect(high).toBeCloseTo(0.225, 3);
      expect(fave.CalcBreathNoiseRatio(100, 1024, 75)).toBeCloseTo(
        fave.CalcBreathNoiseRatio(100, 1024, 100) / 2,
        9,
      );
      expect(fave.CalcBreathNoiseRatio(100, 1024, 150)).toBe(
        fave.CalcBreathNoiseRatio(100, 1024, 100),
      );
    });

    it("CalcBreathToneAttenuation: 50以下では減衰しない", () => {
      expect(fave.CalcBreathToneAttenuation(0, 1024, 50)).toBe(1);
      expect(fave.CalcBreathToneAttenuation(0, 1024, 0)).toBe(1);
    });

    it("CalcBreathToneAttenuation: Bが大きいほど減衰し、低域のほうが強く減衰する", () => {
      const low100 = fave.CalcBreathToneAttenuation(0, 1024, 100);
      const high100 = fave.CalcBreathToneAttenuation(LAST_BIN, 1024, 100);
      const low75 = fave.CalcBreathToneAttenuation(0, 1024, 75);
      expect(low100).toBeCloseTo(0.05, 6);
      expect(high100).toBeCloseTo(0.12, 3);
      expect(low75).toBeGreaterThan(low100);
      expect(low75).toBeLessThan(1);
      for (const bin of [0, 5, 50, 200, LAST_BIN]) {
        const v = fave.CalcBreathToneAttenuation(bin, 1024, 100);
        expect(v).toBeGreaterThanOrEqual(0.02);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("O/T/S/bフラグのゲイン", () => {
    const LAST_BIN = 512;
    /** 係数が、正の値と負の値で互いに逆数になること */
    const expectReciprocal = (
      fn: (bin: number, size: number, flag: number) => number,
      bin: number,
    ) => {
      expect(fn(bin, 1024, 100) * fn(bin, 1024, -100)).toBeCloseTo(1, 9);
    };

    it("CalcOpeningGain: 0は中立、正の値で低域を+6dBまで持ち上げる", () => {
      expect(fave.CalcOpeningGain(5, 1024, 0)).toBe(1);
      expect(fave.CalcOpeningGain(0, 1024, 100)).toBeCloseTo(10 ** (6 / 20), 3);
      expect(fave.CalcOpeningGain(LAST_BIN, 1024, 100)).toBeCloseTo(1, 6);
      expect(fave.CalcOpeningGain(0, 1024, -100)).toBeCloseTo(
        10 ** (-6 / 20),
        3,
      );
      expectReciprocal((b, s, f) => fave.CalcOpeningGain(b, s, f), 5);
      expect(fave.CalcOpeningGain(5, 1024, 500)).toBe(
        fave.CalcOpeningGain(5, 1024, 100),
      );
      expect(fave.CalcOpeningGain(5, 1024, NaN)).toBe(1);
    });

    it("CalcTensionGain: 1500Hz付近を最大+5dBまで持ち上げ、遠い帯域ではほぼ中立", () => {
      expect(fave.CalcTensionGain(35, 1024, 0)).toBe(1);
      expect(fave.CalcTensionGain(35, 1024, 100)).toBeCloseTo(
        10 ** (5 / 20),
        2,
      );
      expect(fave.CalcTensionGain(35, 1024, -100)).toBeCloseTo(
        10 ** (-5 / 20),
        2,
      );
      expect(fave.CalcTensionGain(LAST_BIN, 1024, 100)).toBeCloseTo(1, 6);
      expect(fave.CalcTensionGain(0, 1024, 100)).toBeLessThan(1.01);
      expectReciprocal((b, s, f) => fave.CalcTensionGain(b, s, f), 20);
      expect(fave.CalcTensionGain(5, 1024, NaN)).toBe(1);
    });

    it("CalcBrightnessGain: 正の値で高域を持ち上げ低域を抑える(±12dB)", () => {
      expect(fave.CalcBrightnessGain(5, 1024, 0)).toBe(1);
      expect(fave.CalcBrightnessGain(0, 1024, 100)).toBeCloseTo(
        10 ** (-12 / 20),
        3,
      );
      expect(fave.CalcBrightnessGain(LAST_BIN, 1024, 100)).toBeCloseTo(
        10 ** (12 / 20),
        3,
      );
      // 約1kHz(対数周波数軸の中点)では中立に近い
      expect(fave.CalcBrightnessGain(24, 1024, 100)).toBeCloseTo(1, 1);
      expectReciprocal((b, s, f) => fave.CalcBrightnessGain(b, s, f), 100);
      expect(fave.CalcBrightnessGain(5, 1024, NaN)).toBe(1);
    });

    it("CalcBrightnessGain: 正の値ではbinが上がるほど単調に増える", () => {
      let prev = fave.CalcBrightnessGain(0, 1024, 100);
      for (let bin = 1; bin <= LAST_BIN; bin++) {
        const v = fave.CalcBrightnessGain(bin, 1024, 100);
        expect(v).toBeGreaterThanOrEqual(prev);
        prev = v;
      }
    });

    it("CalcSharpGain: 正の値で高域を+8dBまで持ち上げ、低域は中立", () => {
      expect(fave.CalcSharpGain(5, 1024, 0)).toBe(1);
      expect(fave.CalcSharpGain(0, 1024, 100)).toBeCloseTo(1, 9);
      expect(fave.CalcSharpGain(LAST_BIN, 1024, 100)).toBeCloseTo(
        10 ** (8 / 20),
        2,
      );
      expect(fave.CalcSharpGain(LAST_BIN, 1024, -100)).toBeCloseTo(
        10 ** (-8 / 20),
        2,
      );
      expectReciprocal((b, s, f) => fave.CalcSharpGain(b, s, f), 100);
      expect(fave.CalcSharpGain(5, 1024, NaN)).toBe(1);
    });
  });

  describe("gフラグ(フォルマントのワープ)", () => {
    it("CalcGenderWarpRatio: 0は1、-100は高域側(2^0.5)、100は低域側(2^-0.5)", () => {
      expect(fave.CalcGenderWarpRatio(0)).toBe(1);
      expect(fave.CalcGenderWarpRatio(-100)).toBeCloseTo(Math.SQRT2, 9);
      expect(fave.CalcGenderWarpRatio(100)).toBeCloseTo(1 / Math.SQRT2, 9);
    });

    it("CalcGenderWarpRatio: 範囲外はクランプし、非有限値は1", () => {
      expect(fave.CalcGenderWarpRatio(300)).toBe(fave.CalcGenderWarpRatio(100));
      expect(fave.CalcGenderWarpRatio(-300)).toBe(
        fave.CalcGenderWarpRatio(-100),
      );
      expect(fave.CalcGenderWarpRatio(NaN)).toBe(1);
    });

    it("WarpEnvelopeByRatio: 空配列は空配列を返す", () => {
      expect(fave.WarpEnvelopeByRatio([], 2)).toEqual([]);
    });

    it("WarpEnvelopeByRatio: 比率1は入力のコピーを返す", () => {
      const env = [1, 2, 3];
      const out = fave.WarpEnvelopeByRatio(env, 1);
      expect(out).toEqual(env);
      expect(out).not.toBe(env);
    });

    it("WarpEnvelopeByRatio: 比率2で周波数軸が2倍に引き伸ばされる(線形補間)", () => {
      const out = fave.WarpEnvelopeByRatio([0, 2, 4, 6, 8], 2);
      expect(out).toEqual([0, 1, 2, 3, 4]);
    });

    it("WarpEnvelopeByRatio: 比率0.5で縮み、末尾は端の値で埋まる", () => {
      const out = fave.WarpEnvelopeByRatio([0, 2, 4, 6, 8], 0.5);
      expect(out).toEqual([0, 4, 8, 8, 8]);
    });

    it("WarpEnvelopeByRatio: 比率は0.25..4にクランプされる", () => {
      const env = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      expect(fave.WarpEnvelopeByRatio(env, 100)).toEqual(
        fave.WarpEnvelopeByRatio(env, 4),
      );
      expect(fave.WarpEnvelopeByRatio(env, 0.01)).toEqual(
        fave.WarpEnvelopeByRatio(env, 0.25),
      );
    });

    it("WarpEnvelopeByRatio: 不正な比率は1として扱う", () => {
      const env = [1, 2, 3];
      expect(fave.WarpEnvelopeByRatio(env, NaN)).toEqual(env);
      expect(fave.WarpEnvelopeByRatio(env, 0)).toEqual(env);
      expect(fave.WarpEnvelopeByRatio(env, -1)).toEqual(env);
    });

    it("WarpEnvelopeByRatio: 非有限値は0として補間する", () => {
      const out = fave.WarpEnvelopeByRatio([NaN, 2, 4], 2);
      expect(out).toEqual([0, 1, 2]);
    });
  });

  describe("HashUnit", () => {
    it("同じseedなら同じ値を返す", () => {
      expect(fave.HashUnit(123)).toBe(fave.HashUnit(123));
    });

    it("0以上1未満で、seedが違えば値が違い、平均は0.5付近", () => {
      let sum = 0;
      const seen = new Set<number>();
      for (let seed = 0; seed < 1000; seed++) {
        const v = fave.HashUnit(seed);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
        seen.add(v);
        sum += v;
      }
      expect(seen.size).toBeGreaterThan(990);
      expect(sum / 1000).toBeGreaterThan(0.4);
      expect(sum / 1000).toBeLessThan(0.6);
    });
  });

  describe("ClacSpecEnveloveGauss", () => {
    /** 全binの振幅がampの、実部のみのスペクトルを作る */
    const createSpec = (amps: number[]): Float32Array => {
      const spec = new Float32Array(amps.length * 2);
      amps.forEach((a, i) => {
        spec[i * 2] = a;
      });
      return spec;
    };

    it("sFlagが0なら振幅をそのまま返す", () => {
      const spec = new Float32Array([3, 4, 0, 2, -6, 8]);
      const env = fave.ClacSpecEnveloveGauss(spec, 1024, SAMPLE_RATE, 220, 0);
      expect(env).toEqual([5, 2, 10]);
    });

    it("bin数は複素数の組の数と一致する", () => {
      const env = fave.ClacSpecEnveloveGauss(
        createSpec(new Array(513).fill(1)),
        1024,
        SAMPLE_RATE,
        220,
      );
      expect(env.length).toBe(513);
    });

    it("一定の振幅はぼかしても変わらない", () => {
      const env = fave.ClacSpecEnveloveGauss(
        createSpec(new Array(513).fill(5)),
        1024,
        SAMPLE_RATE,
        220,
      );
      for (const v of env) {
        expect(v).toBeCloseTo(5, 6);
      }
    });

    it("単独のピークは周囲へ広がり、全体の合計は保たれる", () => {
      const amps = new Array(513).fill(0);
      amps[256] = 10;
      const env = fave.ClacSpecEnveloveGauss(
        createSpec(amps),
        1024,
        SAMPLE_RATE,
        220,
        20,
      );
      expect(env[256]).toBeLessThan(10);
      expect(env[256]).toBeGreaterThan(0);
      expect(env[257]).toBeGreaterThan(0);
      expect(env[255]).toBeCloseTo(env[257], 9);
      expect(env.reduce((a, b) => a + b, 0)).toBeCloseTo(10, 5);
    });

    it("sFlagが大きいほど広くぼかす", () => {
      const amps = new Array(513).fill(0);
      amps[256] = 10;
      const narrow = fave.ClacSpecEnveloveGauss(
        createSpec(amps),
        1024,
        SAMPLE_RATE,
        220,
        20,
      );
      const wide = fave.ClacSpecEnveloveGauss(
        createSpec(amps),
        1024,
        SAMPLE_RATE,
        220,
        100,
      );
      expect(wide[256]).toBeLessThan(narrow[256]);
    });

    it("f0が高いほど広くぼかす(倍音間隔に追従する)", () => {
      const amps = new Array(513).fill(0);
      amps[256] = 10;
      const lowF0 = fave.ClacSpecEnveloveGauss(
        createSpec(amps),
        1024,
        SAMPLE_RATE,
        110,
        20,
      );
      const highF0 = fave.ClacSpecEnveloveGauss(
        createSpec(amps),
        1024,
        SAMPLE_RATE,
        880,
        20,
      );
      expect(highF0[256]).toBeLessThan(lowF0[256]);
    });
  });

  describe("CorrectedAmplitudeEnvelope", () => {
    it("出力の平均振幅を入力ampに合わせるゲインを掛ける", () => {
      const output = new Float64Array(1024).fill(0.25);
      // 16bit整数スケールの16384 = 0.5
      const inputAmp = new Array(10).fill(16384);
      const result = fave.CorrectedAmplitudeEnvelope(
        output,
        inputAmp,
        0,
        0,
        1,
        1,
      );
      expect(result.length).toBe(1024);
      for (const v of result) {
        expect(v).toBeCloseTo(0.5, 9);
      }
    });

    it("入力ampが変化すると、出力の時刻に対応する位置の値で補正する", () => {
      const output = new Float64Array(1024).fill(0.25);
      // 入力ampのindex 0..1が0.25、index 2以降が0.5。256フレームごとに1点
      const inputAmp = [8192, 8192, 16384, 16384, 16384, 16384, 16384];
      const result = fave.CorrectedAmplitudeEnvelope(
        output,
        inputAmp,
        0,
        0,
        1,
        1,
      );
      expect(result[0]).toBeCloseTo(0.25, 9);
      expect(result[1023]).toBeCloseTo(0.5, 9);
    });

    it("無音の出力は無音のまま", () => {
      const result = fave.CorrectedAmplitudeEnvelope(
        new Float64Array(512),
        new Array(4).fill(16384),
        0,
        0,
        1,
        1,
      );
      expect(result.every((v) => v === 0)).toBe(true);
    });

    it("入力ampが非有限値なら0として扱う", () => {
      const result = fave.CorrectedAmplitudeEnvelope(
        new Float64Array(512).fill(0.25),
        new Array(4).fill(NaN),
        0,
        0,
        1,
        1,
      );
      expect(result.every((v) => v === 0)).toBe(true);
    });

    it("不正な伸縮率は1として扱う", () => {
      const output = new Float64Array(1024).fill(0.25);
      const inputAmp = new Array(10).fill(16384);
      const expected = fave.CorrectedAmplitudeEnvelope(
        output,
        inputAmp,
        0,
        0,
        1,
        1,
      );
      const actual = fave.CorrectedAmplitudeEnvelope(
        output,
        inputAmp,
        0,
        0,
        NaN,
        0,
      );
      expect(actual).toEqual(expected);
    });

    it("固定範囲と伸縮範囲の伸縮率で、出力時刻を入力時刻へ変換してampを参照する", () => {
      // 出力の前半(512フレーム)は入力256フレーム分(velocityRate=2)、後半は等倍
      const output = new Float64Array(1024).fill(0.25);
      // index 0 (入力0フレーム)は0.25、index1以降(入力256フレーム以降)は0.5
      const inputAmp = [8192, 16384, 16384, 16384, 16384, 16384];
      const result = fave.CorrectedAmplitudeEnvelope(
        output,
        inputAmp,
        256,
        512,
        2,
        1,
      );
      expect(result[0]).toBeCloseTo(0.25, 9);
      // 出力512フレーム=入力256フレーム=index1
      expect(result[512]).toBeCloseTo(0.5, 9);
      // 出力256フレーム=入力128フレーム=index0.5 -> 0.375
      expect(result[256]).toBeCloseTo(0.375, 9);
    });
  });

  describe("ApplyPeakCompressor", () => {
    const data = Float64Array.from([0.1, -0.25, 0.2]);

    it("P=100でピークが0.5になるように正規化する", () => {
      const out = fave.ApplyPeakCompressor(data, 100);
      expect(Array.from(out)).toEqual([
        expect.closeTo(0.2, 9),
        expect.closeTo(-0.5, 9),
        expect.closeTo(0.4, 9),
      ]);
    });

    it("P=0では何も変えない", () => {
      expect(Array.from(fave.ApplyPeakCompressor(data, 0))).toEqual(
        Array.from(data),
      );
    });

    it("Pの途中の値では、正規化ゲインと1の間を線形に補間する", () => {
      // ゲイン = 1-0.5 + 0.5*2 = 1.5
      const out = fave.ApplyPeakCompressor(data, 50);
      expect(out[1]).toBeCloseTo(-0.375, 9);
    });

    it("省略時のPは86", () => {
      const out = fave.ApplyPeakCompressor(data);
      // ゲイン = 0.14 + 0.86*2 = 1.86
      expect(out[1]).toBeCloseTo(-0.25 * 1.86, 9);
    });

    it("非有限値は0にし、ピークの計算からも除く", () => {
      const out = fave.ApplyPeakCompressor(
        Float64Array.from([NaN, 0.25, Infinity, -0.1]),
        100,
      );
      expect(out[0]).toBe(0);
      expect(out[1]).toBeCloseTo(0.5, 9);
      expect(out[2]).toBe(0);
      expect(out[3]).toBeCloseTo(-0.2, 9);
    });

    it("無音は無音のまま返す", () => {
      const out = fave.ApplyPeakCompressor(new Float64Array(8), 100);
      expect(out.every((v) => v === 0)).toBe(true);
    });
  });

  describe("tempo", () => {
    const baseRequest = {
      withFrq: true,
      inputWav: "denoise/01_あかきくけこ.wav",
      targetTone: "A3",
      velocity: 100,
      flags: "",
      offsetMs: 0,
      targetMs: 600,
      fixedMs: 20,
      cutoffMs: 0,
      intensity: 100,
      modulation: 0,
      pitches: "AA#97#",
      inputWavData: new Float64Array(1024),
      frqData: new Float64Array(4),
      ampData: new Float64Array(4),
      frqAverage: 220,
    };

    /** CalcF0Stepに渡されたbpmを返す。ピッチ点間隔の算出直後で処理を打ち切る */
    const getUsedBpm = (tempo: string): number => {
      const spy = vi.spyOn(fave, "CalcF0Step").mockImplementation(() => {
        throw new Error("stop");
      });
      try {
        expect(() =>
          fave.resampWorker({ ...baseRequest, tempo } as ResampWorkerRequest),
        ).toThrow("stop");
        return spy.mock.calls[0][0];
      } finally {
        spy.mockRestore();
      }
    };

    it("先頭の!を除いたbpmを使う", () => {
      expect(getUsedBpm("!150.00")).toBe(150);
    });

    it("!がない数値文字列もbpmとして使う", () => {
      expect(getUsedBpm("90")).toBe(90);
    });

    it("bpmとして解釈できない場合は120を使う", () => {
      expect(getUsedBpm("!abc")).toBe(120);
    });
  });

  describe("getFrqData", () => {
    const WAV = "denoise/01_あかきくけこ.wav";
    const OFFSET_MS = 1538.32;
    const WAV_MS = 400;

    it("frq/ampを補間せずにファイルのグリッドのまま切り出す", async () => {
      const raw = await vb.getFrq(WAV);
      const result = await fave.getFrqData(WAV, OFFSET_MS, WAV_MS);

      const offsetFrame = Math.floor(
        (44100 * OFFSET_MS) / raw.perSamples / 1000,
      );
      const length = Math.ceil((44100 * WAV_MS) / raw.perSamples / 1000) + 1;
      const rawFrq = Array.from(raw.frq);
      const rawAmp = Array.from(raw.amp);

      expect(result.frq).toEqual(
        rawFrq.slice(offsetFrame, offsetFrame + length),
      );
      expect(result.amp).toEqual(
        rawAmp.slice(offsetFrame, offsetFrame + length),
      );
      expect(result.frq.length).toBe(length);
      expect(result.frqAverage).toBe(raw.frqAverage);
    });

    it("timeAxisはfrqファイルのグリッド間隔(perSamples/frameRate)で並ぶ", async () => {
      const raw = await vb.getFrq(WAV);
      const result = await fave.getFrqData(WAV, OFFSET_MS, WAV_MS);

      expect(result.timeAxis.length).toBe(result.frq.length);
      expect(result.timeAxis[0]).toBe(0);
      expect(result.timeAxis[1]).toBeCloseTo(raw.perSamples / 44100, 10);
    });
  });

  describe("出力f0の補間", () => {
    const f0Steps = 100;
    const points = new Float64Array([220, 440, 110]);

    it("点の位置ではユーザー指定の値がそのまま返る", () => {
      expect(fave.InterpolateOutputF0(points, f0Steps, 0)).toBeCloseTo(220, 9);
      expect(fave.InterpolateOutputF0(points, f0Steps, 100)).toBeCloseTo(
        440,
        9,
      );
      expect(fave.InterpolateOutputF0(points, f0Steps, 200)).toBeCloseTo(
        110,
        9,
      );
    });

    it("点の間は対数(cent)で線形に補間される", () => {
      // 220->440の中間は幾何平均
      expect(fave.InterpolateOutputF0(points, f0Steps, 50)).toBeCloseTo(
        Math.sqrt(220 * 440),
        6,
      );
      // 440->110の中間も幾何平均
      expect(fave.InterpolateOutputF0(points, f0Steps, 150)).toBeCloseTo(
        Math.sqrt(440 * 110),
        6,
      );
    });

    it("区間内で単調に変化し、末尾以降は最後の値を保つ", () => {
      let prev = fave.InterpolateOutputF0(points, f0Steps, 0);
      for (let frame = 1; frame <= 100; frame++) {
        const value = fave.InterpolateOutputF0(points, f0Steps, frame);
        expect(value).toBeGreaterThan(prev);
        prev = value;
      }
      expect(fave.InterpolateOutputF0(points, f0Steps, 1000)).toBe(110);
    });

    it("非正値を含む区間は線形補間にフォールバックする", () => {
      const withZero = new Float64Array([0, 200]);
      expect(fave.InterpolateOutputF0(withZero, f0Steps, 50)).toBeCloseTo(
        100,
        9,
      );
    });
  });

  describe("OLAの読み出し位置の連続性", () => {
    const SPAN = 256;
    const FS = 44100;

    /** 位相連続な正弦波を作る。f0Listは256サンプルごとの周波数 */
    const makeSine = (f0List: number[]): Float64Array => {
      const data = new Float64Array(f0List.length * SPAN);
      let phase = 0;
      for (let i = 0; i < data.length; i++) {
        data[i] = 0.3 * Math.sin(phase);
        phase += (2 * Math.PI * f0List[Math.floor(i / SPAN)]) / FS;
      }
      return data;
    };

    const runFixedOla = (
      data: Float64Array,
      inputF0: number[],
      outputF0Hz: number,
      frqAverage: number,
      modulation: number = 0,
    ): Float64Array => {
      const frames = data.length;
      const f0Steps = fave.CalcF0Step(120);
      const outputF0 = new Float64Array(Math.ceil(frames / f0Steps)).fill(
        outputF0Hz,
      );
      return fave.UtauOverlapAddStretch(
        data,
        Float64Array.from(inputF0),
        frqAverage,
        outputF0,
        f0Steps,
        frames,
        frames,
        frames,
        1,
        1,
        modulation,
      );
    };

    const maxStep = (data: Float64Array): number => {
      let max = 0;
      for (let i = 1; i < data.length; i++) {
        max = Math.max(max, Math.abs(data[i] - data[i - 1]));
      }
      return max;
    };

    it("入力f0が切り替わる有声区間でピッチを下げても、サンプル間の段差が出ない", () => {
      const f0List = [220, 220, 330, 330, 330, 330];
      const data = makeSine(f0List);
      const out = runFixedOla(data, f0List, 180, 260);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      // 入力の最大傾き(330Hz,振幅0.3)は約0.014。その3倍未満に収まること
      expect(maxStep(out)).toBeLessThan(0.045);
    });

    it("入力f0が切り替わる有声区間でピッチを上げても、サンプル間の段差が出ない", () => {
      const f0List = [220, 220, 330, 330, 330, 330];
      const data = makeSine(f0List);
      const out = runFixedOla(data, f0List, 400, 260);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      expect(maxStep(out)).toBeLessThan(0.045);
    });

    it("固定範囲の無声部はピッチシフトやmodulationで変調されない", () => {
      // 先頭2区間は無声(f0=0)のノイズ、後半は有声
      const f0List = [0, 0, 220, 220];
      const data = makeSine(f0List);
      let seed = 12345;
      for (let i = 0; i < 2 * SPAN; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        data[i] = ((seed / 0x7fffffff) * 2 - 1) * 0.3;
      }
      // 目標ピッチを入力のちょうど2倍にして、変調されれば明確に差が出る設定にする
      const out = runFixedOla(data, f0List, 440, 220, 50);
      for (let i = 0; i < SPAN; i++) {
        expect(out[i]).toBeCloseTo(data[i], 6);
      }
    });
  });

  describe("UtauOverlapAddStretch", () => {
    const SPAN = 256;
    const HZ = 220;
    const f0Steps = 229.6875;

    /** 全区間のf0がHzの入力f0列 */
    const createInputF0 = (frames: number, hz = HZ): Float64Array =>
      new Float64Array(Math.ceil(frames / SPAN)).fill(hz);

    /** 固定範囲なし・等倍の伸縮で、f0だけを変えて実行する */
    const runOla = (
      data: Float64Array,
      outputHz: number,
      options: {
        targetFrames?: number;
        stretchRate?: number;
        inputFixedFrames?: number;
        outputFixedFrames?: number;
        velocityRate?: number;
        modulation?: number;
        inputHz?: number;
      } = {},
    ): Float64Array => {
      const targetFrames = options.targetFrames ?? data.length;
      const outputF0 = new Float64Array(Math.ceil(targetFrames / f0Steps)).fill(
        outputHz,
      );
      return fave.UtauOverlapAddStretch(
        data,
        createInputF0(data.length, options.inputHz ?? HZ),
        options.inputHz ?? HZ,
        outputF0,
        f0Steps,
        targetFrames,
        options.inputFixedFrames ?? 0,
        options.outputFixedFrames ?? 0,
        options.velocityRate ?? 1,
        options.stretchRate ?? 1,
        options.modulation ?? 0,
      );
    };

    it("入力が空ならエラーにする", () => {
      expect(() =>
        runOla(new Float64Array(0), HZ, { targetFrames: 100 }),
      ).toThrow("入力波形が空");
    });

    it("出力f0が入力f0と同じなら、入力をそのまま出力する", () => {
      const data = createSine(8192, HZ);
      const out = runOla(data, HZ);
      expect(out.length).toBe(data.length);
      expect(maxAbsDiff(out, data)).toBeLessThan(1e-6);
    });

    it("出力f0に応じて音程が変わり、長さは変わらない(オクターブ上)", () => {
      const data = createSine(8192, HZ);
      const out = runOla(data, HZ * 2);
      expect(out.length).toBe(8192);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      const hz = estimateFrequency(out, 1024, 7168);
      expect(hz).toBeGreaterThan(HZ * 2 * 0.9);
      expect(hz).toBeLessThan(HZ * 2 * 1.1);
    });

    it("出力f0に応じて音程が変わり、長さは変わらない(オクターブ下)", () => {
      const data = createSine(8192, HZ);
      const out = runOla(data, HZ / 2);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      const hz = estimateFrequency(out, 1024, 7168);
      expect(hz).toBeGreaterThan((HZ / 2) * 0.9);
      expect(hz).toBeLessThan((HZ / 2) * 1.1);
    });

    it("伸縮範囲を2倍に伸ばしても音程は保たれる", () => {
      const data = createSine(4096, HZ);
      const out = runOla(data, HZ, { targetFrames: 8192, stretchRate: 2 });
      expect(out.length).toBe(8192);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      const hz = estimateFrequency(out, 1024, 7168);
      expect(hz).toBeGreaterThan(HZ * 0.9);
      expect(hz).toBeLessThan(HZ * 1.1);
      // 波形が途切れずに出力全体に渡って振幅がある
      expect(magnitudeAt(out, HZ, 6144, 8192)).toBeGreaterThan(0.05);
    });

    it("伸縮範囲が出力より長くても(等倍)、出力長を超えず先頭から使う", () => {
      const data = createSine(8192, HZ);
      const out = runOla(data, HZ, { targetFrames: 4096 });
      expect(out.length).toBe(4096);
      expect(maxAbsDiff(out, data, 0, 4096)).toBeLessThan(1e-6);
    });

    it("固定範囲を挟んでも出力長は目標フレーム数になる", () => {
      const data = createSine(8192, HZ);
      const out = runOla(data, HZ, {
        targetFrames: 8192,
        inputFixedFrames: 1024,
        outputFixedFrames: 1024,
        stretchRate: 1,
      });
      expect(out.length).toBe(8192);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      expect(maxAbsDiff(out, data)).toBeLessThan(1e-6);
    });

    it("velocityRateで固定範囲が伸び、出力へ伸びた分の長さが割り当てられる", () => {
      const data = createSine(4096, HZ);
      const out = runOla(data, HZ, {
        targetFrames: 8192,
        inputFixedFrames: 2048,
        outputFixedFrames: 4096,
        velocityRate: 2,
        stretchRate: 2,
      });
      expect(out.length).toBe(8192);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      // 固定範囲の終わり付近と伸縮範囲の両方で波形がある
      expect(magnitudeAt(out, HZ, 3072, 4096)).toBeGreaterThan(0.05);
      expect(magnitudeAt(out, HZ, 6144, 8192)).toBeGreaterThan(0.05);
    });

    it("固定範囲のみで出力が埋まる場合は、伸縮率が不正でもエラーにならない", () => {
      const data = createSine(2048, HZ);
      const out = runOla(data, HZ, {
        targetFrames: 1024,
        inputFixedFrames: 2048,
        outputFixedFrames: 1024,
        velocityRate: 0.5,
        stretchRate: NaN,
      });
      expect(out.length).toBe(1024);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it.each([0, -1, NaN, Infinity])(
      "伸縮率が%sのときはエラーにする",
      (stretchRate) => {
        const data = createSine(2048, HZ);
        expect(() => runOla(data, HZ, { stretchRate })).toThrow("伸縮率が不正");
      },
    );

    it("伸縮範囲の入力が無ければエラーにする", () => {
      const data = createSine(512, HZ);
      expect(() =>
        runOla(data, HZ, {
          targetFrames: 1024,
          inputFixedFrames: 512,
          outputFixedFrames: 512,
        }),
      ).toThrow("伸縮区間数が不正");
    });

    it("入力f0が0や異常値の区間でも、平均f0で処理して有限な値を返す", () => {
      const data = createSine(4096, HZ);
      const inputF0 = new Float64Array(16).fill(0);
      inputF0[3] = NaN;
      inputF0[4] = -5;
      const outputF0 = new Float64Array(Math.ceil(4096 / f0Steps)).fill(HZ);
      const out = fave.UtauOverlapAddStretch(
        data,
        inputF0,
        HZ,
        outputF0,
        f0Steps,
        4096,
        0,
        0,
        1,
        1,
        0,
      );
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      expect(maxAbsDiff(out, data)).toBeLessThan(1e-6);
    });

    it("平均f0も異常値の場合は55Hzにフォールバックして有限な値を返す", () => {
      const data = createSine(2048, HZ);
      const outputF0 = new Float64Array(Math.ceil(2048 / f0Steps)).fill(HZ);
      const out = fave.UtauOverlapAddStretch(
        data,
        new Float64Array(8),
        NaN,
        outputF0,
        f0Steps,
        2048,
        0,
        0,
        1,
        1,
        0,
      );
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("modulationが0でないと、入力f0の揺れが出力f0へ混ざる", () => {
      // 入力f0が前半220Hz・後半330Hzの波形
      const f0List = [
        ...new Array(16).fill(220),
        ...new Array(16).fill(330),
      ] as number[];
      const data = new Float64Array(f0List.length * SPAN);
      let phase = 0;
      for (let i = 0; i < data.length; i++) {
        data[i] = 0.3 * Math.sin(phase);
        phase += (2 * Math.PI * f0List[Math.floor(i / SPAN)]) / SAMPLE_RATE;
      }
      const run = (modulation: number) => {
        const outputF0 = new Float64Array(
          Math.ceil(data.length / f0Steps),
        ).fill(275);
        return fave.UtauOverlapAddStretch(
          data,
          Float64Array.from(f0List),
          275,
          outputF0,
          f0Steps,
          data.length,
          0,
          0,
          1,
          1,
          modulation,
        );
      };
      const flat = run(0);
      const modulated = run(100);
      const half = data.length / 2;
      // modulation=0 では前半後半とも275Hz付近、100では入力に追従して前半<後半
      const flatDiff = Math.abs(
        estimateFrequency(flat, 512, half - 512) -
          estimateFrequency(flat, half + 512, data.length - 512),
      );
      const modulatedDiff =
        estimateFrequency(modulated, half + 512, data.length - 512) -
        estimateFrequency(modulated, 512, half - 512);
      expect(flatDiff).toBeLessThan(40);
      expect(modulatedDiff).toBeGreaterThan(60);
    });

    /** 入力f0が一定の波形から、modulationだけを変えて出力を得る */
    const runConstantF0 = (
      modulation: number,
      frqAverage: number,
      inputHz = 220,
      outputHz = 330,
    ) => {
      const frames = 8192;
      const data = createSine(frames, inputHz);
      const inputF0 = new Float64Array(frames / SPAN).fill(inputHz);
      const outputF0 = new Float64Array(Math.ceil(frames / f0Steps)).fill(
        outputHz,
      );
      return fave.UtauOverlapAddStretch(
        data,
        inputF0,
        frqAverage,
        outputF0,
        f0Steps,
        frames,
        0,
        0,
        1,
        1,
        modulation,
      );
    };

    it("入力f0が平均と同じなら、modulationの値によらず出力は変わらない", () => {
      const base = runConstantF0(0, 220);
      expect(maxAbsDiff(runConstantF0(50, 220), base)).toBeLessThan(1e-9);
      expect(maxAbsDiff(runConstantF0(100, 220), base)).toBeLessThan(1e-9);
    });

    it("入力f0が平均の1.5倍なら、modulation100で出力f0も1.5倍になる", () => {
      // 入力330Hz・平均220Hz・出力220Hz -> 220*(330/220)=330Hz
      const out = runConstantF0(100, 220, 330, 220);
      const hz = estimateFrequency(out, 1024, out.length - 1024);
      expect(hz).toBeGreaterThan(330 * 0.95);
      expect(hz).toBeLessThan(330 * 1.05);
    });

    it("frqAverageが不正(0・負・NaN)なら、modulationを無視して出力f0を使う", () => {
      const base = runConstantF0(0, 220);
      for (const average of [0, -1, NaN]) {
        const out = runConstantF0(100, average);
        expect(out.every((v) => Number.isFinite(v))).toBe(true);
        expect(maxAbsDiff(out, base)).toBeLessThan(1e-9);
      }
    });

    it("出力f0が点ごとに大きく往復しても、出力は有限で入力の振幅を大きく超えない", () => {
      const frames = 16384;
      const data = createSine(frames, 110);
      const inputF0 = new Float64Array(frames / SPAN).fill(110);
      const outputF0 = Float64Array.from(
        { length: Math.ceil(frames / f0Steps) },
        (_, i) => (i % 2 === 0 ? 110 : 880),
      );
      const out = fave.UtauOverlapAddStretch(
        data,
        inputF0,
        110,
        outputF0,
        f0Steps,
        frames,
        0,
        0,
        1,
        1,
        0,
      );
      const peak = out.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
      expect(peak).toBeLessThan(0.3 * 1.5);
    });
  });

  describe("ApplyFormantFilter", () => {
    const FRAMES = 8192;
    const HZ = 220;
    const f0Steps = 229.6875;

    const inputF0 = new Float64Array(FRAMES / 256).fill(HZ);
    const outputF0 = new Float64Array(Math.ceil(FRAMES / f0Steps)).fill(HZ);

    /** 入力と出力が同じ波形・同じf0のとき、フラグだけの効果を調べる */
    const runFilter = (
      input: Float64Array,
      flags: {
        B?: number;
        O?: number;
        T?: number;
        S?: number;
        b?: number;
        g?: number;
        s?: number;
      } = {},
      olaed: Float64Array = input,
    ): Float64Array =>
      fave.ApplyFormantFilter(
        input,
        olaed,
        inputF0,
        HZ,
        outputF0,
        f0Steps,
        0,
        0,
        1,
        1,
        flags.B ?? 50,
        flags.O ?? 0,
        flags.T ?? 0,
        flags.S ?? 0,
        flags.b ?? 0,
        flags.g ?? 0,
        flags.s ?? 20,
      );

    const harmonic = createHarmonic(FRAMES, HZ);

    it("入力と出力が同じでフラグが中立なら、波形はほぼ変わらない", () => {
      const out = runFilter(harmonic);
      expect(out.length).toBe(FRAMES);
      expect(maxAbsDiff(out, harmonic)).toBeLessThan(5e-3);
    });

    it("出力は入力と同じ長さで、すべて有限値", () => {
      const out = runFilter(harmonic, {
        O: 100,
        T: 100,
        S: 100,
        b: 100,
        g: 50,
      });
      expect(out.length).toBe(FRAMES);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("無音は無音のまま返す", () => {
      const silent = new Float64Array(FRAMES);
      const out = runFilter(silent);
      expect(out.every((v) => v === 0)).toBe(true);
    });

    it("入力と出力のスペクトル包絡の差が、出力へ補正として反映される", () => {
      // 入力は倍音の多い波形、出力は純音。補正後は入力の倍音構成に近づく
      const pure = createSine(FRAMES, HZ);
      const out = runFilter(harmonic, {}, pure);
      const high = 220 * 6;
      const before = magnitudeAt(pure, high, 2048, 6144);
      const after = magnitudeAt(out, high, 2048, 6144);
      expect(after).toBeGreaterThan(before);
    });

    it("Oフラグ: 正で低域を持ち上げ、負で抑える", () => {
      const neutral = magnitudeAt(runFilter(harmonic), HZ, 2048, 6144);
      const open = magnitudeAt(runFilter(harmonic, { O: 100 }), HZ, 2048, 6144);
      const close = magnitudeAt(
        runFilter(harmonic, { O: -100 }),
        HZ,
        2048,
        6144,
      );
      expect(open / neutral).toBeGreaterThan(1.3);
      expect(close / neutral).toBeLessThan(0.8);
    });

    it("Tフラグ: 正で1.5kHz付近を持ち上げ、負で抑える", () => {
      const hz = HZ * 7;
      const neutral = magnitudeAt(runFilter(harmonic), hz, 2048, 6144);
      const up = magnitudeAt(runFilter(harmonic, { T: 100 }), hz, 2048, 6144);
      const down = magnitudeAt(
        runFilter(harmonic, { T: -100 }),
        hz,
        2048,
        6144,
      );
      expect(up / neutral).toBeGreaterThan(1.4);
      expect(down / neutral).toBeLessThan(0.75);
    });

    it("Sフラグ: 正で高域を持ち上げ、負で抑える", () => {
      const hz = HZ * 20;
      const neutral = magnitudeAt(runFilter(harmonic), hz, 2048, 6144);
      const up = magnitudeAt(runFilter(harmonic, { S: 100 }), hz, 2048, 6144);
      const down = magnitudeAt(
        runFilter(harmonic, { S: -100 }),
        hz,
        2048,
        6144,
      );
      expect(up / neutral).toBeGreaterThan(1.5);
      expect(down / neutral).toBeLessThan(0.7);
    });

    it("bフラグ: 正で高域を持ち上げ低域を抑え、負で逆になる", () => {
      const low = HZ;
      const high = HZ * 20;
      const neutralLow = magnitudeAt(runFilter(harmonic), low, 2048, 6144);
      const neutralHigh = magnitudeAt(runFilter(harmonic), high, 2048, 6144);
      const bright = runFilter(harmonic, { b: 100 });
      const dark = runFilter(harmonic, { b: -100 });
      expect(
        magnitudeAt(bright, high, 2048, 6144) / neutralHigh,
      ).toBeGreaterThan(1.5);
      expect(magnitudeAt(bright, low, 2048, 6144) / neutralLow).toBeLessThan(
        0.6,
      );
      expect(magnitudeAt(dark, high, 2048, 6144) / neutralHigh).toBeLessThan(
        0.7,
      );
      expect(magnitudeAt(dark, low, 2048, 6144) / neutralLow).toBeGreaterThan(
        1.5,
      );
    });

    it("Bフラグ: 100で有声成分(低域)が大きく弱まり、0で高域が弱まる", () => {
      const neutralLow = magnitudeAt(runFilter(harmonic), HZ, 2048, 6144);
      const neutralHigh = magnitudeAt(runFilter(harmonic), HZ * 20, 2048, 6144);
      const breathy = runFilter(harmonic, { B: 100 });
      const clean = runFilter(harmonic, { B: 0 });
      expect(magnitudeAt(breathy, HZ, 2048, 6144) / neutralLow).toBeLessThan(
        0.3,
      );
      expect(
        magnitudeAt(clean, HZ * 20, 2048, 6144) / neutralHigh,
      ).toBeLessThan(0.4);
    });

    it("Bフラグが50を超えるとノイズが加わるが、同じ入力なら結果は再現する", () => {
      const a = runFilter(harmonic, { B: 80 });
      const b = runFilter(harmonic, { B: 80 });
      expect(a).toEqual(b);
      expect(a.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("gフラグ: 正負で包絡のワープ方向が逆になり、結果が異なる", () => {
      const male = runFilter(harmonic, { g: 100 });
      const female = runFilter(harmonic, { g: -100 });
      expect(maxAbsDiff(male, female)).toBeGreaterThan(1e-3);
    });

    it("sフラグ: 0(ぼかしなし)と20でフィルタの結果が異なる", () => {
      const pure = createSine(FRAMES, HZ);
      const sharp = runFilter(harmonic, { s: 0 }, pure);
      const blurred = runFilter(harmonic, { s: 20 }, pure);
      expect(maxAbsDiff(sharp, blurred)).toBeGreaterThan(1e-4);
    });

    it("固定範囲と伸縮範囲で異なる伸縮率でも、有限な値で同じ長さを返す", () => {
      const out = fave.ApplyFormantFilter(
        harmonic,
        harmonic,
        inputF0,
        HZ,
        outputF0,
        f0Steps,
        2048,
        4096,
        2,
        1.5,
        50,
        0,
        0,
        0,
        0,
        0,
        20,
      );
      expect(out.length).toBe(FRAMES);
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("入力f0や出力f0が異常値でも、平均f0で処理して有限な値を返す", () => {
      const badInput = new Float64Array(FRAMES / 256).fill(NaN);
      const badOutput = new Float64Array(outputF0.length).fill(0);
      const out = fave.ApplyFormantFilter(
        harmonic,
        harmonic,
        badInput,
        HZ,
        badOutput,
        f0Steps,
        0,
        0,
        1,
        1,
        50,
        0,
        0,
        0,
        0,
        0,
        20,
      );
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });
  });

  describe("resampWorker(合成波形)", () => {
    const FRAMES = 8192;
    const HZ = 220;

    /** 合成波形から、frq/ampつきのリクエストを作る */
    const createRequest = (
      overrides: Partial<ResampWorkerRequest> = {},
    ): ResampWorkerRequest => {
      const inputWavData = createSine(FRAMES, HZ);
      // amp列は16bit整数スケールの平均振幅(振幅0.3の正弦波の平均絶対値は0.3*2/pi)
      const ampValue = Math.round(((0.3 * 2) / Math.PI) * 32768);
      return {
        withFrq: true,
        inputWav: "synthetic.wav",
        targetTone: "A3",
        velocity: 100,
        flags: "",
        offsetMs: 0,
        targetMs: 300,
        fixedMs: 20,
        cutoffMs: 0,
        intensity: 100,
        modulation: 0,
        tempo: "!120",
        pitches: encodePitch([0, 0, 0]),
        inputWavData,
        frqData: new Float64Array(FRAMES / 256 + 1).fill(HZ),
        ampData: new Float64Array(FRAMES / 256 + 1).fill(ampValue),
        frqAverage: HZ,
        ...overrides,
      } as ResampWorkerRequest;
    };

    const targetFrames = (ms: number) => Math.floor((ms / 1000) * SAMPLE_RATE);

    it("出力長はtargetMsから決まり、すべて有限値", () => {
      const out = fave.resampWorker(createRequest({ targetMs: 300 }));
      expect(out.length).toBe(targetFrames(300));
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("targetMsが負ならエラーにする", () => {
      expect(() => fave.resampWorker(createRequest({ targetMs: -1 }))).toThrow(
        "targetMsが負の値",
      );
    });

    it("出力はf0に追従する(A3=220Hz)", () => {
      const out = fave.resampWorker(createRequest({ targetMs: 300 }));
      const hz = estimateFrequency(out, 2048, out.length - 2048);
      expect(hz).toBeGreaterThan(HZ * 0.9);
      expect(hz).toBeLessThan(HZ * 1.1);
    });

    it("音高名を変えると出力の周波数が変わる(A4=440Hz)", () => {
      const out = fave.resampWorker(
        createRequest({ targetMs: 300, targetTone: "A4" }),
      );
      const hz = estimateFrequency(out, 2048, out.length - 2048);
      expect(hz).toBeGreaterThan(440 * 0.9);
      expect(hz).toBeLessThan(440 * 1.1);
    });

    it("tフラグでcent単位の音高補正が反映される", () => {
      // t100は+1半音。A3(220Hz) -> 約233.1Hz
      const base = fave.resampWorker(createRequest({ flags: "" }));
      const shifted = fave.resampWorker(createRequest({ flags: "t100" }));
      const baseHz = estimateFrequency(base, 2048, base.length - 2048);
      const shiftedHz = estimateFrequency(shifted, 2048, shifted.length - 2048);
      expect(shiftedHz / baseHz).toBeGreaterThan(2 ** (1 / 12) * 0.95);
      expect(shiftedHz / baseHz).toBeLessThan(2 ** (1 / 12) * 1.05);
    });

    it("ピッチ列でピッチが変化する", () => {
      // 先頭は変化なし、以降+1200cent(1オクターブ上)
      const pitches = encodePitch([
        ...new Array(8).fill(0),
        ...new Array(80).fill(1200),
      ]);
      const out = fave.resampWorker(createRequest({ pitches }));
      const early = estimateFrequency(out, 0, 1024);
      const late = estimateFrequency(out, out.length - 4096, out.length - 512);
      expect(late / early).toBeGreaterThan(1.6);
    });

    it("Pフラグ: 100でピークが0.5に正規化され、0では正規化されない", () => {
      const normalized = fave.resampWorker(createRequest({ flags: "P100" }));
      const raw = fave.resampWorker(createRequest({ flags: "P0" }));
      const peakOf = (data: Float64Array) =>
        data.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
      expect(peakOf(normalized)).toBeCloseTo(0.5, 6);
      expect(peakOf(raw)).not.toBeCloseTo(0.5, 3);
      // 正規化は全体に一定のゲインを掛けるだけで、波形の形は変わらない
      const gain = peakOf(normalized) / peakOf(raw);
      expect(
        maxAbsDiff(
          normalized,
          raw.map((v) => v * gain),
        ),
      ).toBeLessThan(1e-9);
    });

    it("入力ampに合わせて出力の音量が決まる(入力の半分の音量なら出力も半分)", () => {
      const full = fave.resampWorker(createRequest({ flags: "P0" }));
      const request = createRequest({ flags: "P0" });
      const half = fave.resampWorker({
        ...request,
        ampData: request.ampData.map((v) => v / 2),
      });
      const mid = Math.floor(full.length / 2);
      const rms = (data: Float64Array) => {
        let sum = 0;
        for (let i = mid - 2048; i < mid + 2048; i++) sum += data[i] * data[i];
        return Math.sqrt(sum / 4096);
      };
      expect(rms(half) / rms(full)).toBeGreaterThan(0.45);
      expect(rms(half) / rms(full)).toBeLessThan(0.55);
    });

    it("Nフラグ: フォルマントフィルタを通さないため、他のフィルタ系フラグが効かない", () => {
      const a = fave.resampWorker(createRequest({ flags: "N" }));
      const b = fave.resampWorker(
        createRequest({ flags: "NO100T100S100b100g50" }),
      );
      expect(b).toEqual(a);
    });

    it("Nフラグなしでは、フィルタ系フラグが出力に影響する", () => {
      const a = fave.resampWorker(createRequest({ flags: "" }));
      const b = fave.resampWorker(createRequest({ flags: "O100" }));
      expect(maxAbsDiff(a, b)).toBeGreaterThan(1e-4);
    });

    it.each([
      ["Mo50", "O50"],
      ["Mt50", "T50"],
      ["ME50", "S50"],
      ["MG50", "w50"],
    ])("moresampler互換フラグ%sは%sと同じ結果になる", (alias, canonical) => {
      const a = fave.resampWorker(createRequest({ flags: alias }));
      const b = fave.resampWorker(createRequest({ flags: canonical }));
      expect(a).toEqual(b);
    });

    it("正規フラグがあるときは、エイリアスフラグより正規フラグを優先する", () => {
      const a = fave.resampWorker(createRequest({ flags: "O80Mo20" }));
      const b = fave.resampWorker(createRequest({ flags: "O80" }));
      expect(a).toEqual(b);
    });

    it("範囲外のフラグ値はクランプされる", () => {
      const a = fave.resampWorker(createRequest({ flags: "O999" }));
      const b = fave.resampWorker(createRequest({ flags: "O100" }));
      expect(a).toEqual(b);
    });

    it("velocityで固定範囲の伸縮が変わる", () => {
      const fast = fave.resampWorker(createRequest({ velocity: 100 }));
      const slow = fave.resampWorker(createRequest({ velocity: 0 }));
      expect(fast.length).toBe(slow.length);
      expect(maxAbsDiff(fast, slow)).toBeGreaterThan(1e-3);
    });

    it("fixedMsが0でも(固定範囲なし)処理できる", () => {
      const out = fave.resampWorker(createRequest({ fixedMs: 0 }));
      expect(out.length).toBe(targetFrames(300));
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("出力が入力より短い場合(圧縮)でも、等倍で処理して出力長を満たす", () => {
      const out = fave.resampWorker(createRequest({ targetMs: 100 }));
      expect(out.length).toBe(targetFrames(100));
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("出力が入力より長い場合(伸長)でも、出力長を満たす", () => {
      const out = fave.resampWorker(createRequest({ targetMs: 800 }));
      expect(out.length).toBe(targetFrames(800));
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("modulationの値を変えても処理できる", () => {
      const out = fave.resampWorker(createRequest({ modulation: 100 }));
      expect(out.length).toBe(targetFrames(300));
      expect(out.every((v) => Number.isFinite(v))).toBe(true);
    });

    it("同じリクエストなら同じ結果を返す(副作用なし)", () => {
      const request = createRequest({ flags: "B70g20" });
      const first = fave.resampWorker(request);
      const second = fave.resampWorker(request);
      expect(second).toEqual(first);
    });
  });
});
