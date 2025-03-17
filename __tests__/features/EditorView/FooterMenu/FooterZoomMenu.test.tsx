import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FooterZoomMenu } from "../../../../src/features/EditorView/FooterMenu/FooterZoomMenu";

// react-i18next の t を単純にキー文字列を返すモックにする
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

// グローバルなcookieStoreのモック
// storeの状態はテスト内で更新可能なオブジェクトとして管理する
let store: {
  horizontalZoom: number;
  verticalZoom: number;
  setHorizontalZoom: (val: number) => void;
  setVerticalZoom: (val: number) => void;
};

beforeEach(() => {
  store = {
    horizontalZoom: 1,
    verticalZoom: 1,
    setHorizontalZoom: vi.fn((val: number) => {
      store.horizontalZoom = val;
    }),
    setVerticalZoom: vi.fn((val: number) => {
      store.verticalZoom = val;
    }),
  };
});

// useCookieStoreのモックを設定
vi.mock("../../../../src/store/cookieStore", () => ({
  useCookieStore: () => store,
}));

describe("FooterZoomMenu", () => {
  let anchor: HTMLElement;
  let handleClose: () => void;

  beforeEach(() => {
    // anchorは適当なdiv要素で代用
    anchor = document.createElement("div");
    handleClose = vi.fn();
  });

  it("初期状態でdisable状態が正しく設定されていることを確認する", () => {
    // 初期値: horizontalZoom = 1, verticalZoom = 1
    render(<FooterZoomMenu anchor={anchor} handleClose={handleClose} />);
    // 水平方向ズームイン: disabled条件は horizontalZoom === last(HORIZONTAL_ZOOM) ＝ 4
    const horizontalZoomIn = screen
      .getByText("editor.footer.horizontalZoomIn")
      .closest("li");
    expect(horizontalZoomIn).not.toHaveAttribute("aria-disabled", "true");
    // 水平方向ズームアウト: disabled条件は horizontalZoom === HORIZONTAL_ZOOM[0] ＝ 0.01
    const horizontalZoomOut = screen
      .getByText("editor.footer.horizontalZoomOut")
      .closest("li");
    expect(horizontalZoomOut).not.toHaveAttribute("aria-disabled", "true");
    // 垂直方向ズームイン: disabled条件は verticalZoom === last(VERTICAL_ZOOM) ＝ 1
    const verticalZoomIn = screen
      .getByText("editor.footer.verticalZoomIn")
      .closest("li");
    expect(verticalZoomIn).toHaveAttribute("aria-disabled", "true");
    // 垂直方向ズームアウト: disabled条件は verticalZoom === VERTICAL_ZOOM[0] ＝ 0.25
    const verticalZoomOut = screen
      .getByText("editor.footer.verticalZoomOut")
      .closest("li");
    expect(verticalZoomOut).not.toHaveAttribute("aria-disabled", "true");
  });

  it("水平ズームインがクリックされたときに期待した値(2)に更新される", () => {
    render(<FooterZoomMenu anchor={anchor} handleClose={handleClose} />);
    // 初期 horizontalZoom = 1 の場合、水平ズームインは次の候補は2
    const horizontalZoomIn = screen
      .getByText("editor.footer.horizontalZoomIn")
      .closest("li") as HTMLElement;
    fireEvent.click(horizontalZoomIn);
    expect(store.setHorizontalZoom).toHaveBeenCalledWith(2);
    expect(handleClose).toHaveBeenCalled();
  });

  it("水平ズームアウトがクリックされたときに期待した値(0.5)に更新される", () => {
    render(<FooterZoomMenu anchor={anchor} handleClose={handleClose} />);
    // 初期 horizontalZoom = 1 の場合、水平ズームアウトは次の候補は0.5 (HORIZONTAL_ZOOM.filter(z => z < 1) => [0.01, 0.1, 0.25, 0.5])
    const horizontalZoomOut = screen
      .getByText("editor.footer.horizontalZoomOut")
      .closest("li") as HTMLElement;
    fireEvent.click(horizontalZoomOut);
    expect(store.setHorizontalZoom).toHaveBeenCalledWith(0.5);
    expect(handleClose).toHaveBeenCalled();
  });

  it("垂直ズームアウトがクリックされたときに期待した値(0.75)に更新される", () => {
    render(<FooterZoomMenu anchor={anchor} handleClose={handleClose} />);
    // 初期 verticalZoom = 1 の場合、垂直ズームアウトは次の候補は0.75 (VERTICAL_ZOOM.filter(z => z < 1) => [0.25, 0.5, 0.75])
    const verticalZoomOut = screen
      .getByText("editor.footer.verticalZoomOut")
      .closest("li") as HTMLElement;
    fireEvent.click(verticalZoomOut);
    expect(store.setVerticalZoom).toHaveBeenCalledWith(0.75);
    expect(handleClose).toHaveBeenCalled();
  });

  it("垂直ズームインは初期状態でdisableになっておりクリックされない", () => {
    render(<FooterZoomMenu anchor={anchor} handleClose={handleClose} />);
    // 垂直ズームインは初期状態で disabled (verticalZoom = 1)
    const verticalZoomIn = screen
      .getByText("editor.footer.verticalZoomIn")
      .closest("li") as HTMLElement;
    expect(verticalZoomIn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(verticalZoomIn);
  });

  it("境界条件で各メニューのdisable状態が正しく反映される", () => {
    // horizontalZoomが最大の場合(4) -> 水平ズームイン disabled
    store.horizontalZoom = 4;
    // verticalZoomが最小の場合(0.25) -> 垂直ズームアウト disabled
    store.verticalZoom = 0.25;
    render(<FooterZoomMenu anchor={anchor} handleClose={handleClose} />);
    const horizontalZoomIn = screen
      .getByText("editor.footer.horizontalZoomIn")
      .closest("li") as HTMLElement;
    const horizontalZoomOut = screen
      .getByText("editor.footer.horizontalZoomOut")
      .closest("li") as HTMLElement;
    const verticalZoomIn = screen
      .getByText("editor.footer.verticalZoomIn")
      .closest("li") as HTMLElement;
    const verticalZoomOut = screen
      .getByText("editor.footer.verticalZoomOut")
      .closest("li") as HTMLElement;
    expect(horizontalZoomIn).toHaveAttribute("aria-disabled", "true");
    expect(horizontalZoomOut).not.toHaveAttribute("aria-disabled", "true");
    expect(verticalZoomIn).not.toHaveAttribute("aria-disabled", "true");
    expect(verticalZoomOut).toHaveAttribute("aria-disabled", "true");
  });
});
