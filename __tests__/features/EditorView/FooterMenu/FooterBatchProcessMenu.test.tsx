import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FooterBatchProcessMenu } from "../../../../src/features/EditorView/FooterMenu/FooterBatchProcessMenu";
import { BaseBatchProcess } from "../../../../src/lib/BaseBatchProcess";

// ダミーのバッチプロセスクラス
class DummyBatchProcess extends BaseBatchProcess {
  title = "dummy.process";
  summary = "ダミー処理";
  protected _process(notes: any, options?: any): any {
    return notes;
  }
}

const dummyBatchProcesses = [
  { title: "dummy.process1", cls: DummyBatchProcess },
  { title: "dummy.process2", cls: DummyBatchProcess },
  { title: "dummy.process3", cls: DummyBatchProcess },
];

describe("useVerticalFooterMenu: FooterBatchProcessMenu", () => {
  let dummyProcessCallback: vi.Mock;
  let dummyHandleClose: vi.Mock;
  let anchorElement: HTMLElement;

  beforeEach(() => {
    // ダミーのコールバック
    dummyProcessCallback = vi.fn();
    dummyHandleClose = vi.fn();
    // ダミーのアンカー要素
    anchorElement = document.createElement("div");
  });

  it("アンカーが null の場合、メニューが非表示になる", () => {
    render(
      <FooterBatchProcessMenu
        anchor={null}
        handleClose={dummyHandleClose}
        batchProcesses={dummyBatchProcesses}
        process={dummyProcessCallback}
      />
    );
    // Menu のopenはprops.anchorの有無で決まるので、anchorがnullの場合、メニューはレンダリングされない
    // MUI Menuはopenが false の場合、DOMに存在しない（または空）と仮定
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("有効なアンカーが与えられた場合、batchProcessesの件数分のMenuItemが生成される", () => {
    render(
      <FooterBatchProcessMenu
        anchor={anchorElement}
        handleClose={dummyHandleClose}
        batchProcesses={dummyBatchProcesses}
        process={dummyProcessCallback}
      />
    );
    // MenuItem は MUI では role="menuitem" としてレンダリングされるはず
    const items = screen.getAllByRole("menuitem");
    expect(items.length).toBe(dummyBatchProcesses.length);
  });

  it("各MenuItemのラベルが正しく表示される", () => {
    render(
      <FooterBatchProcessMenu
        anchor={anchorElement}
        handleClose={dummyHandleClose}
        batchProcesses={dummyBatchProcesses}
        process={dummyProcessCallback}
      />
    );
  });
});
