import { Meta, StoryFn } from "@storybook/react";
import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import { GenerateWave, WaveProcessing } from "utauwav";
import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";
import { ResampWorkerService } from "../services/resampWorker";
import { sampleVB } from "../storybook/sampledata";
import { base64ToArrayBuffer } from "../storybook/utils";
import type { ResampRequest } from "../types/request";

const ResampWorkerDemo: React.FC = () => {
  const [result, setResult] = useState<Float64Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resUrl, setResUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    const service = new ResampWorkerService();

    const runResamp = async () => {
      try {
        await service.waitUntilReady();
        const td = new TextDecoder("Shift-JIS");
        const request: ResampRequest = {
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
          pitches: "AAAA",
        };
        const z = new JSZip();
        await z.loadAsync(base64ToArrayBuffer(sampleVB), {
          decodeFileName: (fileNameBinary: Uint8Array) =>
            td.decode(fileNameBinary),
        });
        const vb = new VoiceBank(z.files);
        await vb.initialize();
        if (!vb) {
          throw new Error(
            "VoiceBank instance is not available. Please set it up."
          );
        }
        const res = await service.processResamp(request, vb);
        setResult(res);

        const wp = new WaveProcessing();
        const wav = GenerateWave(
          44100,
          16,
          wp.InverseLogicalNormalize(Array.from(res), 16)
        );
        const buf = wav.Output();
        const wUrl = URL.createObjectURL(
          new Blob([buf], { type: "audio/wav" })
        );
        setResUrl(wUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    runResamp();

    return () => {
      service.terminate();
    };
  }, []);
  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Resamp Worker Demo</h2>
      このコンポーネントはWorkerの動作を確認するための物であり、プロダクトには含まれていません。
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {resUrl !== undefined && <audio src={resUrl} controls></audio>}
    </div>
  );
};

const meta: Meta = {
  title: "90_Workerテスト/resampler",
  component: ResampWorkerDemo,
};

export default meta;
export const Default: StoryFn = () => <ResampWorkerDemo />;
Default.storyName = "単純な合成";
