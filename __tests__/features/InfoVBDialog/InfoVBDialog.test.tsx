import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InfoVBDialog,
  InfoVBDialogProps,
} from "../../../src/features/InfoVBDialog/InfoVBDialog";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import {
  EncodingOption,
  getFileReaderEncoding,
} from "../../../src/utils/EncodingMapping";
// ダミーの vb オブジェクトを作成（必要なプロパティのみ）
const createDummyVb = (overrides = {}) => ({
  name: "Test VB",
  image: undefined,
  sample: undefined,
  author: "Test Author",
  web: "https://example.com",
  version: "v1.0",
  voice: "Test Voice",
  oto: { otoCount: 5 },
  // ダミーの zip オブジェクト。実際の内容は子コンポーネントのテストで検証済みなので最低限のダミーデータ
  zip: { "readme.txt": {}, "a.txt": {} },
  // initialize は非同期関数としてモック化
  initialize: vi.fn(async (encoding: EncodingOption) => Promise.resolve()),
  ...overrides,
});

// テスト用の setOpen モック
const setOpenMock = vi.fn();

// テストのために、useMusicProjectStore の vb を直接操作できるようにする
// ※ ここでは単純にグローバルストアを更新する方法でテストしています
const setGlobalVb = (vb: any) => {
  useMusicProjectStore.setState({ vb });
};

