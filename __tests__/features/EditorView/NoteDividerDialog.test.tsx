import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  noteDivide,
  NoteDividerDialog,
} from "../../../src/features/EditorView/NoteDividerDialog";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

describe("NotesDividerDialog", () => {
  const createNotes = (): Note[] => {
    const notes = new Array();
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.forEach((n, i) => {
      n.index = i;
      n.length = 480;
      n.notenum = 60 + i;
      n.lyric = "あ";
      n.hasTempo = false;
      n.tempo = 120;
    });
    return notes;
  };
  beforeEach(() => {
    undoManager.clear();
  });

  it("noteDivide:選択したノートを分割する", () => {
    const notes = createNotes();
    const resultNotes = noteDivide(notes, 1, 360);
    //分割前のノートと分割後のノートは長さ以外同じ
    expect(resultNotes[1].length).toBe(360);
    expect(resultNotes[2].length).toBe(120);
    expect(resultNotes[1].index).toBe(resultNotes[2].index);
    expect(resultNotes[1].notenum).toBe(resultNotes[2].notenum);
    expect(resultNotes[1].lyric).toBe(resultNotes[2].lyric);
    //対象以外のノートはそのまま
    expect(resultNotes[0]).toEqual(notes[0]);
    expect(resultNotes[3]).toEqual(notes[2]);
    expect(resultNotes[4]).toEqual(notes[3]);
    expect(resultNotes[5]).toEqual(notes[4]);
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(notes).toEqual(undoResult);
    expect(resultNotes).toEqual(redoResult);
  });

  it("dialogが開き、初期値はノート長の半分。実行ボタンを押すとノートが分割され、ダイアログを閉じる", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const dialogCloseSpy = vi.fn();
    render(
      <NoteDividerDialog
        open={true}
        noteIndex={1}
        handleClose={dialogCloseSpy}
      />
    );
    const slider = screen.getByLabelText("editor.noteDividerDialog.divider");
    expect(Number(slider.getAttribute("aria-valuenow"))).toBe(240);
    const button = screen.getByRole("button", {
      name: /editor.noteDividerDialog.submitButton/i,
    });
    fireEvent.click(button);
    expect(dialogCloseSpy).toHaveBeenCalled();
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes[1].length).toBe(240);
    expect(resultNotes[2].length).toBe(240);
    expect(resultNotes[1].notenum).toBe(resultNotes[2].notenum);
    expect(resultNotes[1].lyric).toBe(resultNotes[2].lyric);
  });

  it("dialogが開き、sliderを操作すると値が変更される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const dialogCloseSpy = vi.fn();
    render(
      <NoteDividerDialog
        open={true}
        noteIndex={1}
        handleClose={dialogCloseSpy}
      />
    );
    const slider = screen.getByLabelText("editor.noteDividerDialog.divider");
    expect(Number(slider.getAttribute("aria-valuenow"))).toBe(240);
    fireEvent.change(slider, { target: { value: 50 } });
    expect(Number(slider.getAttribute("aria-valuenow"))).toBe(50);
  });
});
