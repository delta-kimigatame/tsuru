import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectSettingDialog } from "../../../src/features/EditorView/ProjectSettingDialog";
import { undoManager } from "../../../src/lib/UndoManager";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
describe("ProjectSettingDialog", () => {
  beforeEach(() => {
    undoManager.clear();
    vi.restoreAllMocks();
  });
  it("ustTempoとustFlagsの値が初期表示される", () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([]);
    store.setUstTempo(150);
    store.setUstFlags("B50");
    const handleCloseSpy = vi.fn();
    render(<ProjectSettingDialog open={true} handleClose={handleCloseSpy} />);
    const flagsField = screen.getByRole("textbox", {
      name: /editor\.ustSetting\.flags/i,
    });
    const tempoField = screen.getByRole("spinbutton", {
      name: /editor\.ustSetting\.tempo/i,
    });
    expect(flagsField).toHaveValue("B50");
    expect(tempoField).toHaveValue(150);
  });
  it("ustTempoの変更", async () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([]);
    store.setUstTempo(150);
    store.setUstFlags("B50");
    const handleCloseSpy = vi.fn();
    render(<ProjectSettingDialog open={true} handleClose={handleCloseSpy} />);
    const tempoField = screen.getByRole("spinbutton", {
      name: /editor\.ustSetting\.tempo/i,
    });
    const user = userEvent.setup();
    await user.clear(tempoField);
    await user.type(tempoField, "180");
    expect(tempoField).toHaveValue(180);
  });
  it("ustFlagsの変更", async () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([]);
    store.setUstTempo(150);
    store.setUstFlags("B50");
    const handleCloseSpy = vi.fn();
    render(<ProjectSettingDialog open={true} handleClose={handleCloseSpy} />);
    const flagsField = screen.getByRole("textbox", {
      name: /editor\.ustSetting\.flags/i,
    });
    const user = userEvent.setup();
    await user.clear(flagsField);
    await user.type(flagsField, "g-5");
    expect(flagsField).toHaveValue("g-5");
  });
  it("実行ボタンの動作", async () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([]);
    store.setUstTempo(150);
    store.setUstFlags("B50");
    const handleCloseSpy = vi.fn();
    render(<ProjectSettingDialog open={true} handleClose={handleCloseSpy} />);
    const flagsField = screen.getByRole("textbox", {
      name: /editor\.ustSetting\.flags/i,
    });
    const tempoField = screen.getByRole("spinbutton", {
      name: /editor\.ustSetting\.tempo/i,
    });
    const user = userEvent.setup();
    await user.clear(tempoField);
    await user.type(tempoField, "180");
    await user.clear(flagsField);
    await user.type(flagsField, "g-5");
    const button = screen.getByRole("button", {
      name: /editor\.ustSetting\.submitButton/i,
    });
    fireEvent.click(button);
    //ダイアログが閉じているはず
    expect(handleCloseSpy).toHaveBeenCalled();
    //グローバルな値が更新されているはず
    const resultFlags = useMusicProjectStore.getState().ustFlags;
    const resultTempo = useMusicProjectStore.getState().ustTempo;
    expect(resultFlags).toBe("g-5");
    expect(resultTempo).toBe(180);
  });
});
