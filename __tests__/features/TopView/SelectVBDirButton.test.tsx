import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  SelectVBDirButton,
  SelectVBDirButtonProps,
} from "../../../src/features/TopView/SelectVBDirButton";
import i18n from "../../../src/i18n/configs";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../src/store/snackBarStore";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

// VoiceBankFilesをモック化
vi.mock("../../../src/lib/VoiceBanks/VoiceBankFiles", () => ({
  VoiceBankFiles: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("SelectVBDirButton", () => {
  let setProcessing: () => void;
  let setReadFile: () => void;
  let defaultProps: SelectVBDirButtonProps;

  beforeEach(() => {
    setProcessing = vi.fn();
    setReadFile = vi.fn();
    defaultProps = {
      processing: false,
      setProcessing: setProcessing,
      setReadFile: setReadFile,
    };

    // ストアを初期化
    useMusicProjectStore.setState({
      vb: null,
      setVb: vi.fn(),
      ust: null,
      setUst: vi.fn(),
      ustFileName: "",
      setUstFileName: vi.fn(),
      encoding: "utf8",
      setEncoding: vi.fn(),
    });

    useSnackBarStore.setState({
      open: false,
      severity: "info",
      value: "",
      setOpen: vi.fn(),
      setValue: vi.fn(),
      setSeverity: vi.fn(),
    });

    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <SelectVBDirButton {...defaultProps} />
      </ThemeProvider>
    );
  };

  it("ボタンをクリックするとsetProcessingとsetReadFileが呼ばれる", () => {
    renderComponent();
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(setProcessing).toHaveBeenCalledWith(false);
    expect(setReadFile).toHaveBeenCalledWith(null);
  });

  it("フォルダが選択されるとVoiceBankFilesがinitializeされる", async () => {
    const { VoiceBankFiles } = await import(
      "../../../src/lib/VoiceBanks/VoiceBankFiles"
    );
    renderComponent();

    const dirInput = screen.getByTestId("dir-input") as HTMLInputElement;
    const file = new File(["dummy content"], "test.txt", {
      type: "text/plain",
    });
    Object.defineProperty(file, "webkitRelativePath", {
      value: "testdir/test.txt",
      writable: false,
    });

    fireEvent.change(dirInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(VoiceBankFiles).toHaveBeenCalledWith([file]);
    });

    await waitFor(() => {
      expect(setProcessing).toHaveBeenCalledWith(false);
    });
  });

  it("フォルダが選択されなかった場合は何も実行されない", () => {
    renderComponent();
    const dirInput = screen.getByTestId("dir-input") as HTMLInputElement;
    fireEvent.change(dirInput, { target: { files: null } });
    expect(setProcessing).not.toHaveBeenCalledWith(true);
  });

  it("processingがtrueの場合はボタンがdisabledになる", () => {
    defaultProps.processing = true;
    renderComponent();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("processingがtrueの場合はCircularProgressが表示される", () => {
    defaultProps.processing = true;
    renderComponent();
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
  });

  it("processingがfalseの場合はボタンテキストが表示される", () => {
    defaultProps.processing = false;
    renderComponent();
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(i18n.t("top.selectDirButtonText"));
  });

  it("initialize失敗時はエラーメッセージが表示される", async () => {
    const { VoiceBankFiles } = await import(
      "../../../src/lib/VoiceBanks/VoiceBankFiles"
    );
    (VoiceBankFiles as any).mockImplementation(() => ({
      initialize: vi.fn().mockRejectedValue(new Error("Failed")),
    }));

    renderComponent();

    const dirInput = screen.getByTestId("dir-input") as HTMLInputElement;
    const file = new File(["dummy content"], "test.txt", {
      type: "text/plain",
    });
    Object.defineProperty(file, "webkitRelativePath", {
      value: "testdir/test.txt",
      writable: false,
    });

    fireEvent.change(dirInput, { target: { files: [file] } });

    await waitFor(() => {
      const snackBarStore = useSnackBarStore.getState();
      expect(snackBarStore.setSeverity).toHaveBeenCalledWith("error");
      expect(snackBarStore.setValue).toHaveBeenCalledWith(
        i18n.t("loadVBDialog.error")
      );
      expect(snackBarStore.setOpen).toHaveBeenCalledWith(true);
    });
  });
});
