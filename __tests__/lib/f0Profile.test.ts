import fs from "fs";
import JSZip from "jszip";
import { beforeAll, describe, expect, it } from "vitest";
import { renderingConfig } from "../../src/config/rendering";
import { Resamp } from "../../src/lib/Resamp";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { analyzeFrqByYin } from "../../src/lib/yin";
import { makeTimeAxis } from "../../src/utils/interp";

/** プロファイル対象ケース */
type ProfileCase = {
  /** 表示名 */
  name: string;
  /** 入力wav相対パス */
  inputWav: string;
  /** 原音設定左ブランク(ms) */
  offsetMs: number;
  /** 原音設定右ブランク(ms) */
  cutoffMs: number;
};

/** 1アルゴリズムの計測統計 */
type MeasureStats = {
  /** 計測サンプル数 */
  count: number;
  /** 平均時間(ms) */
  meanMs: number;
  /** 中央値(ms) */
  medianMs: number;
  /** 最小時間(ms) */
  minMs: number;
  /** 最大時間(ms) */
  maxMs: number;
};

/** ケースごとの比較結果 */
type ProfileResult = {
  /** ケース情報 */
  input: ProfileCase;
  /** 入力長(サンプル) */
  sampleLength: number;
  /** 入力長(秒) */
  durationSec: number;
  /** YIN計測統計 */
  yin: MeasureStats;
  /** Harvest計測統計 */
  harvest: MeasureStats;
  /** 平均時間ベースの高速化倍率(Harvest / YIN) */
  speedup: number;
};

/** 指定処理の実行時間を複数回計測して統計値を返す */
const measure = (fn: () => number, iterations: number): MeasureStats => {
  const times: number[] = [];
  let sink = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    sink += fn();
    const end = performance.now();
    times.push(end - start);
  }

  // デッドコード除去対策: 計測結果を式に混ぜる
  if (!Number.isFinite(sink)) {
    throw new Error("計測中に非有限値が発生しました。");
  }

  const sorted = times.slice().sort((a, b) => a - b);
  const meanMs = times.reduce((acc, v) => acc + v, 0) / times.length;
  const medianMs = sorted[Math.floor(sorted.length / 2)];
  return {
    count: iterations,
    meanMs,
    medianMs,
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1],
  };
};

/** 統計値を固定小数点表記へ整形する */
const fmt = (v: number): string => v.toFixed(3);

describe("F0 profiling: YIN vs Harvest", () => {
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

  it("Resamp/FaveResampの実運用条件でf0生成時間を比較する", async () => {
    /** Resamp.test.ts / FaveResamp.test.ts で使われる実入力条件からピックアップ */
    const cases: ProfileCase[] = [
      {
        name: "case-A (offset=1538.32, cutoff=-100)",
        inputWav: "denoise/01_あかきくけこ.wav",
        offsetMs: 1538.32,
        cutoffMs: -100,
      },
      {
        name: "case-B (offset=1538.32, cutoff=-200)",
        inputWav: "denoise/01_あかきくけこ.wav",
        offsetMs: 1538.32,
        cutoffMs: -200,
      },
      {
        name: "case-C (offset=1500, cutoff=4251.428571)",
        inputWav: "denoise/01_あかきくけこ.wav",
        offsetMs: 1500,
        cutoffMs: 4251.428571428572,
      },
    ];

    const results: ProfileResult[] = [];
    for (const c of cases) {
      const wav = Float64Array.from(
        await resamp.getWaveData(c.inputWav, c.offsetMs, c.cutoffMs),
      );
      const durationSec = wav.length / renderingConfig.frameRate;
      const timeAxis = Float64Array.from(
        makeTimeAxis(renderingConfig.worldPeriod, 0, durationSec),
      );

      /** JITとメモリアロケーションの初回コストを落とすためウォームアップ */
      for (let i = 0; i < 3; i++) {
        const y = analyzeFrqByYin(wav);
        const h = resamp.Harvest(wav, timeAxis);
        if (y.frq.length === 0 || h.frq.length === 0) {
          throw new Error("ウォームアップ時にf0列が空になりました。");
        }
      }

      const yinStats = measure(() => {
        const y = analyzeFrqByYin(wav);
        return y.frqAverage + y.frq.length + y.amp.length;
      }, 20);

      const harvestStats = measure(() => {
        const h = resamp.Harvest(wav, timeAxis);
        return h.frqAverage + h.frq.length + h.amp.length;
      }, 20);

      results.push({
        input: c,
        sampleLength: wav.length,
        durationSec,
        yin: yinStats,
        harvest: harvestStats,
        speedup: harvestStats.meanMs / yinStats.meanMs,
      });
    }

    const lines: string[] = [];
    lines.push("[F0 Profile Report] YIN vs Harvest");
    lines.push("condition: 20 iterations, 3 warmups, same input wavData");
    for (const r of results) {
      lines.push(
        [
          `- ${r.input.name}`,
          `len=${r.sampleLength} samples (${fmt(r.durationSec)} sec)`,
          `YIN mean=${fmt(r.yin.meanMs)}ms median=${fmt(r.yin.medianMs)}ms min=${fmt(r.yin.minMs)}ms max=${fmt(r.yin.maxMs)}ms`,
          `Harvest mean=${fmt(r.harvest.meanMs)}ms median=${fmt(r.harvest.medianMs)}ms min=${fmt(r.harvest.minMs)}ms max=${fmt(r.harvest.maxMs)}ms`,
          `speedup(Harvest/YIN)=${fmt(r.speedup)}x`,
        ].join(" | "),
      );
    }

    console.log("\n" + lines.join("\n") + "\n");

    /** 比較テストとしては、両者とも実行可能で結果が有限であることを担保する */
    expect(results.length).toBe(cases.length);
    results.forEach((r) => {
      expect(Number.isFinite(r.yin.meanMs)).toBe(true);
      expect(Number.isFinite(r.harvest.meanMs)).toBe(true);
      expect(r.sampleLength).toBeGreaterThan(0);
    });
  }, 120000);
});
