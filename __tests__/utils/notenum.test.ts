
import { describe, expect, it } from "vitest";
import {
  toneToNoteNum,
  noteNumToTone,
} from "../../src/utils/Notenum";

describe("NoteNumToTone", () => {
    it("NoteNumToTone", () => {
      expect(noteNumToTone(24)).toBe("C1");
      expect(noteNumToTone(25)).toBe("C#1");
      expect(noteNumToTone(26)).toBe("D1");
      expect(noteNumToTone(27)).toBe("D#1");
      expect(noteNumToTone(28)).toBe("E1");
      expect(noteNumToTone(29)).toBe("F1");
      expect(noteNumToTone(30)).toBe("F#1");
      expect(noteNumToTone(31)).toBe("G1");
      expect(noteNumToTone(32)).toBe("G#1");
      expect(noteNumToTone(33)).toBe("A1");
      expect(noteNumToTone(34)).toBe("A#1");
      expect(noteNumToTone(35)).toBe("B1");
      expect(noteNumToTone(36)).toBe("C2");
      expect(noteNumToTone(60)).toBe("C4");
      expect(noteNumToTone(107)).toBe("B7");
    });
  });
  
  describe("ToneToNoteNum", () => {
    it("ToneToNoteNum", () => {
      expect(toneToNoteNum("C1")).toBe(24);
      expect(toneToNoteNum("C#1")).toBe(25);
      expect(toneToNoteNum("D1")).toBe(26);
      expect(toneToNoteNum("D#1")).toBe(27);
      expect(toneToNoteNum("E1")).toBe(28);
      expect(toneToNoteNum("F1")).toBe(29);
      expect(toneToNoteNum("F#1")).toBe(30);
      expect(toneToNoteNum("G1")).toBe(31);
      expect(toneToNoteNum("G#1")).toBe(32);
      expect(toneToNoteNum("A1")).toBe(33);
      expect(toneToNoteNum("A#1")).toBe(34);
      expect(toneToNoteNum("B1")).toBe(35);
      expect(toneToNoteNum("C2")).toBe(36);
      expect(toneToNoteNum("C4")).toBe(60);
      expect(toneToNoteNum("B7")).toBe(107);
      expect(toneToNoteNum("C♯4")).toBe(61);
      expect(toneToNoteNum("Db4")).toBe(61);
      expect(toneToNoteNum("D♭4")).toBe(61);
    });
  });
  