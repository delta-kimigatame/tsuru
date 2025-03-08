import fs from "fs";
import * as iconv from "iconv-lite";
import JSZip from "jszip";
import { beforeAll, describe, expect, it } from "vitest";
import { defaultNote } from "../../src/config/note";
import { renderingConfig } from "../../src/config/rendering";
import { Resamp } from "../../src/lib/Resamp";
import { Ust } from "../../src/lib/Ust";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { Wavtool } from "../../src/lib/Wavtool";
import { ResampRequest } from "../../src/types/request";

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

describe("usedTestUst", () => {
  let vb: VoiceBank;
  let ustBuf: ArrayBuffer;
  beforeAll(async () => {
    const buffer = fs.readFileSync("./__tests__/__fixtures__/testVB.zip");
    const zip = new JSZip();
    const td = new TextDecoder("shift-jis");
    await zip.loadAsync(buffer, {
      // @ts-expect-error 型の方がおかしい
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    vb = new VoiceBank(zip.files);
    await vb.initialize();
    ustBuf = fs.readFileSync("./__tests__/__fixtures__/testustCV.ust");
  });

  it("load", async () => {
    const u = new Ust();
    await u.load(ustBuf);
    expect(u.notes.length).toBe(9);
    expect(u.tempo).toBeCloseTo(120);
    /** 0個目のノート */
    expect(u.notes[0].lyric).toBe("R");
    expect(u.notes[0].length).toBe(480);
    expect(u.notes[0].notenum).toBe(48);
    expect(u.notes[0].tempo).toBe(120);
    /** 1個目のノート */
    expect(u.notes[1].lyric).toBe("か");
    expect(u.notes[1].length).toBe(480);
    expect(u.notes[1].notenum).toBe(48);
    expect(u.notes[1].tempo).toBe(120);
    expect(u.notes[1].intensity).toBe(100);
    expect(u.notes[1].modulation).toBe(0);
    expect(u.notes[1].pbs.time).toBe(-45);
    expect(u.notes[1].pbw).toEqual([60]);
    expect(u.notes[1].pby).toEqual([0]);
    expect(u.notes[1].pbm).toEqual(["", ""]);
    expect(u.notes[1].envelope).toEqual({
      point: [5, 0, 0, 80],
      value: [100, 100, 100, 100],
    });
    /** 7個目のノート */
    expect(u.notes[7].lyric).toBe("が");
    expect(u.notes[7].length).toBe(480);
    expect(u.notes[7].notenum).toBe(48);
    expect(u.notes[7].tempo).toBe(120);
    expect(u.notes[7].intensity).toBe(100);
    expect(u.notes[7].modulation).toBe(0);
    expect(u.notes[7].pbs.time).toBe(-45);
    expect(u.notes[7].pbw).toEqual([60]);
    expect(u.notes[7].pby).toEqual([0]);
    expect(u.notes[7].pbm).toEqual(["", ""]);
    expect(u.notes[7].envelope).toEqual({
      point: [5, 0, 0, 35],
      value: [100, 100, 100, 100],
    });
    expect(u.notes[7].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 20,
      fadeOutTime: 20,
      phase: 50,
      height: 0,
    });
  });
  it("getRenderParams", async () => {
    const u = new Ust();
    await u.load(ustBuf);
    const params = u.getRequestParam(vb, defaultNote);
    expect(params.length).toBe(9);
    expect(params[0].resamp).toBeUndefined();
    expect(params[8].resamp).toBeUndefined();
    expect(params[0].append.stp).toBe(0);
    expect(params[0].append.length).toBe(431);
    expect(params[0].append.envelope).toEqual({ point: [0, 0], value: [] });
    expect(params[0].append.overlap).toBe(0);
    params.slice(1, 7).forEach((p) => expect(p.resamp).not.toBeUndefined());
  });
  it("getRenderParamsSelected", async () => {
    const u = new Ust();
    await u.load(ustBuf);
    const params = u.getRequestParam(vb, defaultNote, [0, 1]);
    expect(params.length).toBe(2);
    expect(params[0].resamp).toBeUndefined();
    expect(params[0].append.stp).toBe(0);
    expect(params[0].append.length).toBe(431);
    expect(params[0].append.envelope).toEqual({ point: [0, 0], value: [] });
    expect(params[0].append.overlap).toBe(0);
    params.slice(1).forEach((p) => expect(p.resamp).not.toBeUndefined());
  });
});

describe("stnth", () => {
  it("synthTest", async () => {
    console.log(`スタート:${Date.now()}`);
    const buffer = fs.readFileSync("./__tests__/__fixtures__/testVB.zip");
    const zip = new JSZip();
    const td = new TextDecoder("shift-jis");
    await zip.loadAsync(buffer, {
      // @ts-expect-error 型の方がおかしい
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    const vb = new VoiceBank(zip.files);
    await vb.initialize();
    console.log(`音源読込完了:${Date.now()}`);
    const ustBuf = fs.readFileSync("./__tests__/__fixtures__/testustCV.ust");
    const u = new Ust();
    await u.load(ustBuf);
    console.log(`ust読込完了:${Date.now()}`);
    const params = u.getRequestParam(vb, defaultNote);
    console.log(`パラメータ生成:${Date.now()}`);
    const resamp = new Resamp(vb);
    await resamp.initialize();
    console.log(`エンジン初期化完了:${Date.now()}`);
    const wavtool = new Wavtool();
    const wav0 = new Array(
      Math.ceil((params[0].append.length / 1000) * renderingConfig.frameRate)
    ).fill(0);
    wavtool.append({ inputData: wav0, ...params[0].append });
    console.log(`休符追加:${Date.now()}`);
    for (let i = 1; i <= 7; i++) {
      const wav1 = await resamp.resamp(params[i].resamp as ResampRequest);
      wavtool.append({ inputData: wav1, ...params[i].append });
      console.log(`ノート${i}個目:${Date.now()}`);
    }
    const wav8 = new Array(
      Math.ceil((params[8].append.length / 1000) * renderingConfig.frameRate)
    ).fill(0);
    wavtool.append({ inputData: wav8, ...params[8].append });
    console.log(`休符追加:${Date.now()}`);
    const w = wavtool.output();
    fs.writeFileSync("./__tests__/test_result/synthTest.wav", new DataView(w));
    console.log(`wav保存:${Date.now()}`);
  }, 20000);
});
