import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import {
  TextTabContent,
  TextTabContentProps,
} from "../../../src/features/InfoVBDialog/TextTabContent";
import type { BaseVoiceBank } from "../../../src/lib/VoiceBanks/BaseVoiceBank";
import * as readService from "../../../src/services/readTextFile";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

// モック対象の snackbarStore
import { useSnackBarStore } from "../../../src/store/snackBarStore";

const createDummyVoiceBank = (): BaseVoiceBank =>
  ({
    loadRootFile: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  }) as unknown as BaseVoiceBank;

describe("TextTabContent", () => {
  let props: TextTabContentProps;
  let snackStore: ReturnType<typeof useSnackBarStore>;

  beforeEach(() => {
    // snackbarStore の初期化（必要なら setState を利用）
    useSnackBarStore.setState({
      open: false,
      value: "",
      severity: "info",
    });
    // spy を用意して、snackbar の setter が呼ばれるか確認する
    snackStore = useSnackBarStore.getState();
    vi.spyOn(snackStore, "setOpen");
    vi.spyOn(snackStore, "setValue");
    vi.spyOn(snackStore, "setSeverity");

    // デフォルトは正常なテキストを返すように設定
    vi.spyOn(readService, "readTextFile").mockResolvedValue("あいう\r\nえお");

    // props の初期値（Shift-JIS の場合）
    props = {
      filename: "test.txt",
      vb: createDummyVoiceBank(),
      encoding: EncodingOption.SHIFT_JIS,
    };
  });

  it("読み込み開始直後はLinearProgressが表示される", async () => {
    // 読み込み処理を遅延させるため、readTextFile を遅延するモックに変更
    vi.spyOn(readService, "readTextFile").mockImplementation(async () => {
      return new Promise((resolve) =>
        setTimeout(() => resolve("あいう\r\nえお"), 1000),
      );
    });

    render(<TextTabContent {...props} />);
    // 初期レンダリング直後は lines が undefined のため LinearProgress が表示される
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    // 1秒待って、テキストがレンダリングされるのを確認
    await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), {
      timeout: 1500,
    });
  });

  it("非同期処理が完了した場合はテキストが正しく分割されレンダリングされる", async () => {
    render(<TextTabContent {...props} />);
    // 非同期処理が完了するまで待つ
    await waitFor(() => expect(screen.getByText(/あいう/)).toBeInTheDocument());
    // 改行区切りで「あいう」と「えお」が表示されていることを確認
    const typography = screen.getByText(/あいう/i);
    expect(typography).toBeInTheDocument();
    expect(screen.getByText(/えお/)).toBeInTheDocument();
  });

  it("非同期処理でエラーが発生した場合はsnackbarのsetterが呼ばれ空配列がレンダリングされる", async () => {
    (props.vb!.loadRootFile as Mock).mockRejectedValue(new Error("fail"));

    render(<TextTabContent {...props} />);
    await waitFor(() => {
      // エラー発生後、snackbarStore の各 setter が呼ばれることを確認
      expect(snackStore.setSeverity).toHaveBeenCalledWith("error");
      expect(snackStore.setValue).toHaveBeenCalledWith(
        "infoVBDialog.TextTabContent.error",
      );
      expect(snackStore.setOpen).toHaveBeenCalledWith(true);
    });
    // 結果として、lines が [] となるので、テキスト表示部分は空となっているはず
    const typography = screen.getByTestId("text-content");
    expect(typography.textContent.trim()).toBe("");
  });

  it("props.textFileやprops.encodingが変更された場合はuseEffectが再実行される", async () => {
    const { rerender } = render(<TextTabContent {...props} />);
    // 初回レンダリングが完了するのを待つ
    await waitFor(() => expect(screen.getByText(/あいう/)).toBeInTheDocument());

    // 新たなテキストファイル（UTF-8 用）を用意
    const newVb = createDummyVoiceBank();
    // readTextFile のモックも新しいテキストを返すように変更
    vi.spyOn(readService, "readTextFile").mockResolvedValue("かきく\r\nけこ");

    // props.filename と encoding を変更して再レンダリング
    rerender(
      <TextTabContent
        filename="new.txt"
        vb={newVb}
        encoding={EncodingOption.UTF8}
      />,
    );
    // 新しい内容がレンダリングされるのを待つ
    await waitFor(() => expect(screen.getByText(/かきく/)).toBeInTheDocument());
    expect(screen.getByText(/けこ/)).toBeInTheDocument();
  });

  it("音源がnullの場合は空配列が設定される", async () => {
    const nullProps: TextTabContentProps = {
      filename: "test.txt",
      vb: null,
      encoding: EncodingOption.SHIFT_JIS,
    };
    render(<TextTabContent {...nullProps} />);

    // textFileがnullの場合、lines が [] となるので、テキスト表示部分は空
    const typography = screen.getByTestId("text-content");
    expect(typography.textContent.trim()).toBe("");
  });
});
