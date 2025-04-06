import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FooterMenu,
  FooterMenuProps,
} from "../../../../src/features/EditorView/FooterMenu/FooterMenu";
import { BaseBatchProcess } from "../../../../src/lib/BaseBatchProcess";
import { LOG } from "../../../../src/lib/Logging";
import { Note } from "../../../../src/lib/Note";
import { executeBatchProcess } from "../../../../src/utils/batchProcess";

// モック対象：loadBatchProcessClasses
import * as useMenuModule from "../../../../src/hooks/useMenu";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../../src/store/snackBarStore";
import * as batchProcessModule from "../../../../src/utils/loadBatchProcess";

// ダミーのバッチプロセスクラス（uiが空の場合）
class DummyBatchProcess extends BaseBatchProcess {
  title = "dummy.process";
  summary = "dummy";
  ui: any[] = []; // 空のUIで分岐
  protected _process(notes: Note[], options?: any): Note[] {
    return notes.map((n) => n.deepCopy());
  }
}

const dummyBatchProcesses = [
  { title: "dummy.process", cls: DummyBatchProcess },
];

// ダミーのバッチプロセスクラス（ui が非空の場合）
class DummyBatchProcessWithUI extends BaseBatchProcess {
  title = "dummy.process.withUI";
  summary = "dummy";
  // ui が非空なら、バッチ処理のオプションダイアログを表示する分岐に入る
  ui: any[] = [{ dummy: true }];
  protected _process(notes: Note[], options?: any): Note[] {
    return notes.map((n) => n.deepCopy());
  }
}
const dummyBatchProcessesWithUI = [
  { title: "dummy.process.withUI", cls: DummyBatchProcessWithUI },
];

// テスト用のFooterMenuProps
const defaultProps: FooterMenuProps = {
  selectedNotesIndex: [],
  handlePlay: () => {},
  handleDownload: () => {},
  synthesisProgress: false,
  synthesisCount: 0,
  playing: false,
  handlePlayStop: () => {},
  selectMode: "toggle",
  setSelectMode: () => {},
};

