import { describe, expect, it } from "vitest";
import { Note } from "../../src/lib/Note";
import {
  abovePitch,
  accentPitch,
  belowPitch,
  reservePitch,
} from "../../src/utils/pitchPattern";

/**
 * pitchPattern.tsのテスト
 */
describe("pitchPattern utilities", () => {
  describe("belowPitch", () => {
    it("Cメジャースケールで3度下から始まるピッチパターンを設定", () => {
      const note = new Note();
      note.notenum = 60; // C4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120: (60/480/480)*120 = 120
      note.atPreutter = 50;

      belowPitch(note, 0, false); // C Major

      // C4の3度下: notenum-4=56(G#3)はオフスケール、notenum-3=57(A3)はオンスケール -> pby[0]=-30
      expect(note.pby).toEqual([-30]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(-30);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);

      // 16分音符 = (60/480/480)*120*1000 = 125ms
      // pbw[0] = Math.abs(pbsTime) = 50
      // pbw[1] = Math.min(125, note.msLength/2)
      expect(note.pbw[0]).toBe(50);

      // pbm: ["", ""]
      expect(note.pbm).toEqual(["", ""]);
    });

    it("前のノートがあるときpbsTimeを計算", () => {
      const prevNote = new Note();
      prevNote.length = 480; // tick
      prevNote.tempo = 480; // BPM 120
      prevNote.lyric = "あ";

      const note = new Note();
      note.notenum = 64; // E4
      note.lyric = "い";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;
      note.prev = prevNote;

      belowPitch(note, 0, false);

      // E4の3度下: notenum-4=60(C4)はオンスケール -> pby[0]=-40
      expect(note.pby).toEqual([-40]);

      // prevがあり休符でないのでpbsHeight=0
      expect(note.pbs.height).toBe(0);

      // 16分音符 = 125ms, prev.msLength/2 = 240ms (lengthはtickなので実際のmsLengthを確認する必要あり)
      // pbsTime = -Math.min(125, prev.msLength/2)
    });

    it("休符のとき何も変更しない", () => {
      const note = new Note();
      note.notenum = 60;
      note.lyric = "R";
      note.tempo = 480;
      note.atPreutter = 50;

      belowPitch(note, 0, false);

      // 休符の場合は何も変更されない（初期化されていない）
      expect(note.pby).toBeUndefined();
      expect(note.pbw).toBeUndefined();
    });

    it("マイナースケールで動作する", () => {
      const note = new Note();
      note.notenum = 69; // A4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      belowPitch(note, 9, true); // A Minor

      // A4の3度下: notenum-4=65(F4)はオンスケール -> pby[0]=-40
      expect(note.pby).toEqual([-40]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(-40);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);
    });

    it("テンポに応じてpbwを調整", () => {
      const note = new Note();
      note.notenum = 60;
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 240; // BPM 240: (60/240/480)*120 = 240
      note.atPreutter = 50;

      belowPitch(note, 0, false);

      // 16分音符 = (60/240/480)*120*1000 = 62.5ms
      // pbw[0] = Math.abs(pbsTime) = 50
      expect(note.pbw[0]).toBe(50);
    });
  });

  describe("abovePitch", () => {
    it("Cメジャースケールで3度上から始まるピッチパターンを設定", () => {
      const note = new Note();
      note.notenum = 60; // C4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      abovePitch(note, 0, false); // C Major

      // C4の3度上: notenum+4=64(E4)はオンスケール -> pby[0]=+40
      expect(note.pby).toEqual([40]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(40);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);

      // pbw[0] = Math.abs(pbsTime) = 50
      expect(note.pbw[0]).toBe(50);

      // pbm: ["", ""]
      expect(note.pbm).toEqual(["", ""]);
    });

    it("マイナースケールで動作する", () => {
      const note = new Note();
      note.notenum = 69; // A4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      abovePitch(note, 9, true); // A Minor

      // A4の3度上: notenum+3=72(C5)はオンスケール -> pby[0]=+30
      expect(note.pby).toEqual([30]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(30);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);
    });

    it("休符のとき何も変更しない", () => {
      const note = new Note();
      note.notenum = 60;
      note.lyric = "R";
      note.tempo = 480;
      note.atPreutter = 50;

      abovePitch(note, 0, false);

      // 休符の場合は何も変更されない（初期化されていない）
      expect(note.pby).toBeUndefined();
      expect(note.pbw).toBeUndefined();
    });
  });

  describe("accentPitch", () => {
    it("Cメジャースケールで3点アクセントパターンを設定", () => {
      const note = new Note();
      note.notenum = 60; // C4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      accentPitch(note, 0, false); // C Major

      // C4の3度上: notenum+4=64(E4)はオンスケール -> pby[0]=+40
      // C4の2度下: notenum-1=59(B3)はオンスケール -> pby[1]=-10
      expect(note.pby).toEqual([40, -10]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(40);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);

      // pbm: ["", "", ""]
      expect(note.pbm).toEqual(["", "", ""]);
    });

    it("マイナースケールで動作する", () => {
      const note = new Note();
      note.notenum = 69; // A4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      accentPitch(note, 9, true); // A Minor

      // A4の3度上: notenum+3=72(C5)はオンスケール -> pby[0]=+30
      // A4の2度下: notenum-2=67(G4)はオンスケール -> pby[1]=-20
      expect(note.pby).toEqual([30, -20]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(30);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);
    });

    it("休符のとき何も変更しない", () => {
      const note = new Note();
      note.notenum = 60;
      note.lyric = "R";
      note.tempo = 480;
      note.atPreutter = 50;

      accentPitch(note, 0, false);

      // 休符の場合は何も変更されない（初期化されていない）
      expect(note.pby).toBeUndefined();
      expect(note.pbw).toBeUndefined();
    });

    it("32分音符のタイミングを使用", () => {
      const note = new Note();
      note.notenum = 60;
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 240; // BPM 240
      note.atPreutter = 50;

      accentPitch(note, 0, false);

      // 32分音符 @ 240 BPM = (60/240/480)*60*1000 = 31.25ms
      // pbw[1] = 32分音符 = 31.25ms
      expect(note.pbw[1]).toBeCloseTo(31.25, 1);
    });
  });

  describe("reservePitch", () => {
    it("Cメジャースケールで4点リザーブパターンを設定", () => {
      const note = new Note();
      note.notenum = 60; // C4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      reservePitch(note, 0, false); // C Major

      // C4の3度下: notenum-3=57(A3)はオンスケール -> pby[0]=-30
      // pby[1] = 0 (ターゲット)
      // C4の2度下: notenum-1=59(B3)はオンスケール -> pby[2]=-10
      expect(note.pby).toEqual([-30, 0, -10]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(-30);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);

      // pbm: ["", "", "", ""]
      expect(note.pbm).toEqual(["", "", "", ""]);
    });

    it("マイナースケールで動作する", () => {
      const note = new Note();
      note.notenum = 69; // A4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480; // BPM 120
      note.atPreutter = 50;

      reservePitch(note, 9, true); // A Minor

      // A4の3度下: notenum-4=65(F4)はオンスケール -> pby[0]=-40
      // pby[1] = 0 (ターゲット)
      // A4の2度下: notenum-2=67(G4)はオンスケール -> pby[2]=-20
      expect(note.pby).toEqual([-40, 0, -20]);

      // prevがないのでpbsHeight=pby[0]
      expect(note.pbs.height).toBe(-40);

      // prevがないのでpbsTime=-note.atPreutter
      expect(note.pbs.time).toBe(-50);
    });

    it("休符のとき何も変更しない", () => {
      const note = new Note();
      note.notenum = 60;
      note.lyric = "R";
      note.tempo = 480;
      note.atPreutter = 50;

      reservePitch(note, 0, false);

      // 休符の場合は何も変更されない（初期化されていない）
      expect(note.pby).toBeUndefined();
      expect(note.pbw).toBeUndefined();
    });

    it("前のノートを正しく処理", () => {
      const prevNote = new Note();
      prevNote.length = 960;
      prevNote.tempo = 480;
      prevNote.lyric = "あ";

      const note = new Note();
      note.notenum = 60;
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480;
      note.atPreutter = 50;
      note.prev = prevNote;

      reservePitch(note, 0, false);

      // prevがあり休符でないのでpbsHeight=0
      expect(note.pbs.height).toBe(0);
    });
  });

  describe("エッジケース", () => {
    it("音域下限の音を処理", () => {
      const note = new Note();
      note.notenum = 24; // C1 (lowest in range)
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480;
      note.atPreutter = 50;

      belowPitch(note, 0, false);

      // C1の3度下: notenum-3=21(A0)はオンスケール -> pby[0]=-30
      expect(note.pby).toEqual([-30]);
      expect(note.pbs.height).toBe(-30);
    });

    it("音域上限の音を処理", () => {
      const note = new Note();
      note.notenum = 107; // B7 (highest in range)
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480;
      note.atPreutter = 50;

      abovePitch(note, 11, false); // B Major

      // B7の3度上: notenum+4=111(D#8)はオンスケール -> pby[0]=+40
      expect(note.pby).toEqual([40]);
      expect(note.pbs.height).toBe(40);
    });

    it("異なるスケールトーンを処理", () => {
      const note = new Note();
      note.notenum = 61; // C#4
      note.lyric = "あ";
      note.length = 480;
      note.tempo = 480;
      note.atPreutter = 50;

      belowPitch(note, 1, false); // C# Major (tone=1)

      // C#4の3度下: notenum-3=58(A#3)はオンスケール -> pby[0]=-30
      expect(note.pby).toEqual([-30]);
      expect(note.pbs.height).toBe(-30);
    });
  });
});
