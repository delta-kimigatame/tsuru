import { describe, expect, it, vi } from "vitest";
import { waitForWorkerMessage } from "../../src/services/worker";

class DummyWorker {
  private listeners: { [key: string]: ((event: MessageEvent) => void)[] } = {};

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

  dispatchEvent(event: MessageEvent) {
    const listeners = this.listeners["message"];
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }
}

describe("waitForWorkerMessage", () => {
  it("マッチするメッセージイベントが発火されるとresolveされる", async () => {
    const dummyWorker = new DummyWorker();
    const promise = waitForWorkerMessage(
      dummyWorker as unknown as Worker,
      (data) => data.type === "test"
    );

    // マッチしないイベントを最初に発火
    dummyWorker.dispatchEvent(
      new MessageEvent("message", { data: { type: "not-test" } })
    );

    // 少し遅れてマッチするイベントを発火
    setTimeout(() => {
      dummyWorker.dispatchEvent(
        new MessageEvent("message", { data: { type: "test", payload: 42 } })
      );
    }, 50);

    const result = await promise;
    expect(result).toEqual({ type: "test", payload: 42 });
  });

  it("resolve後にイベントリスナーが削除される", async () => {
    const dummyWorker = new DummyWorker();
    const removeSpy = vi.spyOn(dummyWorker, "removeEventListener");

    const promise = waitForWorkerMessage(
      dummyWorker as unknown as Worker,
      (data) => data.match === true
    );
    dummyWorker.dispatchEvent(
      new MessageEvent("message", { data: { match: true, info: "hello" } })
    );
    await promise;

    expect(removeSpy).toHaveBeenCalled();
  });
});
