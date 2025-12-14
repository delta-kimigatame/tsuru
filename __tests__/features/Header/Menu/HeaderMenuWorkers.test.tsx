import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMenuWorkers } from "../../../../src/features/Header/Menu/HeaderMenuWorkers";
import { useCookieStore } from "../../../../src/store/cookieStore";

describe("HeaderMenuWorkers", () => {
  const mockOnMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCookieStore.setState({ workersCount: 4 });
  });

  // 1. メニュー項目がレンダリングされる
  it("ワーカー数選択のメニュー項目が表示される", () => {
    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);
    expect(screen.getByRole("menuitem")).toBeInTheDocument();
  });

  // 2. Selectコンポーネントが表示される
  it("Selectコンポーネントが表示される", () => {
    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);
    const select = screen.getByTestId("workersCount-select");
    expect(select).toBeInTheDocument();
  });

  // 3. 現在のworkersCountが選択されている
  it("現在のworkersCountが選択されている", () => {
    useCookieStore.setState({ workersCount: 5 });
    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);

    const select = screen.getByTestId("workersCount-select");
    // eslint-disable-next-line testing-library/no-node-access
    const input = select.querySelector("input");
    expect(input?.value).toBe("5");
  });

  // 4. Select変更時にsetWorkersCountが呼ばれる
  it("Select変更時にsetWorkersCountが呼ばれる", async () => {
    const setWorkersCountSpy = vi.spyOn(
      useCookieStore.getState(),
      "setWorkersCount"
    );

    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);
    const select = screen.getByTestId("workersCount-select");

    // comboboxをクリックして開く
    // eslint-disable-next-line testing-library/no-node-access
    const combobox = select.querySelector('[role="combobox"]');
    if (combobox) {
      fireEvent.mouseDown(combobox);

      // 7のオプションをクリック
      const option7 = await screen.findByRole("option", { name: "7" });
      fireEvent.click(option7);

      expect(setWorkersCountSpy).toHaveBeenCalledWith(7);
    }
  });

  // 5. Select変更時にonMenuCloseが呼ばれる
  it("Select変更時にonMenuCloseが呼ばれる", async () => {
    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);
    const select = screen.getByTestId("workersCount-select");

    // comboboxをクリックして開く
    // eslint-disable-next-line testing-library/no-node-access
    const combobox = select.querySelector('[role="combobox"]');
    if (combobox) {
      fireEvent.mouseDown(combobox);

      // 3のオプションをクリック
      const option3 = await screen.findByRole("option", { name: "3" });
      fireEvent.click(option3);

      expect(mockOnMenuClose).toHaveBeenCalled();
    }
  });

  // 6. 1から9までの選択肢が表示される
  it("1から9までの選択肢が用意されている", async () => {
    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);
    const select = screen.getByTestId("workersCount-select");

    // Selectを開く (comboboxをクリック)
    // eslint-disable-next-line testing-library/no-node-access
    const combobox = select.querySelector('[role="combobox"]');
    if (combobox) {
      fireEvent.mouseDown(combobox);
    }

    // 1から9までのオプションが存在することを確認
    for (let i = 1; i <= 9; i++) {
      expect(
        await screen.findByRole("option", { name: i.toString() })
      ).toBeInTheDocument();
    }
  });

  // 7. parseInt処理が正しく動作する（文字列→数値変換）
  it("Select値が文字列から数値に変換される", async () => {
    const setWorkersCountSpy = vi.spyOn(
      useCookieStore.getState(),
      "setWorkersCount"
    );

    render(<HeaderMenuWorkers onMenuClose={mockOnMenuClose} />);
    const select = screen.getByTestId("workersCount-select");

    // comboboxをクリックして開く
    // eslint-disable-next-line testing-library/no-node-access
    const combobox = select.querySelector('[role="combobox"]');
    if (combobox) {
      fireEvent.mouseDown(combobox);

      // 9のオプションをクリック
      const option9 = await screen.findByRole("option", { name: "9" });
      fireEvent.click(option9);

      // setWorkersCountには数値9が渡される（文字列"9"ではない）
      expect(setWorkersCountSpy).toHaveBeenCalledWith(9);
      expect(typeof setWorkersCountSpy.mock.calls[0][0]).toBe("number");
    }
  });
});
