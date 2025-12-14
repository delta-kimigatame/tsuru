import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenu } from "../../../src/features/Header/HeaderMenu";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

// 子コンポーネントをモック化
vi.mock("../../../src/features/Header/Menu/HeaderMenuLanguage", () => ({
  HeaderMenuLanguage: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-language">Language Menu</div>
  ),
}));

vi.mock("../../../src/features/Header/Menu/HeaderMenuTheme", () => ({
  HeaderMenuTheme: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-theme">Theme Menu</div>
  ),
}));

vi.mock("../../../src/features/Header/Menu/HeaderMenuColorTheme", () => ({
  HeaderMenuColorTheme: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-color-theme">Color Theme Menu</div>
  ),
}));

vi.mock("../../../src/features/Header/Menu/HeaderMenuWorkers", () => ({
  HeaderMenuWorkers: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-workers">Workers Menu</div>
  ),
}));

vi.mock("../../../src/features/Header/Menu/HeaderMenuLog", () => ({
  HeaderMenuLog: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-log">Log Menu</div>
  ),
}));

vi.mock("../../../src/features/Header/Menu/HeaderMenuClearProject", () => ({
  HeaderMenuClearProject: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-clear-project">Clear Project Menu</div>
  ),
}));

vi.mock("../../../src/features/Header/Menu/HeaderMenuClearCache", () => ({
  HeaderMenuClearCache: ({ onMenuClose }: { onMenuClose: () => void }) => (
    <div data-testid="header-menu-clear-cache">Clear Cache Menu</div>
  ),
}));

describe("HeaderMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMusicProjectStore.setState({ vb: null });
  });

  // 1. IconButtonがレンダリングされる
  it("メニューを開くIconButtonが表示される", () => {
    render(<HeaderMenu />);
    const button = screen.getByLabelText("メニューを開く");
    expect(button).toBeInTheDocument();
  });

  // 2. IconButtonをクリックするとメニューが開く
  it("IconButtonをクリックするとメニューが開く", () => {
    render(<HeaderMenu />);
    const button = screen.getByLabelText("メニューを開く");

    fireEvent.click(button);

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // 3. vbがnullの場合、HeaderMenuWorkersが表示される
  it("vbがnullの場合はHeaderMenuWorkersが表示される", () => {
    useMusicProjectStore.setState({ vb: null });
    render(<HeaderMenu />);

    const button = screen.getByLabelText("メニューを開く");
    fireEvent.click(button);

    expect(screen.getByTestId("header-menu-workers")).toBeInTheDocument();
  });

  // 4. vbが非nullの場合、HeaderMenuWorkersが表示されない
  it("vbが非nullの場合はHeaderMenuWorkersが表示されない", () => {
    const mockVb = {
      name: "Test VB",
      image: new Uint8Array([1, 2, 3]).buffer,
      sample: new Uint8Array([4, 5, 6]).buffer,
      author: "Test Author",
      web: "https://example.com",
      version: "v1.0",
      voice: "Test Voice",
      oto: { otoCount: 5 },
      zip: {},
      initialize: async () => Promise.resolve(),
    };

    useMusicProjectStore.setState({ vb: mockVb as any });
    render(<HeaderMenu />);

    const button = screen.getByLabelText("メニューを開く");
    fireEvent.click(button);

    expect(screen.queryByTestId("header-menu-workers")).not.toBeInTheDocument();
  });

  // 5. メニューが開いている状態で、全ての子メニュー項目が表示される
  it("メニューが開くと全ての子メニュー項目が表示される", () => {
    useMusicProjectStore.setState({ vb: null });
    render(<HeaderMenu />);

    const button = screen.getByLabelText("メニューを開く");
    fireEvent.click(button);

    expect(screen.getByTestId("header-menu-language")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-theme")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-color-theme")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-workers")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-log")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-clear-project")).toBeInTheDocument();
    expect(screen.getByTestId("header-menu-clear-cache")).toBeInTheDocument();
  });

  // 6. メニューの外側をクリックするとメニューが閉じる
  it("メニューの外側をクリックするとメニューが閉じる", async () => {
    render(<HeaderMenu />);

    const button = screen.getByLabelText("メニューを開く");
    fireEvent.click(button);

    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Backdropをクリック
    // eslint-disable-next-line testing-library/no-node-access
    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      await act(async () => {
        fireEvent.click(backdrop);
      });
    }

    // メニューが閉じることを確認
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
