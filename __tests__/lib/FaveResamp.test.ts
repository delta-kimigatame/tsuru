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
    const iWav = await resamp.getWaveData(
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
    const iWav = await resamp.getWaveData(
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
});
