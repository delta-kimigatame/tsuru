/**
 * @module resampWorkerService
 * @description
 * メインスレッド側から Worker をロードし、ResampWorkerRequest に変換したデータを送信して、
 * Worker 側の音声合成処理結果（Float64Array）を受け取るサービスです。
 *
 * このサービスは、React UI から利用され、VoiceBank (vb) データから
 * wav や frq データを取得し、必要な変換を実施した上で、Worker に転送可能な形（Float64Array）で送信します。
 */

import { renderingConfig } from "../config/rendering";
import type { VoiceBank } from "../lib/VoiceBanks/VoiceBank";
import type { ResampRequest, ResampWorkerRequest } from "../types/request";
import { interp1d, makeTimeAxis } from "../utils/interp";
import { waitForWorkerMessage } from "./worker";

let workerIdCounter = 0;

/**
 * VoiceBank から wav データを取得し、LogicalNormalize 後の必要な範囲を切り出して返します。
 * @param inputWav - 音源ルートから wav ファイルへの相対パス
 * @param offsetMs - 原音設定の左ブランク (ms)
 * @param cutoffMs - 原音設定の右ブランク (ms)
 * @param vb - VoiceBank インスタンス
 * @returns Promise<number[]> - 切り出された wav データの配列
 */
export const getWaveData = async (
  inputWav: string,
  offsetMs: number,
  cutoffMs: number,
  vb: VoiceBank
): Promise<number[]> => {
  const wavData = await vb.getWave(inputWav);
  const offsetFrame = Math.floor((renderingConfig.frameRate * offsetMs) / 1000);
  const cutoff =
    cutoffMs < 0
      ? offsetMs - cutoffMs
      : (wavData.data.length / wavData.sampleRate) * 1000 - cutoffMs;
  const cutoffFrame = Math.floor((renderingConfig.frameRate * cutoff) / 1000);
  return wavData.LogicalNormalize(1).slice(offsetFrame, cutoffFrame);
};

/**
 * VoiceBank から frq データを取得し、world 時間軸に合わせて補間した結果を返します。
 * @param inputWav - 音源ルートから wav ファイルへの相対パス
 * @param offsetMs - 原音設定の左ブランク (ms)
 * @param wavMs - 読み込んだ wav の長さ (ms)
 * @param vb - VoiceBank インスタンス
 * @returns Promise<{frq: number[]; amp: number[]; timeAxis: number[]; frqAverage: number;}>
 */
export const getFrqData = async (
  inputWav: string,
  offsetMs: number,
  wavMs: number,
  vb: VoiceBank
): Promise<{
  frq: number[];
  amp: number[];
  timeAxis: number[];
  frqAverage: number;
}> => {
  const timeAxis = makeTimeAxis(renderingConfig.worldPeriod, 0, wavMs / 1000);
  const frqData = await vb.getFrq(inputWav);
  const frqTimeAxis = makeTimeAxis(
    (1 / renderingConfig.frqFrameRate) * frqData.perSamples,
    0,
    wavMs / 1000
  );
  const offsetFrame = Math.floor(
    (renderingConfig.frameRate * offsetMs) / (frqData.perSamples * 1000)
  );
  const cutoffFrame =
    Math.ceil(
      (renderingConfig.frameRate * wavMs) / (frqData.perSamples * 1000)
    ) + 1;
  const frq = interp1d(
    Array.from(frqData.frq).slice(offsetFrame, offsetFrame + cutoffFrame),
    frqTimeAxis,
    timeAxis
  );
  const amp = interp1d(
    Array.from(frqData.amp).slice(offsetFrame, offsetFrame + cutoffFrame),
    frqTimeAxis,
    timeAxis
  );
  return {
    frq: frq,
    amp: amp,
    timeAxis: timeAxis,
    frqAverage: frqData.frqAverage,
  };
};

/**
 * ResampWorkerService は、React UI などメインスレッド側から呼び出され、
 * Worker を利用した音声合成処理を実現するサービスです。
 */
export class ResampWorkerService {
  private worker: Worker;
  private isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor() {
    // Worker をモジュールとしてロード
    this.worker = new Worker(new URL("../worker/resamp.ts", import.meta.url), {
      type: "module",
    });

    // "init-started" メッセージを受信した場合にログを出力するリスナーを追加
    this.worker.addEventListener("message", (event: MessageEvent) => {
      if (event.data && event.data.type === "debug") {
        console.log(event);
      }
    });
    // ready 状態を管理する Promise を作成
    this.readyPromise = new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === "ready") {
          this.isReady = true;
          this.worker.removeEventListener("message", handler);
          resolve();
        }
      };
      this.worker.addEventListener("message", handler);
    });
  }
  /**
   * Worker の初期化完了を待ちます。
   * @returns Promise<void> - 初期化完了時に解決される Promise
   */
  public async waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * ResampRequest と VoiceBank (vb) を受け取り、必要なデータを取得してから、
   * ResampWorkerRequest を作成し、Worker に送信します。
   * Worker 側の処理結果（Float64Array）を返します。
   *
   * @param request - メインスレッド側での音声合成リクエスト
   * @param vb - 音源ライブラリとしての VoiceBank オブジェクト
   * @returns Promise<Float64Array> - Worker 側で処理された合成結果の Float64Array
   */
  public async processResamp(
    request: ResampRequest,
    vb: VoiceBank
  ): Promise<Float64Array> {
    // Worker の初期化が完了していることを保証
    await this.waitUntilReady();

    // getWaveData と getFrqData を呼び出してデータを取得
    const waveData = await getWaveData(
      request.inputWav,
      request.offsetMs,
      request.cutoffMs,
      vb
    );
    const frqDataObj = await getFrqData(
      request.inputWav,
      request.offsetMs,
      (waveData.length / renderingConfig.frameRate) * 1000,
      vb
    );

    // ResampWorkerRequest を作成
    const workerRequest: ResampWorkerRequest = {
      // ResampRequest の元のプロパティ
      inputWav: request.inputWav,
      targetTone: request.targetTone,
      velocity: request.velocity,
      flags: request.flags,
      offsetMs: request.offsetMs,
      targetMs: request.targetMs,
      fixedMs: request.fixedMs,
      cutoffMs: request.cutoffMs,
      intensity: request.intensity,
      modulation: request.modulation,
      tempo: request.tempo,
      pitches: request.pitches,
      // メインスレッドで取得したデータ
      inputWavData: Float64Array.from(waveData),
      frqData: Float64Array.from(frqDataObj.frq),
      ampData: Float64Array.from(frqDataObj.amp),
      frqAverage: frqDataObj.frqAverage,
    };

    // 一意なリクエスト ID を生成
    const requestId = workerIdCounter++;

    // Worker からのレスポンスを待つ Promise を作成
    const responsePromise = waitForWorkerMessage(
      this.worker,
      (data) => data.id === requestId
    );

    // Worker にメッセージを送信
    // Float64Array の buffer は Transferable として渡せる
    this.worker.postMessage({ id: requestId, request: workerRequest }, [
      workerRequest.inputWavData.buffer,
      workerRequest.frqData.buffer,
      workerRequest.ampData.buffer,
    ]);

    // Worker からのレスポンスを待ち、結果を返す
    const response = await responsePromise;
    if (response.error) {
      throw new Error(response.error);
    }
    // 返された結果は Float64Array として受け取る
    return response.result as Float64Array;
  }
  /**
   * Worker を停止します。
   */
  public terminate(): void {
    this.worker.terminate();
  }
}
