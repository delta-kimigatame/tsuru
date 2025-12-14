import useMediaQuery from "@mui/material/useMediaQuery";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { useThemeMode } from "../../src/hooks/useThemeMode";
import { useCookieStore } from "../../src/store/cookieStore";

vi.mock("../../src/store/cookieStore", () => ({
  useCookieStore: vi.fn(),
}));

vi.mock("@mui/material/useMediaQuery", () => ({
  default: vi.fn(),
}));

describe("useThemeMode", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  it("system設定でダークモードの場合darkになる", () => {
    (useCookieStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: "system",
    });
    (useMediaQuery as Mock).mockReturnValue(true);
    const { result } = renderHook(() => useThemeMode());
    expect(result.current).toBe("dark");
  });
  it("system設定でライトモードの場合lightになる", () => {
    (useCookieStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: "system",
    });
    (useMediaQuery as Mock).mockReturnValue(false);
    const { result } = renderHook(() => useThemeMode());
    expect(result.current).toBe("light");
  });
  it("dark設定の場合darkになる", () => {
    (useCookieStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: "dark",
    });
    (useMediaQuery as Mock).mockReturnValue(false);
    const { result } = renderHook(() => useThemeMode());
    expect(result.current).toBe("dark");
  });
  it("light設定の場合lightになる", () => {
    (useCookieStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: "light",
    });
    (useMediaQuery as Mock).mockReturnValue(true);
    const { result } = renderHook(() => useThemeMode());
    expect(result.current).toBe("light");
  });
});
