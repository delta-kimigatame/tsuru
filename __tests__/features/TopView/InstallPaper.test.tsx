import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import { InstallPaper } from "../../../src/features/TopView/InstallPaper";
import i18n from "../../../src/i18n/configs";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

describe("InstallPaper", () => {
  let mockPrompt: any;
  let mockUserChoice: any;

  beforeEach(() => {
    mockUserChoice = { outcome: "accepted" };
    mockPrompt = vi.fn().mockResolvedValue(undefined);

    // beforeinstallpromptイベントをモック
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve(mockUserChoice),
    };

    // userAgentをモック（非iOS）
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      configurable: true,
    });

    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <InstallPaper />
      </ThemeProvider>
    );
  };

  it("非iOS環境ではインストールボタンが表示される", () => {
    renderComponent();
    const button = screen.getByRole("button", {
      name: i18n.t("top.install"),
    });
    expect(button).toBeInTheDocument();
  });

  it("iOS環境では画像が表示される", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      configurable: true,
    });

    renderComponent();
    const image = screen.getByAltText(
      "iosの場合 ホーム画面に追加を選択してインストールできます"
    );
    expect(image).toBeInTheDocument();
  });

  it("deferredPromptがnullの場合はボタンがdisabledになる", () => {
    renderComponent();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("beforeinstallpromptイベントが発火するとボタンが有効になる", async () => {
    renderComponent();

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve(mockUserChoice),
    };

    await act(async () => {
      window.dispatchEvent(
        Object.assign(new Event("beforeinstallprompt"), mockEvent)
      );
    });

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  it("appinstalledイベントが発火するとコンポーネントが非表示になる", async () => {
    renderComponent();

    await act(async () => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    await waitFor(() => {
      const button = screen.queryByRole("button");
      expect(button).not.toBeInTheDocument();
    });
  });

  it("Macintoshの場合はiOS扱いになる", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      configurable: true,
    });

    renderComponent();
    const image = screen.getByAltText(
      "iosの場合 ホーム画面に追加を選択してインストールできます"
    );
    expect(image).toBeInTheDocument();
  });
});
