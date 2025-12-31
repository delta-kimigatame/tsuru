import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ColorThemeMenu } from "../../../src/features/Header/ColorThemeMenu";
import { useCookieStore } from "../../../src/store/cookieStore";
import { colors } from "../../../src/types/colorTheme";

describe("ColorThemeMenu", () => {
  const mockOnMenuClose = vi.fn();
  let mockAnchor: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnchor = document.createElement("div");
    useCookieStore.getState().setColorTheme("blue");
  });

  // 1. メニューが開いている場合はMenuコンポーネントが表示される
  it("anchorが指定されている場合はメニューが表示される", () => {
    render(
      <ColorThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // 2. メニューが閉じている場合はMenuコンポーネントが表示されない
  it("anchorがnullの場合はメニューが表示されない", () => {
    render(<ColorThemeMenu anchor={null} onMenuClose={mockOnMenuClose} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // 3. 全ての色テーマ項目が表示される
  it("表示数はlegacyで始まらないカラーテーマの数+1", () => {
    render(
      <ColorThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />
    );
    const menuItems = screen.getAllByRole("menuitem");
    // colorsの数だけmenuitemが存在することを確認
    expect(menuItems.length).toBe(
      colors.filter((color) => !color.startsWith("legacy")).length + 1
    );
  });

  // 4. 色テーマ項目をクリックするとsetColorThemeが呼ばれる
  it("色テーマ項目をクリックするとsetColorThemeが呼ばれてメニューが閉じる", () => {
    const setColorThemeSpy = vi.spyOn(
      useCookieStore.getState(),
      "setColorTheme"
    );
    render(
      <ColorThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />
    );

    // 最初の色テーマ項目をクリック
    const menuItems = screen.getAllByRole("menuitem");
    fireEvent.click(menuItems[0]);

    expect(setColorThemeSpy).toHaveBeenCalledWith(colors[0]);
    expect(mockOnMenuClose).toHaveBeenCalled();
  });

  // 5. メニューの外側をクリックするとonMenuCloseが呼ばれる
  it("メニューの外側をクリックするとonMenuCloseが呼ばれる", () => {
    render(
      <ColorThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />
    );

    // Backdropをクリック（メニューの外側）
    // eslint-disable-next-line testing-library/no-node-access
    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnMenuClose).toHaveBeenCalled();
    }
  });
});
