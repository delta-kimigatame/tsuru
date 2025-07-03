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
import { LOG } from "../lib/Logging";
import type { BaseVoiceBank } from "../lib/VoiceBanks/BaseVoiceBank";
import type {
  ResampRequest,
  ResampWorkerRequest,
  WithFrq,
  WithoutFrq,
} from "../types/request";
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
  vb: BaseVoiceBank
): Promise<number[]> => {
  LOG.info(`wavデータの読込:${inputWav}`, "resampWorker.getWaveData");
  try {
    const wavData = await vb.getWave(inputWav);
    const offsetFrame = Math.floor(
      (renderingConfig.frameRate * offsetMs) / 1000
    );
    const cutoff =
      cutoffMs < 0
        ? offsetMs - cutoffMs
        : (wavData.data.length / wavData.sampleRate) * 1000 - cutoffMs;
    const cutoffFrame = Math.floor((renderingConfig.frameRate * cutoff) / 1000);
    return wavData.LogicalNormalize(1).slice(offsetFrame, cutoffFrame);
  } catch (err) {
    LOG.error(`wavデータの読込に失敗:${inputWav}`, "resampWorker.getWaveData");
    throw err; //wavが読込できないのはUTAUとして致命傷でありどうにもできないので上位にエラーで返す
  }
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
  vb: BaseVoiceBank
): Promise<{
  frq: number[];
  amp: number[];
  timeAxis: number[];
  frqAverage: number;
}> => {
  /** TODO frqファイルが存在しないとき、frqを生成できるようにする */
  LOG.info(`frqデータの読込:${inputWav}`, "resampWorker.getFrqData");
  try {
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
    LOG.debug(
      `offsetFrame:${offsetFrame},cutoffFrame:${cutoffFrame}`,
      "resampWorker.getFrqData"
    );
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
  } catch (err) {
    LOG.error(`frqデータの読込に失敗:${inputWav}`, "resampWorker.getFrqData");
    throw err; //frqは原理的にアプリ内で生成可能であるが、現時点でそのような実装はないため、読込失敗は致命的
  }
};

/**
 * ResampWorkerService は、React UI などメインスレッド側から呼び出され、
 * Worker を利用した音声合成処理を実現するサービスです。
 */
export class ResampWorkerService {
  private worker: Worker;
  public isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor() {
    LOG.info("resamp workerのロード開始", "resampWorker.ResampWorkerService");
    this.worker = new Worker(new URL("../worker/resamp.ts", import.meta.url), {
      type: "module",
    });

    // "init-started" メッセージを受信した場合にログを出力するリスナーを追加
    this.worker.addEventListener("message", (event: MessageEvent) => {
      if (event.data && event.data.type === "debug") {
        LOG.debug(
          `resamp workerからのデバッグメッセージ:${event.data.data}`,
          "resampWorker.ResampWorkerService"
        );
      } else if (event.data && event.data.type === "error") {
        LOG.warn(
          `resamp workerからのエラーメッセージ:${JSON.stringify(
            event.data.error
          )}`,
          "resampWorker.ResampWorkerService"
        );
      }
    });
    // ready 状態を管理する Promise を作成
    this.readyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.worker.removeEventListener("message", handler);
        LOG.error(
          `resamp workerの初期化タイムアウト`,
          "resampWorker.ResampWorkerService"
        );
        // reject(new Error("resamp workerの初期化がタイムアウトしました"));
      }, 30000);
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === "ready") {
          clearTimeout(timeout);
          LOG.info("resamp workerのロード完了", "resampWorker.WorkerService");
          this.isReady = true;
          this.worker.removeEventListener("message", handler);
          resolve();
        } else if (event.data && event.data.type === "error") {
          clearTimeout(timeout);
          LOG.warn(
            `resamp workerからのエラーメッセージ:${JSON.stringify(
              event.data.error
            )}`,
            "resampWorker.ResampWorkerService"
          );
          // reject(new Error("resamp workerでエラーが発生しました"));
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
    vb: BaseVoiceBank
  ): Promise<Float64Array> {
    // Worker の初期化が完了していることを保証
    await this.waitUntilReady();
    LOG.info(`wav生成request準備`, "resampWorker.ResampWorkerService");

    let waveData: number[];
    // getWaveData と getFrqData を呼び出してデータを取得
    try {
      waveData = await getWaveData(
        request.inputWav,
        request.offsetMs,
        request.cutoffMs,
        vb
      );
    } catch (err) {
      throw err;
    }
    LOG.debug(
      `取得したwav長:${waveData.length}`,
      "resampWorker.ResampWorkerService"
    );
    let frqDataObj: {
      frq: number[];
      amp: number[];
      timeAxis: number[];
      frqAverage: number;
    };
    let frqRequest: WithFrq | WithoutFrq = { withFrq: false };
    try {
      frqDataObj = await getFrqData(
        request.inputWav,
        request.offsetMs,
        (waveData.length / renderingConfig.frameRate) * 1000,
        vb
      );
      frqRequest = {
        withFrq: true,
        frqData: Float64Array.from(frqDataObj.frq),
        ampData: Float64Array.from(frqDataObj.amp),
        frqAverage: frqDataObj.frqAverage,
      } as unknown as WithFrq;
    } catch (err) {
      LOG.debug(
        `frqの読み込みに失敗したため合成時に生成します:${request.inputWav}`,
        "resampWorker.ResampWorkerService"
      );
    }

    // ResampWorkerRequest を作成
    const workerRequest = Object.assign(
      {
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
      },
      frqRequest
    ) as ResampWorkerRequest;

    // 一意なリクエスト ID を生成
    const requestId = workerIdCounter++;

    // Worker からのレスポンスを待つ Promise を作成
    const responsePromise = waitForWorkerMessage(
      this.worker,
      (data) => data.id === requestId
    );

    LOG.debug(
      `workerにwav生成リクエスト送信:${JSON.stringify({
        ...request,
        inputWavData: waveData.length,
        withFrq: frqRequest.withFrq,
      })}、requestId:${requestId}`,
      "resampWorker.ResampWorkerService"
    );

    // Worker にメッセージを送信
    // Float64Array の buffer は Transferable として渡せる
    if (frqRequest.withFrq) {
      this.worker.postMessage({ id: requestId, request: workerRequest }, [
        workerRequest.inputWavData.buffer,
        workerRequest.frqData.buffer,
        workerRequest.ampData.buffer,
      ]);
    } else {
      this.worker.postMessage({ id: requestId, request: workerRequest }, [
        workerRequest.inputWavData.buffer,
      ]);
    }

    // Worker からのレスポンスを待ち、結果を返す
    const response = await responsePromise;
    if (response.error) {
      LOG.error(
        `requestId:${requestId}、${response.error}`,
        "resampWorker.Worker"
      );
      throw new Error(response.error);
    }
    LOG.info(
      `wav生成完了。requestId:${requestId}`,
      "resampWorker.ResampWorkerService"
    );
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
