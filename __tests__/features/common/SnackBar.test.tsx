import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import { SnackBar } from "../../../src/features/common/SnackBar";
import { useSnackBarStore } from "../../../src/store/snackBarStore";

const lightTheme = createTheme(getDesignTokens("light"));

// useVerticalFooterMenuをモック
vi.mock("../../../src/hooks/useVerticalFooterMenu", () => ({
  useVerticalFooterMenu: vi.fn(() => false),
}));

describe("SnackBar", () => {
  beforeEach(() => {
    // ストアを初期化
    useSnackBarStore.setState({
      open: false,
      severity: "info",
      value: "",
      setOpen: (open: boolean) => useSnackBarStore.setState({ open }),
      setValue: (value: string) => useSnackBarStore.setState({ value }),
      setSeverity: (severity: "info" | "success" | "warning" | "error") =>
        useSnackBarStore.setState({ severity }),
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <SnackBar />
      </ThemeProvider>
    );
  };

  it("openがfalseの場合は表示されない", () => {
    useSnackBarStore.setState({ open: false });
    renderComponent();

    const alert = screen.queryByRole("alert");
    expect(alert).not.toBeInTheDocument();
  });

  it("openがtrueの場合はメッセージが表示される", async () => {
    renderComponent();

    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "テストメッセージ",
        severity: "success",
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("テストメッセージ");
    });
  });

  it("severityがinfoの場合はinfoアラートが表示される", async () => {
    renderComponent();

    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "情報メッセージ",
        severity: "info",
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-filledInfo");
    });
  });

  it("severityがsuccessの場合はsuccessアラートが表示される", async () => {
    renderComponent();

    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "成功メッセージ",
        severity: "success",
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-filledSuccess");
    });
  });

  it("severityがwarningの場合はwarningアラートが表示される", async () => {
    renderComponent();

    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "警告メッセージ",
        severity: "warning",
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-filledWarning");
    });
  });

  it("severityがerrorの場合はerrorアラートが表示される", async () => {
    renderComponent();

    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "エラーメッセージ",
        severity: "error",
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-filledError");
    });
  });

  it("新しいメッセージが来ると既存のメッセージが閉じてから再表示される", async () => {
    renderComponent();

    // 最初のメッセージ
    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "最初のメッセージ",
        severity: "info",
      });
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("最初のメッセージ");
    });

    // 新しいメッセージ
    act(() => {
      useSnackBarStore.setState({
        open: true,
        value: "新しいメッセージ",
        severity: "success",
      });
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("新しいメッセージ");
    });
  });
});