describe("FooterMenu", () => {
  beforeEach(() => {
    // LOGの内部ログをクリア
    LOG.datas = [];
    // モックのリセット
    vi.clearAllMocks();
  });

  it("マウント時にloadBatchProcessClassesが呼ばれ、batchProcessesが設定される", async () => {
    // loadBatchProcessClasses をモックしてダミー結果を返す
    const loadBatchProcessMock = vi
      .spyOn(batchProcessModule, "loadBatchProcessClasses")
      .mockResolvedValue(dummyBatchProcesses);
    render(<FooterMenu {...defaultProps} />);
    // 非同期処理が解決するのを待つ
    await act(async () => Promise.resolve());
    expect(loadBatchProcessMock).toHaveBeenCalled();
    // LOG にバッチプロセスの一覧取得ログがあるか確認（文字列の一部で検証）
    expect(LOG.datas[3]).toContain("バッチプロセスの一覧取得");
  });

  it("バッチプロセス実行時、bp.uiが空の場合はexecuteBatchProcessが呼ばれる", async () => {
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    // executeBatchProcess を spyOn して呼び出しを確認
    const executeSpy = vi
      .spyOn({ executeBatchProcess }, "executeBatchProcess")
      .mockImplementation(() => {});
    // FooterMenu のprops.selectedNotesIndex を設定
    const props: FooterMenuProps = {
      ...defaultProps,
      selectedNotesIndex: [0, 1],
    };
    // バッチプロセスとして dummyBatchProcesses を設定（FooterMenu内部で setBatchProcesses により設定される）
    // ここでは、loadBatchProcessClasses のモックで dummyBatchProcesses を返すようにしているのでOK
    vi.spyOn(batchProcessModule, "loadBatchProcessClasses").mockResolvedValue(
      dummyBatchProcesses
    );
    // it 内で FooterMenu.BatchProcessMenu 用の useMenu をモックする
    const originalUseMenu = useMenuModule.useMenu;
    const handleBatchProcessMenuCloseSpy = vi.fn();
    vi.spyOn(useMenuModule, "useMenu").mockImplementation(
      (logContext: string) => {
        if (logContext === "FooterMenu.BatchProcessMenu") {
          const [anchor, handleOpen, originalHandleClose] =
            originalUseMenu(logContext);
          // ここで handleClose をラップして spy 化する。anchor と handleOpen はそのまま返す。
          return [
            anchor,
            handleOpen,
            (...args: any[]) => {
              handleBatchProcessMenuCloseSpy(...args);
              return originalHandleClose(...args);
            },
          ];
        }
        return originalUseMenu(logContext);
      }
    );
    render(<FooterMenu {...props} />);
    // クリックで BatchProcessMenu を開く
    const batchTab = await screen.findByRole("tab", {
      name: /editor.footer.batchProcess/i,
    });
    fireEvent.click(batchTab);

    const menuItem = await screen.findByRole("menuitem", {
      name: /dummy\.process/i,
    });
    menuItem.click();
    // LOGの出力により、バッチ処理実行が行われたことを間接的に検証
    expect(LOG.datas.some((s) => s.includes("選択されたノートの更新"))).toBe(
      true
    );
    // handleBatchProcessMenuClose が呼ばれていることを、LOG に「メニューを閉じる」出力されているかで検証
    expect(handleBatchProcessMenuCloseSpy).toHaveBeenCalled();
  });

  it("bp.uiが非空の場合、dialogBatchProcessにbpが設定され、batchProcessDialogOpenがtrueになり、handleBatchProcessMenuCloseが呼ばれる", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);

    // loadBatchProcessClasses をモックして、非空 ui を持つダミーを返す
    vi.spyOn(batchProcessModule, "loadBatchProcessClasses").mockResolvedValue(
      dummyBatchProcessesWithUI
    );

    // it 内で、FooterMenu.BatchProcessMenu 用の useMenu をモックして、handleClose の呼び出しを spy 化
    const originalUseMenu = useMenuModule.useMenu;
    const handleBatchProcessMenuCloseSpy = vi.fn();
    vi.spyOn(useMenuModule, "useMenu").mockImplementation(
      (logContext: string) => {
        if (logContext === "FooterMenu.BatchProcessMenu") {
          const [anchor, handleOpen, originalHandleClose] =
            originalUseMenu(logContext);
          // ここで handleClose をラップして spy 化する。anchor と handleOpen はそのまま返す。
          return [
            anchor,
            handleOpen,
            (...args: any[]) => {
              handleBatchProcessMenuCloseSpy(...args);
              return originalHandleClose(...args);
            },
          ];
        }
        return originalUseMenu(logContext);
      }
    );
    // FooterMenu の props を設定
    const props: FooterMenuProps = {
      ...defaultProps,
      selectedNotesIndex: [0, 1],
    };

    render(<FooterMenu {...props} />);

    // クリックする前に各タブを取得しておく
    const projectTab = await screen.findByRole("tab", {
      name: /editor.footer.project/i,
    });
    const selectTab = await screen.findByRole("tab", {
      name: /editor.footer.selectRange/i,
    });
    const zoomTab = await screen.findByRole("tab", {
      name: /editor.footer.zoom/i,
    });
    const playTab = await screen.findByRole("tab", {
      name: /editor.footer.play/i,
    });
    const wavTab = await screen.findByRole("tab", {
      name: /editor.footer.wav/i,
    });
    // BatchProcess タブをクリックしてメニューを表示する
    const batchTab = await screen.findByRole("tab", {
      name: /editor.footer.batchProcess/i,
    });
    fireEvent.click(batchTab);

    // メニュー項目（ダミーの bp タイトルに対応する項目）を取得してクリックする
    const menuItem = await screen.findByRole("menuitem", {
      name: /dummy.process.withUI/i,
    });
    fireEvent.click(menuItem);

    // LOGの出力により、バッチ処理実行が行われたことを間接的に検証（例："バッチ処理ダイアログの起動"）
    expect(
      LOG.datas.some((s) => s.includes("バッチ処理ダイアログの起動"))
    ).toBe(true);

    // ダイアログが表示されることを検証
    // BatchProcessDialog が render されると role="dialog" が存在するはず
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // handleBatchProcessMenuClose が呼ばれたことを検証
    expect(handleBatchProcessMenuCloseSpy).toHaveBeenCalled();
    expect(projectTab).toHaveAttribute("disabled");
    expect(selectTab).toHaveAttribute("disabled");
    expect(zoomTab).toHaveAttribute("disabled");
    expect(batchTab).toHaveAttribute("disabled");
    expect(playTab).toHaveAttribute("disabled");
    expect(wavTab).toHaveAttribute("disabled");
  });
  it("notes.length===0のとき、project以外のタブがdisabled", async () => {
    // storeをnotes.length===0で初期化
    const dummyNotes = [];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    render(<FooterMenu {...defaultProps} />);
    const projectTab = await screen.findByRole("tab", {
      name: /editor.footer.project/i,
    });
    const selectTab = await screen.findByRole("tab", {
      name: /editor.footer.selectRange/i,
    });
    const zoomTab = await screen.findByRole("tab", {
      name: /editor.footer.zoom/i,
    });
    const batchTab = await screen.findByRole("tab", {
      name: /editor.footer.batchProcess/i,
    });
    const playTab = await screen.findByRole("tab", {
      name: /editor.footer.play/i,
    });
    const wavTab = await screen.findByRole("tab", {
      name: /editor.footer.wav/i,
    });
    expect(projectTab).not.toHaveAttribute("disabled");
    expect(selectTab).toHaveAttribute("disabled");
    expect(zoomTab).toHaveAttribute("disabled");
    expect(batchTab).toHaveAttribute("disabled");
    expect(playTab).toHaveAttribute("disabled");
    expect(wavTab).toHaveAttribute("disabled");
  });
  it("synthesisProgressがtrueのとき、zoom以外のタブがdisabled", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    // synthesisProgress, batchProcessProgress, ustLoadProgress 等の状態を true にして disabled を確認
    const props: FooterMenuProps = {
      ...defaultProps,
      synthesisProgress: true,
      selectedNotesIndex: [],
    };
    render(<FooterMenu {...props} />);
    const projectTab = await screen.findByRole("tab", {
      name: /editor.footer.project/i,
    });
    const selectTab = await screen.findByRole("tab", {
      name: /editor.footer.selectRange/i,
    });
    const zoomTab = await screen.findByRole("tab", {
      name: /editor.footer.zoom/i,
    });
    const batchTab = await screen.findByRole("tab", {
      name: /editor.footer.batchProcess/i,
    });
    const tabs = await screen.findAllByRole("tab", {
      name: /0\/3/i,
    });
    const playTab = tabs[0];
    const wavTab = tabs[1];
    expect(projectTab).toHaveAttribute("disabled");
    expect(selectTab).toHaveAttribute("disabled");
    expect(zoomTab).not.toHaveAttribute("disabled");
    expect(batchTab).toHaveAttribute("disabled");
    expect(playTab).toHaveAttribute("disabled");
    expect(wavTab).toHaveAttribute("disabled");
  });

  it("再生ボタンは、playingがfalseならhandlePlayが、trueならhandlePlayStopが呼ばれる", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    const handlePlaySpy = vi.fn();
    const handlePlayStopSpy = vi.fn();
    // playingがfalseの場合
    let props: FooterMenuProps = {
      ...defaultProps,
      playing: false,
      handlePlay: handlePlaySpy,
      handlePlayStop: handlePlayStopSpy,
    };
    const { rerender } = render(<FooterMenu {...props} />);
    const playTab = await screen.findByRole("tab", {
      name: /editor.footer.play/i,
    });
    fireEvent.click(playTab);
    expect(handlePlaySpy).toHaveBeenCalledTimes(1);
    // playingがtrueの場合
    props = { ...props, playing: true };
    rerender(<FooterMenu {...props} />);
    fireEvent.click(playTab);
    expect(handlePlayStopSpy).toHaveBeenCalledTimes(1);
  });

  it("ダウンロードボタンはhandleDownloadが呼ばれる", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    const handleDownloadSpy = vi.fn();
    const props: FooterMenuProps = {
      ...defaultProps,
      handleDownload: handleDownloadSpy,
    };
    render(<FooterMenu {...props} />);
    const downloadTab = await screen.findByRole("tab", {
      name: /editor.footer.wav/i,
    });
    fireEvent.click(downloadTab);
    expect(handleDownloadSpy).toHaveBeenCalledTimes(1);
  });

  it("selectModeがtoggleのとき、selectボタンを押すと、setSelectModeにrangeが渡り、スナックバーが表示される。", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    const setSelectModeSpy = vi.fn();
    const props: FooterMenuProps = {
      ...defaultProps,
      setSelectMode: setSelectModeSpy,
    };
    const snackBarstore = useSnackBarStore.getState();
    const setValueSpy = vi.spyOn(snackBarstore, "setValue");
    const setOpenSpy = vi.spyOn(snackBarstore, "setOpen");
    const setSeveritySpy = vi.spyOn(snackBarstore, "setSeverity");
    render(<FooterMenu {...props} />);
    const selectTab = await screen.findByRole("tab", {
      name: /editor.footer.selectRange/i,
    });
    fireEvent.click(selectTab);
    expect(setSelectModeSpy).toHaveBeenCalledWith("range");
    expect(setSeveritySpy).toHaveBeenCalledWith("info");
    expect(setOpenSpy).toHaveBeenCalledWith(true);
    expect(setValueSpy).toHaveBeenCalledWith("editor.selectRangeBegin");
  });
  it("selectModeがrangeかつselectNotesIndex.length!==0のとき、selectボタンを押すと、selectNotesIndexが空配列になり、スナックバーが表示される。", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    const setSelectedNotesIndexSpy = vi.fn();
    const props: FooterMenuProps = {
      ...defaultProps,
      selectMode: "range",
      setSelectedNotesIndex: setSelectedNotesIndexSpy,
      selectedNotesIndex: [0],
    };
    const snackBarstore = useSnackBarStore.getState();
    const setValueSpy = vi.spyOn(snackBarstore, "setValue");
    const setOpenSpy = vi.spyOn(snackBarstore, "setOpen");
    const setSeveritySpy = vi.spyOn(snackBarstore, "setSeverity");
    render(<FooterMenu {...props} />);
    const selectTab = await screen.findByRole("tab", {
      name: /editor.footer.selectReset/i,
    });
    fireEvent.click(selectTab);
    expect(setSelectedNotesIndexSpy).toHaveBeenCalledWith([]);
    expect(setSeveritySpy).toHaveBeenCalledWith("info");
    expect(setOpenSpy).toHaveBeenCalledWith(true);
    expect(setValueSpy).toHaveBeenCalledWith("editor.selectReset");
  });
  it("selectModeがrangeかつselectNotesIndex.length===0のとき、selectボタンを押すと、setSelectModeにtoggleが渡る。", async () => {
    // まず、グローバルストアにダミーのノートを設定
    const dummyNotes = [new Note(), new Note(), new Note()];
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(dummyNotes);
    const setSelectModeSpy = vi.fn();
    const props: FooterMenuProps = {
      ...defaultProps,
      selectMode: "range",
      setSelectMode: setSelectModeSpy,
    };
    render(<FooterMenu {...props} />);
    const selectTab = await screen.findByRole("tab", {
      name: /editor.footer.selectCancel/i,
    });
    fireEvent.click(selectTab);
    expect(setSelectModeSpy).toHaveBeenCalledWith("toggle");
  });
});
