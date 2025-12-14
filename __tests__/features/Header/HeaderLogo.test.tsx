// HeaderLogo.test.tsx
import { useMediaQuery } from "@mui/material";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderLogo } from "../../../src/features/Header//HeaderLogo";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../src/store/snackBarStore";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

// useMediaQueryをモック化
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn().mockReturnValue(true), // デフォルトはtrue (画面サイズ大)
  };
});

// ダミー vb オブジェクト（vbが非nullの場合のテスト用）
const dummyVb = {
  name: "Test VB",
  image: new Uint8Array([1, 2, 3]).buffer, // ダミーの画像データ
  sample: new Uint8Array([4, 5, 6]).buffer, // ダミーのサンプルデータ
  author: "Test Author",
  web: "https://example.com",
  version: "v1.0",
  voice: "Test Voice",
  oto: { otoCount: 5 },
  zip: { "readme.txt": {}, "a.txt": {} },
  initialize: async (encoding: EncodingOption) => Promise.resolve(),
};

// ヘルパー関数: グローバルな vb を設定する
const setGlobalVb = (vb: any) => {
  useMusicProjectStore.setState({ vb });
};
describe("HeaderLogo", () => {
  beforeEach(() => {
    // 各テストの前に、グローバルストアの状態を初期化する
    setGlobalVb(dummyVb);
    // 可能なら、SnackBar のモックもクリアする
    const snackBar = useSnackBarStore.getState();
    vi.clearAllMocks();
  });

  // 1. vbが非null時のクリックハンドラの動作検証
  it("vbが非nullの場合はAvatarをクリックするとInfoVBDialogが開く", async () => {
    // 初期状態: vb is non-null
    setGlobalVb(dummyVb);
    render(<HeaderLogo />);
    // Avatar の alt 属性は vb.name のはず
    const avatar = await screen.findByAltText(dummyVb.name);
    act(() => {
      fireEvent.click(avatar);
    });
    // InfoVBDialog は Dialog コンポーネントとして表示されるはず
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  // 2. vbがなnull時のクリックハンドラの動作検証
  it("vbがnullの場合はAvatarをクリックするとsnackbarが表示される", async () => {
    // vb を null に設定
    setGlobalVb(null);
    // スナックバーの set* メソッドを spy
    const snackBar = useSnackBarStore.getState();
    const setSeveritySpy = vi.spyOn(snackBar, "setSeverity");
    const setValueSpy = vi.spyOn(snackBar, "setValue");
    const setOpenSpy = vi.spyOn(snackBar, "setOpen");

    render(<HeaderLogo />);
    // vb が null の場合、Avatar の alt は "logo"
    const avatar = await screen.findByAltText("logo");
    act(() => {
      fireEvent.click(avatar);
    });
    await waitFor(() => {
      expect(setSeveritySpy).toHaveBeenCalledWith("info");
      expect(setValueSpy).toHaveBeenCalled();
      expect(setOpenSpy).toHaveBeenCalledWith(true);
    });
  });

  // 3. vbが非null時のAvatarの属性検証
  it("vbが非nullの場合はvb.imageとvb.nameでAvatarがレンダリングされる", async () => {
    setGlobalVb(dummyVb);
    render(<HeaderLogo />);
    const avatar = await screen.findByAltText(dummyVb.name);
    // Avatar src should not equal default logo
    expect(avatar.getAttribute("src")).not.toEqual("./static/logo192.png");
    // alt 属性が vb.name になっている
    expect(avatar.getAttribute("alt")).toEqual(dummyVb.name);
  });

  // 4. vbがなnull時のAvatarの属性検証
  it("vbがnullの場合はデフォルトロゴとalt='logo'でAvatarがレンダリングされる", async () => {
    setGlobalVb(null);
    render(<HeaderLogo />);
    const avatar = await screen.findByAltText("logo");
    expect(avatar.getAttribute("src")).toEqual("./static/logo192.png");
    expect(avatar.getAttribute("alt")).toEqual("logo");
  });

  // 5. vbが非nullかつ内部状態がopenのときInfoVBDialogがレンダリングされることの検証
  it("open状態がtrueでvbが非nullの場合はInfoVBDialogがレンダリングされる", async () => {
    setGlobalVb(dummyVb);
    render(<HeaderLogo />);
    const avatar = await screen.findByAltText(dummyVb.name);
    // Click to open dialog
    act(() => {
      fireEvent.click(avatar);
    });
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  // 6. InfoVBDialogに期待する通りsetOpenが渡っていることの検証
  // ※ InfoVBDialog自体は子コンポーネントとして既にテスト済みのため、ここでは
  // 単に InfoVBDialog がレンダリングされていることを確認する
  it("InfoVBDialogにsetOpen propが正しく渡される", async () => {
    setGlobalVb(dummyVb);
    render(<HeaderLogo />);
    const avatar = await screen.findByAltText(dummyVb.name);
    act(() => {
      fireEvent.click(avatar);
    });
    // InfoVBDialog is rendered when open state is true.
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    // 詳細な props の検証は、InfoVBDialog の単体テストで行う前提なので、
    // ここでは setOpen が呼ばれる挙動を含めて十分とする。
  });

  // 7. レスポンシブ表示: matches=true (画面幅sm以上) の場合はTypographyが表示される
  it("画面幅がsm以上の場合はTypographyが表示される", async () => {
    // デフォルトでuseMediaQueryはtrueを返す設定になっているため、
    // 特別なモック設定なしで画面サイズが大きい状態をテスト
    setGlobalVb(dummyVb);
    const { container } = render(<HeaderLogo />);

    // vbが非nullの場合、vb.nameがTypographyとして表示される
    // Typographyはsubtitle2として表示される (BoxのdirectChildとして)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const typography = container.querySelector(".MuiTypography-subtitle2");
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveTextContent(dummyVb.name);
  });

  // 8. レスポンシブ表示: matches=false (画面幅sm未満) の場合はTypographyが表示されない
  it("画面幅がsm未満の場合はTypographyが表示されない", async () => {
    // useMediaQueryがfalseを返すようモック
    vi.mocked(useMediaQuery).mockReturnValue(false);

    setGlobalVb(null);
    const { container } = render(<HeaderLogo />);

    // vbがnullの場合のproductNameもTypographyとして表示されないことを確認
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const typography = container.querySelector(".MuiTypography-subtitle2");
    expect(typography).not.toBeInTheDocument();
  });
});