describe("InfoVBDialog", () => {
  beforeEach(() => {
    // 各テスト前に setOpenMock をクリア
    setOpenMock.mockClear();
  });

  // 1. vb 更新時の初期化とダイアログ表示
  it("vbが非nullの場合はmount時に同意状態が初期化されsetOpen(true)が呼ばれる", async () => {
    const dummyVb = createDummyVb();
    setGlobalVb(dummyVb);
    const props: InfoVBDialogProps = {
      open: false, // 初期は false
      setOpen: setOpenMock,
    };

    render(<InfoVBDialog {...props} />);
    // useEffect で vb の更新時に setOpen(true) が呼ばれるので待つ
    await waitFor(() => {
      expect(setOpenMock).toHaveBeenCalledWith(true);
    });
  });
  // 2. エンコード変更時の再初期化（ReInitializeVb の動作）
  it("エンコードを変更した場合はvb.initializeが新しいエンコード値で呼ばれる", async () => {
    // 初期状態: vb には SHIFT_JIS が前提
    const dummyVb = createDummyVb();
    setGlobalVb(dummyVb);

    const props: InfoVBDialogProps = {
      open: true,
      setOpen: setOpenMock,
    };

    render(<InfoVBDialog {...props} />);
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "UTF-8" });
    await user.click(optionUTF8);

    // エンコード変更により内部の useEffect が再実行され、vb.initialize が新しい値で呼ばれるのを待つ
    await waitFor(() => {
      expect(dummyVb.initialize).toHaveBeenCalledWith(
        getFileReaderEncoding(EncodingOption.UTF8)
      );
    });
  });
  // 3. 利用規約同意ボタンの動作
  it("利用規約同意ボタンをクリックした場合はagreedがtrueになりsetOpen(false)が呼ばれる", async () => {
    const dummyVb = createDummyVb();
    setGlobalVb(dummyVb);
    const props: InfoVBDialogProps = {
      open: true,
      setOpen: setOpenMock,
    };
    const { getByRole, queryByRole } = render(<InfoVBDialog {...props} />);

    // 初回表示では利用規約同意ボタンが表示される（DialogActions 内の Button）
    const agreeButton = await getByRole("button", {
      name: /infoVBDialog\.agreeButton/i,
    });
    // クリック前は閉じるアイコンは表示されない
    expect(queryByRole("button", { name: /close/i })).toBeNull();
    // クリックして同意処理を実行
    fireEvent.click(agreeButton);
    // props.setOpen(false) が呼ばれるはず
    await waitFor(() => {
      expect(setOpenMock).toHaveBeenCalledWith(false);
    });
  });
  // 4. 同意済みの場合の閉じるアイコンの動作
  it("同意済みの場合は閉じるアイコンが表示されクリックするとsetOpen(false)が呼ばれる", async () => {
    const dummyVb = createDummyVb();
    setGlobalVb(dummyVb);
    const props: InfoVBDialogProps = {
      open: true,
      setOpen: setOpenMock,
    };
    // まず、同意してダイアログを閉じる操作をシミュレートするために、
    // 利用規約同意ボタンをクリックして、agreed を true にする（内部 state 変更）
    const { getByRole, queryByRole, rerender } = render(
      <InfoVBDialog {...props} />
    );
    // Simulate clicking the agree button
    const agreeButton = await getByRole("button", {
      name: /infoVBDialog\.agreeButton/i,
    });
    fireEvent.click(agreeButton);
    // 再レンダリング後、閉じるアイコンが表示されるはず
    // ※ただし、内部で agreed が true になった後、DialogActions は非表示になるので、DialogTitle 内の IconButton が表示されるはず
    // ダイアログを再表示するために props.open を再度 true（Header 呼び出しシナリオ）とみなす
    rerender(<InfoVBDialog {...{ ...props, open: true }} />);
    // Portal 内から閉じるアイコン（aria-label "close"）を検出
    const closeIcon = await waitFor(() =>
      getByRole("button", { name: /close/i })
    );
    // クリックして閉じる処理を確認
    fireEvent.click(closeIcon);
    await waitFor(() => {
      expect(setOpenMock).toHaveBeenCalledWith(false);
    });
  });
  // 5. props.open による表示制御
  it("props.openがfalseの場合はダイアログがレンダリングされない", () => {
    const dummyVb = createDummyVb();
    setGlobalVb(dummyVb);
    const props: InfoVBDialogProps = {
      open: false,
      setOpen: setOpenMock,
    };
    const { queryByRole } = render(<InfoVBDialog {...props} />);
    expect(queryByRole("dialog")).toBeNull();
  });
  // 6. vb が null の場合、ダイアログがレンダリングされない
  it("vbがnullの場合はダイアログがレンダリングされない", () => {
    setGlobalVb(null);
    const props: InfoVBDialogProps = {
      open: true,
      setOpen: setOpenMock,
    };
    const { queryByRole } = render(<InfoVBDialog {...props} />);
    expect(queryByRole("dialog")).toBeNull();
  });
  // 7. 子コンポーネントへの props の受け渡しの最低限の検証
  it("子コンポーネントへvbのプロパティおよびencodingとvb.zipが正しく渡される", async () => {
    const dummyVb = createDummyVb();
    setGlobalVb(dummyVb);
    const props: InfoVBDialogProps = {
      open: true,
      setOpen: setOpenMock,
    };
    const { getByText } = render(<InfoVBDialog {...props} />);
    // CharacterInfo 内の vb.name が表示されていることを確認
    await waitFor(() => {
      expect(getByText(dummyVb.name)).toBeDefined();
    });
    // TextTabs に渡される vb.zip に基づいたタブが表示されること（例として "readme.txt" タブ）
    await waitFor(() => {
      expect(getByText("readme.txt")).toBeDefined();
    });
    // EncodingSelect も表示される（ラベル等）
    await waitFor(() => {
      expect(getByText(/encoding/i)).toBeDefined();
    });
  });

  // 8. progress状態のテスト
  it("progress中の場合はCircularProgressが表示される", async () => {
    const dummyVb = createDummyVb({
      initialize: vi.fn(async () => {
        // 遅延させてprogressをtrueに保つ
        await new Promise((resolve) => setTimeout(resolve, 100));
      }),
    });
    setGlobalVb(dummyVb);
    const props: InfoVBDialogProps = {
      open: true,
      setOpen: setOpenMock,
    };
    const { getByRole, rerender } = render(<InfoVBDialog {...props} />);

    // エンコードを変更してprogressをtrueにする
    const combobox = getByRole("combobox");
    await userEvent.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "UTF-8" });
    await userEvent.click(optionUTF8);

    // progress中はCircularProgressが表示される
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});
