import { act, render } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWindowSize } from "../../src/hooks/useWindowSize";

describe("useWindowSize", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  // ダミーコンポーネント: useWindowSize の値を表示する
  const DummyComponent: React.FC = () => {
    const size = useWindowSize();
    return (
      <div data-testid="size">
        {size.width} x {size.height}
      </div>
    );
  };

  it("初期マウント時にwindowサイズが取得できる", () => {
    window.innerWidth = 1024;
    window.innerHeight = 768;
    const { getByTestId } = render(<DummyComponent />);
    expect(getByTestId("size").textContent).toBe("1024 x 768");
  });

  it("windowサイズ変更時に値が更新される", () => {
    window.innerWidth = 800;
    window.innerHeight = 600;
    const { getByTestId } = render(<DummyComponent />);
    const sizeDiv = getByTestId("size");
    expect(sizeDiv.textContent).toBe("800 x 600");

    act(() => {
      window.innerWidth = 1200;
      window.innerHeight = 900;
      window.dispatchEvent(new Event("resize"));
    });
    expect(sizeDiv.textContent).toBe("1200 x 900");
  });

  it("アンマウント時にresizeイベントリスナーが削除される", () => {
    const { unmount } = render(<DummyComponent />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });
});
