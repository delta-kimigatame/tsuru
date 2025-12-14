import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import { LoadVBUnit } from "../../../src/features/TopView/LoadVBUnit";
import i18n from "../../../src/i18n/configs";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

// モック化
vi.mock("../../../src/features/LoadVBDialog/LoadVBDialog", () => ({
  LoadVBDialog: vi.fn(() => <div data-testid="load-vb-dialog">Dialog</div>),
}));

describe("LoadVBUnit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <LoadVBUnit />
      </ThemeProvider>
    );
  };

  it("SelectVBButtonが表示される", () => {
    renderComponent();
    const button = screen.getByRole("button", {
      name: i18n.t("top.selectZipButtonText"),
    });
    expect(button).toBeInTheDocument();
  });

  it("SelectVBDirButtonが表示される", () => {
    renderComponent();
    const button = screen.getByRole("button", {
      name: i18n.t("top.selectDirButtonText"),
    });
    expect(button).toBeInTheDocument();
  });

  it("初期状態ではLoadVBDialogが表示されない", () => {
    renderComponent();
    const dialog = screen.queryByTestId("load-vb-dialog");
    expect(dialog).not.toBeInTheDocument();
  });

  it("ファイルを選択するとLoadVBDialogが表示される", async () => {
    renderComponent();
    const user = userEvent.setup();

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["dummy content"], "test.zip", {
      type: "application/zip",
    });

    await user.upload(fileInput, file);

    const dialog = screen.getByTestId("load-vb-dialog");
    expect(dialog).toBeInTheDocument();
  });
});
