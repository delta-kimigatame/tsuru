import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageMenu } from "../../../src/features/Header/LanguageMenu";
import { useCookieStore } from "../../../src/store/cookieStore";
import { languages } from "../../../src/types/language";

describe("LanguageMenu", () => {
  const mockOnMenuClose = vi.fn();
  let mockAnchor: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnchor = document.createElement("div");
    useCookieStore.getState().setLanguage("ja");
  });

  // 1. メニューが開いている場合はMenuコンポーネントが表示される
  it("anchorが指定されている場合はメニューが表示される", () => {
    render(<LanguageMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // 2. メニューが閉じている場合はMenuコンポーネントが表示されない
  it("anchorがnullの場合はメニューが表示されない", () => {
    render(<LanguageMenu anchor={null} onMenuClose={mockOnMenuClose} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // 3. 全ての言語項目が表示される
  it("全ての言語が表示される", () => {
    render(<LanguageMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);
    languages.forEach((language) => {
      // 言語コード自体がアイコンとして表示される
      expect(screen.getByText(language)).toBeInTheDocument();
    });
  });

  // 4. 言語項目をクリックするとsetLanguageが呼ばれる
  it("言語項目をクリックするとsetLanguageが呼ばれてメニューが閉じる", () => {
    const setLanguageSpy = vi.spyOn(useCookieStore.getState(), "setLanguage");
    render(<LanguageMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);

    // 最初の言語項目をクリック
    const menuItems = screen.getAllByRole("menuitem");
    fireEvent.click(menuItems[0]);

    expect(setLanguageSpy).toHaveBeenCalledWith(languages[0]);
    expect(mockOnMenuClose).toHaveBeenCalled();
  });

  // 5. メニューの外側をクリックするとonMenuCloseが呼ばれる
  it("メニューの外側をクリックするとonMenuCloseが呼ばれる", () => {
    render(<LanguageMenu anchor={mockAnchor} onMenuClose={mockOnMenuClose} />);

    // Backdropをクリック（メニューの外側）
    // eslint-disable-next-line testing-library/no-node-access
    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnMenuClose).toHaveBeenCalled();
    }
  });
});
