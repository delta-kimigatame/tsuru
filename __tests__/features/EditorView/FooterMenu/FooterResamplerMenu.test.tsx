import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FooterResamplerMenu } from "../../../../src/features/EditorView/FooterMenu/FooterResamplerMenu";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useSnackBarStore } from "../../../../src/store/snackBarStore";

describe("FooterResamplerMenu", () => {
  const mockHandleClose = vi.fn();
  const mockSetResampEngine = vi.fn();
  const anchor = document.createElement("div");

  beforeEach(() => {
    vi.clearAllMocks();
    useCookieStore.setState({
      resampEngine: "resamp",
      setResampEngine: mockSetResampEngine,
    });
  });

  it("anchorがnullの場合、メニューが表示されない", () => {
    render(<FooterResamplerMenu anchor={null} handleClose={mockHandleClose} />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("エンジンの一覧が表示される", () => {
    render(
      <FooterResamplerMenu anchor={anchor} handleClose={mockHandleClose} />,
    );
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(screen.getByText("resampler.resamp")).toBeTruthy();
    expect(screen.getByText("resampler.fave")).toBeTruthy();
  });

  it("選択中のエンジンにチェックが付く", () => {
    render(
      <FooterResamplerMenu anchor={anchor} handleClose={mockHandleClose} />,
    );
    const items = screen.getAllByRole("menuitem");
    expect(items[0].querySelector('[data-testid="CheckBoxIcon"]')).toBeTruthy();
    expect(
      items[1].querySelector('[data-testid="CheckBoxOutlineBlankIcon"]'),
    ).toBeTruthy();
  });

  it("クリックでcookieを変更しメニューを閉じ、読込完了までモーダルを表示する", async () => {
    let resolveReload: () => void = () => {};
    const reloadResampler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveReload = resolve;
        }),
    );
    render(
      <FooterResamplerMenu
        anchor={anchor}
        handleClose={mockHandleClose}
        reloadResampler={reloadResampler}
      />,
    );

    fireEvent.click(screen.getByText("resampler.fave"));

    expect(mockSetResampEngine).toHaveBeenCalledWith("fave");
    expect(mockHandleClose).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeTruthy();
    });

    await act(async () => {
      resolveReload();
    });
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).toBeNull();
    });
    expect(reloadResampler).toHaveBeenCalledTimes(1);
  });

  it("読込に失敗した場合、スナックバー表示・元のエンジンへ切り戻し・再読込完了後にモーダルを閉じる", async () => {
    let resolveRollback: () => void = () => {};
    const reloadResampler = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveRollback = resolve;
          }),
      );
    render(
      <FooterResamplerMenu
        anchor={anchor}
        handleClose={mockHandleClose}
        reloadResampler={reloadResampler}
      />,
    );

    fireEvent.click(screen.getByText("resampler.fave"));

    await waitFor(() => {
      expect(mockSetResampEngine).toHaveBeenNthCalledWith(1, "fave");
      expect(mockSetResampEngine).toHaveBeenNthCalledWith(2, "resamp");
      expect(reloadResampler).toHaveBeenCalledTimes(2);
    });
    const snackBar = useSnackBarStore.getState();
    expect(snackBar.open).toBe(true);
    expect(snackBar.severity).toBe("error");
    expect(snackBar.value).toBe("resampler.loadError");
    // 切り戻し側の読込が終わるまでモーダルは表示されたまま
    expect(screen.getByRole("progressbar")).toBeTruthy();

    await act(async () => {
      resolveRollback();
    });
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).toBeNull();
    });
  });

  it("選択中のエンジンをクリックした場合は再読込しない", () => {
    const reloadResampler = vi.fn().mockResolvedValue(undefined);
    render(
      <FooterResamplerMenu
        anchor={anchor}
        handleClose={mockHandleClose}
        reloadResampler={reloadResampler}
      />,
    );

    fireEvent.click(screen.getByText("resampler.resamp"));

    expect(mockHandleClose).toHaveBeenCalled();
    expect(mockSetResampEngine).not.toHaveBeenCalled();
    expect(reloadResampler).not.toHaveBeenCalled();
  });
});
