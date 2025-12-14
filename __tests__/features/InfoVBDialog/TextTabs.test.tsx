import { fireEvent, render, waitFor } from "@testing-library/react";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import {
  TextTabs,
  TextTabsProps,
  filterRule,
} from "../../../src/features/InfoVBDialog/TextTabs";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

// ヘルパー関数: ダミーの JSZip オブジェクトを作成する
const createDummyZipFiles = (files: {
  [key: string]: string;
}): { [key: string]: JSZip.JSZipObject } => {
  const zip = new JSZip();
  Object.entries(files).forEach(([filename, content]) => {
    // 中身は minimal な文字列ファイルとして作成
    zip.file(filename, new File([content], filename, { type: "text/plain" }));
  });
  return zip.files;
};

describe("TextTabs", () => {
  // 1. filterRule のテスト
  describe("filterRule", () => {
    it("character.txtとinstall.txtとreadme.txtは除外される", () => {
      expect(filterRule("character.txt")).toBe(false);
      expect(filterRule("install.txt")).toBe(false);
      expect(filterRule("readme.txt")).toBe(false);
    });
    it("その他の.txtファイルは通過する", () => {
      expect(filterRule("a.txt")).toBe(true);
      expect(filterRule("sample.txt")).toBe(true);
    });
  });

  // 2. useMemo による textFileList の算出の検証
  it("props.zipFilesを与えた場合はtextFileListが正しく算出される", () => {
    // 以下のファイルが zipFiles に含まれるとする:
    // "readme.txt", "a.txt", "b.txt", "character.txt", "install.txt"
    const dummyFiles = createDummyZipFiles({
      "readme.txt": "R",
      "a.txt": "A",
      "b.txt": "B",
      "character.txt": "C",
      "install.txt": "I",
    });
    // TextTabs では、filterRule で "readme.txt", "character.txt", "install.txt" は除外され、
    // ただし readme.txt が存在すれば先頭に unshift されるので、期待される一覧は:
    // ["readme.txt", "a.txt", "b.txt"]
    const props: TextTabsProps = {
      zipFiles: dummyFiles,
      encoding: EncodingOption.SHIFT_JIS,
    };
    const { container } = render(<TextTabs {...props} />);
    // タブのラベルが正しく表示されているか検証
    // findAllByRole で取得する場合、タブが配列で返るので、それをソートして比較
    const tabs = container.querySelectorAll('[role="tab"]');
    const tabLabels = Array.from(tabs).map((tab) => tab.textContent?.trim());
    expect(tabLabels.sort()).toEqual(["readme.txt", "a.txt", "b.txt"].sort());
  });

  // 3. props.zipFiles の変更により、textFileList が再計算されるかの検証
  it("zipFilesの内容が変わった場合はtextFileListが再計算される", async () => {
    // 初期値: normalZipFiles = {"readme.txt", "a.txt"}
    const normalZipFiles = createDummyZipFiles({
      "readme.txt": "R",
      "a.txt": "A",
    });
    const props: TextTabsProps = {
      zipFiles: normalZipFiles,
      encoding: EncodingOption.SHIFT_JIS,
    };
    const { rerender, container } = render(<TextTabs {...props} />);
    let tabs = container.querySelectorAll('[role="tab"]');
    let tabLabels = Array.from(tabs).map((tab) => tab.textContent?.trim());
    expect(tabLabels.sort()).toEqual(["readme.txt", "a.txt"].sort());

    // 新たな zipFiles: {"readme.txt", "a.txt", "b.txt"}
    const newZipFiles = createDummyZipFiles({
      "readme.txt": "R",
      "a.txt": "A",
      "b.txt": "B",
    });
    rerender(
      <TextTabs zipFiles={newZipFiles} encoding={EncodingOption.SHIFT_JIS} />
    );
    await waitFor(() => {
      tabs = container.querySelectorAll('[role="tab"]');
      tabLabels = Array.from(tabs).map((tab) => tab.textContent?.trim());
      expect(tabLabels.sort()).toEqual(["readme.txt", "a.txt", "b.txt"].sort());
    });
  });

  // 4. handleChange が呼ばれた際、value の state が更新されるか（タブ切替のロジック）
  it("タブを切り替えた場合は内部stateが更新される", async () => {
    const dummyFiles = createDummyZipFiles({
      "readme.txt": "R",
      "a.txt": "A",
      "b.txt": "B",
    });
    const props: TextTabsProps = {
      zipFiles: dummyFiles,
      encoding: EncodingOption.SHIFT_JIS,
    };
    const { container } = render(<TextTabs {...props} />);
    // 初期状態では value は 0、すなわち "readme.txt" タブが選択されているはず
    // タブをクリックして切り替える
    const tabs = container.querySelectorAll('[role="tab"]');
    // a.txt タブは index 1
    fireEvent.click(tabs[1]);
    // コンポーネント内で useState が更新され、対応する TabPanel が表示されるはず
    // ここでは、TextTabContent のコンテンツとして "R", "A", "B" のいずれかが表示されるので、
    // a.txt の内容 "A" が表示されるかどうかを確認（TextTabContent 自体のテストで内容を確認している前提）
    // ※TextTabContent の実装によっては、DOM の変化を確認する方法が異なるかもしれません
    await waitFor(() => {
      expect(container.textContent).toContain("A");
    });
  });

  // 5. 各タブの key と、TextTabContent に渡される props の確認
  it("各タブに渡されるTextTabContentのpropsが期待通りである", async () => {
    // テスト用に各テキストファイルの内容として、一文字の識別子を入れる
    const zipFiles = createDummyZipFiles({
      "readme.txt": "R",
      "a.txt": "A",
      "b.txt": "B",
    });
    const props: TextTabsProps = {
      zipFiles,
      encoding: EncodingOption.SHIFT_JIS,
    };
    const { container } = render(<TextTabs {...props} />);
    await waitFor(() => {
      expect(container.textContent).toContain("R");
    });
    const tabs = container.querySelectorAll('[role="tab"]');
    fireEvent.click(tabs[1]);
    await waitFor(() => {
      expect(container.textContent).toContain("A");
    });
    fireEvent.click(tabs[2]);
    await waitFor(() => {
      expect(container.textContent).toContain("B");
    });
  });

  // 6. textFileListがundefinedの場合のテスト
  it("zipFilesとfilesが両方nullの場合はテキストファイルが見つかりませんと表示される", () => {
    const props: TextTabsProps = {
      zipFiles: null,
      files: null,
      encoding: EncodingOption.SHIFT_JIS,
    };
    const { getByText } = render(<TextTabs {...props} />);
    expect(getByText(/infoVBDialog\.TextTabs\.notFound/i)).toBeInTheDocument();
  });
});
