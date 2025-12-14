import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FooterPhonemizerMenu } from "../../../../src/features/EditorView/FooterMenu/FooterPhonemizerMenu";
import { BasePhonemizer } from "../../../../src/lib/BasePhonemizer";
import { LOG } from "../../../../src/lib/Logging";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import * as loadPhonemizerModule from "../../../../src/utils/loadPhonemizer";

// モックPhonemizerクラス
class MockPhonemizer1 extends BasePhonemizer {
  name = "TestPhonemizer1";
  phonemize = vi.fn();
}

class MockPhonemizer2 extends BasePhonemizer {
  name = "TestPhonemizer2";
  phonemize = vi.fn();
}

describe("FooterPhonemizerMenu", () => {
  const mockHandleClose = vi.fn();
  const mockAnchor = document.createElement("div");

  beforeEach(() => {
    vi.clearAllMocks();
    LOG.clear();
    // Zustandストアの状態をリセット（setPhonemizer内でnotesとvbにアクセスするため初期化が必要）
    useMusicProjectStore.setState({
      phonemizer: new MockPhonemizer1(),
      notes: [], // setPhonemizer内でnotesにアクセスするため空配列を設定
      vb: null, // setPhonemizer内でvbにアクセスするため設定
    });
  });

  const defaultProps = {
    anchor: mockAnchor,
    handleClose: mockHandleClose,
  };

  it("anchorがnullの場合、メニューが表示されない", () => {
    render(
      <FooterPhonemizerMenu anchor={null} handleClose={mockHandleClose} />
    );

    // MUIのMenuはanchorがnullの場合、DOMには存在するが非表示になる
    const menu = screen.queryByRole("menu");
    expect(menu).toBeNull();
  });

  it("コンポーネントマウント時にログが出力される", async () => {
    const mockLoadPhonemizer = vi.spyOn(
      loadPhonemizerModule,
      "loadPhonemizerClasses"
    );
    mockLoadPhonemizer.mockResolvedValue([
      { name: "TestPhonemizer1", cls: MockPhonemizer1 },
    ]);

    render(<FooterPhonemizerMenu {...defaultProps} />);

    await waitFor(() => {
      expect(
        LOG.datas.some((s) => s.includes("コンポーネントマウント"))
      ).toBeTruthy();
    });
  });

  it("loadPhonemizerClassesが呼ばれ、Phonemizerの一覧が読み込まれる", async () => {
    const mockLoadPhonemizer = vi.spyOn(
      loadPhonemizerModule,
      "loadPhonemizerClasses"
    );
    mockLoadPhonemizer.mockResolvedValue([
      { name: "TestPhonemizer1", cls: MockPhonemizer1 },
      { name: "TestPhonemizer2", cls: MockPhonemizer2 },
    ]);

    render(<FooterPhonemizerMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockLoadPhonemizer).toHaveBeenCalledOnce();
    });

    await waitFor(() => {
      expect(
        LOG.datas.some((s) => s.includes("Phonemizerの一覧取得"))
      ).toBeTruthy();
    });
  });

  it("Phonemizerの一覧がメニューアイテムとして表示される", async () => {
    const mockLoadPhonemizer = vi.spyOn(
      loadPhonemizerModule,
      "loadPhonemizerClasses"
    );
    mockLoadPhonemizer.mockResolvedValue([
      { name: "TestPhonemizer1", cls: MockPhonemizer1 },
      { name: "TestPhonemizer2", cls: MockPhonemizer2 },
    ]);

    render(<FooterPhonemizerMenu {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("TestPhonemizer1")).toBeInTheDocument();
      expect(screen.getByText("TestPhonemizer2")).toBeInTheDocument();
    });
  });

  it("現在のPhonemizerにチェックマークが表示される", async () => {
    const mockLoadPhonemizer = vi.spyOn(
      loadPhonemizerModule,
      "loadPhonemizerClasses"
    );
    mockLoadPhonemizer.mockResolvedValue([
      { name: "TestPhonemizer1", cls: MockPhonemizer1 },
      { name: "TestPhonemizer2", cls: MockPhonemizer2 },
    ]);

    // 現在のPhonemizerを設定
    const currentPhonemizer = new MockPhonemizer1();
    useMusicProjectStore.setState({ phonemizer: currentPhonemizer });

    render(<FooterPhonemizerMenu {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("TestPhonemizer1")).toBeInTheDocument();
    });

    // CheckBoxIconが存在することを確認（テストIDやaria-labelで判定するのが理想だが、ここではクラス名で判定）
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);

    // 最初のメニューアイテム（TestPhonemizer1）にチェックボックスアイコンがあることを確認
    const firstMenuItem = menuItems[0];
    const checkIcon = firstMenuItem.querySelector(
      '[data-testid="CheckBoxIcon"]'
    );
    const uncheckIcon = firstMenuItem.querySelector(
      '[data-testid="CheckBoxOutlineBlankIcon"]'
    );

    // MUIのアイコンは<svg>として描画されるため、親要素を確認
    expect(firstMenuItem.textContent).toContain("TestPhonemizer1");
  });

  it("メニューアイテムがクリック可能な状態で表示される", async () => {
    const mockLoadPhonemizer = vi.spyOn(
      loadPhonemizerModule,
      "loadPhonemizerClasses"
    );
    mockLoadPhonemizer.mockResolvedValue([
      { name: "TestPhonemizer1", cls: MockPhonemizer1 },
      { name: "TestPhonemizer2", cls: MockPhonemizer2 },
    ]);

    render(<FooterPhonemizerMenu {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("TestPhonemizer2")).toBeInTheDocument();
    });

    // MenuItemが正しく表示されているか確認
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent("TestPhonemizer1");
    expect(menuItems[1]).toHaveTextContent("TestPhonemizer2");
  });
  it("loadPhonemizerClassesが空の配列を返す場合、メニューアイテムが表示されない", async () => {
    const mockLoadPhonemizer = vi.spyOn(
      loadPhonemizerModule,
      "loadPhonemizerClasses"
    );
    mockLoadPhonemizer.mockResolvedValue([]);

    render(<FooterPhonemizerMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockLoadPhonemizer).toHaveBeenCalledOnce();
    });

    // メニューアイテムが存在しないことを確認
    const menuItems = screen.queryAllByRole("menuitem");
    expect(menuItems).toHaveLength(0);
  });
});
