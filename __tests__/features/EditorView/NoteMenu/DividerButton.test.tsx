import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { DividerButton } from "../../../../src/features/EditorView/NoteMenu/DividerButton";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("DividerButton", () => {
  it("DividerButton:クリックすると、setDividerTargetIndexにindexが渡される", async () => {
    const store = useMusicProjectStore.getState();
    const setDividerTargetIndexSpy = vi.fn();
    render(
      <DividerButton
        setDividerTargetIndex={setDividerTargetIndexSpy}
        selectedNotesIndex={[0]}
      />
    );
    const button = await screen.findByTestId("DividerButton");
    await fireEvent.click(button);
    expect(setDividerTargetIndexSpy).toHaveBeenCalledWith(0);
  });
});
