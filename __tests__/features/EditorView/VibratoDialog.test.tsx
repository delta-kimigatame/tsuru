import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  VibratoDialog,
  VibratoEdit,
} from "../../../src/features/EditorView/VibratoDialog";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { Ust } from "../../../src/lib/Ust";
import { BaseVoiceBank } from "../../../src/lib/VoiceBanks/BaseVoiceBank";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

describe("VibratoDialog", () => {
  beforeEach(() => {
    undoManager.clear();
    const store = useMusicProjectStore.getState();
    const mockVb = {
      getOtoRecord: vi.fn().mockReturnValue({}),
    } as unknown as BaseVoiceBank;
    store.setVb(mockVb);
  });
  it("VibratoEdit:useVibratoがtrueの場合、値を更新する", () => {
    const n = new Note();
    n.vibrato = "50,120,40,35,45,1,8,0";
    const resultNote = VibratoEdit(
      n,
      {
        length: 60,
        cycle: 180,
        depth: 50,
        fadeInTime: 40,
        fadeOutTime: 50,
        phase: 2,
        height: -1,
      },
      true
    );
    expect(resultNote.vibrato.length).toBe(60);
    expect(resultNote.vibrato.cycle).toBe(180);
    expect(resultNote.vibrato.depth).toBe(50);
    expect(resultNote.vibrato.fadeInTime).toBe(40);
    expect(resultNote.vibrato.fadeOutTime).toBe(50);
    expect(resultNote.vibrato.phase).toBe(2);
    expect(resultNote.vibrato.height).toBe(-1);
    const undoNotes = undoManager.undo();
    const redoNotes = undoManager.redo();
    expect(undoNotes).toEqual([n]);
    expect(redoNotes).toEqual([resultNote]);
  });
  it("VibratoEdit:useVibratoがfalseの場合、undefinedにする", () => {
    const n = new Note();
    n.vibrato = "50,120,40,35,45,1,8,0";
    const resultNote = VibratoEdit(
      n,
      {
        length: 60,
        cycle: 180,
        depth: 50,
        fadeInTime: 40,
        fadeOutTime: 50,
        phase: 2,
        height: -1,
      },
      false
    );
    expect(resultNote.vibrato).toBe(undefined);
    const undoNotes = undoManager.undo();
    const redoNotes = undoManager.redo();
    expect(undoNotes).toEqual([n]);
    expect(redoNotes).toEqual([resultNote]);
  });
  it("VibratoDialog:noteがundefinedの場合の初期値", () => {
    const dialogCloseSpy = vi.fn();
    render(
      <VibratoDialog
        open={true}
        note={undefined}
        handleClose={dialogCloseSpy}
      />
    );
    const useVibratoSwitch = screen.getAllByRole("checkbox", {
      name: /useVibrato/i,
    })[0];
    const lengthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.length/i,
    });
    const cycleSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.cycle/i,
    });
    const depthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.depth/i,
    });
    const fadeInTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeInTime/i,
    });
    const fadeOutTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeOutTime/i,
    });
    const phaseSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.phase/i,
    });
    const heightSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.height/i,
    });
    expect(useVibratoSwitch).not.toBeChecked();
    expect(lengthSlider).toHaveAttribute("aria-valuenow", "65");
    expect(cycleSlider).toHaveAttribute("aria-valuenow", "180");
    expect(depthSlider).toHaveAttribute("aria-valuenow", "35");
    expect(fadeInTimeSlider).toHaveAttribute("aria-valuenow", "20");
    expect(fadeOutTimeSlider).toHaveAttribute("aria-valuenow", "20");
    expect(phaseSlider).toHaveAttribute("aria-valuenow", "0");
    expect(heightSlider).toHaveAttribute("aria-valuenow", "0");
  });
  it("VibratoDialog:noteのビブラートが設定されていない場合", () => {
    const dialogCloseSpy = vi.fn();
    render(
      <VibratoDialog
        open={true}
        note={new Note()}
        handleClose={dialogCloseSpy}
      />
    );
    const useVibratoSwitch = screen.getAllByRole("checkbox", {
      name: /useVibrato/i,
    })[0];
    const lengthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.length/i,
    });
    const cycleSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.cycle/i,
    });
    const depthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.depth/i,
    });
    const fadeInTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeInTime/i,
    });
    const fadeOutTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeOutTime/i,
    });
    const phaseSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.phase/i,
    });
    const heightSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.height/i,
    });
    expect(useVibratoSwitch).not.toBeChecked();
    expect(lengthSlider).toHaveAttribute("aria-valuenow", "65");
    expect(cycleSlider).toHaveAttribute("aria-valuenow", "180");
    expect(depthSlider).toHaveAttribute("aria-valuenow", "35");
    expect(fadeInTimeSlider).toHaveAttribute("aria-valuenow", "20");
    expect(fadeOutTimeSlider).toHaveAttribute("aria-valuenow", "20");
    expect(phaseSlider).toHaveAttribute("aria-valuenow", "0");
    expect(heightSlider).toHaveAttribute("aria-valuenow", "0");
  });
  it("VibratoDialog:noteのビブラートが設定されている場合", () => {
    const n = new Note();
    n.vibrato = "50,120,40,35,45,1,8,0";
    const dialogCloseSpy = vi.fn();
    render(<VibratoDialog open={true} note={n} handleClose={dialogCloseSpy} />);
    const useVibratoSwitch = screen.getAllByRole("checkbox", {
      name: /useVibrato/i,
    })[0];
    const lengthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.length/i,
    });
    const cycleSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.cycle/i,
    });
    const depthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.depth/i,
    });
    const fadeInTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeInTime/i,
    });
    const fadeOutTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeOutTime/i,
    });
    const phaseSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.phase/i,
    });
    const heightSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.height/i,
    });
    expect(useVibratoSwitch).toBeChecked();
    expect(lengthSlider).toHaveAttribute("aria-valuenow", "50");
    expect(cycleSlider).toHaveAttribute("aria-valuenow", "120");
    expect(depthSlider).toHaveAttribute("aria-valuenow", "40");
    expect(fadeInTimeSlider).toHaveAttribute("aria-valuenow", "35");
    expect(fadeOutTimeSlider).toHaveAttribute("aria-valuenow", "45");
    expect(phaseSlider).toHaveAttribute("aria-valuenow", "1");
    expect(heightSlider).toHaveAttribute("aria-valuenow", "8");
  });
  it("VibratoDialog:フォームの変更", () => {
    const dialogCloseSpy = vi.fn();
    render(
      <VibratoDialog
        open={true}
        note={new Note()}
        handleClose={dialogCloseSpy}
      />
    );
    const useVibratoSwitch = screen.getAllByRole("checkbox", {
      name: /useVibrato/i,
    })[0];
    const lengthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.length/i,
    });
    const cycleSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.cycle/i,
    });
    const depthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.depth/i,
    });
    const fadeInTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeInTime/i,
    });
    const fadeOutTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeOutTime/i,
    });
    const phaseSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.phase/i,
    });
    const heightSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.height/i,
    });
    fireEvent.click(useVibratoSwitch);
    fireEvent.change(lengthSlider, { target: { value: "50" } });
    fireEvent.change(cycleSlider, { target: { value: "170" } });
    fireEvent.change(depthSlider, { target: { value: "33" } });
    fireEvent.change(fadeInTimeSlider, { target: { value: "30" } });
    fireEvent.change(fadeOutTimeSlider, { target: { value: "40" } });
    fireEvent.change(phaseSlider, { target: { value: "10" } });
    fireEvent.change(heightSlider, { target: { value: "-50" } });
    expect(useVibratoSwitch).toBeChecked();
    expect(lengthSlider).toHaveAttribute("aria-valuenow", "50");
    expect(cycleSlider).toHaveAttribute("aria-valuenow", "170");
    expect(depthSlider).toHaveAttribute("aria-valuenow", "33");
    expect(fadeInTimeSlider).toHaveAttribute("aria-valuenow", "30");
    expect(fadeOutTimeSlider).toHaveAttribute("aria-valuenow", "40");
    expect(phaseSlider).toHaveAttribute("aria-valuenow", "10");
    expect(heightSlider).toHaveAttribute("aria-valuenow", "-50");
  });
  it("VibratoDialog:実行によりvibratoが設定される", () => {
    const n = new Note();
    n.index = 0;
    n.lyric = "あ";
    n.notenum = 60;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);

    const dialogCloseSpy = vi.fn();
    render(<VibratoDialog open={true} note={n} handleClose={dialogCloseSpy} />);
    const useVibratoSwitch = screen.getAllByRole("checkbox", {
      name: /useVibrato/i,
    })[0];
    const lengthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.length/i,
    });
    const cycleSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.cycle/i,
    });
    const depthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.depth/i,
    });
    const fadeInTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeInTime/i,
    });
    const fadeOutTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeOutTime/i,
    });
    const phaseSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.phase/i,
    });
    const heightSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.height/i,
    });
    const button = screen.getByRole("button", {
      name: /editor\.vibratoDialog\.submitButton/i,
    });
    fireEvent.click(useVibratoSwitch);
    fireEvent.change(lengthSlider, { target: { value: "50" } });
    fireEvent.change(cycleSlider, { target: { value: "170" } });
    fireEvent.change(depthSlider, { target: { value: "33" } });
    fireEvent.change(fadeInTimeSlider, { target: { value: "30" } });
    fireEvent.change(fadeOutTimeSlider, { target: { value: "40" } });
    fireEvent.change(phaseSlider, { target: { value: "10" } });
    fireEvent.change(heightSlider, { target: { value: "-50" } });
    fireEvent.click(button);
    expect(useVibratoSwitch).toBeChecked();
    expect(dialogCloseSpy).toHaveBeenCalled();
    const resultNote = useMusicProjectStore.getState().notes[0];
    expect(n).not.toEqual(resultNote);
    expect(resultNote.vibrato.length).toBe(50);
    expect(resultNote.vibrato.cycle).toBe(170);
    expect(resultNote.vibrato.depth).toBe(33);
    expect(resultNote.vibrato.fadeInTime).toBe(30);
    expect(resultNote.vibrato.fadeOutTime).toBe(40);
    expect(resultNote.vibrato.phase).toBe(10);
    expect(resultNote.vibrato.height).toBe(-50);
  });
  it("VibratoDialog:noteのビブラート設定解除", () => {
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.vibrato = "50,120,40,35,45,1,8,0";
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const dialogCloseSpy = vi.fn();
    render(<VibratoDialog open={true} note={n} handleClose={dialogCloseSpy} />);
    const useVibratoSwitch = screen.getAllByRole("checkbox", {
      name: /useVibrato/i,
    })[0];
    const lengthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.length/i,
    });
    const cycleSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.cycle/i,
    });
    const depthSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.depth/i,
    });
    const fadeInTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeInTime/i,
    });
    const fadeOutTimeSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.fadeOutTime/i,
    });
    const phaseSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.phase/i,
    });
    const heightSlider = screen.getByRole("slider", {
      name: /editor\.vibratoDialog\.height/i,
    });
    const button = screen.getByRole("button", {
      name: /editor\.vibratoDialog\.submitButton/i,
    });
    expect(useVibratoSwitch).toBeChecked();
    fireEvent.click(useVibratoSwitch);
    expect(useVibratoSwitch).not.toBeChecked();
    fireEvent.click(button);
    expect(dialogCloseSpy).toHaveBeenCalled();
    const resultNote = useMusicProjectStore.getState().notes[0];
    expect(n).not.toEqual(resultNote);
    expect(resultNote.vibrato).toBe(undefined);
  });
});
