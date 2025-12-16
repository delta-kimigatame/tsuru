import { describe, expect, it } from "vitest";
import { isNoteInScale } from "../../src/utils/scale";

describe("isNoteInScale", () => {
  describe("C Major (tone=0, isMinor=false)", () => {
    const tone = 0;
    const isMinor = false;

    it("スケール内の音はtrueを返す", () => {
      expect(isNoteInScale(60, tone, isMinor)).toBe(true); // C4
      expect(isNoteInScale(62, tone, isMinor)).toBe(true); // D4
      expect(isNoteInScale(64, tone, isMinor)).toBe(true); // E4
      expect(isNoteInScale(65, tone, isMinor)).toBe(true); // F4
      expect(isNoteInScale(67, tone, isMinor)).toBe(true); // G4
      expect(isNoteInScale(69, tone, isMinor)).toBe(true); // A4
      expect(isNoteInScale(71, tone, isMinor)).toBe(true); // B4
    });

    it("スケール外の音はfalseを返す", () => {
      expect(isNoteInScale(61, tone, isMinor)).toBe(false); // C#4
      expect(isNoteInScale(63, tone, isMinor)).toBe(false); // D#4
      expect(isNoteInScale(66, tone, isMinor)).toBe(false); // F#4
      expect(isNoteInScale(68, tone, isMinor)).toBe(false); // G#4
      expect(isNoteInScale(70, tone, isMinor)).toBe(false); // A#4
    });

    it("異なるオクターブでも正しく判定できる", () => {
      expect(isNoteInScale(48, tone, isMinor)).toBe(true); // C3
      expect(isNoteInScale(72, tone, isMinor)).toBe(true); // C5
      expect(isNoteInScale(49, tone, isMinor)).toBe(false); // C#3
      expect(isNoteInScale(73, tone, isMinor)).toBe(false); // C#5
    });
  });

  describe("A Minor (tone=9, isMinor=true)", () => {
    const tone = 9;
    const isMinor = true;

    it("スケール内の音はtrueを返す", () => {
      expect(isNoteInScale(69, tone, isMinor)).toBe(true); // A4
      expect(isNoteInScale(71, tone, isMinor)).toBe(true); // B4
      expect(isNoteInScale(60, tone, isMinor)).toBe(true); // C4
      expect(isNoteInScale(62, tone, isMinor)).toBe(true); // D4
      expect(isNoteInScale(64, tone, isMinor)).toBe(true); // E4
      expect(isNoteInScale(65, tone, isMinor)).toBe(true); // F4
      expect(isNoteInScale(67, tone, isMinor)).toBe(true); // G4
    });

    it("スケール外の音はfalseを返す", () => {
      expect(isNoteInScale(70, tone, isMinor)).toBe(false); // A#4
      expect(isNoteInScale(61, tone, isMinor)).toBe(false); // C#4
      expect(isNoteInScale(63, tone, isMinor)).toBe(false); // D#4
      expect(isNoteInScale(66, tone, isMinor)).toBe(false); // F#4
      expect(isNoteInScale(68, tone, isMinor)).toBe(false); // G#4
    });
  });

  describe("F# Major (tone=6, isMinor=false)", () => {
    const tone = 6;
    const isMinor = false;

    it("スケール内の音はtrueを返す", () => {
      expect(isNoteInScale(66, tone, isMinor)).toBe(true); // F#4
      expect(isNoteInScale(68, tone, isMinor)).toBe(true); // G#4
      expect(isNoteInScale(70, tone, isMinor)).toBe(true); // A#4
      expect(isNoteInScale(71, tone, isMinor)).toBe(true); // B4
      expect(isNoteInScale(61, tone, isMinor)).toBe(true); // C#4
      expect(isNoteInScale(63, tone, isMinor)).toBe(true); // D#4
      expect(isNoteInScale(65, tone, isMinor)).toBe(true); // F4 (E#)
    });

    it("スケール外の音はfalseを返す", () => {
      expect(isNoteInScale(67, tone, isMinor)).toBe(false); // G4
      expect(isNoteInScale(69, tone, isMinor)).toBe(false); // A4
      expect(isNoteInScale(60, tone, isMinor)).toBe(false); // C4
      expect(isNoteInScale(62, tone, isMinor)).toBe(false); // D4
      expect(isNoteInScale(64, tone, isMinor)).toBe(false); // E4
    });
  });

  describe("D Minor (tone=2, isMinor=true)", () => {
    const tone = 2;
    const isMinor = true;

    it("スケール内の音はtrueを返す", () => {
      expect(isNoteInScale(62, tone, isMinor)).toBe(true); // D4
      expect(isNoteInScale(64, tone, isMinor)).toBe(true); // E4
      expect(isNoteInScale(65, tone, isMinor)).toBe(true); // F4
      expect(isNoteInScale(67, tone, isMinor)).toBe(true); // G4
      expect(isNoteInScale(69, tone, isMinor)).toBe(true); // A4
      expect(isNoteInScale(70, tone, isMinor)).toBe(true); // A#4 (Bb)
      expect(isNoteInScale(60, tone, isMinor)).toBe(true); // C4
    });

    it("スケール外の音はfalseを返す", () => {
      expect(isNoteInScale(61, tone, isMinor)).toBe(false); // C#4
      expect(isNoteInScale(63, tone, isMinor)).toBe(false); // D#4
      expect(isNoteInScale(66, tone, isMinor)).toBe(false); // F#4
      expect(isNoteInScale(68, tone, isMinor)).toBe(false); // G#4
      expect(isNoteInScale(71, tone, isMinor)).toBe(false); // B4
    });
  });

  describe("境界値テスト", () => {
    it("最小値付近のnotenumでも正しく判定できる", () => {
      expect(isNoteInScale(24, 0, false)).toBe(true); // C1 in C Major
      expect(isNoteInScale(25, 0, false)).toBe(false); // C#1 in C Major
    });

    it("最大値付近のnotenumでも正しく判定できる", () => {
      expect(isNoteInScale(107, 0, false)).toBe(true); // B7 in C Major
      expect(isNoteInScale(106, 0, false)).toBe(false); // A#7 in C Major
    });
  });
});
