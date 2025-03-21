import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  SelectVBButton,
  SelectVBButtonProps,
} from "../../../src/features/TopView/SelectVBButton";
import i18n from "../../../src/i18n/configs";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

describe("SelectVBButton", () => {
  let setProcessing: () => void;
  let setReadFile: () => void;
  let setDialogOpen: () => void;
  let defaultProps: SelectVBButtonProps;

  beforeEach(() => {
    setProcessing = vi.fn();
    setReadFile = vi.fn();
    setDialogOpen = vi.fn();
    defaultProps = {
      processing: false,
      setProcessing: setProcessing,
      setReadFile: setReadFile,
      setDialogOpen: setDialogOpen,
    };
    vi.clearAllMocks();
  });
  const renderComponent = () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <SelectVBButton {...defaultProps} />
      </ThemeProvider>
    );
  };
  it("ボタンをクリックすると隠しinputのクリックイベントが発火する", () => {
    renderComponent();
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(setProcessing).toHaveBeenCalledWith(false);
    expect(setReadFile).toHaveBeenCalledWith(null);
  });

  it("ファイルが選択された時の動作", () => {
    renderComponent();
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["dummy content"], "test.zip", {
      type: "application/zip",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(setProcessing).toHaveBeenCalledWith(true);
    expect(setReadFile).toHaveBeenCalledWith(file);
    expect(setDialogOpen).toHaveBeenCalledWith(true);
  });

  it("ファイルが何も選択されなかったときの動作", () => {
    renderComponent();
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: null } });
    expect(setProcessing).not.toHaveBeenCalled();
    expect(setReadFile).not.toHaveBeenCalled();
    expect(setDialogOpen).not.toHaveBeenCalled();
  });
});
