import { act, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { EDITOR_CONFIG } from "../../src/config/editor";
import { useVerticalFooterMenu } from "../../src/hooks/useVerticalFooterMenu";

// ダミーコンポーネントで useVerticalFooterMenu の返す値を表示
const DummyComponent: React.FC = () => {
  const menuVertical = useVerticalFooterMenu();
  return (
    <div data-testid="menu-vertical">
      {menuVertical ? "vertical" : "horizontal"}
    </div>
  );
};

describe("useVerticalFooterMenu", () => {
  it("初期マウント時に、画面高さが閾値未満ならvertical、以上ならhorizontalが返る", () => {
    act(() => {
      // 閾値より小さい高さの場合
      window.innerHeight = EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD - 100;
      window.dispatchEvent(new Event("resize"));
    });
    const { unmount } = render(<DummyComponent />);
    expect(screen.getByTestId("menu-vertical").textContent).toBe("vertical");
    unmount(); // cleanup

    // 再度レンダリングして高さが閾値以上の場合を確認
    act(() => {
      window.innerHeight = EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD + 100;
      window.dispatchEvent(new Event("resize"));
    });
    render(<DummyComponent />);
    expect(screen.getByTestId("menu-vertical").textContent).toBe("horizontal");
  });

  it("windowサイズ変更時に値が更新される", () => {
    render(<DummyComponent />);
    // 初期状態：画面高さが閾値以上の場合
    act(() => {
      window.innerHeight = EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD + 100;
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getByTestId("menu-vertical").textContent).toBe("horizontal");

    // 画面高さが閾値未満に変更された場合
    act(() => {
      window.innerHeight = EDITOR_CONFIG.VERTICAL_FOOTER_MENU_THRESHOLD - 50;
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getByTestId("menu-vertical").textContent).toBe("vertical");
  });
});
