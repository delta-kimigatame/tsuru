import JSZip from "jszip";
import * as iconv from "iconv-lite";
import { describe, expect, it } from "vitest";
import { Note } from "../../src/lib/Note";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { CharacterTxt } from "../../src/lib/VoiceBanks/CharacterTxt";

describe("Note", () => {
  it("index", () => {
    const n = new Note();
    expect(n.index).toBeUndefined();
    n.index = 1;
    expect(n.index).toBe(1);
  });

  it("length", () => {
    const n = new Note();
    expect(n.length).toBeUndefined();
    n.length = 480;
    expect(n.length).toBe(480);
    n.length = 480.9;
    expect(n.length).toBe(480);
    n.length = -480;
    expect(n.length).toBe(0);
  });

  it("notenum", () => {
    const n = new Note();
    expect(n.notenum).toBeUndefined();
    n.notenum = 60;
    expect(n.notenum).toBe(60);
    n.notenum = 60.9;
    expect(n.notenum).toBe(60);
    n.notenum = 108;
    expect(n.notenum).toBe(107);
    n.notenum = 23;
    expect(n.notenum).toBe(24);
  });

  it("tempo", () => {
    const n = new Note();
    expect(n.tempo).toBeUndefined();
    n.tempo = 120.0;
    expect(n.tempo).toBe(120.0);
    n.tempo = 120.9;
    expect(n.tempo).toBe(120.9);
    n.tempo = 9.9;
    expect(n.tempo).toBe(10);
    n.tempo = 512.1;
    expect(n.tempo).toBe(512);
  });

  it("preutter", () => {
    const n = new Note();
    expect(n.preutter).toBeUndefined();
    n.preutter = 120.9;
    expect(n.preutter).toBe(120.9);
    expect(n.atPreutter).toBe(120.9);
    n.preutter = -120.9;
    expect(n.preutter).toBe(0);
    expect(n.atPreutter).toBe(0);
  });

  it("overlap", () => {
    const n = new Note();
    expect(n.overlap).toBeUndefined();
    n.overlap = 120.9;
    expect(n.overlap).toBe(120.9);
    expect(n.atOverlap).toBe(120.9);
    n.overlap = -120.9;
    expect(n.overlap).toBe(-120.9);
    expect(n.atOverlap).toBe(-120.9);
  });

  it("stp", () => {
    const n = new Note();
    expect(n.stp).toBeUndefined();
    n.stp = 120.9;
    expect(n.stp).toBe(120.9);
    expect(n.atStp).toBe(120.9);
    n.stp = -120.9;
    expect(n.stp).toBe(0);
    expect(n.atStp).toBe(0);
  });

  it("velocity", () => {
    const n = new Note();
    expect(n.velocity).toBeUndefined();
    expect(n.velocityRate).toBe(1);
    n.velocity = 100;
    expect(n.velocity).toBe(100);
    expect(n.velocityRate).toBe(1);
    n.velocity = 100.9;
    expect(n.velocity).toBe(100);
    expect(n.velocityRate).toBe(1);
    n.velocity = 201;
    expect(n.velocity).toBe(200);
    expect(n.velocityRate).toBe(0.5);
    n.velocity = -1;
    expect(n.velocity).toBe(0);
    expect(n.velocityRate).toBe(2);
  });

  it("intensity", () => {
    const n = new Note();
    expect(n.intensity).toBeUndefined();
    n.intensity = 100;
    expect(n.intensity).toBe(100);
    n.intensity = 100.9;
    expect(n.intensity).toBe(100);
    n.intensity = 201;
    expect(n.intensity).toBe(200);
    n.intensity = -1;
    expect(n.intensity).toBe(0);
  });
  it("modulation", () => {
    const n = new Note();
    expect(n.modulation).toBeUndefined();
    n.modulation = 100;
    expect(n.modulation).toBe(100);
    n.modulation = 100.9;
    expect(n.modulation).toBe(100);
    n.modulation = 201;
    expect(n.modulation).toBe(200);
    n.modulation = -201;
    expect(n.modulation).toBe(-200);
  });

  it("pitches", () => {
    const n = new Note();
    expect(n.pitches).toBeUndefined();
    n.pitches = "0,-1,1.9,2048,-2049";
    expect(n.pitches).toEqual([0, -1, 1, 2047, -2048]);
    n.SetPitches([2048, -2049, 1.9]);
    expect(n.pitches).toEqual([2047, -2048, 1]);
  });

  it("pbstart", () => {
    const n = new Note();
    expect(n.pbStart).toBeUndefined();
    n.pbStart = 30;
    expect(n.pbStart).toBe(30);
  });

  it("pbs", () => {
    const n = new Note();
    expect(n.pbs).toBeUndefined();
    n.pbs = "-30";
    expect(n.pbs).toEqual({ time: -30, height: 0 });
    n.pbs = "-50.5;0.5";
    expect(n.pbs).toEqual({ time: -50.5, height: 0.5 });
    n.pbs = "-100.5,-0.9";
    expect(n.pbs).toEqual({ time: -100.5, height: -0.9 });
    n.pbs = "-50.5;201";
    expect(n.pbs).toEqual({ time: -50.5, height: 200 });
    n.pbs = "-50.5;-201";
    expect(n.pbs).toEqual({ time: -50.5, height: -200 });
    const n2 = new Note();
    n2.pbsTime = 50;
    expect(n2.pbs).toEqual({ time: 50, height: 0 });
    const n3 = new Note();
    n3.pbsHeight = 50;
    expect(n3.pbs).toEqual({ time: 0, height: 50 });
    n3.pbsHeight = 201;
    expect(n3.pbs).toEqual({ time: 0, height: 200 });
    n3.pbsHeight = -201;
    expect(n3.pbs).toEqual({ time: 0, height: -200 });
  });

  it("pby", () => {
    const n = new Note();
    expect(n.pby).toBeUndefined();
    n.pby = "0,10.9,201,-201";
    expect(n.pby).toEqual([0, 10.9, 200, -200]);
    n.SetPby([201, -201, 10.9]);
    expect(n.pby).toEqual([200, -200, 10.9]);
  });

  it("pbw", () => {
    const n = new Note();
    expect(n.pbw).toBeUndefined();
    n.pbw = "0,10.9,-1";
    expect(n.pbw).toEqual([0, 10.9, 0]);
    n.SetPbw([-1, 0, 10.9]);
    expect(n.pbw).toEqual([0, 0, 10.9]);
  });

  it("pbm", () => {
    const n = new Note();
    expect(n.pbm).toBeUndefined();
    n.pbm = ",s,r,j,l";
    expect(n.pbm).toEqual(["", "s", "r", "j", ""]);
    n.SetPbm(["s", "", "j", "r"]);
    expect(n.pbm).toEqual(["s", "", "j", "r"]);
  });

  it("envelope", () => {
    const n = new Note();
    expect(n.envelope).toBeUndefined();
    n.envelope = "0,0";
    expect(n.envelope).toEqual({ point: [0, 0], value: [] });
    n.envelope = "0,5.1,35.1,0,100,90";
    expect(n.envelope).toEqual({ point: [0, 5.1, 35.1], value: [0, 100, 90] });
    n.envelope = "0,5.1,35.1,0,100,90,80";
    expect(n.envelope).toEqual({
      point: [0, 5.1, 35.1],
      value: [0, 100, 90, 80],
    });
    n.envelope = "0,5.1,35.1,0,100,90,80,30";
    expect(n.envelope).toEqual({
      point: [0, 5.1, 35.1],
      value: [0, 100, 90, 80],
    });
    n.envelope = "0,5.1,35.1,0,100,90,80,30,20";
    expect(n.envelope).toEqual({
      point: [0, 5.1, 35.1, 20],
      value: [0, 100, 90, 80],
    });
    n.envelope = "0,5.1,35.1,0,100,90,80,30,20,40";
    expect(n.envelope).toEqual({
      point: [0, 5.1, 35.1, 20, 40],
      value: [0, 100, 90, 80],
    });
    n.envelope = "0,5.1,35.1,0,100,90,80,30,20,40,100";
    expect(n.envelope).toEqual({
      point: [0, 5.1, 35.1, 20, 40],
      value: [0, 100, 90, 80, 100],
    });
    n.envelope = "-1,-1,-1,-1,-1,-1,-1,30,-1,-1,-1";
    expect(n.envelope).toEqual({
      point: [0, 0, 0, 0, 0],
      value: [0, 0, 0, 0, 0],
    });
    n.envelope = "201,201,201,201,201,201,201,30,201,201,201";
    expect(n.envelope).toEqual({
      point: [201, 201, 201, 201, 201],
      value: [200, 200, 200, 200, 200],
    });
    n.SetEnvelope({
      point: [-1, -1, -1, -1, -1],
      value: [0, -1, 100, 200, 201],
    });
    expect(n.envelope).toEqual({
      point: [0, 0, 0, 0, 0],
      value: [0, 0, 100, 200, 200],
    });
  });
  it("vibrato", () => {
    const n = new Note();
    expect(n.vibrato).toBeUndefined();
    n.vibrato = "50,120,100,20,30,5,10,0";
    expect(n.vibrato).toEqual({
      length: 50,
      cycle: 120,
      depth: 100,
      fadeInTime: 20,
      fadeOutTime: 30,
      phase: 5,
      height: 10,
    });
    n.vibrato = "-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000";
    expect(n.vibrato).toEqual({
      length: 0,
      cycle: 64,
      depth: 5,
      fadeInTime: 0,
      fadeOutTime: 0,
      phase: -100,
      height: -100,
    });
    n.vibrato = "1000,1000,1000,1000,1000,1000,1000,1000";
    expect(n.vibrato).toEqual({
      length: 100,
      cycle: 512,
      depth: 200,
      fadeInTime: 100,
      fadeOutTime: 100,
      phase: 100,
      height: 100,
    });
    n.vibratoLength = 50;
    n.vibratoCycle = 120;
    n.vibratoDepth = 100;
    n.vibratoFadeInTime = 20;
    n.vibratoFadeOutTime = 30;
    n.vibratoPhase = 5;
    n.vibratoHeight = 10;
    expect(n.vibrato).toEqual({
      length: 50,
      cycle: 120,
      depth: 100,
      fadeInTime: 20,
      fadeOutTime: 30,
      phase: 5,
      height: 10,
    });
    n.vibratoLength = -1000;
    n.vibratoCycle = -1000;
    n.vibratoDepth = -1000;
    n.vibratoFadeInTime = -1000;
    n.vibratoFadeOutTime = -1000;
    n.vibratoPhase = -1000;
    n.vibratoHeight = -1000;
    expect(n.vibrato).toEqual({
      length: 0,
      cycle: 64,
      depth: 5,
      fadeInTime: 0,
      fadeOutTime: 0,
      phase: -100,
      height: -100,
    });
    n.vibratoLength = 1000;
    n.vibratoCycle = 1000;
    n.vibratoDepth = 1000;
    n.vibratoFadeInTime = 1000;
    n.vibratoFadeOutTime = 1000;
    n.vibratoPhase = 1000;
    n.vibratoHeight = 1000;
    expect(n.vibrato).toEqual({
      length: 100,
      cycle: 512,
      depth: 200,
      fadeInTime: 100,
      fadeOutTime: 100,
      phase: 100,
      height: 100,
    });
  });

  it("msLength", () => {
    const n = new Note();
    expect(() => n.msLength).toThrow("length is not initial.");
    n.length = 480;
    expect(() => n.msLength).toThrow("tempo is not initial.");
    n.tempo = 120;
    expect(n.msLength).toBe(500);
    n.length = 240;
    expect(n.msLength).toBe(250);
    n.tempo = 60;
    expect(n.msLength).toBe(500);
  });

  it("applyOto", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).OutputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );

    const o_output = new File(
      [iconv.encode("_あ.wav=あ,1,2,3,300,100\r\n", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );

    const o_output2 = new File(
      [iconv.encode("_う.wav=う,1,2,3,450,150\r\n", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("root/oto.ini", o_output);
    z.file("root/test/oto.ini", o_output2);
    const vb = new VoiceBank(z.files);
    await vb.Initialize();
    const n = new Note();
    expect(() => n.ApplyOto(vb)).toThrow("lyric is not initial.");
    n.lyric = "い";
    expect(() => n.ApplyOto(vb)).toThrow("notenum is not initial.");
    n.notenum = 60;
    n.ApplyOto(vb);
    expect(n.atPreutter).toBe(0);
    expect(n.atOverlap).toBe(0);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("R");
    expect(n.atFilename).toBe("");
    n.lyric = "あ";
    n.ApplyOto(vb);
    expect(n.atPreutter).toBe(300);
    expect(n.atOverlap).toBe(100);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("あ");
    expect(n.atFilename).toBe("_あ.wav");
    n.lyric = "う";
    n.ApplyOto(vb);
    expect(n.atPreutter).toBe(450);
    expect(n.atOverlap).toBe(150);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("う");
    expect(n.atFilename).toBe("test/_う.wav");
  });

  it("AutoFitParam_NoPrev", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).OutputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );

    const o_output = new File(
      [iconv.encode("_あ.wav=あ,1,2,3,300,100\r\n", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );

    z.file("root/character.txt", c_output);
    z.file("root/oto.ini", o_output);
    const vb = new VoiceBank(z.files);
    await vb.Initialize();
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.velocity = 200;
    n.ApplyOto(vb);
    expect(n.atPreutter).toBe(150);
    expect(n.atOverlap).toBe(50);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("あ");
    expect(n.atFilename).toBe("_あ.wav");
    n.preutter = 600;
    expect(n.atPreutter).toBe(300);
    expect(n.atOverlap).toBe(50);
    expect(n.atStp).toBe(0);
    n.overlap = 200;
    expect(n.atPreutter).toBe(300);
    expect(n.atOverlap).toBe(100);
    expect(n.atStp).toBe(0);
    n.stp = 10;
    expect(n.atPreutter).toBe(300);
    expect(n.atOverlap).toBe(100);
    expect(n.atStp).toBe(10);
  });

  it("AutoFitParam_WithPrev", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).OutputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );

    const o_output = new File(
      [iconv.encode("_あ.wav=あ,1,2,3,450,150\r\n", "Windows-31j")],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );

    z.file("root/character.txt", c_output);
    z.file("root/oto.ini", o_output);
    const vb = new VoiceBank(z.files);
    await vb.Initialize();
    const prev_n = new Note();
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.velocity = 200;
    n.prev = prev_n;
    prev_n.next = n;
    expect(() => n.ApplyOto(vb)).toThrow("prev length is not initial.");
    prev_n.length = 480;
    expect(() => n.ApplyOto(vb)).toThrow("prev tempo is not initial.");
    prev_n.tempo = 120;
    expect(() => n.ApplyOto(vb)).toThrow("prev lyric is not initial.");
    prev_n.lyric = "あ";
    n.ApplyOto(vb);
    /** 250 >= 225-75のため自動調整無し */
    expect(n.atPreutter).toBe(225);
    expect(n.atOverlap).toBe(75);
    expect(n.atStp).toBe(0);
    n.velocity = 100;
    /** 250 < 450-150のため自動調整 */
    expect(n.atPreutter).toBe(375);
    expect(n.atOverlap).toBe(125);
    expect(n.atStp).toBe(75);
    prev_n.lyric = "R";
    /** 500 >= 450-150のため自動調整無し */
    expect(n.atPreutter).toBe(450);
    expect(n.atOverlap).toBe(150);
    expect(n.atStp).toBe(0);
    n.preutter = 750;
    /** 500 < 750-150のため自動調整 */
    expect(n.atPreutter).toBe(625);
    expect(n.atOverlap).toBe(125);
    expect(n.atStp).toBe(125);
    n.stp = 50;
    /** 500 < 750-150のため自動調整 */
    expect(n.atPreutter).toBe(625);
    expect(n.atOverlap).toBe(125);
    expect(n.atStp).toBe(175);
    n.overlap = 250;
    /** 500 <= 750-250のため自動調整無し */
    expect(n.atPreutter).toBe(750);
    expect(n.atOverlap).toBe(250);
    expect(n.atStp).toBe(50);
  });
});
