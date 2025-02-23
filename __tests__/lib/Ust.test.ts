import * as iconv from "iconv-lite";
import { describe, expect, it } from "vitest";
import { Ust } from "../../src/lib/Ust";

const makeHeader = (encode: string): Array<string> => {
  const headerLines = [
    "[#VERSION]",
    "UST Version1.2",
    "[#SETTING]",
    "Tempo=150.00",
    "Tracks=1",
    "Project=test",
    "VoiceDir=%VOICE%{あああ}",
    "OutFile=output.wav",
    "CacheDir=main__.cache",
    "Tool1=wavtool.exe",
    "Tool2=resamp.exe",
    "Flags=B50",
    "Mode2=True",
  ];
  if (encode === "utf-8") {
    return headerLines
      .slice(0, 3)
      .concat(["Charset=UTF-8"], headerLines.slice(3));
  } else {
    return headerLines;
  }
};

describe("Ust", () => {
  it("load_header", async () => {
    const ustLines = makeHeader("shift-jis").concat([
      "[#0000]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
      "[#0001]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
    ]);
    const ustBuf = new File(
      [iconv.encode(ustLines.join("\r\n"), "Windows-31j")],
      "test.ust",
      { type: "text/plane;charset=shift-jis" }
    );
    const u = new Ust();
    expect(u.tempo).toBe(120);
    expect(u.flags).toBeUndefined();
    await u.load(ustBuf);
    expect(u.tempo).toBe(150);
    expect(u.flags).toBe("B50");
    expect(u.notes.length).toBe(2);
    expect(u.notes[0].lyric).toBe("あ");
  });
  it("load_header_utf8", async () => {
    const ustLines = makeHeader("utf-8").concat([
      "[#0000]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
      "[#0001]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
    ]);
    const ustBuf = new File(
      [iconv.encode(ustLines.join("\r\n"), "utf-8")],
      "test.ust",
      { type: "text/plane;charset=utf-8" }
    );
    const u = new Ust();
    expect(u.tempo).toBe(120);
    expect(u.flags).toBeUndefined();
    await u.load(ustBuf);
    expect(u.tempo).toBe(150);
    expect(u.flags).toBe("B50");
    expect(u.notes.length).toBe(2);
    expect(u.notes[0].lyric).toBe("あ");
  });
  it("minimum_note", async () => {
    const ustLines = makeHeader("utf-8").concat([
      "[#0000]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
    ]);
    const ustBuf = new File(
      [iconv.encode(ustLines.join("\r\n"), "utf-8")],
      "test.ust",
      { type: "text/plane;charset=utf-8" }
    );
    const u = new Ust();
    await u.load(ustBuf);
    expect(u.notes.length).toBe(1);
    expect(u.notes[0].index).toBe(0);
    expect(u.notes[0].length).toBe(1920);
    expect(u.notes[0].lyric).toBe("あ");
    expect(u.notes[0].notenum).toBe(60);
    expect(u.notes[0].tempo).toBe(150);
    expect(u.notes[0].hasTempo).toBeFalsy();
    expect(u.notes[0].preutter).toBeUndefined();
  });
  it("fully_note", async () => {
    const ustLines = makeHeader("utf-8").concat([
      "[#0000]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "Tempo=120",
      "PreUtterance=1",
      "@preuttr=2",
      "VoiceOverlap=3",
      "@overlap=4",
      "StartPoint=5",
      "@stpoint=6",
      "@filename=filepath",
      "@alias=あ_C4",
      "Velocity=150",
      "Intensity=80",
      "Modulation=30",
      "PitchBend=0,1,2,3",
      "PBStart=-10.0",
      "PBS=-5;3",
      "PBY=1,2,3",
      "PBW=10,20,30,40",
      "PBM=,s,r,j,",
      "Flags=g-5",
      "VBR=1,2,3,4,5,6,7,8",
      "Envelope=9,10,11,12,13,14,15,%,16,17,18",
      "Label=aa",
      "$direct=True",
      "$region=1番",
      "$region_end=イントロ",
    ]);
    const ustBuf = new File(
      [iconv.encode(ustLines.join("\r\n"), "utf-8")],
      "test.ust",
      { type: "text/plane;charset=utf-8" }
    );
    const u = new Ust();
    await u.load(ustBuf);
    expect(u.notes.length).toBe(1);
    expect(u.notes[0].index).toBe(0);
    expect(u.notes[0].length).toBe(1920);
    expect(u.notes[0].lyric).toBe("あ");
    expect(u.notes[0].notenum).toBe(60);
    expect(u.notes[0].tempo).toBe(120);
    expect(u.notes[0].hasTempo).toBeTruthy();
    expect(u.notes[0].preutter).toBe(1);
    expect(u.notes[0].overlap).toBe(3);
    expect(u.notes[0].stp).toBe(5);
    expect(u.notes[0].velocity).toBe(150);
    expect(u.notes[0].intensity).toBe(80);
    expect(u.notes[0].modulation).toBe(30);
    expect(u.notes[0].pitches).toEqual([0, 1, 2, 3]);
    expect(u.notes[0].pbStart).toBe(-10);
    expect(u.notes[0].pbs).toEqual({ time: -5, height: 3 });
    expect(u.notes[0].pby).toEqual([1, 2, 3]);
    expect(u.notes[0].pbw).toEqual([10, 20, 30, 40]);
    expect(u.notes[0].pbm).toEqual(["", "s", "r", "j", ""]);
    expect(u.notes[0].flags).toBe("g-5");
    expect(u.notes[0].vibrato).toEqual({
      length: 1,
      cycle: 64,
      depth: 5,
      fadeInTime: 4,
      fadeOutTime: 5,
      phase: 6,
      height: 7,
    });
    expect(u.notes[0].envelope).toEqual({
      point: [9, 10, 11, 16, 17],
      value: [12, 13, 14, 15, 18],
    });
    expect(u.notes[0].label).toBe("aa");
    expect(u.notes[0].direct).toBeTruthy();
    expect(u.notes[0].region).toBe("1番");
    expect(u.notes[0].regionEnd).toBe("イントロ");
  });
  it("tempo", async () => {
    const ustLines = makeHeader("utf-8").concat([
      "[#0000]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
      "[#0001]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
      "Tempo=120",
      "[#0002]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
    ]);
    const ustBuf = new File(
      [iconv.encode(ustLines.join("\r\n"), "utf-8")],
      "test.ust",
      { type: "text/plane;charset=utf-8" }
    );
    const u = new Ust();
    await u.load(ustBuf);
    expect(u.notes.length).toBe(3);
    expect(u.notes[0].tempo).toBe(150);
    expect(u.notes[0].hasTempo).toBeFalsy();
    expect(u.notes[1].tempo).toBe(120);
    expect(u.notes[1].hasTempo).toBeTruthy();
    expect(u.notes[2].tempo).toBe(120);
    expect(u.notes[2].hasTempo).toBeFalsy();
  });
  it("pointer", async () => {
    const ustLines = makeHeader("utf-8").concat([
      "[#0000]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
      "[#0001]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
      "Tempo=120",
      "[#0002]",
      "Length=1920",
      "Lyric=あ",
      "NoteNum=60",
      "PreUtterance=",
    ]);
    const ustBuf = new File(
      [iconv.encode(ustLines.join("\r\n"), "utf-8")],
      "test.ust",
      { type: "text/plane;charset=utf-8" }
    );
    const u = new Ust();
    await u.load(ustBuf);
    expect(u.notes.length).toBe(3);
    expect(u.notes[0].prev).toBeUndefined();
    expect(u.notes[0].next.index).toBe(1);
    expect(u.notes[1].prev.index).toBe(0);
    expect(u.notes[1].next.index).toBe(2);
    expect(u.notes[2].prev.index).toBe(1);
    expect(u.notes[2].next).toBeUndefined();
  });
});
