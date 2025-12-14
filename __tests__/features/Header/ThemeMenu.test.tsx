import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeMenu } from "../../../src/features/Header/ThemeMenu";
import { useCookieStore } from "../../../src/store/cookieStore";

describe("ThemeMenu", () => {
  const mockOnMenuClose = vi.fn();
  let mockAnchor: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnchor = document.createElement("div");
    useCookieStore.getState().setMode("system");
  });

  // 1. メニューが開いている場合はMenuコンポーネントが表示される
  it("anchorが指定されている場合はメニューが表示される", () => {
    render(<ThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // 2. メニューが閉じている場合はMenuコンポーネントが表示されない
  it("anchorがnullの場合はメニューが表示されない", () => {
    render(<ThemeMenu anchor={null} onMenuClose={mockOnMenuClose} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // 3. 3つのテーマ項目（system、light、dark）が表示される
  it("3つのテーマ項目が表示される", () => {
    render(<ThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(3);
  });

  // 4. system項目をクリックするとsetMode('system')が呼ばれる
  it("system項目をクリックするとsetModeが呼ばれてメニューが閉じる", () => {
    const setModeSpy = vi.spyOn(useCookieStore.getState(), "setMode");
    render(<ThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);

    const menuItems = screen.getAllByRole("menuitem");
    fireEvent.click(menuItems[0]); // system

    expect(setModeSpy).toHaveBeenCalledWith("system");
    expect(mockOnMenuClose).toHaveBeenCalled();
  });

  // 5. light項目をクリックするとsetMode('light')が呼ばれる
  it("light項目をクリックするとsetModeが呼ばれてメニューが閉じる", () => {
    const setModeSpy = vi.spyOn(useCookieStore.getState(), "setMode");
    render(<ThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);

    const menuItems = screen.getAllByRole("menuitem");
    fireEvent.click(menuItems[1]); // light

    expect(setModeSpy).toHaveBeenCalledWith("light");
    expect(mockOnMenuClose).toHaveBeenCalled();
  });

  // 6. dark項目をクリックするとsetMode('dark')が呼ばれる
  it("dark項目をクリックするとsetModeが呼ばれてメニューが閉じる", () => {
    const setModeSpy = vi.spyOn(useCookieStore.getState(), "setMode");
    render(<ThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);

    const menuItems = screen.getAllByRole("menuitem");
    fireEvent.click(menuItems[2]); // dark

    expect(setModeSpy).toHaveBeenCalledWith("dark");
    expect(mockOnMenuClose).toHaveBeenCalled();
  });

  // 7. メニューの外側をクリックするとonMenuCloseが呼ばれる
  it("メニューの外側をクリックするとonMenuCloseが呼ばれる", () => {
    render(<ThemeMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);

    // Backdropをクリック（メニューの外側）
    // eslint-disable-next-line testing-library/no-node-access
    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnMenuClose).toHaveBeenCalled();
    }
  });
});
