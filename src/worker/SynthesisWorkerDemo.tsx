import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import { resampWorkersCount } from "../config/workers";
import { Ust } from "../lib/Ust";
import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";
import { SynthesisWorker } from "../services/synthesis"; // SynthesisWorkerの実装ファイル
import { useMusicProjectStore } from "../store/musicProjectStore";
import { loadVB } from "../storybook/utils";
// Propsの型定義
interface SynthesisWorkerDemoProps {
  vbFileName: string; // 例: "minimumCV.zip" や "standardVCV.zip"
  ustBuffer: ArrayBuffer; // Ustの内容を表すArrayBuffer
  testDescription: string; //testデータを説明する文章
}
const SynthesisWorkerDemo: React.FC<SynthesisWorkerDemoProps> = ({
  vbFileName,
  ustBuffer,
  testDescription,
}) => {
  const { vb, setVb, ust, setUst } = useMusicProjectStore();
  // 合成結果のwavデータ（16bit/44100Hz）のArrayBuffer
  const [result, setResult] = useState<ArrayBuffer | null>(null);
  // 読み込み中フラグ
  const [loading, setLoading] = useState<boolean>(true);
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);
  // 作成されたwavのURL（audio再生用）
  const [resUrl, setResUrl] = useState<string | undefined>(undefined);
  // プロファイリング用：合成開始時間（ms）
  const [startTime, setStartTime] = useState<number | null>(null);
  // プロファイリング用：合成完了時間（ms）
  const [endTime, setEndTime] = useState<number | null>(null);
  // プロファイリング用:vbのサイズ
  const [vbSize, setVbSize] = useState<number | null>(null);
  // プロファイリング用：合成開始時間（ms）
  const [startVBLoadTime, setStartVBLoadTime] = useState<number | null>(null);
  // プロファイリング用：合成完了時間（ms）
  const [endFetchTime, setEndFetchTime] = useState<number | null>(null);
  // プロファイリング用：合成完了時間（ms）
  const [endVBLoadTime, setEndVBLoadTime] = useState<number | null>(null);

  // SynthesisWorkerを1回だけ生成（このインスタンスを使い回す）
  const synthesisWorker = React.useMemo(() => new SynthesisWorker(), []); // コンポーネント起動時にVBとUSTをロードしてグローバル状態に設定
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const td = new TextDecoder("Shift-JIS");
        const u = new Ust();
        await u.load(ustBuffer);
        setUst(u);
        setStartVBLoadTime(Date.now());
        const buffer = await loadVB(vbFileName);
        setEndFetchTime(Date.now());
        const zip = new JSZip();
        await zip.loadAsync(buffer, {
          decodeFileName: (fileNameBinary: Uint8Array) =>
            td.decode(fileNameBinary),
        });
        const loadedVb = new VoiceBank(zip.files);
        await loadedVb.initialize();
        setVb(loadedVb);
        setEndVBLoadTime(Date.now());
        setVbSize(buffer.byteLength / (1024 * 1024));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    loadGlobalData();
  }, [setVb, setUst]);

  // vbが非nullになった際に、synthesis処理を実行
  useEffect(() => {
    if (!vb) return;
    const runSynthesis = async () => {
      try {
        setStartTime(Date.now());
        // selectNotes: 空配列の場合は全ノート対象
        const buf = await synthesisWorker.synthesis([]);
        setEndTime(Date.now());
        setResult(buf);

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
    runSynthesis();
  }, [vb]);

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Synthesis Worker Demo</h2>
      <p>
        このコンポーネントはSynthesisWorker.synthesis()をテストするためのものです。
        <br />
        このテストシナリオでは、{testDescription}
      </p>
      <h2>VBの概要</h2>
      {vbSize && <p>ロードしたVB: {vbSize} MB</p>}
      {startVBLoadTime && <p>開始時刻: {startVBLoadTime} ms</p>}
      {endFetchTime && (
        <p>
          完了時刻: {endFetchTime} ms（VBのフェッチにかかった時間:{" "}
          {endFetchTime - startVBLoadTime} ms）
        </p>
      )}
      {endVBLoadTime && (
        <p>
          完了時刻: {endVBLoadTime} ms（VBのロードにかかった時間:{" "}
          {endVBLoadTime - startVBLoadTime} ms）
        </p>
      )}
      <h2>合成処理</h2>
      <p>workerの数:{resampWorkersCount}</p>
      {startTime && <p>開始時刻: {startTime} ms</p>}
      {endTime && (
        <p>
          完了時刻: {endTime} ms（合成にかかった時間: {endTime - startTime} ms）
        </p>
      )}
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {resUrl !== undefined && <audio src={resUrl} controls></audio>}
    </div>
  );
};

export default SynthesisWorkerDemo;
