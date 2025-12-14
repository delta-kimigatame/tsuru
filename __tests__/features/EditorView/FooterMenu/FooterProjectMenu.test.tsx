import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
    expect(
      LOG.datas.some((s) => s.includes("ustの読込がキャンセルされた"))
    ).toBe(true);
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
    expect(LOG.datas.some((s) => s.includes("click LoadUst"))).toBe(true);
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
    expect(LOG.datas.some((s) => s.includes("click Save Ust"))).toBe(true);
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
    expect(LOG.datas.some((s) => s.includes("click Project Setting"))).toBe(
      true
    );
  });

  it("プロジェクトクリアをクリックするとclearUstとundoManager.clearが呼ばれる", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    const { undoManager } = await import("../../../../src/lib/UndoManager");
    const clearSpy = vi.spyOn(undoManager, "clear");

    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );

    const item = screen
      .getByText("editor.footer.clearProject")
      .closest("li") as HTMLElement;
    fireEvent.click(item);

    expect(LOG.datas.some((s) => s.includes("click Clear Project"))).toBe(true);
    expect(clearSpy).toHaveBeenCalled();
    expect(handleCloseSpy).toHaveBeenCalled();
  });

  it("調(Tone)を変更するとsetToneが呼ばれる", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    const store = useMusicProjectStore.getState();
    const setToneSpy = vi.spyOn(store, "setTone");

    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );

    // MUI Selectコンポーネントを見つける（MusicNoteIconの隣のSelect）
    // comboboxロールで検索
    const selectButton = screen.getByRole("combobox");

    // Selectを開く
    fireEvent.mouseDown(selectButton);

    // ドロップダウンメニューから"F"(value=5)を選択
    const fOption = await screen.findByText("F");
    fireEvent.click(fOption);

    // setToneが5で呼ばれたことを確認
    expect(setToneSpy).toHaveBeenCalledWith(5);
    expect(LOG.datas.some((s) => s.includes("調を変更"))).toBe(true);
  });

  it("長調/短調の切り替えでsetIsMinorが呼ばれる", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    const store = useMusicProjectStore.getState();
    const setIsMinorSpy = vi.spyOn(store, "setIsMinor");

    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );

    // チェックボックスを探す（長調/短調）
    const checkboxes = screen.getAllByRole("checkbox");
    const isMinorCheckbox = checkboxes[0]; // 最初のチェックボックスが長調/短調

    fireEvent.click(isMinorCheckbox);

    expect(setIsMinorSpy).toHaveBeenCalled();
    expect(LOG.datas.some((s) => s.includes("長調/短調を変更"))).toBe(true);
  });

  it("立ち絵表示の切り替えでsetIsShowPortraitが呼ばれる", async () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    const store = useMusicProjectStore.getState();
    const setIsShowPortraitSpy = vi.spyOn(store, "setIsShowPortrait");

    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );

    // チェックボックスを探す（立ち絵表示）
    const checkboxes = screen.getAllByRole("checkbox");
    const isShowPortraitCheckbox = checkboxes[1]; // 2番目のチェックボックスが立ち絵表示

    fireEvent.click(isShowPortraitCheckbox);

    expect(setIsShowPortraitSpy).toHaveBeenCalled();
    expect(LOG.datas.some((s) => s.includes("立ち絵表示の切り替え"))).toBe(
      true
    );
  });

  it("ust===nullの場合、保存ボタンとプロジェクト設定ボタンがdisabled", () => {
    const handleCloseSpy = vi.fn();
    const setUstLoadProgressSpy = vi.fn();
    const store = useMusicProjectStore.getState();
    store.setUst(null);

    render(
      <FooterProjectMenu
        anchor={anchorElement}
        handleClose={handleCloseSpy}
        setUstLoadProgress={setUstLoadProgressSpy}
      />
    );

    const saveButton = screen
      .getByText("editor.footer.saveUst")
      .closest("li") as HTMLElement;
    const settingButton = screen
      .getByText("editor.footer.prjectSetting")
      .closest("li") as HTMLElement;

    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    expect(settingButton).toHaveAttribute("aria-disabled", "true");
  });
});
