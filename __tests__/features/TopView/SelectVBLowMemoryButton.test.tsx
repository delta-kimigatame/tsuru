import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  SelectVBLowMemoryButton,
  SelectVBLowMemoryButtonProps,
} from "../../../src/features/TopView/SelectVBLowMemoryButton";
import i18n from "../../../src/i18n/configs";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new Uint8Array([0x50, 0x4b, 0x03, 0x04]).buffer);
  };
}

describe("SelectVBLowMemoryButton", () => {
  let props: SelectVBLowMemoryButtonProps;

  beforeEach(() => {
    props = {
      processing: false,
      setProcessing: vi.fn(),
      setReadFile: vi.fn(),
      setDialogOpen: vi.fn(),
      setLoadMode: vi.fn(),
    };
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <ThemeProvider theme={lightTheme}>
        <SelectVBLowMemoryButton {...props} />
      </ThemeProvider>,
    );

  it("有効なZIPを選択すると低メモリモードでダイアログを開く", async () => {
    renderComponent();
    const file = new File(
      [new Uint8Array([0x50, 0x4b, 0x03, 0x04]), "dummy content"],
      "test.zip",
      { type: "application/zip" },
    );

    fireEvent.change(screen.getByTestId("low-memory-file-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(props.setProcessing).toHaveBeenCalledWith(true);
      expect(props.setLoadMode).toHaveBeenCalledWith("lowMemory");
      expect(props.setReadFile).toHaveBeenCalledWith(file);
      expect(props.setDialogOpen).toHaveBeenCalledWith(true);
    });
  });

  it("処理中はボタンを無効化する", () => {
    props.processing = true;
    renderComponent();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
