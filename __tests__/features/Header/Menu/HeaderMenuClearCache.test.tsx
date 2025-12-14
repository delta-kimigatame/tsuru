import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuClearCache } from "../../../../src/features/Header/Menu/HeaderMenuClearCache";

// Service Worker APIとCaches APIをモック化
const mockUnregister = vi.fn();
const mockGetRegistration = vi.fn();
const mockCachesKeys = vi.fn();
const mockCachesDelete = vi.fn();

// グローバルオブジェクトのモック
Object.defineProperty(global, "navigator", {
  value: {
    serviceWorker: {
      getRegistration: mockGetRegistration,
    },
  },
  writable: true,
});

Object.defineProperty(global, "caches", {
  value: {
    keys: mockCachesKeys,
    delete: mockCachesDelete,
  },
  writable: true,
});

// window.location.reloadをモック化
delete (window as any).location;
(window as any).location = { reload: vi.fn() };

describe("HeaderMenuClearCache", () => {
  const mockOnMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. メニュー項目がレンダリングされる
  it("キャッシュクリアのメニュー項目が表示される", () => {
    render(<HeaderMenuClearCache onMenuClose={mockOnMenuClose} />);
    // アイコンの存在確認（CachedIcon）
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. クリック時にService Workerが登録されている場合はunregisterが呼ばれる
  it("Service Workerが登録されている場合はunregisterが呼ばれる", async () => {
    mockGetRegistration.mockResolvedValue({
      unregister: mockUnregister,
    });
    mockCachesKeys.mockResolvedValue([]);

    render(<HeaderMenuClearCache onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(mockGetRegistration).toHaveBeenCalled();
      expect(mockUnregister).toHaveBeenCalled();
    });
  });

  // 3. クリック時にService Workerが未登録の場合はunregisterが呼ばれない
  it("Service Workerが未登録の場合はunregisterが呼ばれない", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockCachesKeys.mockResolvedValue([]);

    render(<HeaderMenuClearCache onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(mockGetRegistration).toHaveBeenCalled();
      expect(mockUnregister).not.toHaveBeenCalled();
    });
  });

  // 4. クリック時に全てのキャッシュが削除される
  it("クリックすると全てのキャッシュが削除される", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockCachesKeys.mockResolvedValue(["cache-1", "cache-2", "cache-3"]);
    mockCachesDelete.mockResolvedValue(true);

    render(<HeaderMenuClearCache onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(mockCachesKeys).toHaveBeenCalled();
      expect(mockCachesDelete).toHaveBeenCalledTimes(3);
      expect(mockCachesDelete).toHaveBeenCalledWith("cache-1");
      expect(mockCachesDelete).toHaveBeenCalledWith("cache-2");
      expect(mockCachesDelete).toHaveBeenCalledWith("cache-3");
    });
  });

  // 5. クリア完了後にonMenuCloseが呼ばれる
  it("キャッシュクリア完了後にonMenuCloseが呼ばれる", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockCachesKeys.mockResolvedValue([]);

    render(<HeaderMenuClearCache onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(mockOnMenuClose).toHaveBeenCalled();
    });
  });

  // 6. クリア完了後にwindow.location.reloadが呼ばれる
  it("キャッシュクリア完了後にページがリロードされる", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockCachesKeys.mockResolvedValue([]);

    render(<HeaderMenuClearCache onMenuClose={mockOnMenuClose} />);
    const menuItem = screen.getByRole("menuitem");

    fireEvent.click(menuItem);

    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});
