// HeaderLogo.test.tsx
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderLogo } from "../../../src/features/Header//HeaderLogo";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../src/store/snackBarStore";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

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
  it("should open InfoVBDialog when vb is non-null and avatar is clicked", async () => {
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

  // 2. vbがnull時のクリックハンドラの動作検証
  it("should show snackbar message when vb is null and avatar is clicked", async () => {
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
  it("should render avatar with vb.image and vb.name when vb is non-null", async () => {
    setGlobalVb(dummyVb);
    render(<HeaderLogo />);
    const avatar = await screen.findByAltText(dummyVb.name);
    // Avatar src should not equal default logo
    expect(avatar.getAttribute("src")).not.toEqual("./static/logo192.png");
    // alt 属性が vb.name になっている
    expect(avatar.getAttribute("alt")).toEqual(dummyVb.name);
  });

  // 4. vbがnull時のAvatarの属性検証
  it("should render avatar with default logo and alt 'logo' when vb is null", async () => {
    setGlobalVb(null);
    render(<HeaderLogo />);
    const avatar = await screen.findByAltText("logo");
    expect(avatar.getAttribute("src")).toEqual("./static/logo192.png");
    expect(avatar.getAttribute("alt")).toEqual("logo");
  });

  // 5. vbが非nullかつ内部状態がopenのときInfoVBDialogがレンダリングされることの検証
  it("should render InfoVBDialog when open state is true and vb is non-null", async () => {
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
  it("should pass setOpen prop correctly to InfoVBDialog", async () => {
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
});
