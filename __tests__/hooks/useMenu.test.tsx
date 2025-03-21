import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { useMenu } from "../../src/hooks/useMenu";

describe("useMenu", () => {
  it("ボタンをクリックするとメニューが開き、外側をクリックするとメニューが閉じる", () => {
    const DummyComponent: React.FC = () => {
      const [anchor, handleOpen, handleClose] = useMenu("DummyMenu");
      return (
        <div>
          <button data-testid="open-button" onClick={handleOpen}>
            Open Menu
          </button>
          <div data-testid="outside" onClick={handleClose}>
            Outside Area
          </div>
          {anchor && <div data-testid="menu">Menu is open</div>}
        </div>
      );
    };

    render(<DummyComponent />);
    // 初期状態ではメニューは表示されない
    expect(screen.queryByTestId("menu")).toBeNull();

    // ボタンをクリックしてメニューを開く
    fireEvent.click(screen.getByTestId("open-button"));
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    // 外側をクリックしてメニューを閉じる
    fireEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByTestId("menu")).toBeNull();
  });
});
