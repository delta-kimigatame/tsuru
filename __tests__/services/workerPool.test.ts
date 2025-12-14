import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaseVoiceBank } from "../../src/lib/VoiceBanks/BaseVoiceBank";
import { ResampWorkerPool } from "../../src/services/workerPool";
import { ResampRequest } from "../../src/types/request";

// ResampWorkerServiceをモック
vi.mock("../../src/services/resampWorker", () => {
  return {
    ResampWorkerService: vi.fn().mockImplementation(() => {
      return {
        processResamp: vi.fn(),
        isReady: true,
      };
    }),
  };
});

describe("ResampWorkerPool", () => {
  let pool: ResampWorkerPool;
  const dummyRequest: ResampRequest = {
    inputWav: "test.wav",
    targetTone: "C4",
    velocity: 100,
    flags: "",
    offsetMs: 0,
    targetMs: 500,
    fixedMs: 20,
    cutoffMs: -100,
    intensity: 100,
    modulation: 0,
    tempo: "!120",
    pitches: "AAAA",
    inputWavData: 0,
    withFrq: false,
  };
  const dummyVb = {} as BaseVoiceBank;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("指定した数のworkerが初期化される", () => {
    pool = new ResampWorkerPool(3);
    expect(pool.workers.length).toBe(3);
    expect(pool.taskQueue.length).toBe(0);
  });

  it("runResampを呼ぶとタスクがキューに追加される", async () => {
    pool = new ResampWorkerPool(1);
    const mockWorker = pool.workers[0].worker as any;
    mockWorker.processResamp.mockResolvedValue(new Float64Array([1, 2, 3]));

    const promise = pool.runResamp(dummyRequest, dummyVb, 0);

    // processResampが呼ばれることを確認
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockWorker.processResamp).toHaveBeenCalledWith(
      dummyRequest,
      dummyVb
    );

    const result = await promise;
    expect(result).toEqual(new Float64Array([1, 2, 3]));
  });

  it("複数のタスクが順番に処理される", async () => {
    pool = new ResampWorkerPool(1);
    const mockWorker = pool.workers[0].worker as any;

    // 最初のタスクは遅延、2番目は即座に解決
    mockWorker.processResamp
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(new Float64Array([1])), 50)
          )
      )
      .mockImplementationOnce(() => Promise.resolve(new Float64Array([2])));

    const promise1 = pool.runResamp(dummyRequest, dummyVb, 0);
    const promise2 = pool.runResamp(dummyRequest, dummyVb, 1);

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).toEqual(new Float64Array([1]));
    expect(result2).toEqual(new Float64Array([2]));
    expect(mockWorker.processResamp).toHaveBeenCalledTimes(2);
  });

  it("複数のworkerで並列にタスクが処理される", async () => {
    pool = new ResampWorkerPool(2);
    const mockWorker1 = pool.workers[0].worker as any;
    const mockWorker2 = pool.workers[1].worker as any;

    mockWorker1.processResamp.mockResolvedValue(new Float64Array([1]));
    mockWorker2.processResamp.mockResolvedValue(new Float64Array([2]));

    const promise1 = pool.runResamp(dummyRequest, dummyVb, 0);
    const promise2 = pool.runResamp(dummyRequest, dummyVb, 1);

    await Promise.all([promise1, promise2]);

    // 両方のworkerが呼ばれることを確認
    expect(mockWorker1.processResamp).toHaveBeenCalledTimes(1);
    expect(mockWorker2.processResamp).toHaveBeenCalledTimes(1);
  });

  it("clearTasksでキュー内の全てのタスクがキャンセルされる", async () => {
    pool = new ResampWorkerPool(1);
    const mockWorker = pool.workers[0].worker as any;

    // 最初のタスクは遅延（workerをbusyにする）
    mockWorker.processResamp.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(new Float64Array([1])), 100)
        )
    );

    // 最初のタスクを実行してworkerをbusyにする
    const promise1 = pool.runResamp(dummyRequest, dummyVb, 0);

    // 2番目のタスクを追加（キューに入る）
    const promise2 = pool.runResamp(dummyRequest, dummyVb, 1);

    // promise2のエラーハンドラを先に登録
    const promise2Result = promise2.catch((e) => e);

    // キューに追加されるのを待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    // キューをクリア
    pool.clearTasks();

    // 1番目（実行中）は成功、2番目（キュー内）はキャンセルされる
    await expect(promise1).resolves.toEqual(new Float64Array([1]));
    const error = await promise2Result;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Canceled");
  });

  it("clearTaskで指定したインデックスのタスクがキャンセルされる", async () => {
    pool = new ResampWorkerPool(1);
    const mockWorker = pool.workers[0].worker as any;

    // 遅延するタスクを設定
    mockWorker.processResamp
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(new Float64Array([1])), 50)
          )
      )
      .mockImplementationOnce(() => Promise.resolve(new Float64Array([2])));

    const promise1 = pool.runResamp(dummyRequest, dummyVb, 0);
    const promise2 = pool.runResamp(dummyRequest, dummyVb, 1);

    // promise2のエラーハンドラを先に登録
    const promise2Result = promise2.catch((e) => e);

    // キューに追加されるのを待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    // index 1のタスクをキャンセル
    pool.clearTask(1);

    const result1 = await promise1;
    expect(result1).toEqual(new Float64Array([1]));

    const error = await promise2Result;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Canceled");
  });

  it("workerがエラーを返す場合、promiseがrejectされる", async () => {
    pool = new ResampWorkerPool(1);
    const mockWorker = pool.workers[0].worker as any;

    mockWorker.processResamp.mockRejectedValue(new Error("Worker error"));

    const promise = pool.runResamp(dummyRequest, dummyVb, 0);

    await expect(promise).rejects.toThrow("Worker error");
  });

  it("タスクキューが空でworkerが空いている状態で新しいタスクが即座に割り当てられる", async () => {
    pool = new ResampWorkerPool(2);
    const mockWorker1 = pool.workers[0].worker as any;

    mockWorker1.processResamp.mockResolvedValue(new Float64Array([1]));

    const startTime = Date.now();
    await pool.runResamp(dummyRequest, dummyVb, 0);
    const endTime = Date.now();

    // タスクが即座に処理されることを確認（100ms以内）
    expect(endTime - startTime).toBeLessThan(100);
  });
});
