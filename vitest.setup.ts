import "@testing-library/jest-dom";
HTMLElement.prototype.scrollTo = () => {};

global.Worker = class {
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  onerror: ((this: Worker, ev: ErrorEvent) => any) | null = null;
  constructor(public scriptUrl: string) {
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
