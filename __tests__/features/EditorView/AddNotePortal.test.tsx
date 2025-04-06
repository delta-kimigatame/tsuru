import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddNotePortal } from "../../../src/features/EditorView/AddNotePortal";

describe("AddNotePortal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("AddNotePortal:fabをクリックすると、setAddNoteLyricが呼ばれる。あ→R", async () => {
    const addNoteLyricSpy = vi.fn();
    render(
      <AddNotePortal
        addNoteLength={480}
        setAddNoteLength={() => {}}
        addNoteLyric="あ"
        setAddNoteLyric={addNoteLyricSpy}
      />
    );
    const button = await screen.findByTestId("addNoteLyricFab");
    fireEvent.click(button);
    expect(addNoteLyricSpy).toHaveBeenCalledWith("R");
  });
  it("AddNotePortal:fabをクリックすると、setAddNoteLyricが呼ばれる。R→あ", async () => {
    const addNoteLyricSpy = vi.fn();
    render(
      <AddNotePortal
        addNoteLength={480}
        setAddNoteLength={() => {}}
        addNoteLyric="R"
        setAddNoteLyric={addNoteLyricSpy}
      />
    );
    const button = await screen.findByTestId("addNoteLyricFab");
    fireEvent.click(button);
    expect(addNoteLyricSpy).toHaveBeenCalledWith("あ");
  });
  it("AddNotePortal:selectを変更すると、setAddNoteLengthが呼ばれる。", async () => {
    const addNoteLengthSpy = vi.fn();
    const user = userEvent.setup();
    render(
      <AddNotePortal
        addNoteLength={480}
        setAddNoteLength={addNoteLengthSpy}
        addNoteLyric="R"
        setAddNoteLyric={() => {}}
      />
    );
    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const length960 = await screen.findByRole("option", {
      name: "editor.noteAddPortal.length960",
    });
    await user.click(length960);
    expect(addNoteLengthSpy).toHaveBeenCalledWith(960);
  });
});
