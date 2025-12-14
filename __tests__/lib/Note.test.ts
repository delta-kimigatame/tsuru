import fs from "fs";
import * as iconv from "iconv-lite";
import JSZip from "jszip";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { defaultNote } from "../../src/config/note";
import { dumpEnvelope, dumpNotes, Note } from "../../src/lib/Note";
import { CharacterTxt } from "../../src/lib/VoiceBanks/CharacterTxt";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { ResampRequest } from "../../src/types/request";
import { makeTimeAxis } from "../../src/utils/interp";

describe("Note", () => {
  it("indexが正しく設定される", () => {
    const n = new Note();
    expect(n.index).toBeUndefined();
    n.index = 1;
    expect(n.index).toBe(1);
  });

  // Phase 3: 未テストプロパティテスト
  it("hasTempoでテンポパラメータの有無を管理できる", () => {
    const n = new Note();
    expect(n.hasTempo).toBeUndefined();
    n.hasTempo = true;
    expect(n.hasTempo).toBe(true);
    n.hasTempo = false;
    expect(n.hasTempo).toBe(false);
  });

  it("labelが正しく設定される", () => {
    const n = new Note();
    expect(n.label).toBeUndefined();
    n.label = "ラベルテスト";
    expect(n.label).toBe("ラベルテスト");
  });

  it("flagsが正しく設定される", () => {
    const n = new Note();
    expect(n.flags).toBeUndefined();
    n.flags = "g-3B50";
    expect(n.flags).toBe("g-3B50");
  });

  it("voiceColorが正しく設定される", () => {
    const n = new Note();
    expect(n.voiceColor).toBeUndefined();
    n.voiceColor = "Soft";
    expect(n.voiceColor).toBe("Soft");
  });

  it("lengthが正の整数に丸められて設定される", () => {
    const n = new Note();
    expect(n.length).toBeUndefined();
    n.length = 480;
    expect(n.length).toBe(480);
    n.length = 480.9;
    expect(n.length).toBe(480);
    n.length = -480;
    expect(n.length).toBe(0);
  });

  describe("notenum", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.notenum).toBeUndefined();
    });

    it("正常値を設定できる", () => {
      n.notenum = 60;
      expect(n.notenum).toBe(60);
    });

    it("小数は整数に丸められる", () => {
      n.notenum = 60.9;
      expect(n.notenum).toBe(60);
    });

    it("最大値107を設定できる", () => {
      n.notenum = 107;
      expect(n.notenum).toBe(107);
    });

    it("最大値を超えた値は107にクランプされる", () => {
      n.notenum = 108;
      expect(n.notenum).toBe(107);
    });

    it("最小値24を設定できる", () => {
      n.notenum = 24;
      expect(n.notenum).toBe(24);
    });

    it("最小値未満の値は24にクランプされる", () => {
      n.notenum = 23;
      expect(n.notenum).toBe(24);
    });
  });

  describe("tempo", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.tempo).toBeUndefined();
    });

    it("正常値を浮動小数として設定できる", () => {
      n.tempo = 120.0;
      expect(n.tempo).toBe(120.0);
    });

    it("小数点以下も保持される", () => {
      n.tempo = 120.9;
      expect(n.tempo).toBe(120.9);
    });

    it("最小値10を設定できる", () => {
      n.tempo = 10;
      expect(n.tempo).toBe(10);
    });

    it("最小値未満は10にクランプされる", () => {
      n.tempo = 9.9;
      expect(n.tempo).toBe(10);
    });

    it("最大値512を設定できる", () => {
      n.tempo = 512;
      expect(n.tempo).toBe(512);
    });

    it("最大値を超えた値は512にクランプされる", () => {
      n.tempo = 512.1;
      expect(n.tempo).toBe(512);
    });
  });

  describe("preutter", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.preutter).toBeUndefined();
    });

    it("正常値を設定するとatPreutterに反映される", () => {
      n.preutter = 120.9;
      expect(n.preutter).toBe(120.9);
      expect(n.atPreutter).toBe(120.9);
    });

    it("0を設定できる", () => {
      n.preutter = 0;
      expect(n.preutter).toBe(0);
      expect(n.atPreutter).toBe(0);
    });

    it("負の値は0にクランプされる", () => {
      n.preutter = -120.9;
      expect(n.preutter).toBe(0);
      expect(n.atPreutter).toBe(0);
    });
  });

  describe("overlap", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.overlap).toBeUndefined();
    });

    it("正の値を設定するとatOverlapに反映される", () => {
      n.overlap = 120.9;
      expect(n.overlap).toBe(120.9);
      expect(n.atOverlap).toBe(120.9);
    });

    it("負の値も設定できる", () => {
      n.overlap = -120.9;
      expect(n.overlap).toBe(-120.9);
      expect(n.atOverlap).toBe(-120.9);
    });
  });

  describe("stp", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.stp).toBeUndefined();
    });

    it("正常値を設定するとatStpに反映される", () => {
      n.stp = 120.9;
      expect(n.stp).toBe(120.9);
      expect(n.atStp).toBe(120.9);
    });

    it("0を設定できる", () => {
      n.stp = 0;
      expect(n.stp).toBe(0);
      expect(n.atStp).toBe(0);
    });

    it("負の値は0にクランプされる", () => {
      n.stp = -120.9;
      expect(n.stp).toBe(0);
      expect(n.atStp).toBe(0);
    });
  });

  describe("velocity", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.velocity).toBeUndefined();
    });

    it("正常値を設定するとvelocityRateが計算される", () => {
      n.velocity = 100;
      expect(n.velocity).toBe(100);
      expect(n.velocityRate).toBe(1);
    });

    it("小数は整数に丸められる", () => {
      n.velocity = 100.9;
      expect(n.velocity).toBe(100);
    });

    it("最大値200を設定できる", () => {
      n.velocity = 200;
      expect(n.velocity).toBe(200);
      expect(n.velocityRate).toBe(0.5);
    });

    it("最大値を超えた値は200にクランプされる", () => {
      n.velocity = 201;
      expect(n.velocity).toBe(200);
    });

    it("最小値0を設定できる", () => {
      n.velocity = 0;
      expect(n.velocity).toBe(0);
      expect(n.velocityRate).toBe(2);
    });

    it("最小値未満は0にクランプされる", () => {
      n.velocity = -1;
      expect(n.velocity).toBe(0);
    });
  });

  // Phase 3: エラー処理・エッジケーステスト
  it("velocityRateはvelocity未設定時に1を返す", () => {
    const n = new Note();
    expect(n.velocityRate).toBe(1);
  });

  it("directプロパティで直接wavtool使用フラグを設定できる", () => {
    const n = new Note();
    expect(n.direct).toBeUndefined();
    n.direct = true;
    expect(n.direct).toBe(true);
    n.direct = false;
    expect(n.direct).toBe(false);
  });

  describe("intensity", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.intensity).toBeUndefined();
    });

    it("正常値を設定できる", () => {
      n.intensity = 100;
      expect(n.intensity).toBe(100);
    });

    it("小数は整数に丸められる", () => {
      n.intensity = 100.9;
      expect(n.intensity).toBe(100);
    });

    it("最大値200を設定できる", () => {
      n.intensity = 200;
      expect(n.intensity).toBe(200);
    });

    it("最大値を超えた値は200にクランプされる", () => {
      n.intensity = 201;
      expect(n.intensity).toBe(200);
    });

    it("最小値0を設定できる", () => {
      n.intensity = 0;
      expect(n.intensity).toBe(0);
    });

    it("最小値未満は0にクランプされる", () => {
      n.intensity = -1;
      expect(n.intensity).toBe(0);
    });
  });

  describe("modulation", () => {
    let n: Note;

    beforeEach(() => {
      n = new Note();
    });

    it("デフォルト値はundefinedである", () => {
      expect(n.modulation).toBeUndefined();
    });

    it("正常値を設定できる", () => {
      n.modulation = 100;
      expect(n.modulation).toBe(100);
    });

    it("小数は整数に丸められる", () => {
      n.modulation = 100.9;
      expect(n.modulation).toBe(100);
    });

    it("最大値200を設定できる", () => {
      n.modulation = 200;
      expect(n.modulation).toBe(200);
    });

    it("最大値を超えた値は200にクランプされる", () => {
      n.modulation = 201;
      expect(n.modulation).toBe(200);
    });

    it("最小値-200を設定できる", () => {
      n.modulation = -200;
      expect(n.modulation).toBe(-200);
    });

    it("最小値未満は-200にクランプされる", () => {
      n.modulation = -201;
      expect(n.modulation).toBe(-200);
    });
  });

  it("pitchesが-2048～2047の範囲で整数配列として設定される", () => {
    const n = new Note();
    expect(n.pitches).toBeUndefined();
    n.pitches = "0,-1,1.9,2048,-2049";
    expect(n.pitches).toEqual([0, -1, 1, 2047, -2048]);
    n.setPitches([2048, -2049, 1.9]);
    expect(n.pitches).toEqual([2047, -2048, 1]);
  });

  it("pbStartが正しく設定される", () => {
    const n = new Note();
    expect(n.pbStart).toBeUndefined();
    n.pbStart = 30;
    expect(n.pbStart).toBe(30);
  });

  it("pbsくtimeとheightを指定して正しく設定される", () => {
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

  it("pbyが-200～200の範囲で浮動小数配列として設定される", () => {
    const n = new Note();
    expect(n.pby).toBeUndefined();
    n.pby = "0,10.9,201,-201";
    expect(n.pby).toEqual([0, 10.9, 200, -200]);
    n.setPby([201, -201, 10.9]);
    expect(n.pby).toEqual([200, -200, 10.9]);
  });

  it("pbwが0以上の浮動小数配列として設定される", () => {
    const n = new Note();
    expect(n.pbw).toBeUndefined();
    n.pbw = "0,10.9,-1";
    expect(n.pbw).toEqual([0, 10.9, 0]);
    n.setPbw([-1, 0, 10.9]);
    expect(n.pbw).toEqual([0, 0, 10.9]);
  });

  it("pbmが補間方法を表す配列として設定される", () => {
    const n = new Note();
    expect(n.pbm).toBeUndefined();
    n.pbm = ",s,r,j,l";
    expect(n.pbm).toEqual(["", "s", "r", "j", ""]);
    n.setPbm(["s", "", "j", "r"]);
    expect(n.pbm).toEqual(["s", "", "j", "r"]);
  });

  it("envelopeがpointとvalueを持ち範囲制限されて設定される", () => {
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
    n.setEnvelope({
      point: [-1, -1, -1, -1, -1],
      value: [0, -1, 100, 200, 201],
    });
    expect(n.envelope).toEqual({
      point: [0, 0, 0, 0, 0],
      value: [0, 0, 100, 200, 200],
    });
  });
  it("vibratoが各パラメータを持ち範囲制限されて設定される", () => {
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

  // Phase 1: 異常値ガード処理テスト
  it("notenumにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.notenum = 60;
    expect(n.notenum).toBe(60);
    n.notenum = NaN;
    expect(n.notenum).toBe(60);
  });

  it("notenumにInfinityを設定しても値が変更されない", () => {
    const n = new Note();
    n.notenum = 60;
    expect(n.notenum).toBe(60);
    n.notenum = Infinity;
    expect(n.notenum).toBe(60);
    n.notenum = -Infinity;
    expect(n.notenum).toBe(60);
  });

  it("preutterにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.preutter = 100;
    expect(n.preutter).toBe(100);
    n.preutter = NaN;
    expect(n.preutter).toBe(100);
  });

  it("overlapにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.overlap = 50;
    expect(n.overlap).toBe(50);
    n.overlap = NaN;
    expect(n.overlap).toBe(50);
  });

  it("stpにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.stp = 10;
    expect(n.stp).toBe(10);
    n.stp = NaN;
    expect(n.stp).toBe(10);
  });

  it("velocityにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.velocity = 100;
    expect(n.velocity).toBe(100);
    n.velocity = NaN;
    expect(n.velocity).toBe(100);
  });

  it("intensityにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.intensity = 100;
    expect(n.intensity).toBe(100);
    n.intensity = NaN;
    expect(n.intensity).toBe(100);
  });

  it("modulationにNaNを設定しても値が変更されない", () => {
    const n = new Note();
    n.modulation = 50;
    expect(n.modulation).toBe(50);
    n.modulation = NaN;
    expect(n.modulation).toBe(50);
  });

  // Phase 2: 個別vibratoパラメータsetterテスト
  it("vibratoLengthが0～100の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoLength = 75;
    expect(n.vibrato.length).toBe(75);
    n.vibratoLength = -10;
    expect(n.vibrato.length).toBe(0);
    n.vibratoLength = 150;
    expect(n.vibrato.length).toBe(100);
  });

  it("vibratoCycleが64～512の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoCycle = 200;
    expect(n.vibrato.cycle).toBe(200);
    n.vibratoCycle = 50;
    expect(n.vibrato.cycle).toBe(64);
    n.vibratoCycle = 600;
    expect(n.vibrato.cycle).toBe(512);
  });

  it("vibratoDepthが5～200の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoDepth = 150;
    expect(n.vibrato.depth).toBe(150);
    n.vibratoDepth = 3;
    expect(n.vibrato.depth).toBe(5);
    n.vibratoDepth = 250;
    expect(n.vibrato.depth).toBe(200);
  });

  it("vibratoFadeInTimeが0～100の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoFadeInTime = 50;
    expect(n.vibrato.fadeInTime).toBe(50);
    n.vibratoFadeInTime = -10;
    expect(n.vibrato.fadeInTime).toBe(0);
    n.vibratoFadeInTime = 150;
    expect(n.vibrato.fadeInTime).toBe(100);
  });

  it("vibratoFadeOutTimeが0～100の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoFadeOutTime = 50;
    expect(n.vibrato.fadeOutTime).toBe(50);
    n.vibratoFadeOutTime = -10;
    expect(n.vibrato.fadeOutTime).toBe(0);
    n.vibratoFadeOutTime = 150;
    expect(n.vibrato.fadeOutTime).toBe(100);
  });

  it("vibratoPhaseが-100～100の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoPhase = 50;
    expect(n.vibrato.phase).toBe(50);
    n.vibratoPhase = -150;
    expect(n.vibrato.phase).toBe(-100);
    n.vibratoPhase = 150;
    expect(n.vibrato.phase).toBe(100);
  });

  it("vibratoHeightが-100～100の範囲で設定される", () => {
    const n = new Note();
    n.vibrato = "50,100,100,0,0,0,0,0";
    n.vibratoHeight = 50;
    expect(n.vibrato.height).toBe(50);
    n.vibratoHeight = -150;
    expect(n.vibrato.height).toBe(-100);
    n.vibratoHeight = 150;
    expect(n.vibrato.height).toBe(100);
  });

  // Phase 1: lyric setter副作用テスト
  it("lyric変更時にnextのautoFitParamが呼ばれる", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const o_output = new File(
      [
        iconv.encode(
          "_あ.wav=あ,1,2,3,300,100\r\n_い.wav=い,5,10,15,200,50\r\n",
          "Windows-31j"
        ),
      ],
      "oto.ini",
      { type: "text/plane;charset=shift-jis" }
    );
    z.file("root/character.txt", c_output);
    z.file("root/oto.ini", o_output);
    const vb = new VoiceBank(z.files);
    await vb.initialize();

    const n1 = new Note();
    n1.length = 480;
    n1.tempo = 120;
    n1.lyric = "あ";
    n1.notenum = 60;
    n1.applyOto(vb);

    const n2 = new Note();
    n2.length = 480;
    n2.tempo = 120;
    n2.lyric = "い";
    n2.notenum = 60;
    n2.applyOto(vb);

    n1.next = n2;
    n2.prev = n1;

    // n1のatPreutterが300、n2は元々200
    expect(n2.atPreutter).toBe(200);

    // n1のlyricを変更するとn2.autoFitParam()が呼ばれる
    n1.lyric = "い";
    n1.applyOto(vb);

    // n1のatPreutterが200に変わり、n2のautoFitParamで調整される
    expect(n1.atPreutter).toBe(200);
  });

  it("lyric変更時にotoがundefinedにリセットされる", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
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
    await vb.initialize();

    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.applyOto(vb);
    expect(n.oto).toBeDefined();

    n.lyric = "い";
    expect(n.oto).toBeUndefined();
  });

  // Phase 1: 配列系メソッドテスト
  it("setPbyで配列が正しく設定される", () => {
    const n = new Note();
    n.setPby([10.5, -50, 100, 250, -250]);
    expect(n.pby).toEqual([10.5, -50, 100, 200, -200]);
  });

  it("setPbwで配列が正しく設定される", () => {
    const n = new Note();
    n.setPbw([10.5, 0, -5, 100]);
    expect(n.pbw).toEqual([10.5, 0, 0, 100]);
  });

  it("setPbmで配列が正しく設定される", () => {
    const n = new Note();
    n.setPbm(["s", "", "r", "j"]);
    expect(n.pbm).toEqual(["s", "", "r", "j"]);
  });

  it("setEnvelopeでundefinedを渡すとenvelopeがundefinedになる", () => {
    const n = new Note();
    n.envelope = "0,5,35,0,100,90";
    expect(n.envelope).toBeDefined();
    n.setEnvelope(undefined);
    expect(n.envelope).toBeUndefined();
  });

  // Phase 3: ユーティリティテスト
  it("pbsTimeで個別にtime値を設定できる", () => {
    const n = new Note();
    n.pbsTime = 100;
    expect(n.pbs).toEqual({ time: 100, height: 0 });
    n.pbsTime = -50;
    expect(n.pbs).toEqual({ time: -50, height: 0 });
  });

  it("pbsHeightで個別にheight値を設定できる", () => {
    const n = new Note();
    n.pbsHeight = 50;
    expect(n.pbs).toEqual({ time: 0, height: 50 });
    n.pbsHeight = -100;
    expect(n.pbs).toEqual({ time: 0, height: -100 });
    n.pbsHeight = 250;
    expect(n.pbs).toEqual({ time: 0, height: 200 });
    n.pbsHeight = -250;
    expect(n.pbs).toEqual({ time: 0, height: -200 });
  });

  // Phase 1: getCacheIndexテスト
  it("getCacheIndexでprevの有無に応じた連番が取得できる", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
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
    await vb.initialize();

    const n1 = new Note();
    n1.lyric = "あ";
    n1.notenum = 60;
    n1.applyOto(vb);
    expect(n1.getCacheIndex(vb)).toEqual([0]);

    const n2 = new Note();
    n2.lyric = "あ";
    n2.notenum = 60;
    n2.applyOto(vb);
    n2.prev = n1;
    n1.next = n2;
    expect(n2.getCacheIndex(vb)).toEqual([1]);

    const n3 = new Note();
    n3.lyric = "あ";
    n3.notenum = 60;
    n3.applyOto(vb);
    n3.prev = n2;
    n2.next = n3;
    expect(n3.getCacheIndex(vb)).toEqual([2]);
  });

  it("lengthとtempoからmsLengthが計算される", () => {
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

  it("applyOtoで原音設定が適用されat系プロパティが設定される", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
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
    await vb.initialize();
    const n = new Note();
    expect(() => n.applyOto(vb)).toThrow("lyric is not initial.");
    n.lyric = "い";
    expect(() => n.applyOto(vb)).toThrow("notenum is not initial.");
    n.notenum = 60;
    n.applyOto(vb);
    expect(n.atPreutter).toBe(0);
    expect(n.atOverlap).toBe(0);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("R");
    expect(n.atFilename).toBe("");
    n.lyric = "あ";
    n.applyOto(vb);
    expect(n.atPreutter).toBe(300);
    expect(n.atOverlap).toBe(100);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("あ");
    expect(n.atFilename).toBe("_あ.wav");
    n.lyric = "う";
    n.applyOto(vb);
    expect(n.atPreutter).toBe(450);
    expect(n.atOverlap).toBe(150);
    expect(n.atStp).toBe(0);
    expect(n.atAlias).toBe("う");
    expect(n.atFilename).toBe("test/_う.wav");
  });

  it("prevがない場合autoFitParamでat値がそのまま設定される", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
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
    await vb.initialize();
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.velocity = 200;
    n.applyOto(vb);
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

  it("prevがある場合autoFitParamで自動調整が適用される", async () => {
    const z = new JSZip();
    const c = new CharacterTxt({ name: "あ" });
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).outputTxt(), "Windows-31j")],
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
    await vb.initialize();
    const prev_n = new Note();
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.velocity = 200;
    n.prev = prev_n;
    prev_n.next = n;
    expect(() => n.applyOto(vb)).toThrow("prev length is not initial.");
    prev_n.length = 480;
    expect(() => n.applyOto(vb)).toThrow("prev tempo is not initial.");
    prev_n.tempo = 120;
    expect(() => n.applyOto(vb)).toThrow("prev lyric is not initial.");
    prev_n.lyric = "あ";
    n.applyOto(vb);
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

describe("RenderNote", () => {
  it("outputMsがnextのat値を考慮して計算される", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    expect(n.outputMs).toBe(500);
    n.preutter = 100;
    expect(n.outputMs).toBe(600);
    n.preutter = 200;
    expect(n.outputMs).toBe(700);
    const next_n = new Note();
    n.next = next_n;
    expect(n.outputMs).toBe(700);
    next_n.preutter = 100;
    expect(n.outputMs).toBe(600);
    next_n.overlap = 50;
    expect(n.outputMs).toBe(650);
  });

  // Phase 2: outputMsエッジケーステスト
  it("nextがundefinedの場合outputMsはmsLengthとatPreutterの合計になる", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    n.preutter = 100;
    expect(n.outputMs).toBe(600); // 500 + 100
  });

  it("nextが休符の場合outputMsはmsLengthとatPreutterの合計になる", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    n.preutter = 100;
    const next_n = new Note();
    next_n.lyric = "R";
    n.next = next_n;
    expect(n.outputMs).toBe(600); // 500 + 100
  });

  it("targetLengthが50ms単位で切り上げて計算される", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    n.preutter = 24;
    expect(n.targetLength).toBe(550);
    n.preutter = 25;
    expect(n.targetLength).toBe(600);
    n.stp = 50;
    expect(n.targetLength).toBe(650);
  });

  it("pitchSpanがtempoから5tick分の間隔として計算される", () => {
    const n = new Note();
    n.tempo = 120;
    expect(n.pitchSpan).toBe(0.5 / 96);
    n.tempo = 60;
    expect(n.pitchSpan).toBe((0.5 / 96) * 2);
    n.tempo = 240;
    expect(n.pitchSpan).toBe(0.5 / 96 / 2);
  });

  it("単独ノートの基準ピッチが全て0になる", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    n.preutter = 100;
    n.stp = 50;
    expect(n.targetLength).toBe(700);
    const timeAxis = makeTimeAxis(n.pitchSpan, 0, n.targetLength / 1000);
    expect(timeAxis.length).toBe(136);
    const basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.length).toBe(136);
    basePitches.forEach((p) => expect(p).toBe(0));
  });
  it("prevがある場合基準ピッチがprevのnotenum差分を反映する", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 125;
    n.preutter = 100;
    n.overlap = 0;
    n.stp = 70;
    n.notenum = 60;
    const p_note = new Note();
    p_note.length = 480;
    p_note.tempo = 125;
    p_note.notenum = 61;
    p_note.lyric = "R";
    n.prev = p_note;
    let timeAxis = makeTimeAxis(n.pitchSpan, 0, n.targetLength / 1000);
    /** 1つ前のノートが休符の場合影響なし */
    let basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.length).toBe(141);
    basePitches.forEach((p) => expect(p).toBe(0));
    /** 1つ前のノートが歌詞の場合 */
    p_note.lyric = "あ";
    basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.slice(0, 33)).toEqual(new Array(33).fill(100));
    expect(basePitches.slice(33)).toEqual(new Array(141 - 33).fill(0));
    /** prev.pbs.timeより前まで参照する場合 */
    n.stp = 480;
    timeAxis = makeTimeAxis(n.pitchSpan, 0, n.targetLength / 1000);
    basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.length).toBe(221);
    expect(basePitches.slice(0, 21)).toEqual(new Array(21).fill(0));
    expect(basePitches.slice(21, 115)).toEqual(new Array(115 - 21).fill(100));
    expect(basePitches.slice(115)).toEqual(new Array(221 - 115).fill(0));
    /** pbs.timeの影響下はprevより現ノート優先 */
    n.pbs = "-500;0";
    timeAxis = makeTimeAxis(n.pitchSpan, 0, n.targetLength / 1000);
    basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.length).toBe(221);
    expect(basePitches).toEqual(new Array(221).fill(0));
  });
  it("nextがある場合基準ピッチがnext.pbs.time後がnextのnotenumを反映する", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 125;
    n.preutter = 100;
    n.stp = 70;
    n.notenum = 60;
    const n_note = new Note();
    n_note.length = 480;
    n_note.tempo = 125;
    n_note.notenum = 61;
    n_note.lyric = "R";
    n.next = n_note;
    let timeAxis = makeTimeAxis(n.pitchSpan, 0, n.targetLength / 1000);
    /** 1つ後のノートが休符の場合影響なし */
    let basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.length).toBe(141);
    basePitches.forEach((p) => expect(p).toBe(0));
    /** 1つ後ろのノートに歌詞がある場合next.pbs.timeより後は後ろのノートの音高が基準となる。 */
    n_note.lyric = "あ";
    n_note.pbs = "-500;0";
    basePitches = n.getBasePitch(timeAxis);
    expect(basePitches.slice(0, 30)).toEqual(new Array(30).fill(0));
    expect(basePitches.slice(30)).toEqual(new Array(141 - 30).fill(100));
  });

  it("getPitchInterpBaseでpbs,pbw,pby,pbmから補間パラメータが生成される", () => {
    const n = new Note();
    n.pbs = "-200;5";
    n.pbw = "300,200,100";
    n.pby = "10,-10,0";
    n.pbm = ",r,j";
    n.notenum = 60;
    let param = n.getPitchInterpBase(n, 100);
    expect(param.x).toEqual([-100, 200, 400, 500]);
    expect(param.y).toEqual([50, 100, -100, 0]);
    expect(param.mode).toEqual(["", "r", "j"]);
    n.pbm = "";
    param = n.getPitchInterpBase(n, 100);
    expect(param.x).toEqual([-100, 200, 400, 500]);
    expect(param.y).toEqual([50, 100, -100, 0]);
    expect(param.mode).toEqual(["", "", ""]);
    const prev_n = new Note();
    prev_n.lyric = "R";
    prev_n.notenum = 61;
    n.prev = prev_n;
    param = n.getPitchInterpBase(n, 100);
    expect(param.x).toEqual([-100, 200, 400, 500]);
    expect(param.y).toEqual([50, 100, -100, 0]);
    expect(param.mode).toEqual(["", "", ""]);
    prev_n.lyric = "あ";
    param = n.getPitchInterpBase(n, 100);
    expect(param.x).toEqual([-100, 200, 400, 500]);
    expect(param.y).toEqual([100, 100, -100, 0]);
    expect(param.mode).toEqual(["", "", ""]);
  });

  it("デフォルト補間(cos曲線)でピッチが補間される", () => {
    const n = new Note();
    n.pbs = "0;0";
    n.pbw = "100";
    n.pby = "10";
    n.pbm = "";
    const t = [0, 0.025, 0.05, 0.075, 0.1];
    let p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[1]).toBeCloseTo(50 - (100 * 1 ** 0.5) / 2 ** 0.5 / 2);
    expect(p[2]).toBeCloseTo(50);
    expect(p[3]).toBeCloseTo(50 + (100 * 1 ** 0.5) / 2 ** 0.5 / 2);
    expect(p[4]).toBeCloseTo(100);
    n.pby = "-10";
    p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[1]).toBeCloseTo(-50 + (100 * 1 ** 0.5) / 2 ** 0.5 / 2);
    expect(p[2]).toBeCloseTo(-50);
    expect(p[3]).toBeCloseTo(-50 - (100 * 1 ** 0.5) / 2 ** 0.5 / 2);
    expect(p[4]).toBeCloseTo(-100);
  });

  it("線形補間(s)でピッチが補間される", () => {
    const n = new Note();
    n.pbs = "0;0";
    n.pbw = "100";
    n.pby = "10";
    n.pbm = "s";
    const t = [0, 0.025, 0.05, 0.075, 0.1];
    let p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[1]).toBe(25);
    expect(p[2]).toBe(50);
    expect(p[3]).toBe(75);
    expect(p[4]).toBe(100);
    n.pby = "-10";
    p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[1]).toBe(-25);
    expect(p[2]).toBe(-50);
    expect(p[3]).toBe(-75);
    expect(p[4]).toBe(-100);
  });
  it("R補間(sin曲線)でピッチが補間される", () => {
    const n = new Note();
    n.pbs = "0;0";
    n.pbw = "100";
    n.pby = "10";
    n.pbm = "r";
    const t = [0, 0.025, 0.05, 0.075, 0.1];
    let p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[2]).toBeCloseTo(50 * 2 ** 0.5);
    expect(p[4]).toBeCloseTo(100);
    n.pby = "-10";
    p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[2]).toBeCloseTo(-50 * 2 ** 0.5);
    expect(p[4]).toBeCloseTo(-100);
  });
  it("J補間(cos曲線反転)でピッチが補間される", () => {
    const n = new Note();
    n.pbs = "0;0";
    n.pbw = "100";
    n.pby = "10";
    n.pbm = "j";
    const t = [0, 0.025, 0.05, 0.075, 0.1];
    let p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[2]).toBeCloseTo(100 - 50 * 2 ** 0.5);
    expect(p[4]).toBeCloseTo(100);
    n.pby = "-10";
    p = n.getInterpPitch(n, t, 0);
    expect(p.length).toBe(5);
    expect(p[0]).toBe(0);
    expect(p[2]).toBeCloseTo(-100 + 50 * 2 ** 0.5);
    expect(p[4]).toBeCloseTo(-100);
  });
  it("負のoffsetで線形補間が正しく動作する", () => {
    const n = new Note();
    n.pbs = "-200;0";
    n.pbw = "50,150";
    n.pby = "15,0";
    n.pbm = "s,s";
    const t = [0, 0.025, 0.05, 0.075, 0.1];
    let p = n.getInterpPitch(n, t, 100);
    expect(p.length).toBe(5);
    expect(p[0]).toBeCloseTo(100);
    expect(p[1]).toBeCloseTo(75);
    expect(p[2]).toBeCloseTo(50);
    expect(p[3]).toBeCloseTo(25);
    expect(p[4]).toBeCloseTo(0);
  });

  // Phase 2: ピッチ計算early returnテスト
  it("pbsがundefinedの場合getInterpPitchは全て0を返す", () => {
    const n = new Note();
    // pbs未設定
    const t = [0, 0.05, 0.1];
    const p = n.getInterpPitch(n, t, 0);
    expect(p).toEqual([0, 0, 0]);
  });

  it("vibratoがundefinedの場合getVibratoPitchesは全て0を返す", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 480;
    // vibrato未設定
    const t = makeTimeAxis(0.005, 0, 0.5);
    const vp = n.getVibratoPitches(n, t, 0);
    expect(vp).toEqual(new Array(t.length).fill(0));
  });

  it("getVibratoDepthでfadeIn/Outを考慮した深さが計算される", () => {
    const n = new Note();
    expect(n.getVibratoDepth(100, 0, 0, 100, 20, 20)).toBeCloseTo(0);
    expect(n.getVibratoDepth(100, 10, 0, 100, 20, 20)).toBeCloseTo(50);
    expect(n.getVibratoDepth(100, 20, 0, 100, 20, 20)).toBeCloseTo(100);
    expect(n.getVibratoDepth(100, 21, 0, 100, 20, 20)).toBeCloseTo(100);
    expect(n.getVibratoDepth(100, 80, 0, 100, 20, 20)).toBeCloseTo(100);
    expect(n.getVibratoDepth(100, 81, 0, 100, 20, 20)).toBeCloseTo(95);
    expect(n.getVibratoDepth(100, 100, 0, 100, 20, 20)).toBeCloseTo(0);
  });

  it("基本ビブラートピッチが正しく生成される", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,100,100,0,0,0,0";
    const noFadevp = n.getVibratoPitches(n, t, 0);
    expect(noFadevp.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(noFadevp[100]).toBeCloseTo(0);
    expect(noFadevp[105]).toBe(100);
    expect(noFadevp[110]).toBeCloseTo(0);
    expect(noFadevp[115]).toBe(-100);
    expect(noFadevp[120]).toBeCloseTo(0);
    expect(noFadevp[125]).toBe(100);
    expect(noFadevp[130]).toBeCloseTo(0);
    expect(noFadevp[135]).toBe(-100);
    expect(noFadevp[140]).toBeCloseTo(0);
    expect(noFadevp[145]).toBe(100);
    expect(noFadevp[150]).toBeCloseTo(0);
    expect(noFadevp[155]).toBe(-100);
    expect(noFadevp[160]).toBeCloseTo(0);
    expect(noFadevp[165]).toBe(100);
    expect(noFadevp[170]).toBeCloseTo(0);
    expect(noFadevp[175]).toBe(-100);
    expect(noFadevp[180]).toBeCloseTo(0);
    expect(noFadevp[185]).toBe(100);
    expect(noFadevp[190]).toBeCloseTo(0);
    expect(noFadevp[195]).toBe(-100);
  });
  it("ビブラートのfadeInが正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,100,100,100,0,0,0";
    const fadeInVbr = n.getVibratoPitches(n, t, 0);
    expect(fadeInVbr.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(fadeInVbr[100]).toBeCloseTo(0);
    expect(fadeInVbr[105]).toBe(5);
    expect(fadeInVbr[110]).toBeCloseTo(0);
    expect(fadeInVbr[115]).toBe(-15);
    expect(fadeInVbr[120]).toBeCloseTo(0);
    expect(fadeInVbr[125]).toBe(25);
    expect(fadeInVbr[130]).toBeCloseTo(0);
    expect(fadeInVbr[135]).toBe(-35);
    expect(fadeInVbr[140]).toBeCloseTo(0);
    expect(fadeInVbr[145]).toBe(45);
    expect(fadeInVbr[150]).toBeCloseTo(0);
    expect(fadeInVbr[155]).toBe(-55);
    expect(fadeInVbr[160]).toBeCloseTo(0);
    expect(fadeInVbr[165]).toBe(65);
    expect(fadeInVbr[170]).toBeCloseTo(0);
    expect(fadeInVbr[175]).toBe(-75);
    expect(fadeInVbr[180]).toBeCloseTo(0);
    expect(fadeInVbr[185]).toBe(85);
    expect(fadeInVbr[190]).toBeCloseTo(0);
    expect(fadeInVbr[195]).toBe(-95);
  });
  it("ビブラートのfadeOutが正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,100,100,0,100,0,0";
    const fadeOutVbr = n.getVibratoPitches(n, t, 0);
    expect(fadeOutVbr.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(fadeOutVbr[100]).toBeCloseTo(0);
    expect(fadeOutVbr[105]).toBe(95);
    expect(fadeOutVbr[110]).toBeCloseTo(0);
    expect(fadeOutVbr[115]).toBe(-85);
    expect(fadeOutVbr[120]).toBeCloseTo(0);
    expect(fadeOutVbr[125]).toBe(75);
    expect(fadeOutVbr[130]).toBeCloseTo(0);
    expect(fadeOutVbr[135]).toBe(-65);
    expect(fadeOutVbr[140]).toBeCloseTo(0);
    expect(fadeOutVbr[145]).toBe(55);
    expect(fadeOutVbr[150]).toBeCloseTo(0);
    expect(fadeOutVbr[155]).toBe(-45);
    expect(fadeOutVbr[160]).toBeCloseTo(0);
    expect(fadeOutVbr[165]).toBe(35);
    expect(fadeOutVbr[170]).toBeCloseTo(0);
    expect(fadeOutVbr[175]).toBe(-25);
    expect(fadeOutVbr[180]).toBeCloseTo(0);
    expect(fadeOutVbr[185]).toBe(15);
    expect(fadeOutVbr[190]).toBeCloseTo(0);
    expect(fadeOutVbr[195]).toBe(-5);
  });
  it("ビブラートのphaseパラメータが正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,100,100,0,0,25,0";
    const phasevp = n.getVibratoPitches(n, t, 0);
    expect(phasevp.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(phasevp[100]).toBeCloseTo(100);
    expect(phasevp[105]).toBeCloseTo(0);
    expect(phasevp[110]).toBeCloseTo(-100);
    expect(phasevp[115]).toBeCloseTo(0);
    expect(phasevp[120]).toBeCloseTo(100);
    expect(phasevp[125]).toBeCloseTo(0);
    expect(phasevp[130]).toBeCloseTo(-100);
    expect(phasevp[135]).toBeCloseTo(0);
    expect(phasevp[140]).toBeCloseTo(100);
    expect(phasevp[145]).toBeCloseTo(0);
    expect(phasevp[150]).toBeCloseTo(-100);
    expect(phasevp[155]).toBeCloseTo(0);
    expect(phasevp[160]).toBeCloseTo(100);
    expect(phasevp[165]).toBeCloseTo(0);
    expect(phasevp[170]).toBeCloseTo(-100);
    expect(phasevp[175]).toBeCloseTo(0);
    expect(phasevp[180]).toBeCloseTo(100);
    expect(phasevp[185]).toBeCloseTo(0);
    expect(phasevp[190]).toBeCloseTo(-100);
    expect(phasevp[195]).toBeCloseTo(0);
  });
  it("ビブラートのlengthパラメータが正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "25,100,100,0,0,0,0";
    const lengthVb = n.getVibratoPitches(n, t, 0);
    expect(lengthVb.slice(0, 150)).toEqual(new Array(150).fill(0));
    expect(lengthVb[150]).toBeCloseTo(0);
    expect(lengthVb[155]).toBe(100);
    expect(lengthVb[160]).toBeCloseTo(0);
    expect(lengthVb[165]).toBe(-100);
    expect(lengthVb[170]).toBeCloseTo(0);
    expect(lengthVb[175]).toBe(100);
    expect(lengthVb[180]).toBeCloseTo(0);
    expect(lengthVb[185]).toBe(-100);
    expect(lengthVb[190]).toBeCloseTo(0);
    expect(lengthVb[195]).toBe(100);
  });
  it("ビブラートのheightパラメータ(正)が正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,100,100,0,0,0,100";
    const heightVbr = n.getVibratoPitches(n, t, 0);
    expect(heightVbr.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(heightVbr[100]).toBeCloseTo(0 + 100);
    expect(heightVbr[105]).toBe(100 + 100);
    expect(heightVbr[110]).toBeCloseTo(0 + 100);
    expect(heightVbr[115]).toBe(-100 + 100);
    expect(heightVbr[120]).toBeCloseTo(0 + 100);
    expect(heightVbr[125]).toBe(100 + 100);
    expect(heightVbr[130]).toBeCloseTo(0 + 100);
    expect(heightVbr[135]).toBe(-100 + 100);
    expect(heightVbr[140]).toBeCloseTo(0 + 100);
    expect(heightVbr[145]).toBe(100 + 100);
    expect(heightVbr[150]).toBeCloseTo(0 + 100);
    expect(heightVbr[155]).toBe(-100 + 100);
    expect(heightVbr[160]).toBeCloseTo(0 + 100);
    expect(heightVbr[165]).toBe(100 + 100);
    expect(heightVbr[170]).toBeCloseTo(0 + 100);
    expect(heightVbr[175]).toBe(-100 + 100);
    expect(heightVbr[180]).toBeCloseTo(0 + 100);
    expect(heightVbr[185]).toBe(100 + 100);
    expect(heightVbr[190]).toBeCloseTo(0 + 100);
    expect(heightVbr[195]).toBe(-100 + 100);
  });
  it("ビブラートのheightパラメータ(負)が正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,100,100,0,0,0,-100";
    const heightVbr = n.getVibratoPitches(n, t, 0);
    expect(heightVbr.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(heightVbr[100]).toBeCloseTo(0 - 100);
    expect(heightVbr[105]).toBe(100 - 100);
    expect(heightVbr[110]).toBeCloseTo(0 - 100);
    expect(heightVbr[115]).toBe(-100 - 100);
    expect(heightVbr[120]).toBeCloseTo(0 - 100);
    expect(heightVbr[125]).toBe(100 - 100);
    expect(heightVbr[130]).toBeCloseTo(0 - 100);
    expect(heightVbr[135]).toBe(-100 - 100);
    expect(heightVbr[140]).toBeCloseTo(0 - 100);
    expect(heightVbr[145]).toBe(100 - 100);
    expect(heightVbr[150]).toBeCloseTo(0 - 100);
    expect(heightVbr[155]).toBe(-100 - 100);
    expect(heightVbr[160]).toBeCloseTo(0 - 100);
    expect(heightVbr[165]).toBe(100 - 100);
    expect(heightVbr[170]).toBeCloseTo(0 - 100);
    expect(heightVbr[175]).toBe(-100 - 100);
    expect(heightVbr[180]).toBeCloseTo(0 - 100);
    expect(heightVbr[185]).toBe(100 - 100);
    expect(heightVbr[190]).toBeCloseTo(0 - 100);
    expect(heightVbr[195]).toBe(-100 - 100);
  });

  it("ビブラートのcycleパラメータが正しく動作する", () => {
    const n = new Note();
    n.tempo = 120;
    n.length = 960;
    const t = makeTimeAxis(0.005, 0, 1);
    expect(t.length).toBe(201);
    const uvp = n.getVibratoPitches(n, t, 0);
    expect(uvp).toEqual(new Array(201).fill(0));
    n.vibrato = "50,200,100,0,0,0,0";
    const slowSycleVbr = n.getVibratoPitches(n, t, 0);
    expect(slowSycleVbr.slice(0, 100)).toEqual(new Array(100).fill(0));
    expect(slowSycleVbr[100]).toBeCloseTo(0);
    expect(slowSycleVbr[110]).toBeCloseTo(100);
    expect(slowSycleVbr[120]).toBeCloseTo(0);
    expect(slowSycleVbr[130]).toBeCloseTo(-100);
    expect(slowSycleVbr[140]).toBeCloseTo(0);
    expect(slowSycleVbr[150]).toBeCloseTo(100);
    expect(slowSycleVbr[160]).toBeCloseTo(0);
    expect(slowSycleVbr[170]).toBeCloseTo(-100);
    expect(slowSycleVbr[180]).toBeCloseTo(0);
    expect(slowSycleVbr[190]).toBeCloseTo(100);
  });
  it("補間とビブラートを組み合わせたピッチが正しく生成される", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    n.pbs = "0;10";
    n.pbw = "500,0";
    n.pby = "10,0";
    n.pbm = "s,s";
    n.notenum = 60;
    n.vibrato = "50,250,100,0,0,0,0";
    let pitch = n.getRenderPitch();
    expect(pitch.length).toBe(107);
    pitch.slice(0, 48).forEach((p) => expect(p).toBe(100));
    expect(pitch[60]).toBeCloseTo(200);
    expect(pitch[72]).toBeCloseTo(100);
    expect(pitch[84]).toBeCloseTo(0);
    expect(pitch[96]).toBeCloseTo(100);
    pitch.slice(97).forEach((p) => expect(p).toBe(0));
  });
  it("nextノートのpbs/pby/pbmがprevのピッチ計算に反映される", () => {
    const n = new Note();
    n.lyric = "あ";
    n.length = 480;
    n.tempo = 120;
    n.pbs = "0;10";
    n.pbw = "500,0";
    n.pby = "10,0";
    n.pbm = "s,s";
    n.notenum = 60;
    n.vibrato = "50,250,100,0,0,0,0";
    const nextN = new Note();
    nextN.lyric = "あ";
    nextN.length = 480;
    nextN.tempo = 120;
    nextN.notenum = 60;
    nextN.pbs = "-500;-10";
    nextN.pbw = "0,500,0";
    nextN.pby = "-10,-10,0";
    nextN.pbm = "s,s";
    nextN.stp = 500;
    n.next = nextN;
    nextN.prev = n;
    let pitch = n.getRenderPitch();
    let npitch = nextN.getRenderPitch();
    expect(pitch.length).toBe(107);
    pitch.slice(0, 48).forEach((p) => expect(p).toBe(0));
    expect(pitch[60]).toBeCloseTo(100);
    expect(pitch[72]).toBeCloseTo(0);
    expect(pitch[84]).toBeCloseTo(-100);
    expect(pitch[96]).toBeCloseTo(0);
    pitch.slice(97).forEach((p) => expect(p).toBe(0));
    expect(npitch.length).toBe(203);
    npitch.slice(0, 48).forEach((p) => expect(p).toBe(0));
    expect(npitch[60]).toBeCloseTo(100);
    expect(npitch[72]).toBeCloseTo(0);
    expect(npitch[84]).toBeCloseTo(-100);
    expect(npitch[96]).toBeCloseTo(0);
    npitch.slice(97).forEach((p) => expect(p).toBe(0));
    nextN.notenum = 61;
    pitch = n.getRenderPitch();
    expect(pitch.length).toBe(107);
    pitch.slice(0, 48).forEach((p) => expect(p).toBe(100));
    expect(pitch[60]).toBeCloseTo(200);
    expect(pitch[72]).toBeCloseTo(100);
    expect(pitch[84]).toBeCloseTo(0);
    expect(pitch[96]).toBeCloseTo(100);
    pitch.slice(97).forEach((p) => expect(p).toBe(100));
  });
});

