import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  EncodingSelect,
  EncodingSelectProps,
} from "../../../src/features/common/EncodingSelect";
import i18n from "../../../src/i18n/configs";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

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
  it("UTF-8を選択するとsetValueが呼ばれる", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "UTF-8" });
    await user.click(optionUTF8);
    expect(setValue).toHaveBeenCalledWith(EncodingOption.UTF8);
  });

  it("Shift-JISを選択するとsetValueが呼ばれる", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const optionShiftJIS = await screen.findByRole("option", {
      name: "Shift-JIS",
    });
    await user.click(optionShiftJIS);
    expect(setValue).toHaveBeenCalledWith(EncodingOption.SHIFT_JIS);
  });

  it("GB18030を選択するとsetValueが呼ばれる", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const optionGB18030 = await screen.findByRole("option", {
      name: "GB18030",
    });
    await user.click(optionGB18030);
    expect(setValue).toHaveBeenCalledWith(EncodingOption.GB18030);
  });

  it("GBKを選択するとsetValueが呼ばれる", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const optionGBK = await screen.findByRole("option", { name: "GBK" });
    await user.click(optionGBK);
    expect(setValue).toHaveBeenCalledWith(EncodingOption.GBK);
  });

  it("BIG5を選択するとsetValueが呼ばれる", async () => {
    renderComponent();
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const optionBIG5 = await screen.findByRole("option", { name: "BIG5" });
    await user.click(optionBIG5);
    expect(setValue).toHaveBeenCalledWith(EncodingOption.BIG5);
  });

  it("disabledがtrueの場合は選択できない", async () => {
    defaultProps.disabled = true;
    renderComponent();

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-disabled", "true");
  });

  it("valueプロパティで指定した値が表示される", () => {
    defaultProps.value = EncodingOption.UTF8;
    renderComponent();

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveTextContent("UTF-8");
  });
});
