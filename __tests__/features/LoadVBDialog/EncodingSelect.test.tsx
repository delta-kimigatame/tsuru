import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  EncodingSelect,
  EncodingSelectProps,
} from "../../../src/features/LoadVBDialog/EncodingSelect";
import i18n from "../../../src/i18n/configs";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

describe("EncodingSelect", () => {
  let setValue: () => void;
  let defaultProps: EncodingSelectProps;

  beforeEach(() => {
    setValue = vi.fn();
    defaultProps = {
      disabled: false,
      value: "",
      setValue: setValue,
    };
    vi.clearAllMocks();
  });
  const renderComponent = () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <EncodingSelect {...defaultProps} />
      </ThemeProvider>
    );
  };
  it("文字コードを変更した際の動作_utf-8", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "UTF-8" });
    await user.click(optionUTF8);
    expect(setValue).toHaveBeenCalledWith("utf-8");
  });
  it("文字コードを変更した際の動作_shift-jis", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "Shift-JIS" });
    await user.click(optionUTF8);
    expect(setValue).toHaveBeenCalledWith("Shift-Jis");
  });
});