describe("getRequestParam", () => {
  let vb: VoiceBank;
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
  });

  it("休符ノートのリクエストパラメータが正しく生成される", () => {
    const n = new Note();
    n.length = 480;
    n.lyric = "R";
    n.tempo = 120;
    n.notenum = 60;
    const param = n.getRequestParam(vb, "", defaultNote)[0];
    expect(param.resamp).toBeUndefined();
    expect(param.append.length).toBe(500);
    expect(param.append.stp).toBe(0);
    expect(param.append.envelope.point.length).toBe(2);
    expect(param.append.envelope.value.length).toBe(0);
    expect(param.append.overlap).toBe(0);
  });

  it("directノートのリクエストパラメータが正しく生成される", () => {
    const n = new Note();
    n.length = 480;
    n.lyric = "あ";
    n.tempo = 120;
    n.notenum = 60;
    n.direct = true;
    n.envelope = "0,5,35,0,100,100,0";
    n.stp = 10;
    const param = n.getRequestParam(vb, "", defaultNote)[0];
    expect(param.resamp).toBeUndefined();
    expect(param.append.inputWav).toBe("denoise/01_あかきくけこ.wav");
    expect(param.append.length).toBe(500);
    expect(param.append.stp).toBe(10 + 1538.32);
    expect(param.append.envelope.point.length).toBe(3);
    expect(param.append.envelope.value.length).toBe(4);
    expect(param.append.overlap).toBe(-0.91);
  });

  it("resampリクエストパラメータが正しく生成される", () => {
    const n = new Note();
    n.length = 480;
    n.lyric = "あ";
    n.tempo = 120;
    n.notenum = 60;
    n.stp = 10;
    const param = n.getRequestParam(vb, "", defaultNote)[0];
    const resamp = param.resamp as ResampRequest;
    expect(resamp.inputWav).toBe("denoise/01_あかきくけこ.wav");
    expect(resamp.targetTone).toBe("C4");
    expect(resamp.velocity).toBe(100);
    expect(resamp.flags).toBe("");
    expect(resamp.offsetMs).toBe(1538.32);
    expect(resamp.targetMs).toBe(550);
    expect(resamp.fixedMs).toBe(66.21);
    expect(resamp.cutoffMs).toBe(-325.62);
    expect(resamp.intensity).toBe(100);
    expect(resamp.modulation).toBe(0);
    expect(resamp.tempo).toBe("!120.00");
    expect(resamp.pitches).toBe("AA#106#");
    expect(param.append.length).toBe(500);
    expect(param.append.stp).toBe(10);
    expect(param.append.envelope.point.length).toBe(3);
    expect(param.append.envelope.value.length).toBe(4);
    expect(param.append.overlap).toBe(-0.91);
  });

  it("deepCopyで全プロパティが深いコピーされる", () => {
    const original = new Note();
    original.index = 0;
    original.length = 1920;
    original.lyric = "あ";
    original.notenum = 60;
    original.tempo = 120;
    original.hasTempo = true;
    original.preutter = 1;
    original.overlap = 3;
    original.stp = 5;
    original.velocity = 150;
    original.intensity = 80;
    original.modulation = 30;
    original.setPitches([0, 1, 2, 3]);
    original.pbStart = -10;
    original.pbs = "-5,3";
    original.pby = "1, 2, 3";
    original.pbw = "10, 20, 30, 40";
    original.pbm = ",s,r,j,";
    original.flags = "g-5";
    original.vibrato = "1,2,3,4,5,6,7,8";
    original.envelope = "9,10,11,12,13,14,15,%,16,17,18";
    original.label = "aa";
    original.direct = true;
    original.region = "1番";
    original.regionEnd = "イントロ";

    // 参照コピーすべきオブジェクト
    const prev = new Note();
    const next = new Note();
    original.prev = prev;
    original.next = next;

    // deepCopy 実行
    const copy = original.deepCopy();

    // **1. 全プロパティが正しくコピーされているか**
    expect(copy).toEqual(original);

    // **2. コピー元とコピー後のオブジェクトは別インスタンス**
    expect(copy).not.toBe(original);

    // **3. 参照コピーされるべきオブジェクトは同じインスタンス**
    expect(copy.prev).toBe(prev);
    expect(copy.next).toBe(next);
  });

  it("dumpEnvelopeでEnvelope型が正しく文字列化される", () => {
    expect(dumpEnvelope({ point: [0, 100], value: [0, 100, 100] })).toBe(
      "0.00,100.00"
    );
    expect(dumpEnvelope({ point: [0, 5, 35], value: [0, 80, 90] })).toBe(
      "0.00,5.00,35.00,0,80,90"
    );
    expect(dumpEnvelope({ point: [0, 5, 35], value: [0, 80, 90, 5] })).toBe(
      "0.00,5.00,35.00,0,80,90,5"
    );
    expect(dumpEnvelope({ point: [0, 5, 35, 20], value: [0, 80, 90, 5] })).toBe(
      "0.00,5.00,35.00,0,80,90,5,%,20.00"
    );
    expect(
      dumpEnvelope({ point: [0, 5, 35, 20, 10], value: [0, 80, 90, 5, 75] })
    ).toBe("0.00,5.00,35.00,0,80,90,5,%,20.00,10.00,75");
  });
  it("最小限のプロパティでdumpが正しく出力される", () => {
    const n = new Note();
    n.index = 1;
    n.length = 480;
    n.lyric = "あ";
    n.notenum = 60;
    n.hasTempo = false;
    n.tempo = 120;
    const dump = n.dump();
    expect(dump).toContain("[#0001]");
    expect(dump).toContain("Length=480");
    expect(dump).toContain("Lyric=あ");
    expect(dump).toContain("NoteNum=60");
    expect(dump).not.toContain("Tempo=");
    expect(dump).not.toContain("PreUtterance=");
    expect(dump).not.toContain("VoiceOverlap=");
    expect(dump).not.toContain("StartPoint=");
    expect(dump).not.toContain("Velocity=");
    expect(dump).not.toContain("Intensity=");
    expect(dump).not.toContain("PitchBend=");
    expect(dump).not.toContain("PBStart=");
    expect(dump).not.toContain("PBS=");
    expect(dump).not.toContain("PBY=");
    expect(dump).not.toContain("PBW=");
    expect(dump).not.toContain("PBM=");
    expect(dump).not.toContain("Flags=");
    expect(dump).not.toContain("VBR=");
    expect(dump).not.toContain("Envelope=");
    expect(dump).not.toContain("Label=");
    expect(dump).not.toContain("$direct=True");
    expect(dump).not.toContain("$region=");
    expect(dump).not.toContain("$region_end=");
  });
  it("全プロパティ設定時にdumpが正しく出力される", () => {
    const n = new Note();
    n.index = 1;
    n.length = 480;
    n.lyric = "あ";
    n.notenum = 60;
    n.hasTempo = true;
    n.tempo = 120;
    n.preutter = 1;
    n.overlap = 2;
    n.stp = 3;
    n.velocity = 50;
    n.intensity = 60;
    n.pitches = "0,0";
    n.pbStart = -15;
    n.pbs = "-10;30";
    n.pby = "1,2,3";
    n.pbw = "4,5,6";
    n.pbm = ",s,r";
    n.flags = "B50";
    n.vibrato = "65,64,5,20,20,0,0,0";
    n.envelope = "0,5,35,0,100,100,0";
    n.label = "l";
    n.direct = true;
    n.region = "start";
    n.regionEnd = "end";
    const dump = n.dump();
    expect(dump).toContain("[#0001]");
    expect(dump).toContain("Length=480");
    expect(dump).toContain("Lyric=あ");
    expect(dump).toContain("NoteNum=60");
    expect(dump).toContain("Tempo=120.00");
    expect(dump).toContain("PreUtterance=1.00");
    expect(dump).toContain("VoiceOverlap=2.00");
    expect(dump).toContain("StartPoint=3.00");
    expect(dump).toContain("Velocity=50");
    expect(dump).toContain("Intensity=60");
    expect(dump).toContain("PitchBend=0,0");
    expect(dump).toContain("PBStart=-15.00");
    expect(dump).toContain("PBS=-10.0;30.0");
    expect(dump).toContain("PBY=1.0,2.0,3.0");
    expect(dump).toContain("PBW=4.0,5.0,6.0");
    expect(dump).toContain("PBM=,s,r");
    expect(dump).toContain("Flags=B50");
    expect(dump).toContain("VBR=65,64,5,20,20,0,0,0");
    expect(dump).toContain("Envelope=0.00,5.00,35.00,0,100,100,0");
    expect(dump).toContain("Label=l");
    expect(dump).toContain("$direct=True");
    expect(dump).toContain("$region=start");
    expect(dump).toContain("$region_end=end");
  });

  // Phase 3: dumpNotes関数テスト
  it("dumpNotes関数で複数ノートがUST形式で出力される", () => {
    const n1 = new Note();
    n1.index = 0;
    n1.length = 480;
    n1.lyric = "あ";
    n1.notenum = 60;

    const n2 = new Note();
    n2.index = 1;
    n2.length = 240;
    n2.lyric = "い";
    n2.notenum = 62;

    const output = dumpNotes([n1, n2], 120, "g-3");
    expect(output).toContain("[#SETTING]");
    expect(output).toContain("Charset=UTF-8");
    expect(output).toContain("Tempo=120");
    expect(output).toContain("Flags=g-3");
    expect(output).toContain("Mode2=True");
    expect(output).toContain("[#0000]");
    expect(output).toContain("Lyric=あ");
    expect(output).toContain("Length=480");
    expect(output).toContain("[#0001]");
    expect(output).toContain("Lyric=い");
    expect(output).toContain("Length=240");
    expect(output).toContain("[#TRACKEND]");
  });
});
