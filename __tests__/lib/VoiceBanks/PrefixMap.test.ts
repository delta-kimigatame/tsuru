import { describe, expect, it } from "vitest";
import { PrefixMap } from "../../../src/lib/VoiceBanks/PrefixMap";

import { noteNumToTone, toneToNoteNum } from "../../../src/utils/Notenum";

describe("prefix.map", () => {
  it("empty_init", () => {
    const map = new PrefixMap();
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const valueFromNotenum = map.getValue(i);
      expect(valueFromNotenum.tone).toBe(noteNumToTone(i));
      expect(valueFromNotenum.prefix).toBe("");
      expect(valueFromNotenum.suffix).toBe("");
      const valueFromToneName = map.getValue(noteNumToTone(i));
      expect(valueFromToneName.tone).toBe(noteNumToTone(i));
      expect(valueFromToneName.prefix).toBe("");
      expect(valueFromToneName.suffix).toBe("");
    }
  });
  it("change_value", () => {
    const map = new PrefixMap();
    map.setValue({ tone: "B7", prefix: "pre", suffix: "" });
    map.setValue({ tone: "A#7", prefix: "", suffix: "su" });
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const valueFromNotenum = map.getValue(i);
      expect(valueFromNotenum.tone).toBe(noteNumToTone(i));
      if (i === toneToNoteNum("B7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i === toneToNoteNum("A#7")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });

  it("change_range_value", () => {
    const map = new PrefixMap();
    map.setRangeValues("C7-B7", "pre", "");
    map.setRangeValues("C6-B6", "", "su");
    map.setRangeValues("C5-B5", "testp", "tests");
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const valueFromNotenum = map.getValue(i);
      expect(valueFromNotenum.tone).toBe(noteNumToTone(i));
      if (i >= toneToNoteNum("C7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i >= toneToNoteNum("C6")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else if (i >= toneToNoteNum("C5")) {
        expect(valueFromNotenum.prefix).toBe("testp");
        expect(valueFromNotenum.suffix).toBe("tests");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });

  it("output_empty", () => {
    const map = new PrefixMap();
    const output = map.outputMap();
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      expect(output).toContain(noteNumToTone(i) + "\t\t");
    }
  });
  it("output_setValue", () => {
    const map = new PrefixMap();
    map.setValue({ tone: "B7", prefix: "pre", suffix: "" });
    map.setValue({ tone: "A#7", prefix: "", suffix: "su" });
    const output = map.outputMap();
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      if (i === toneToNoteNum("B7")) {
        expect(output).toContain(noteNumToTone(i) + "\tpre\t");
      } else if (i === toneToNoteNum("A#7")) {
        expect(output).toContain(noteNumToTone(i) + "\t\tsu");
      } else {
        expect(output).toContain(noteNumToTone(i) + "\t\t");
      }
    }
  });
  it("output_setRangeValues", () => {
    const map = new PrefixMap();
    map.setRangeValues("C7-B7", "pre", "");
    map.setRangeValues("C6-B6", "", "su");
    map.setRangeValues("C5-B5", "testp", "tests");
    const output = map.outputMap();
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      if (i >= toneToNoteNum("C7")) {
        expect(output).toContain(noteNumToTone(i) + "\tpre\t");
      } else if (i >= toneToNoteNum("C6")) {
        expect(output).toContain(noteNumToTone(i) + "\t\tsu");
      } else if (i >= toneToNoteNum("C5")) {
        expect(output).toContain(noteNumToTone(i) + "\ttestp\ttests");
      } else {
        expect(output).toContain(noteNumToTone(i) + "\t\t");
      }
    }
  });
  it("output_setRangeSingle", () => {
    const map = new PrefixMap();
    map.setRangeValues("B7", "pre", "");
    const output = map.outputMap();
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      if (i >= toneToNoteNum("B7")) {
        expect(output).toContain(noteNumToTone(i) + "\tpre\t");
      } else {
        expect(output).toContain(noteNumToTone(i) + "\t\t");
      }
    }
  });
  it("load_empty_file", () => {
    const map = new PrefixMap();
    const output = map.outputMap();
    const map2 = new PrefixMap(output);
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const valueFromNotenum = map2.getValue(i);
      expect(valueFromNotenum.tone).toBe(noteNumToTone(i));
      expect(valueFromNotenum.prefix).toBe("");
      expect(valueFromNotenum.suffix).toBe("");
      const valueFromToneName = map2.getValue(noteNumToTone(i));
      expect(valueFromToneName.tone).toBe(noteNumToTone(i));
      expect(valueFromToneName.prefix).toBe("");
      expect(valueFromToneName.suffix).toBe("");
    }
  });
  it("load_file", () => {
    const map = new PrefixMap();
    map.setRangeValues("C7-B7", "pre", "");
    map.setRangeValues("C6-B6", "", "su");
    map.setRangeValues("C5-B5", "testp", "tests");
    const output = map.outputMap();
    const map2 = new PrefixMap(output);
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const valueFromNotenum = map2.getValue(i);
      expect(valueFromNotenum.tone).toBe(noteNumToTone(i));
      if (i >= toneToNoteNum("C7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i >= toneToNoteNum("C6")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else if (i >= toneToNoteNum("C5")) {
        expect(valueFromNotenum.prefix).toBe("testp");
        expect(valueFromNotenum.suffix).toBe("tests");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });
  it("load_file_with_Charset:utf8", () => {
    const map = new PrefixMap();
    map.setRangeValues("C7-B7", "pre", "");
    map.setRangeValues("C6-B6", "", "su");
    map.setRangeValues("C5-B5", "testp", "tests");
    const output = "#Charset:UTF8\r\n" + map.outputMap();
    const map2 = new PrefixMap(output);
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const valueFromNotenum = map2.getValue(i);
      expect(valueFromNotenum.tone).toBe(noteNumToTone(i));
      if (i >= toneToNoteNum("C7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i >= toneToNoteNum("C6")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else if (i >= toneToNoteNum("C5")) {
        expect(valueFromNotenum.prefix).toBe("testp");
        expect(valueFromNotenum.suffix).toBe("tests");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });
  it("output_empty_for_OU", () => {
    const map = new PrefixMap();
    map.voiceColor = "test";
    const output = map.outputSubbanks();
    expect(output[0].color).toBe("test");
    expect(output[0].prefix).toBe("");
    expect(output[0].suffix).toBe("");
    expect(output[0].tone_ranges[0]).toBe("C1-B7");
  });
  it("output_range_for_OU", () => {
    const map = new PrefixMap();
    map.voiceColor = "test";
    map.setRangeValues("C7-B7", "pre", "");
    map.setRangeValues("C6-B6", "", "su");
    map.setRangeValues("C5-B5", "testp", "tests");
    const output = map.outputSubbanks();
    expect(output[0].color).toBe("test");
    expect(output[0].prefix).toBe("");
    expect(output[0].suffix).toBe("");
    expect(output[0].tone_ranges[0]).toBe("C1-B4");
    expect(output[1].color).toBe("test");
    expect(output[1].prefix).toBe("testp");
    expect(output[1].suffix).toBe("tests");
    expect(output[1].tone_ranges[0]).toBe("C5-B5");
    expect(output[2].color).toBe("test");
    expect(output[2].prefix).toBe("");
    expect(output[2].suffix).toBe("su");
    expect(output[2].tone_ranges[0]).toBe("C6-B6");
    expect(output[3].color).toBe("test");
    expect(output[3].prefix).toBe("pre");
    expect(output[3].suffix).toBe("");
    expect(output[3].tone_ranges[0]).toBe("C7-B7");
  });
  it("output_range_for_OU_same_prefix_last", () => {
    const map = new PrefixMap();
    map.voiceColor = "test";
    map.setRangeValues("C6-B6", "", "su");
    const output = map.outputSubbanks();
    expect(output[0].color).toBe("test");
    expect(output[0].prefix).toBe("");
    expect(output[0].suffix).toBe("");
    expect(output[0].tone_ranges[0]).toBe("C1-B5");
    expect(output[0].tone_ranges[1]).toBe("C7-B7");
    expect(output[1].color).toBe("test");
    expect(output[1].prefix).toBe("");
    expect(output[1].suffix).toBe("su");
    expect(output[1].tone_ranges[0]).toBe("C6-B6");
  });
  it("output_range_for_OU_same_prefix_last", () => {
    const map = new PrefixMap();
    map.voiceColor = "test";
    map.setRangeValues("C4-B4", "", "su");
    map.setRangeValues("C6-B6", "", "su");
    const output = map.outputSubbanks();
    expect(output[0].color).toBe("test");
    expect(output[0].prefix).toBe("");
    expect(output[0].suffix).toBe("");
    expect(output[0].tone_ranges[0]).toBe("C1-B3");
    expect(output[0].tone_ranges[1]).toBe("C5-B5");
    expect(output[0].tone_ranges[2]).toBe("C7-B7");
    expect(output[1].color).toBe("test");
    expect(output[1].prefix).toBe("");
    expect(output[1].suffix).toBe("su");
    expect(output[1].tone_ranges[0]).toBe("C4-B4");
    expect(output[1].tone_ranges[1]).toBe("C6-B6");
  });
});
