import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuClearProject } from "../../../../src/features/Header/Menu/HeaderMenuClearProject";
import { undoManager } from "../../../../src/lib/UndoManager";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

// undoManagerのモック
vi.mock("../../../../src/lib/UndoManager", () => ({
  undoManager: {
    clear: vi.fn(),
  },
}));

describe("HeaderMenuClearProject", () => {
  const mockOnMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. メニュー項目がレンダリングされる
  it("プロジェクトクリアのメニュー項目が表示される", () => {
    render(<HeaderMenuClearProject onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. クリックするとclearUstが呼ばれる
  it("クリックするとclearUstが呼ばれる", () => {
    const clearUstSpy = vi.spyOn(useMusicProjectStore.getState(), "clearUst");

    render(<HeaderMenuClearProject onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    expect(clearUstSpy).toHaveBeenCalled();
  });

  // 3. クリックするとundoManager.clearが呼ばれる
  it("クリックするとundoManager.clearが呼ばれる", () => {
    render(<HeaderMenuClearProject onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    expect(undoManager.clear).toHaveBeenCalled();
  });

  // 4. クリックするとonMenuCloseが呼ばれる
  it("クリックするとonMenuCloseが呼ばれる", () => {
    render(<HeaderMenuClearProject onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    expect(mockOnMenuClose).toHaveBeenCalled();
  });

  // 5. クリック時の処理順序を確認
  it("clearUst、undoManager.clear、onMenuCloseの順で呼ばれる", () => {
    const clearUstSpy = vi.spyOn(useMusicProjectStore.getState(), "clearUst");
    const callOrder: string[] = [];

    clearUstSpy.mockImplementation(() => {
      callOrder.push("clearUst");
    });

    (undoManager.clear as any).mockImplementation(() => {
      callOrder.push("undoManager.clear");
    });

    mockOnMenuClose.mockImplementation(() => {
      callOrder.push("onMenuClose");
    });

    render(<HeaderMenuClearProject onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    expect(callOrder).toEqual(["clearUst", "undoManager.clear", "onMenuClose"]);
  });
});
