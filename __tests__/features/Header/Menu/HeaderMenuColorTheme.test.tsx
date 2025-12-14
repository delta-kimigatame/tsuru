import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuColorTheme } from "../../../../src/features/Header/Menu/HeaderMenuColorTheme";
import { useCookieStore } from "../../../../src/store/cookieStore";

// ColorThemeMenuをモック化
vi.mock("../../../../src/features/Header/ColorThemeMenu", () => ({
  ColorThemeMenu: ({
    anchor,
    onMenuClose,
  }: {
    anchor: HTMLElement | null;
    onMenuClose: () => void;
  }) => (
    <div data-testid="color-theme-menu" data-anchor={anchor ? "true" : "false"}>
      <button onClick={onMenuClose}>Close Color Theme Menu</button>
    </div>
  ),
}));

describe("HeaderMenuColorTheme", () => {
  const mockOnMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCookieStore.setState({ colorTheme: "blue" });
  });

  // 1. メニュー項目がレンダリングされる
  it("カラーテーマのメニュー項目が表示される", () => {
    render(<HeaderMenuColorTheme onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. 初期状態ではColorThemeMenuのanchorがnull
  it("初期状態ではColorThemeMenuが閉じている", () => {
    render(<HeaderMenuColorTheme onMenuClose={mockOnMenuClose} />);
    const colorThemeMenu = screen.getByTestId("color-theme-menu");
    expect(colorThemeMenu).toHaveAttribute("data-anchor", "false");
  });

  // 3. メニュー項目をクリックするとColorThemeMenuが開く
  it("メニュー項目をクリックするとColorThemeMenuが開く", () => {
    render(<HeaderMenuColorTheme onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    const colorThemeMenu = screen.getByTestId("color-theme-menu");
    expect(colorThemeMenu).toHaveAttribute("data-anchor", "true");
  });

  // 4. ColorThemeMenuを閉じると両方のメニューが閉じる
  it("ColorThemeMenuを閉じると親メニューも閉じる", () => {
    render(<HeaderMenuColorTheme onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    // ColorThemeMenuの閉じるボタンをクリック
    const closeButton = screen.getByText("Close Color Theme Menu");
    fireEvent.click(closeButton);

    // 親メニューのonMenuCloseが呼ばれる
    expect(mockOnMenuClose).toHaveBeenCalled();

    // ColorThemeMenuのanchorがnullになる
    const colorThemeMenu = screen.getByTestId("color-theme-menu");
    expect(colorThemeMenu).toHaveAttribute("data-anchor", "false");
  });

  // 5. 現在のcolorThemeが表示される
  it("現在のcolorThemeが表示される", () => {
    useCookieStore.setState({ colorTheme: "red" });
    const { container } = render(
      <HeaderMenuColorTheme onMenuClose={mockOnMenuClose} />
    );

    // colorTheme.red という翻訳キーのテキストが存在することを確認
    // 複数マッチを避けるため、getAllByTextを使用
    const texts = screen.getAllByText(/red/i);
    expect(texts.length).toBeGreaterThan(0);
  });
});
