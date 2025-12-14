import "@testing-library/jest-dom";

HTMLElement.prototype.scrollTo = () => {};

// Mock window.location
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {};
}
Object.defineProperty(globalThis.window, "location", {
  value: {
    hostname: "localhost",
    href: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
  configurable: true,
});

global.Worker = class {
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  onerror: ((this: Worker, ev: ErrorEvent) => any) | null = null;
  constructor(public scriptUrl: string | URL) {
    // 必要なら scriptUrl を検証する
  }
  postMessage(data: any) {
    // テストで必要ならここで onmessage を呼ぶなど、挙動を定義可能
  }
  addEventListener(type: string, listener: any) {
    // イベントリスナーの登録
  }
  removeEventListener(type: string, listener: any) {
    // イベントリスナーの解除
  }
  terminate() {
    // Worker の終了処理
  }
};
global.URL.createObjectURL = (blob: Blob) => "blob:dummy-url";

// import.meta.urlをモック
if (typeof global.import === "undefined") {
  (global as any).import = {};
}
if (typeof (global as any).import.meta === "undefined") {
  (global as any).import.meta = {};
}
(global as any).import.meta.url = "file:///test";
