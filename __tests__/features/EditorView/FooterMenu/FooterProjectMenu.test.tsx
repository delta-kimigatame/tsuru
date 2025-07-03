import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FooterProjectMenu } from "../../../../src/features/EditorView/FooterMenu/FooterProjectMenu";
import { LOG } from "../../../../src/lib/Logging";
import { dumpNotes, Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

// モック対象：loadBatchProcessClasses

describe("FooterProjectMenu", () => {
  let anchorElement: HTMLElement;
  beforeEach(() => {
    // LOGの内部ログをクリア
    LOG.datas = [];
    // モックのリセット
    vi.clearAllMocks();
    vi.resetAllMocks();
    // ダミーのアンカー要素
    anchorElement = document.createElement("div");
  });
  it("隠しファイル入力が存在し、accept属性が正しく設定されている", () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const fileInput = screen.getByTestId("ust-file-input") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.getAttribute("accept")).toBe(".ust");
  });

  it("ファイル選択時にファイルが無い場合、LOG.warnが呼ばれる", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const fileInput = screen.getByTestId("ust-file-input") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(LOG.datas[0]).toContain("ustの読込がキャンセルされた");
    // setUstLoadProgressが呼ばれていないことを確認
    expect(setUstLoadProgressSpy).not.toHaveBeenCalled();
  });

  it("ファイル選択でustLoadProgressが一時的にtrueになり、非同期処理完了後にfalseになる", async () => {
    // Ust.load を即解決するダミーモック
    vi.spyOn(Ust.prototype, "load").mockResolvedValue(undefined);
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const fileInput = screen.getByTestId("ust-file-input") as HTMLInputElement;

    // ダミーファイル作成（arrayBufferもオーバーライド）
    const dummyContent = "dummy content";
    const dummyFile = new File([dummyContent], "test.ust", { type: ".ust" });
    dummyFile.arrayBuffer = async () =>
      new TextEncoder().encode(dummyContent).buffer;

    // ファイル選択イベントを発火
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });
    //setUstLoadProgressがtrueになるはず
    expect(setUstLoadProgressSpy).toHaveBeenCalledWith(true);

    // 非同期処理の完了を待つ（微小な待機）
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    //非同期処理終了後setUstLoadProgressがfalseになるはず
    expect(setUstLoadProgressSpy).toHaveBeenCalledWith(false);
  });
  it("ustの読み込み成功時にsetUst, setUstTempo, setUstFlags, setNotesが呼ばれる", async () => {
    // ダミーUst の準備
    const dummyNotes = [new Note(), new Note(), new Note()];
    dummyNotes[0].index = 0;
    dummyNotes[0].lyric = "あ";
    dummyNotes[0].notenum = 60;
    dummyNotes[0].length = 480;
    dummyNotes[1].index = 1;
    dummyNotes[1].length = 480;
    dummyNotes[1].lyric = "あ";
    dummyNotes[1].notenum = 60;
    dummyNotes[2].index = 2;
    dummyNotes[2].length = 480;
    dummyNotes[2].lyric = "あ";
    dummyNotes[2].notenum = 60;
    const dummyTempo = 130;
    const dummyFlags = "dummyFlags";

    // Ust.prototype.load をモックして、this にダミー値をセットする
    // vi.spyOn(Ust.prototype, "load").mockImplementation(function () {
    //   this.notes = dummyNotes;
    //   this.tempo = dummyTempo;
    //   this.flags = dummyFlags;
    //   return Promise.resolve();
    // });

    // useMusicProjectStore の setter 関数を spyOn する
    const store = useMusicProjectStore.getState();
    const setUstSpy = vi.spyOn(store, "setUst");
    const setUstTempoSpy = vi.spyOn(store, "setUstTempo");
    const setUstFlagsSpy = vi.spyOn(store, "setUstFlags");
    const setNotesSpy = vi.spyOn(store, "setNotes");

    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const fileInput = screen.getByTestId("ust-file-input") as HTMLInputElement;

    // ダミーファイル作成
    const dummyContent = dumpNotes(dummyNotes, dummyTempo, dummyFlags);
    const dummyFile = new File([dummyContent], "dummy.ust", { type: ".ust" });
    dummyFile.arrayBuffer = async () =>
      new TextEncoder().encode(dummyContent).buffer;

    // ファイル選択イベントを発火
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    // 非同期処理完了を待つ
    await waitFor(
      () => {
        expect(setUstSpy).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

    // expect(setUstSpy).toHaveBeenCalled();
    expect(setUstTempoSpy).toHaveBeenCalledWith(dummyTempo);
    expect(setUstFlagsSpy).toHaveBeenCalledWith(dummyFlags);
    // expect(setNotesSpy).toHaveBeenCalledWith(dummyNotes);
  });
  it("ust読込をクリックするとust読込シナリオが走ることをログで確認", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const item = screen
      .getByText("editor.footer.loadUst")
      .closest("li") as HTMLElement;
    fireEvent.click(item);
    expect(LOG.datas[0]).toContain("click LoadUst");
  });
  it("ust保存をクリックするとust保存シナリオが走ることをログで確認", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const item = screen
      .getByText("editor.footer.saveUst")
      .closest("li") as HTMLElement;
    fireEvent.click(item);
    expect(LOG.datas[0]).toContain("click Save Ust");
  });
  it("プロジェクト設定をクリックするとダイアログは開くシナリオが走ることをログで確認", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );
    const item = screen
      .getByText("editor.footer.prjectSetting")
      .closest("li") as HTMLElement;
    fireEvent.click(item);
    expect(LOG.datas[0]).toContain("click Project Setting");
  });
});
