import { createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import JSZip from "jszip";
import React from "react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  LoadVBDialog,
  LoadVBDialogProps,
} from "../../../src/features/LoadVBDialog/LoadVBDialog";
import i18n from "../../../src/i18n/configs";
import * as VoiceBankModule from "../../../src/lib/VoiceBanks/VoiceBank";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

// JSZip のモック
vi.mock("jszip");
vi.mock("../../../src/lib/VoiceBanks/VoiceBank", () => ({
  VoiceBank: vi.fn(),
}));
const VoiceBankMock = VoiceBankModule.VoiceBank as unknown as Mock;
// useMusicProjectStore のモック
const mockSetVb = vi.fn();
vi.mock("../../../src/store/musicProjectStore", () => ({
  useMusicProjectStore: () => ({
    setVb: mockSetVb,
  }),
}));
const mockSetOpen = vi.fn();
const mockSetValue = vi.fn();
const mockSetSeverity = vi.fn();
vi.mock("../../../src/store/snackBarStore", () => ({
  useSnackBarStore: () => ({
    setOpen: mockSetOpen,
    setValue: mockSetValue,
    setSeverity: mockSetSeverity,
  }),
}));

// テスト用のダミーファイル
const dummyFile = new File(["dummy content"], "dummy.zip", {
  type: "application/zip",
});
describe("LoadVBDialog", () => {
  let props: LoadVBDialogProps;
  beforeEach(() => {
    vi.resetModules();
    props = {
      readFile: dummyFile,
      dialogOpen: true,
      setProcessing: vi.fn(),
      setReadFile: vi.fn(),
      setDialogOpen: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("readFileがnullの場合、ダイアログは表示されない", () => {
    props.readFile = null;
    render(<LoadVBDialog {...props} />);
    // ダイアログのopen条件は props.dialogOpen && readFile !== null のため
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("readFileが設定された場合、JSZip.loadAsyncが呼ばれてzipFilesが更新される", async () => {
    // fakeなzipファイル群を用意
    const fakeFiles = { "file1.txt": { name: "file1.txt" } };
    const loadAsyncMock = vi.fn().mockResolvedValue({ files: fakeFiles });
    (JSZip as unknown as any).mockImplementation(() => ({
      loadAsync: loadAsyncMock,
    }));

    render(<LoadVBDialog {...props} />);
    // useEffectで loadZip が呼ばれるので loadAsyncMock の呼び出しを待つ
    await waitFor(() => {
      expect(loadAsyncMock).toHaveBeenCalled();
    });
    // 内部状態が更新され、FileListにファイル名が表示されるはず
    expect(await screen.findByText("file1.txt")).toBeInTheDocument();
  });

  it("handleCloseが呼ばれると、setDialogOpenとsetProcessingがfalseになる", () => {
    render(<LoadVBDialog {...props} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(props.setDialogOpen).toHaveBeenCalledWith(false);
    expect(props.setProcessing).toHaveBeenCalledWith(false);
  });

  it("handleButtonClick成功パターン：VoiceBank.initializeが成功し、setVb, setDialogOpen, setProcessingが呼ばれる", async () => {
    const fakeVoiceBank = {
      initialize: vi.fn().mockResolvedValue(undefined),
    };

    // VoiceBank のモック実装を上書きする
    VoiceBankMock.mockImplementation(() => fakeVoiceBank);

    render(<LoadVBDialog {...props} />);
    // ※ここでは、内部状態zipFilesの読込が完了するのを待つ
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );
    // ボタンを取得してクリック
    const button = screen.getByRole("button", { name: /OK/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(fakeVoiceBank.initialize).toHaveBeenCalled();
    });
    expect(mockSetVb).toHaveBeenCalled();
    expect(props.setDialogOpen).toHaveBeenCalledWith(false);
    expect(props.setProcessing).toHaveBeenCalledWith(false);
  });
  it("handleButtonClickエラーパターン：VoiceBank.initializeが失敗した場合、snackBarが呼び出され、ダイアログと処理状態が更新される", async () => {
    const fakeVoiceBank = {
      initialize: vi.fn().mockRejectedValue(new Error("fail")),
    };

    // VoiceBank のモック実装を上書きする
    VoiceBankMock.mockImplementation(() => fakeVoiceBank);

    render(<LoadVBDialog {...props} />);
    // ※ここでは、内部状態zipFilesの読込が完了するのを待つ
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );
    // ボタンを取得してクリック
    const button = screen.getByRole("button", { name: /OK/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(fakeVoiceBank.initialize).toHaveBeenCalled();
    });
    expect(props.setDialogOpen).toHaveBeenCalledWith(false);
    expect(props.setProcessing).toHaveBeenCalledWith(false);

    await waitFor(() => expect(mockSetOpen).toHaveBeenCalledWith(true));
    await waitFor(() =>
      expect(mockSetValue).toHaveBeenCalledWith(
        "読込失敗しました。このファイルはUTAU音源ではありません。"
      )
    );
    await waitFor(() => expect(mockSetSeverity).toHaveBeenCalledWith("error"));
  });
});
