/// <reference lib="webworker" />
/**
 * @module resampWorker
 * @description
 * 音声合成のうち、音程の変更と伸縮を担当するバックエンド処理を行う Worker スレッドです。
 * この Worker は、wasm のロードなどにより初回起動時に初期化に時間がかかるため、起動直後に初期化処理を行い、
 * メインスレッドに準備完了を通知します。
 * メインスレッドからは、ResampWorkerRequest を受け取り、処理結果（Float64Array）を Transferable な形で返却します.
 */

import { Resamp } from "../lib/Resamp";
import type { ResampWorkerRequest } from "../types/request";

/**
 * Resamp クラスのインスタンス。
 * 音声合成処理のコアとなるクラスで、WASM の初期化などを内包します。
 */
let resamp: Resamp;

/**
 * Worker の初期化処理。
 * Resamp のインスタンスを生成し、WASM のロードなど必要な初期化を実施します。
 * 初期化が完了すると、メインスレッドへ "ready" メッセージを送信します。
 *
 * @async
 * @returns {Promise<void>} 初期化完了時に解決される Promise
 */
const initializeWorker = async (): Promise<void> => {
  postMessage({ type: "init-started" });
  postMessage({ type: "debug", data: "init-started" });
  try {
    postMessage({ type: "debug", data: "creating Resamp instance" });
    resamp = new Resamp();

    postMessage({ type: "debug", data: "calling resamp.initialize" });
    await resamp.initialize();

    postMessage({ type: "ready" });
  } catch (e) {
    postMessage({ type: "error", error: String(e) });
  }
};

/**
 * メッセージイベントリスナー
 * メインスレッドから送られてくるメッセージを受信し、ResampWorkerRequest を処理します。
 * 各メッセージには一意の id が付与され、結果またはエラーが同じ id とともに返されます。
 *
 * @param {MessageEvent} event - メインスレッドからのメッセージイベント
 */
self.addEventListener("message", async (event: MessageEvent) => {
  const { id, request } = event.data as {
    id: number;
    request: ResampWorkerRequest;
  };
  try {
    const result: Float64Array = await Promise.resolve(
      resamp.resampWorker(request)
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

initializeWorker().catch((err) => {
  postMessage({
    type: "error",
    error: err instanceof Error ? err.message : err,
  });
});
