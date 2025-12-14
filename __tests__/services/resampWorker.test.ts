import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ResampWorkerService } from "../../src/services/resampWorker";
import type { ResampRequest } from "../../src/types/request";

// DummyWorker を定義し、Worker の挙動をモックする
class DummyWorker {
  private listeners: { [key: string]: ((event: MessageEvent) => void)[] } = {};
  // コンストラクタでは、短いタイムアウトで "ready" メッセージを送信する
  constructor(public scriptUrl: string, public options?: any) {
    setTimeout(() => {
      this.dispatchEvent(
        new MessageEvent("message", { data: { type: "ready" } })
      );
    }, 10);
  }

  addEventListener(event: string, listener: (ev: MessageEvent) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  removeEventListener(event: string, listener: (ev: MessageEvent) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  // postMessage を呼ばれると、リクエスト内容に応じたレスポンスをシミュレートする
  postMessage(message: any, transfer?: Transferable[]) {
    const { id, request } = message;
    // エラーシナリオ: inputWav が "simulateError" ならエラーを返す
    if (request.inputWav === "simulateError") {
      setTimeout(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: { id, error: "simulated error" },
          })
        );
      }, 10);
    } else {
      // 成功の場合は、固定の Float64Array 結果 [10,20,30] を返す
      setTimeout(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: { id, result: new Float64Array([10, 20, 30]) },
          })
        );
      }, 10);
    }
  }

  dispatchEvent(event: MessageEvent) {
    const listeners = this.listeners["message"];
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  terminate() {
    // 特に処理は不要
  }
}

// グローバルな Worker を DummyWorker に上書き
global.Worker = DummyWorker as any;

// Dummy VoiceBank を定義
const dummyVoiceBank = {
  // getWave は、LogicalNormalize 後の適当な配列を返す
  getWave: async (inputWav: string) => {
    return {
      data: new Array(44100 * 2).fill(1),
      sampleRate: 44100,
      LogicalNormalize: (factor: number) => new Array(44100).fill(1),
    };
  },
  // getFrq は、ダミーのフーリエ関連データを返す
  getFrq: async (inputWav: string) => {
    return {
      perSamples: 100,
      frq: new Float64Array([440, 440, 440, 440]),
      amp: new Float64Array([0.5, 0.5, 0.5, 0.5]),
      frqAverage: 440,
    };
  },
};

// Dummy ResampRequest の定義
const dummyResampRequest: ResampRequest = {
  inputWav: "dummy/path.wav",
  targetTone: "A3",
  velocity: 100,
  flags: "",
  offsetMs: 1000,
  targetMs: 500,
  fixedMs: 20,
  cutoffMs: -100,
  intensity: 80,
  modulation: 0,
  tempo: "!120",
  pitches: "AAAA",
};

describe("ResampWorkerService", () => {
  let service: ResampWorkerService;

  beforeEach(() => {
    // 各テストごとに新しいサービスインスタンスを生成
    service = new ResampWorkerService();
  });

  afterEach(() => {
    // テスト終了時に Worker を停止
    service.terminate();
  });

  it("workerが準備完了するまで待機する", async () => {
    // waitUntilReady() が解決するまで待てるか確認
    await service.waitUntilReady();
    expect(true).toBe(true);
  });

  it("workerが成功レスポンスを返すとprocessResampが結果を返す", async () => {
    // 正常系: processResamp を呼び出し、DummyWorker が成功レスポンスを返すか確認
    const result = await service.processResamp(
      dummyResampRequest,
      dummyVoiceBank
    );
    expect(result).toBeInstanceOf(Float64Array);
    expect(Array.from(result)).toEqual([10, 20, 30]);
  });

  it("workerがエラーレスポンスを返すとprocessResampがエラーをthrowする", async () => {
    // エラーシナリオ: inputWav を "simulateError" にしてエラー応答をシミュレートする
    const errorRequest: ResampRequest = {
      ...dummyResampRequest,
      inputWav: "simulateError",
    };
    await expect(
      service.processResamp(errorRequest, dummyVoiceBank)
    ).rejects.toThrow("simulated error");
  });
});
