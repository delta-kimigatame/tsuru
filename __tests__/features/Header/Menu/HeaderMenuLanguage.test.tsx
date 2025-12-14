import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuLanguage } from "../../../../src/features/Header/Menu/HeaderMenuLanguage";
import { useCookieStore } from "../../../../src/store/cookieStore";

// LanguageMenuをモック化
vi.mock("../../../../src/features/Header/LanguageMenu", () => ({
  LanguageMenu: ({
    anchor,
    onMenuClose,
  }: {
    anchor: HTMLElement | null;
    onMenuClose: () => void;
  }) => (
    <div data-testid="language-menu" data-anchor={anchor ? "true" : "false"}>
      <button onClick={onMenuClose}>Close Language Menu</button>
    </div>
  ),
}));

describe("HeaderMenuLanguage", () => {
  const mockOnMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCookieStore.setState({ language: "ja" });
  });

  // 1. メニュー項目がレンダリングされる
  it("言語のメニュー項目が表示される", () => {
    render(<HeaderMenuLanguage onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. 初期状態ではLanguageMenuのanchorがnull
  it("初期状態ではLanguageMenuが閉じている", () => {
    render(<HeaderMenuLanguage onMenuClose={mockOnMenuClose} />);
    const languageMenu = screen.getByTestId("language-menu");
    expect(languageMenu).toHaveAttribute("data-anchor", "false");
  });

  // 3. メニュー項目をクリックするとLanguageMenuが開く
  it("メニュー項目をクリックするとLanguageMenuが開く", () => {
    render(<HeaderMenuLanguage onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    const languageMenu = screen.getByTestId("language-menu");
    expect(languageMenu).toHaveAttribute("data-anchor", "true");
  });

  // 4. LanguageMenuを閉じると両方のメニューが閉じる
  it("LanguageMenuを閉じると親メニューも閉じる", () => {
    render(<HeaderMenuLanguage onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    // LanguageMenuの閉じるボタンをクリック
    const closeButton = screen.getByText("Close Language Menu");
    fireEvent.click(closeButton);

    // 親メニューのonMenuCloseが呼ばれる
    expect(mockOnMenuClose).toHaveBeenCalled();

    // LanguageMenuのanchorがnullになる
    const languageMenu = screen.getByTestId("language-menu");
    expect(languageMenu).toHaveAttribute("data-anchor", "false");
  });

  // 5. 現在のlanguageが表示される
  it("現在のlanguageが表示される", () => {
    useCookieStore.setState({ language: "en" });
    render(<HeaderMenuLanguage onMenuClose={mockOnMenuClose} />);

    // 言語コード "en" がアイコンとして表示される
    expect(screen.getByText("en")).toBeInTheDocument();
  });
});
