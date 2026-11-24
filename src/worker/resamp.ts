/// <reference lib="webworker" />
/**
 * @module resampWorker
 * @description
 * 音声合成のうち、音程の変更と伸縮を担当するバックエンド処理を行う Worker スレッドです。
 * この Worker は、wasm のロードなどにより初回起動時に初期化に時間がかかるため、起動直後に初期化処理を行い、
 * メインスレッドに準備完了を通知します。
 * メインスレッドからは、ResampWorkerRequest を受け取り、処理結果（Float64Array）を Transferable な形で返却します.
 */

import type { ResampBase } from "../lib/ResampBase";
import { createResampEngine, type ResampEngineName } from "../lib/ResampEngine";
import type { ResampWorkerRequest } from "../types/request";

/**
 * resampエンジンのインスタンス。
 * エンジンはサービス側からの init メッセージで指定される。
 */
let resamp: ResampBase;

/**
 * Worker の初期化処理。
 * 指定されたエンジンのインスタンスを生成して初期化し、メインスレッドへ "ready" メッセージを送信します。
 *
 * @async
 * @param {ResampEngineName} engine - 使用するエンジン名
 * @returns {Promise<void>} 初期化完了時に解決される Promise
 */
const initializeWorker = async (engine: ResampEngineName): Promise<void> => {
  postMessage({ type: "init-started" });
  postMessage({ type: "debug", data: "init-started" });
  try {
    postMessage({ type: "debug", data: `creating ${engine} instance` });
    resamp = await createResampEngine(engine);

    postMessage({ type: "debug", data: "calling resamp.initialize" });
    await resamp.initialize();

    postMessage({ type: "ready" });
  } catch (e) {
    postMessage({ type: "error", error: String(e) });
  }
};

/**
 * メッセージイベントリスナー
 * メインスレッドから送られてくるメッセージを受信します。
 * - { type: "init", engine }: 指定されたエンジンで初期化します。
 * - { id, request }: ResampWorkerRequest を処理します。結果またはエラーが同じ id とともに返されます。
 *
 * @param {MessageEvent} event - メインスレッドからのメッセージイベント
 */
self.addEventListener("message", async (event: MessageEvent) => {
  if (event.data && event.data.type === "init") {
    await initializeWorker(event.data.engine as ResampEngineName);
    return;
  }
  const { id, request } = event.data as {
    id: number;
    request: ResampWorkerRequest;
  };
  try {
    const result: Float64Array = await Promise.resolve(
      resamp.resampWorker(request),
    );
    postMessage({ id, result }, [result.buffer]);
  } catch (error) {
    postMessage({
      id,
      type: "error",
      error: error instanceof Error ? error.message : error,
    });
  }
});
