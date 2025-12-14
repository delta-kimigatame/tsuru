import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuTheme } from "../../../../src/features/Header/Menu/HeaderMenuTheme";
import { useCookieStore } from "../../../../src/store/cookieStore";

// ThemeMenuをモック化
vi.mock("../../../../src/features/Header/ThemeMenu", () => ({
  ThemeMenu: ({
    anchor,
    onMenuClose,
  }: {
    anchor: HTMLElement | null;
    onMenuClose: () => void;
  }) => (
    <div data-testid="theme-menu" data-anchor={anchor ? "true" : "false"}>
      <button onClick={onMenuClose}>Close Theme Menu</button>
    </div>
  ),
}));

describe("HeaderMenuTheme", () => {
  const mockOnMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCookieStore.setState({ mode: "system" });
  });

  // 1. メニュー項目がレンダリングされる
  it("テーマのメニュー項目が表示される", () => {
    render(<HeaderMenuTheme onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. 初期状態ではThemeMenuのanchorがnull
  it("初期状態ではThemeMenuが閉じている", () => {
    render(<HeaderMenuTheme onMenuClose={mockOnMenuClose} />);
    const themeMenu = screen.getByTestId("theme-menu");
    expect(themeMenu).toHaveAttribute("data-anchor", "false");
  });

  // 3. メニュー項目をクリックするとThemeMenuが開く
  it("メニュー項目をクリックするとThemeMenuが開く", () => {
    render(<HeaderMenuTheme onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    const themeMenu = screen.getByTestId("theme-menu");
    expect(themeMenu).toHaveAttribute("data-anchor", "true");
  });

  // 4. ThemeMenuを閉じると両方のメニューが閉じる
  it("ThemeMenuを閉じると親メニューも閉じる", () => {
    render(<HeaderMenuTheme onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    // ThemeMenuの閉じるボタンをクリック
    const closeButton = screen.getByText("Close Theme Menu");
    fireEvent.click(closeButton);

    // 親メニューのonMenuCloseが呼ばれる
    expect(mockOnMenuClose).toHaveBeenCalled();

    // ThemeMenuのanchorがnullになる
    const themeMenu = screen.getByTestId("theme-menu");
    expect(themeMenu).toHaveAttribute("data-anchor", "false");
  });

  // 5. mode="system"の場合はPhonelinkSetupIconが表示される
  it("mode='system'の場合は適切なアイコンが表示される", () => {
    useCookieStore.setState({ mode: "system" });
    const { container } = render(
      <HeaderMenuTheme onMenuClose={mockOnMenuClose} />
    );

    // PhonelinkSetupIconのdata-testid確認
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(
      container.querySelector('[data-testid="PhonelinkSetupIcon"]')
    ).toBeInTheDocument();
  });

  // 6. mode="light"の場合はLightModeIconが表示される
  it("mode='light'の場合は適切なアイコンが表示される", () => {
    useCookieStore.setState({ mode: "light" });
    const { container } = render(
      <HeaderMenuTheme onMenuClose={mockOnMenuClose} />
    );

    // LightModeIconのdata-testid確認
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(
      container.querySelector('[data-testid="LightModeIcon"]')
    ).toBeInTheDocument();
  });

  // 7. mode="dark"の場合はDarkModeIconが表示される
  it("mode='dark'の場合は適切なアイコンが表示される", () => {
    useCookieStore.setState({ mode: "dark" });
    const { container } = render(
      <HeaderMenuTheme onMenuClose={mockOnMenuClose} />
    );

    // DarkModeIconのdata-testid確認
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(
      container.querySelector('[data-testid="DarkModeIcon"]')
    ).toBeInTheDocument();
  });
});
