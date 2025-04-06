import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NoteEdit,
  NotePropertyDialog,
} from "../../../src/features/EditorView/NotePropertyDialog";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

describe("NotePropertyDialog", () => {
  beforeEach(() => {
    undoManager.clear();
  });
  it("NoteEdit:設定した通り値が変更される", () => {
    const note = new Note();
    note.index = 0;
    note.length = 480;
    note.lyric = "あ";
    note.notenum = 60;
    const resultNotes = NoteEdit(note, {
      length: 240,
      lyric: "い",
      notenum: 61,
      preutter: 1,
      overlap: 2,
      stp: 3,
      intensity: 10,
      velocity: 20,
      modulation: 30,
    });
    expect(resultNotes.index).toBe(0);
    expect(resultNotes.length).toBe(240);
    expect(resultNotes.lyric).toBe("い");
    expect(resultNotes.notenum).toBe(61);
    expect(resultNotes.preutter).toBe(1);
    expect(resultNotes.overlap).toBe(2);
    expect(resultNotes.stp).toBe(3);
    expect(resultNotes.intensity).toBe(10);
    expect(resultNotes.velocity).toBe(20);
    expect(resultNotes.modulation).toBe(30);
    //元のノートは不変
    expect(note.index).toBe(0);
    expect(note.length).toBe(480);
    expect(note.lyric).toBe("あ");
    expect(note.notenum).toBe(60);
    expect(note.preutter).toBe(undefined);
    expect(note.overlap).toBe(undefined);
    expect(note.stp).toBe(undefined);
    expect(note.intensity).toBe(undefined);
    expect(note.velocity).toBe(undefined);
    expect(note.modulation).toBe(undefined);

    const undoResult = undoManager.undo()[0];
    const redoResult = undoManager.redo()[0];
    expect(undoResult).toEqual(note);
    expect(redoResult).toEqual(resultNotes);
  });
  it("空のノートを渡すと初期値が描画され、ノートを渡すとノートの値で更新される", () => {
    const { rerender } = render(
      <NotePropertyDialog open={true} note={undefined} handleClose={() => {}} />
    );
    const lyricField = screen.getByRole("textbox", {
      name: /editor\.noteProperty\.lyric/i,
    });
    const lengthField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.length/i,
    });
    const notenumSelect = screen.getByRole("combobox");
    const preutterField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.preutter/i,
    });
    const overlapField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.overlap/i,
    });
    const stpField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.stp/i,
    });
    const intensitySlider = screen.getByRole("slider", {
      name: /editor\.noteProperty\.intensity/i,
    });
    const velocitySlider = screen.getByRole("slider", {
      name: /editor\.noteProperty\.velocity/i,
    });
    const modulationSlider = screen.getByRole("slider", {
      name: /editor\.noteProperty\.modulation/i,
    });
    //初期値の確認
    expect(lyricField).toHaveValue("あ");
    expect(lengthField).toHaveValue(480);
    expect(notenumSelect).toHaveTextContent("C4");
    expect(preutterField).toHaveValue(null);
    expect(overlapField).toHaveValue(null);
    expect(stpField).toHaveValue(null);
    expect(intensitySlider).toHaveAttribute("aria-valuenow", "100");
    expect(velocitySlider).toHaveAttribute("aria-valuenow", "100");
    expect(modulationSlider).toHaveAttribute("aria-valuenow", "0");
    //再描画用のノート
    const n = new Note();
    n.lyric = "い";
    n.length = 240;
    n.notenum = 61;
    n.preutter = 1;
    n.overlap = 2;
    n.stp = 3;
    n.intensity = 10;
    n.velocity = 20;
    n.modulation = 30;
    //再描画用
    rerender(
      <NotePropertyDialog open={true} note={n} handleClose={() => {}} />
    );
    //再描画後値が変わっていることを確認する。
    expect(lyricField).toHaveValue("い");
    expect(lengthField).toHaveValue(240);
    expect(notenumSelect).toHaveTextContent("C#4");
    expect(preutterField).toHaveValue(1);
    expect(overlapField).toHaveValue(2);
    expect(stpField).toHaveValue(3);
    expect(intensitySlider).toHaveAttribute("aria-valuenow", "10");
    expect(velocitySlider).toHaveAttribute("aria-valuenow", "20");
    expect(modulationSlider).toHaveAttribute("aria-valuenow", "30");
  });
  it("フォームの値変更し、実行ボタンをクリックすると変更が適用されダイアログが閉じる", async () => {
    const n = new Note();
    n.lyric = "い";
    n.length = 240;
    n.notenum = 61;
    n.preutter = 1;
    n.overlap = 2;
    n.stp = 3;
    n.intensity = 10;
    n.velocity = 20;
    n.modulation = 30;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const dialogCloseSpy = vi.fn();
    const { rerender } = render(
      <NotePropertyDialog open={true} note={n} handleClose={dialogCloseSpy} />
    );
    const user = userEvent.setup();
    const lyricField = screen.getByRole("textbox", {
      name: /editor\.noteProperty\.lyric/i,
    });
    const lengthField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.length/i,
    });
    const notenumSelect = screen.getByRole("combobox");
    const preutterField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.preutter/i,
    });
    const overlapField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.overlap/i,
    });
    const stpField = screen.getByRole("spinbutton", {
      name: /editor\.noteProperty\.stp/i,
    });
    const intensitySlider = screen.getByRole("slider", {
      name: /editor\.noteProperty\.intensity/i,
    });
    const velocitySlider = screen.getByRole("slider", {
      name: /editor\.noteProperty\.velocity/i,
    });
    const modulationSlider = screen.getByRole("slider", {
      name: /editor\.noteProperty\.modulation/i,
    });
    //編集前の値の確認
    expect(lyricField).toHaveValue("い");
    expect(lengthField).toHaveValue(240);
    expect(notenumSelect).toHaveTextContent("C#4");
    expect(preutterField).toHaveValue(1);
    expect(overlapField).toHaveValue(2);
    expect(stpField).toHaveValue(3);
    expect(intensitySlider).toHaveAttribute("aria-valuenow", "10");
    expect(velocitySlider).toHaveAttribute("aria-valuenow", "20");
    expect(modulationSlider).toHaveAttribute("aria-valuenow", "30");
    //各フォームの編集操作
    await user.clear(lyricField);
    await user.type(lyricField, "う");
    await user.clear(lengthField);
    await user.type(lengthField, "480");
    await user.click(notenumSelect);
    const option1 = await screen.findByRole("option", { name: /C4/i });
    await user.click(option1);
    await user.clear(preutterField);
    await user.type(preutterField, "5.1");
    await user.clear(overlapField);
    await user.type(overlapField, "-3.2");
    await user.clear(stpField);
    await user.type(stpField, "11");
    fireEvent.change(intensitySlider, { target: { value: "40" } });
    fireEvent.change(velocitySlider, { target: { value: "50" } });
    fireEvent.change(modulationSlider, { target: { value: "60" } });
    // 編集後の値の確認
    expect(lyricField).toHaveValue("う");
    expect(lengthField).toHaveValue(480);
    expect(notenumSelect).toHaveTextContent("C4");
    expect(preutterField).toHaveValue(5.1);
    expect(overlapField).toHaveValue(-3.2);
    expect(stpField).toHaveValue(11);
    expect(intensitySlider).toHaveAttribute("aria-valuenow", "40");
    expect(velocitySlider).toHaveAttribute("aria-valuenow", "50");
    expect(modulationSlider).toHaveAttribute("aria-valuenow", "60");
    //処理の実行
    const button = screen.getByRole("button", {
      name: /editor.noteProperty.submitButton/i,
    });
    fireEvent.click(button);
    //ダイアログが閉じているはず
    expect(dialogCloseSpy).toHaveBeenCalled();
    rerender(
      <NotePropertyDialog
        open={false}
        note={undefined}
        handleClose={dialogCloseSpy}
      />
    );
    // notesが更新されているはず
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes[0].lyric).toBe("う");
    expect(resultNotes[0].length).toBe(480);
    expect(resultNotes[0].notenum).toBe(60);
    expect(resultNotes[0].preutter).toBe(5.1);
    expect(resultNotes[0].overlap).toBe(-3.2);
    expect(resultNotes[0].stp).toBe(11);
    expect(resultNotes[0].intensity).toBe(40);
    expect(resultNotes[0].velocity).toBe(50);
    expect(resultNotes[0].modulation).toBe(60);
  });
});
