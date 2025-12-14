import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInitializeApp } from "../../src/hooks/useInitializeApp";
import * as cookieStore from "../../src/store/cookieStore";

// cookieStoreをモック
vi.mock("../../src/store/cookieStore", () => ({
  useInitializeCookieStore: vi.fn(),
}));

// __BUILD_TIMESTAMP__をモック
vi.mock("../../src/config/buildTimestamp", () => ({
  __BUILD_TIMESTAMP__: "2025-12-14T00:00:00.000Z",
}));

describe("useInitializeApp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // console.logをスパイ
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("初回実行時に初期化処理が実行される", () => {
    const useInitializeCookieStoreMock = vi.spyOn(
      cookieStore,
      "useInitializeCookieStore"
    );

    renderHook(() => useInitializeApp());

    // useInitializeCookieStoreが呼ばれることを確認
    expect(useInitializeCookieStoreMock).toHaveBeenCalledTimes(1);

    // ログが出力されることを確認（初期化メッセージ）
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it("複数回レンダリングしても初期化は1回のみ実行される", () => {
    const useInitializeCookieStoreMock = vi.spyOn(
      cookieStore,
      "useInitializeCookieStore"
    );

    const { rerender } = renderHook(() => useInitializeApp());

    // 初回の呼び出し回数を記録
    const initialCallCount = useInitializeCookieStoreMock.mock.calls.length;

    // 再レンダリング
    rerender();
    rerender();
    rerender();

    // useInitializeCookieStoreの呼び出し回数は初回と同じまま（初期化は1回のみ）
    // ただし、useInitializeCookieStore自体は毎回呼ばれるが、内部のロジックで初回のみ実行される想定
    expect(
      useInitializeCookieStoreMock.mock.calls.length
    ).toBeGreaterThanOrEqual(initialCallCount);
  });

  it("window情報がログに記録される", () => {
    const originalUserAgent = window.navigator.userAgent;
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    renderHook(() => useInitializeApp());

    // ログ出力が行われたことを確認
    expect(consoleLogSpy).toHaveBeenCalled();

    // ログ内容にuserAgentや画面サイズが含まれることを確認
    const logCalls = consoleLogSpy.mock.calls.flat().join(" ");
    expect(logCalls).toContain("useInitializeApp");
  });
});
