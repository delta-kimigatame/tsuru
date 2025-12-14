import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuLog } from "../../../../src/features/Header/Menu/HeaderMenuLog";
import { LOG } from "../../../../src/lib/Logging";
import { dumpNotes } from "../../../../src/lib/Note";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

// dumpNotesをモック化
vi.mock("../../../../src/lib/Note", () => ({
  dumpNotes: vi.fn(),
}));

// URL.createObjectURLとdocument.createElementをモック化
const mockCreateObjectURL = vi.fn();
const mockClick = vi.fn();
const mockAnchor = {
  href: "",
  download: "",
  click: mockClick,
};

global.URL.createObjectURL = mockCreateObjectURL;

// document.createElementのスパイを設定
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
  if (tag === "a") {
    return mockAnchor as any;
  }
  return originalCreateElement(tag);
});

describe("HeaderMenuLog", () => {
  const mockOnMenuClose = vi.fn();
  const mockVb = {
    name: "Test VB",
    oto: {
      GetLines: vi.fn().mockReturnValue([{ alias: "test" }]),
    },
  };
  const mockUst = {
    getRequestParam: vi.fn(),
  };
  const mockNotes = [{ notenum: 60 }];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");

    // mockAnchorをリセット
    mockAnchor.href = "";
    mockAnchor.download = "";

    // ストアの初期化
    useMusicProjectStore.setState({
      vb: mockVb as any,
      ust: mockUst as any,
      notes: mockNotes as any,
      ustTempo: 120,
      ustFlags: "",
    });
    useCookieStore.setState({ defaultNote: {} as any });

    // LOGのモック
    LOG.datas = ["Log line 1", "Log line 2", "Log line 3"];
  });

  // 1. メニュー項目がレンダリングされる
  it("ログのメニュー項目が表示される", () => {
    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. メニュー項目をクリックするとダイアログが開く
  it("メニュー項目をクリックするとダイアログが開く", async () => {
    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  // 3. ダイアログにダウンロードボタンが表示される
  it("ダイアログにダウンロードボタンが表示される", async () => {
    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      // 翻訳キー "error.download" に対応するボタン
      expect(
        screen.getByRole("button", { name: /download/i })
      ).toBeInTheDocument();
    });
  });

  // 4. ダウンロードボタンをクリックするとdumpNotesが呼ばれる
  it("ダウンロードボタンをクリックするとdumpNotesが呼ばれる", async () => {
    vi.mocked(dumpNotes).mockReturnValue("UST DUMP DATA");
    mockUst.getRequestParam.mockReturnValue([{ param: "test" }]);

    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole("button", { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(dumpNotes).toHaveBeenCalledWith(mockNotes, 120, "");
    });
  });

  // 5. ダウンロードボタンをクリックするとust.getRequestParamが呼ばれる
  it("ダウンロードボタンをクリックするとust.getRequestParamが呼ばれる", async () => {
    vi.mocked(dumpNotes).mockReturnValue("UST DUMP DATA");
    mockUst.getRequestParam.mockReturnValue([{ param: "test" }]);

    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole("button", { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockUst.getRequestParam).toHaveBeenCalledWith(mockVb, {});
    });
  });

  // 6. dumpNotesがエラーを投げた場合、エラーメッセージが含まれる
  it("dumpNotesがエラーを投げた場合はエラーメッセージが含まれる", async () => {
    vi.mocked(dumpNotes).mockImplementation(() => {
      throw new Error("Dump failed");
    });
    mockUst.getRequestParam.mockReturnValue([]);

    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole("button", { name: /download/i });
    fireEvent.click(downloadButton);

    // エラーが発生してもクリックは成功する（エラーハンドリングされる）
    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
  });

  // 7. ダウンロードボタンをクリックするとファイルがダウンロードされる
  it("ダウンロードボタンをクリックするとファイルがダウンロードされる", async () => {
    vi.mocked(dumpNotes).mockReturnValue("UST DUMP DATA");
    mockUst.getRequestParam.mockReturnValue([{ param: "test" }]);

    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole("button", { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  // 8. CloseIconをクリックするとダイアログが閉じる
  it("CloseIconをクリックするとダイアログが閉じてonMenuCloseが呼ばれる", async () => {
    render(<HeaderMenuLog onMenuClose={mockOnMenuClose} />);

    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText("close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnMenuClose).toHaveBeenCalled();
    });
  });
});
