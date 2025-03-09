import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";
import { ResampRequest } from "../types/request";
import { ResampWorkerService } from "./resampWorker";

/**
 * Deferred Promise のヘルパー型
 */
type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};

/**
 * Defreedを生成するためのヘルパー関数
 * @returns
 */
const createDeferred = <T>(): Deferred<T> => {
  let resolve: (value: T) => void = () => {};
  let reject: (reason?: any) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/**
 * タスクとして保持する情報の型
 */
type ResampTask = {
  /**
   * resampを実行するための引数
   */
  request: ResampRequest;
  /**
   * resampを実行する音声ライブラリ
   */
  vb: VoiceBank;
  /**
   * 実行結果を解決するためのオブジェクト
   */
  deferred: Deferred<Float64Array>;
};

/**
 * 複数のresampWorkerに適切にタスクを振り分けるためのworeker pool
 */
export class ResampWorkerPool {
  /** 実行状態を管理するworker */
  workers: Array<{ worker: ResampWorkerService; busy: boolean }>;
  /** 未実行のタスク */
  taskQueue: Array<ResampTask>;

  /**
   * workerの数を指定し、worker poolを初期化する
   * @param workerCount workerの数
   */
  constructor(workerCount: number) {
    this.workers = [];
    this.taskQueue = [];
    for (let i = 0; i < workerCount; i++) {
      this.workers.push({ worker: new ResampWorkerService(), busy: false });
    }
  }

  /**
   * API: requestとvbを渡して、resampWorkerの結果（Promise<Float64Array>）を返す
   * @param request resamp用のリクエスト
   * @param vb VoiceBankインスタンス
   * @returns Promise<Float64Array>
   */
  public runResamp(
    request: ResampRequest,
    vb: VoiceBank
  ): Promise<Float64Array> {
    const deferred = createDeferred<Float64Array>();
    // タスクを作成してキューに追加
    const task: ResampTask = { request, vb, deferred };
    this.enqueueTask(task);
    return deferred.promise;
  }

  /**
   * タスクをキューに追加し、割り当て処理を開始する
   * @param task タスク
   */
  private enqueueTask(task: ResampTask): void {
    this.taskQueue.push(task);
    this.assignTasks();
  }
  /**
   * 利用可能なWorkerにタスクを割り当てる
   */
  private assignTasks(): void {
    // Workerプールの各Workerについて、アイドル状態かつタスクキューにタスクがあれば割り当てる
    for (const entry of this.workers) {
      if (!entry.busy && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        if (task) {
          entry.busy = true;
          // processResampはPromise<Float64Array>を返す
          entry.worker
            .processResamp(task.request, task.vb)
            .then((result) => {
              task.deferred.resolve(result);
            })
            .catch((error) => {
              task.deferred.reject(error);
            })
            .finally(() => {
              entry.busy = false;
              // 次のタスクを再帰的に割り当てる
              this.assignTasks();
            });
        }
      }
    }
  }
}
