import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RESAMPLER_FLAGS } from "../../../src/config/resamplerFlags";
import { ResamplerHelpDialog } from "../../../src/features/EditorView/ResamplerHelpDialog";
import { useCookieStore } from "../../../src/store/cookieStore";

describe("ResamplerHelpDialog", () => {
  const handleClose = vi.fn();
  const handleSelectEngine = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCookieStore.setState({ resampEngine: "resamp" });
  });

  it("open=falseの場合は何も表示されない", () => {
    render(
      <ResamplerHelpDialog
        open={false}
        engine="resamp"
        handleClose={handleClose}
        handleSelectEngine={handleSelectEngine}
      />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("エンジン名と説明が表示される", () => {
    render(
      <ResamplerHelpDialog
        open
        engine="fave"
        handleClose={handleClose}
        handleSelectEngine={handleSelectEngine}
      />,
    );
    expect(screen.getByText("resampler.fave")).toBeTruthy();
    expect(screen.getByText("resampler.description.fave")).toBeTruthy();
  });

  it.each(["resamp", "fave"] as const)(
    "%sのフラグがすべてテーブルに表示される",
    (engine) => {
      render(
        <ResamplerHelpDialog
          open
          engine={engine}
          handleClose={handleClose}
          handleSelectEngine={handleSelectEngine}
        />,
      );
      // ヘッダ行 + フラグ数
      expect(screen.getAllByRole("row")).toHaveLength(
        1 + RESAMPLER_FLAGS[engine].length,
      );
    },
  );

  it("現在選択中のエンジンの場合、ボタンは閉じるのみ行う", () => {
    render(
      <ResamplerHelpDialog
        open
        engine="resamp"
        handleClose={handleClose}
        handleSelectEngine={handleSelectEngine}
      />,
    );
    fireEvent.click(screen.getByText("resampler.close"));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleSelectEngine).not.toHaveBeenCalled();
  });

  it("選択されていないエンジンの場合、エンジンを選択してダイアログを閉じる", () => {
    render(
      <ResamplerHelpDialog
        open
        engine="fave"
        handleClose={handleClose}
        handleSelectEngine={handleSelectEngine}
      />,
    );
    fireEvent.click(screen.getByText("resampler.useThisEngine"));
    expect(handleSelectEngine).toHaveBeenCalledWith("fave");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("closeアイコンでダイアログを閉じる", () => {
    render(
      <ResamplerHelpDialog
        open
        engine="fave"
        handleClose={handleClose}
        handleSelectEngine={handleSelectEngine}
      />,
    );
    fireEvent.click(screen.getByLabelText("close"));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleSelectEngine).not.toHaveBeenCalled();
  });
});
