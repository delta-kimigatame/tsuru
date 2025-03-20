import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EnvelopeTypeOptions,
  PreprocessingBatchProcess,
} from "../../../src/lib/BatchProcess/PreprocessingBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const bp = new PreprocessingBatchProcess();

describe("PreprocessingBatchProcessのvibratoProgress", () => {
  const createTestNotes = (): Note[] => {
    const notes = Array<Note>();
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].lyric = "あ";
    notes[0].length = 480;
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].lyric = "あ";
    notes[1].length = 960;
    notes[1].prev = notes[0];
    notes[0].next = notes[1];
    notes.push(new Note());
    notes[2].index = 2;
    notes[2].lyric = "あ";
    notes[2].length = 960;
    notes[2].prev = notes[1];
    notes[1].next = notes[2];
    notes.push(new Note());
    notes[3].index = 3;
    notes[3].lyric = "R";
    notes[3].length = 960;
    notes[3].prev = notes[2];
    notes[2].next = notes[3];
    notes.push(new Note());
    notes[4].index = 4;
    notes[4].lyric = "あ";
    notes[4].length = 960;
    notes[4].prev = notes[3];
    notes[3].next = notes[4];
    return notes;
  };

  it("ending.isProcessがtrueのとき、Rの前と最後のノートにビブラートが適用される", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: false, threshold: 480 },
        long: { isProcess: false, threshold: 960 },
        ending: { isProcess: true, threshold: 960 },
      })
    );
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toBeUndefined();
    expect(notes[2].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
  });
  it("ending.isProcessがtrueで、Rの前と最後のノートでも、threshold以下であれば適用されない", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: false, threshold: 480 },
        long: { isProcess: false, threshold: 960 },
        ending: { isProcess: true, threshold: 961 },
      })
    );
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toBeUndefined();
    expect(notes[2].vibrato).toBeUndefined();
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toBeUndefined();
  });

  it("long.isProcessがtrueのとき、lyricがR以外のノートに適用される", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: false, threshold: 480 },
        long: { isProcess: true, threshold: 960 },
        ending: { isProcess: false, threshold: 960 },
      })
    );
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toEqual({
      length: 70,
      cycle: 160,
      depth: 50,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    expect(notes[2].vibrato).toEqual({
      length: 70,
      cycle: 160,
      depth: 50,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toEqual({
      length: 70,
      cycle: 160,
      depth: 50,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
  });

  it("long.isProcessがtrueとending.isProcessingの両方がtrueのとき、ending設定が優先される", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: false, threshold: 480 },
        long: { isProcess: true, threshold: 960 },
        ending: { isProcess: true, threshold: 960 },
      })
    );
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toEqual({
      length: 70,
      cycle: 160,
      depth: 50,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    expect(notes[2].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
  });
  it("long.isProcessがtrueのときでも、threshold以下のノートには適用されない", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: false, threshold: 480 },
        long: { isProcess: true, threshold: 961 },
        ending: { isProcess: false, threshold: 960 },
      })
    );
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toBeUndefined();
    expect(notes[2].vibrato).toBeUndefined();
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toBeUndefined();
  });
  it("default.isProcessがtrueのとき、R以外のノートに適用される", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: true, threshold: 480 },
        long: { isProcess: false, threshold: 960 },
        ending: { isProcess: false, threshold: 960 },
      })
    );
    expect(notes[0].vibrato).toEqual({
      length: 80,
      cycle: 200,
      depth: 20,
      fadeInTime: 20,
      fadeOutTime: 20,
      phase: 0,
      height: 0,
    });
    expect(notes[1].vibrato).toEqual({
      length: 80,
      cycle: 200,
      depth: 20,
      fadeInTime: 20,
      fadeOutTime: 20,
      phase: 0,
      height: 0,
    });
    expect(notes[2].vibrato).toEqual({
      length: 80,
      cycle: 200,
      depth: 20,
      fadeInTime: 20,
      fadeOutTime: 20,
      phase: 0,
      height: 0,
    });
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toEqual({
      length: 80,
      cycle: 200,
      depth: 20,
      fadeInTime: 20,
      fadeOutTime: 20,
      phase: 0,
      height: 0,
    });
  });
  it("default.isProcessがtrueのときでも、threshold以下のノートには適用されない", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: true, threshold: 961 },
        long: { isProcess: false, threshold: 960 },
        ending: { isProcess: false, threshold: 960 },
      })
    );
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toBeUndefined();
    expect(notes[2].vibrato).toBeUndefined();
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toBeUndefined();
  });
  it("3項目ともtrueのとき、優先順位はending>long>default", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: true, threshold: 480 },
        long: { isProcess: true, threshold: 960 },
        ending: { isProcess: true, threshold: 960 },
      })
    );
    /** default */
    expect(notes[0].vibrato).toEqual({
      length: 80,
      cycle: 200,
      depth: 20,
      fadeInTime: 20,
      fadeOutTime: 20,
      phase: 0,
      height: 0,
    });
    /** long */
    expect(notes[1].vibrato).toEqual({
      length: 70,
      cycle: 160,
      depth: 50,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    /** ending */
    expect(notes[2].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
    /** 休符 */
    expect(notes[3].vibrato).toBeUndefined();
    /** ending */
    expect(notes[4].vibrato).toEqual({
      length: 70,
      cycle: 180,
      depth: 65,
      fadeInTime: 10,
      fadeOutTime: 10,
      phase: 50,
      height: 0,
    });
  });
  it("条件に該当しないビブラートは削除される。", () => {
    const notes = createTestNotes();
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: true, threshold: 480 },
        long: { isProcess: true, threshold: 960 },
        ending: { isProcess: true, threshold: 960 },
      })
    );
    /** ここ時点では3以外にビブラートがあるはず */
    notes.forEach((n) =>
      bp.vibratoProcess(n, {
        default: { isProcess: false, threshold: 480 },
        long: { isProcess: false, threshold: 960 },
        ending: { isProcess: false, threshold: 960 },
      })
    );
    /** 全てfalseでビブラートが消えるはず */
    expect(notes[0].vibrato).toBeUndefined();
    expect(notes[1].vibrato).toBeUndefined();
    expect(notes[2].vibrato).toBeUndefined();
    expect(notes[3].vibrato).toBeUndefined();
    expect(notes[4].vibrato).toBeUndefined();
  });
});

describe("PreprocessingBatchProcessのenvelopeCrossfade", () => {
  const createTestNotes = (): Note[] => {
    /** atOverlapはoverlap代入時に自動計算される */
    const notes = new Array<Note>();
    /** 先頭ノートの処理を確認するためのノート */
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].overlap = 10;
    notes[0].lyric = "あ";
    notes[0] = notes[0].deepCopy();
    /** 前のノートが非休符でoverlapがある。後ろのノートが休符 */
    notes.push(new Note());
    notes[1].index = 1;
    notes[1].overlap = 11;
    notes[1].lyric = "あ";
    notes[1] = notes[1].deepCopy();
    notes[1].prev = notes[0];
    notes[0].next = notes[1];
    /** 休符 */
    notes.push(new Note());
    notes[2].index = 2;
    notes[2].overlap = 12;
    notes[2].lyric = "R";
    notes[2].prev = notes[1];
    notes[1].next = notes[2];
    /** 前のノートが休符で後ろのノートが非休符 */
    notes.push(new Note());
    notes[3].index = 1;
    notes[3].overlap = 13;
    notes[3].lyric = "あ";
    notes[3].prev = notes[2];
    notes[2].next = notes[3];
    /** 前後両方のノートが非休符 */
    notes.push(new Note());
    notes[4].index = 1;
    notes[4].overlap = 14;
    notes[4].lyric = "あ";
    notes[4].prev = notes[3];
    notes[3].next = notes[4];
    /** オーバーラップがマイナスの音の前の音 */
    notes.push(new Note());
    notes[5].index = 1;
    notes[5].overlap = 15;
    notes[5].lyric = "あ";
    notes[5].prev = notes[4];
    notes[4].next = notes[5];
    /** オーバーラップがマイナスの音の前の音で最後の音 */
    notes.push(new Note());
    notes[6].index = 1;
    notes[6].overlap = -15;
    notes[6].lyric = "か";
    notes[6].prev = notes[5];
    notes[5].next = notes[6];

    return notes;
  };

  it("クロスフェードのテスト", () => {
    const notes = createTestNotes();
    notes.forEach((n) => bp.envelopeCrossfade(n));
    /** 前の音がないためp2はdefault(5) */
    expect(notes[0].envelope).toEqual({
      point: [0, 5, 11],
      value: [0, 100, 100, 0],
    });
    /** 後ろの音が休符のためp3はdefault(35) */
    expect(notes[1].envelope).toEqual({
      point: [0, 11, 35],
      value: [0, 100, 100, 0],
    });
    /** 休符分のエンベロープは使われないパラメータのためテストしない */
    /** 前の音が休符のためp2はdefault(5) */
    expect(notes[3].envelope).toEqual({
      point: [0, 5, 14],
      value: [0, 100, 100, 0],
    });
    /** 前後あり */
    expect(notes[4].envelope).toEqual({
      point: [0, 14, 15],
      value: [0, 100, 100, 0],
    });
    /** 後ろの音がオーバーラップマイナスなためp3はdefault(35) */
    expect(notes[5].envelope).toEqual({
      point: [0, 15, 35],
      value: [0, 100, 100, 0],
    });
    /**
     * 後ろの音がないためp3はdefault(35)
     * オーバーラップがマイナスのためp2はdefault(5)
     * */
    expect(notes[6].envelope).toEqual({
      point: [0, 5, 35],
      value: [0, 100, 100, 0],
    });
  });
});
describe("PreprocessingBatchProcessのenvelopeProcessing", () => {
  let bp: PreprocessingBatchProcess;

  beforeEach(() => {
    bp = new PreprocessingBatchProcess();
  });

  it("optionが'reset'の場合、note.setEnvelope(undefined)が呼ばれる", () => {
    const note = new Note();
    note.lyric = "folder- あsuffix"; // 任意の値
    const setEnvelopeSpy = vi.spyOn(note, "setEnvelope");
    bp.envelopeProcess(note, "reset" as EnvelopeTypeOptions);
    expect(setEnvelopeSpy).toHaveBeenCalledWith(undefined);
  });

  it("optionが'allCrossFade'の場合、envelopeCrossfadeが呼ばれる", () => {
    const note = new Note();
    note.lyric = "folder- あsuffix"; // 任意の値
    const envelopeCrossfadeSpy = vi.spyOn(bp, "envelopeCrossfade");
    bp.envelopeProcess(note, "allCrossFade" as EnvelopeTypeOptions);
    expect(envelopeCrossfadeSpy).toHaveBeenCalledWith(note);
  });

  it("optionが'vcvCrossFade'かつ、VCVCheck.test(note.lyric)がtrueの場合、envelopeCrossfadeが呼ばれる", () => {
    const note = new Note();
    // VCVCheckパターン /[-aiuron] ([ぁ-んァ-ヶ]+)/ にマッチする文字列
    // 例: ハイフンと半角スペースを含むので、"folder- あsuffix" など
    note.lyric = "folder- あsuffix";
    const envelopeCrossfadeSpy = vi.spyOn(bp, "envelopeCrossfade");
    bp.envelopeProcess(note, "vcvCrossFade" as EnvelopeTypeOptions);
    expect(envelopeCrossfadeSpy).toHaveBeenCalledWith(note);
  });

  it("optionが'vcvCrossFade'かつ、VCVCheck.test(note.lyric)がfalseの場合、note.setEnvelope(undefined)が呼ばれる", () => {
    const note = new Note();
    // VCVCheck にマッチしない文字列（ハイフンと半角スペースが存在しない）
    note.lyric = "folderあsuffix";
    const setEnvelopeSpy = vi.spyOn(note, "setEnvelope");
    bp.envelopeProcess(note, "vcvCrossFade" as EnvelopeTypeOptions);
    expect(setEnvelopeSpy).toHaveBeenCalledWith(undefined);
  });
});
describe("PreprocessingBatchProcessのlyricProcessing", () => {
  // ヘルパー: 指定した lyric を持つ Note を作成する。
  // 必要に応じて prev を設定できるようにする。
  const createNote = (lyric: string, prev?: Note): Note => {
    const note = new Note();
    note.lyric = lyric;
    note.length = 480;
    note.tempo = 120;
    if (prev) {
      note.prev = prev;
      prev.next = note;
    }
    return note;
  };
  // CVモードのテストケース

  it("modeがCVでprevが未設定の場合、useHeadingCVがtrueなら'- {alias}'を返す", () => {
    const note = createNote("folder- あsuffix"); // 正規表現により alias = "あ"
    const options = {
      mode: "CV" as const,
      replace: false,
      useHeadingCV: true,
      vowelConnect: "none" as const,
    };
    bp.lyricProcess(note, options);
    // prevが未設定なので先頭音として扱われ、'- あ'となる
    expect(note.lyric).toBe("- あ");
  });

  it("modeがCVでprevが未設定の場合、vowelConnectが'*'の場合は母音結合しない", () => {
    const note = createNote("folder- あsuffix");
    const options = {
      mode: "CV" as const,
      replace: false,
      useHeadingCV: false,
      vowelConnect: "*" as const,
    };
    bp.lyricProcess(note, options);
    // prevが未設定のため条件に合わず、単に alias が返される
    expect(note.lyric).toBe("あ");
  });

  it("modeがCVでprev.lyric==='R'の場合、useHeadingCVがtrueなら'- {alias}'を返す", () => {
    const prevNote = createNote("dummy");
    prevNote.lyric = "R";
    const note = createNote("folder- あsuffix", prevNote);
    const options = {
      mode: "CV" as const,
      replace: false,
      useHeadingCV: true,
      vowelConnect: "none" as const,
    };
    bp.lyricProcess(note, options);
    expect(note.lyric).toBe("- あ");
  });

  it("modeがCVでprev.lyric!== 'R'の場合、useHeadingCVがfalseかつvowelConnectが'*'なら'* {alias}'になる", () => {
    const prevNote = createNote("folder- いsuffix");
    const note = createNote("folder- あsuffix", prevNote);
    const options = {
      mode: "CV" as const,
      replace: false,
      useHeadingCV: false,
      vowelConnect: "*" as const,
    };
    bp.lyricProcess(note, options);
    // prev が存在し、かつ alias ("あ") は1文字の母音と一致するため、母音結合が適用される
    expect(note.lyric).toBe("* あ");
  });

  it("modeがCVでprev.lyric!== 'R'の場合、vowelConnectが'param'ならaliasのみ返しタイミングパラメータを設定する", () => {
    const prevNote = createNote("folder- いsuffix");
    const note = createNote("folder- あsuffix", prevNote);
    const options = {
      mode: "CV" as const,
      replace: false,
      useHeadingCV: false,
      vowelConnect: "param" as const,
    };
    bp.lyricProcess(note, options);
    expect(note.lyric).toBe("あ");
    expect(note.stp).toBe(50);
    expect(note.preutter).toBe(25);
    expect(note.overlap).toBe(50);
  });

  it("modeがCVでprev.lyric!== 'R'の場合、vowelConnectが'none'ならaliasのみ返しタイミングパラメータは変更されない", () => {
    const prevNote = createNote("folder- いsuffix");
    const note = createNote("folder- あsuffix", prevNote);
    // 事前にタイミングパラメータに特定の値を設定
    note.stp = 999;
    note.preutter = 999;
    note.overlap = 999;
    const options = {
      mode: "CV" as const,
      replace: false,
      useHeadingCV: false,
      vowelConnect: "none" as const,
    };
    bp.lyricProcess(note, options);
    expect(note.lyric).toBe("あ");
    expect(note.stp).toBe(999);
    expect(note.preutter).toBe(999);
    expect(note.overlap).toBe(999);
  });

  it("modeがCVでreplaceがtrueの場合、対象文字が置換される", () => {
    const note = createNote("folder- をsuffix");
    const options = {
      mode: "CV" as const,
      replace: true,
      useHeadingCV: false,
      vowelConnect: "none" as const,
    };
    bp.lyricProcess(note, options);
    // "を" が "お" に置換されるので alias が "お" になる
    expect(note.lyric).toBe("お");
  });

  // VCVモードのテストケース

  it("modeがVCVでnote.prevがundefinedの場合、'- {alias}'になる", () => {
    const note = createNote("folder- あsuffix");
    const options = {
      mode: "VCV" as const,
      replace: false,
      useHeadingCV: false,
      vowelConnect: "none" as const,
    };
    bp.lyricProcess(note, options);
    expect(note.lyric).toBe("- あ");
  });

  it("modeがVCVでnote.prev.lyric==='R'の場合、'- {alias}'になる", () => {
    const prevNote = createNote("dummy");
    prevNote.lyric = "R";
    const note = createNote("folder- あsuffix", prevNote);
    const options = {
      mode: "VCV" as const,
      replace: false,
      useHeadingCV: false,
      vowelConnect: "none" as const,
    };
    bp.lyricProcess(note, options);
    expect(note.lyric).toBe("- あ");
  });

  it("modeがVCVでnote.prev.lyricが母音に該当する場合、該当母音とaliasが返される", () => {
    const vowelsMapping: { input: string; expected: string }[] = [
      { input: "あ", expected: "a" },
      { input: "い", expected: "i" },
      { input: "う", expected: "u" },
      { input: "え", expected: "e" },
      { input: "お", expected: "o" },
      { input: "ん", expected: "n" },
    ];
    for (const { input, expected } of vowelsMapping) {
      const prevNote = createNote(`folder- ${input}suffix`);
      const note = createNote("folder- あsuffix", prevNote);
      const options = {
        mode: "VCV" as const,
        replace: false,
        useHeadingCV: false,
        vowelConnect: "none" as const,
      };
      bp.lyricProcess(note, options);
      expect(note.lyric).toBe(`${expected} あ`);
    }
  });
});

describe("PreprocessingBatchProcess", () => {
  const createTestNote = (): Note[] => {
    const notes = new Array<Note>();
    /** notes[0]は初期値があるパターン */
    notes.push(new Note());
    notes[0].index = 0;
    notes[0].lyric = "あ";
    notes[0].length = 480;
    notes[0].tempo = 120;
    notes[0].intensity = 100;
    notes[0].velocity = 100;
    notes[0].modulation = 0;
    notes[0].flags = "B50";
    notes[0].pbsTime = -100;
    notes[0].pbsHeight = 10;
    notes[0].setPbm(["r", "j"]);
    notes[0].setPbw([100, 100]);
    notes[0].setPby([10, 10]);
    notes[0] = notes[0].deepCopy();
    /** notes[1]は初期値がないパターン */
    notes.push(new Note());
    notes[1].index = 0;
    notes[1].lyric = "あ";
    notes[1].length = 480;
    notes[1].tempo = 120;
    notes[1] = notes[1].deepCopy();
    notes[1].prev = notes[0];
    notes[0].next = notes[1];
    /** notes[2]は休符のパターン */
    notes.push(new Note());
    notes[2].index = 0;
    notes[2].lyric = "R";
    notes[2].length = 480;
    notes[2].tempo = 120;
    notes[2] = notes[2].deepCopy();
    notes[2].prev = notes[1];
    notes[1].next = notes[2];
    return notes;
  };
  let bp: PreprocessingBatchProcess;
  let notes: Note[];
  beforeEach(() => {
    bp = new PreprocessingBatchProcess();
    undoManager.clear();
    notes = createTestNote();
  });
  it("全てのオプションがtrueの場合", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: true,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: true,
      envelopeType: "allCrossFade",
      vibrato: true,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: true,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: true,
      intensityValue: 110,
      velocity: true,
      velocityValue: 120,
      modulation: true,
      modulationValue: 20,
      flags: true,
      flagsValue: "g-5",
    });
    expect(lyricSpy).toHaveBeenCalledTimes(3);
    expect(envelopeSpy).toHaveBeenCalledTimes(3);
    expect(vibratoSpy).toHaveBeenCalledTimes(3);
    expect(result[0].pbs.height).toBe(0);
    expect(result[0].pbs.time).toBe(-50);
    expect(result[0].pby).toEqual([0]);
    expect(result[0].pbw).toEqual([60]);
    expect(result[0].pbm).toEqual([""]);
    expect(result[1].pbs.height).toBe(0);
    expect(result[1].pbs.time).toBe(-50);
    expect(result[1].pby).toEqual([0]);
    expect(result[1].pbw).toEqual([60]);
    expect(result[1].pbm).toEqual([""]);
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(110);
    expect(result[1].intensity).toBe(110);
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(120);
    expect(result[1].velocity).toBe(120);
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(20);
    expect(result[1].modulation).toBe(20);
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("g-5");
    expect(result[1].flags).toBe("g-5");
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    undo.forEach((n, i) => {
      n.prev = i === 0 ? undefined : undo[i - 1];
      n.next = i === n.length - 1 ? undefined : undo[i + 1];
    });
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("全てのオプションがfalseの場合", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("lyricがtrueだがlyricOptionsがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: true,
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("envelopeがtrueだがenvelopeTypeがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: true,
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("vibratoがtrueだがvibratoOptionsがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: true,
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("pitchがtrueだがpitchOptionsがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: true,
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("intensityがtrueだがintensityValueがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: true,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("velocityがtrueだがvelocityValueがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: true,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("modulationがtrueだがmodulationValueがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: true,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("flagsがtrueだがflagsValueがない", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: true,
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });

  it("lyricがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: true,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).toHaveBeenCalledTimes(3);
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    undo.forEach((n, i) => {
      n.prev = i === 0 ? undefined : undo[i - 1];
      n.next = i === n.length - 1 ? undefined : undo[i + 1];
    });
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });

  it("envelopeがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: true,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).toHaveBeenCalledTimes(3);
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });

  it("vibratoがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: true,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).toHaveBeenCalledTimes(3);
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("pitchがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: true,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(0);
    expect(result[0].pbs.time).toBe(-50);
    expect(result[0].pby).toEqual([0]);
    expect(result[0].pbw).toEqual([60]);
    expect(result[0].pbm).toEqual([""]);
    expect(result[1].pbs.height).toBe(0);
    expect(result[1].pbs.time).toBe(-50);
    expect(result[1].pby).toEqual([0]);
    expect(result[1].pbw).toEqual([60]);
    expect(result[1].pbm).toEqual([""]);
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("intensityがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: true,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(110);
    expect(result[1].intensity).toBe(110);
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("velocityがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: true,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(120);
    expect(result[1].velocity).toBe(120);
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("modulationがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: true,
      modulationValue: 20,
      flags: false,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(20);
    expect(result[1].modulation).toBe(20);
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("B50");
    expect(result[1].flags).toBeUndefined();
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
  it("flagsがtrue", () => {
    const envelopeSpy = vi.spyOn(bp, "envelopeProcess");
    const vibratoSpy = vi.spyOn(bp, "vibratoProcess");
    const lyricSpy = vi.spyOn(bp, "lyricProcess");
    const result = bp.process(notes, {
      lyric: false,
      lyricOptions: {
        mode: "CV",
        replace: false,
        useHeadingCV: false,
        vowelConnect: "*",
      },
      envelope: false,
      envelopeType: "allCrossFade",
      vibrato: false,
      vibratoOptions: {
        ending: { isProcess: true, threshold: 960 },
        long: { isProcess: true, threshold: 960 },
        default: { isProcess: true, threshold: 480 },
      },
      pitch: false,
      pitchOptions: { timing: -50, speed: 60 },
      intensity: false,
      intensityValue: 110,
      velocity: false,
      velocityValue: 120,
      modulation: false,
      modulationValue: 20,
      flags: true,
      flagsValue: "g-5",
    });
    expect(lyricSpy).not.toHaveBeenCalled();
    expect(envelopeSpy).not.toHaveBeenCalled();
    expect(vibratoSpy).not.toHaveBeenCalled();
    expect(result[0].pbs.height).toBe(10);
    expect(result[0].pbs.time).toBe(-100);
    expect(result[0].pby).toEqual([10, 10]);
    expect(result[0].pbw).toEqual([100, 100]);
    expect(result[0].pbm).toEqual(["r", "j"]);
    expect(result[1].pbs).toBeUndefined();
    expect(result[1].pby).toBeUndefined();
    expect(result[1].pbw).toBeUndefined();
    expect(result[1].pbm).toBeUndefined();
    expect(result[2].pbs).toBeUndefined();
    expect(result[2].pby).toBeUndefined();
    expect(result[2].pbw).toBeUndefined();
    expect(result[2].pbm).toBeUndefined();
    expect(result[0].intensity).toBe(100);
    expect(result[1].intensity).toBeUndefined();
    expect(result[2].intensity).toBeUndefined();
    expect(result[0].velocity).toBe(100);
    expect(result[1].velocity).toBeUndefined();
    expect(result[2].velocity).toBeUndefined();
    expect(result[0].modulation).toBe(0);
    expect(result[1].modulation).toBeUndefined();
    expect(result[2].modulation).toBeUndefined();
    expect(result[0].flags).toBe("g-5");
    expect(result[1].flags).toBe("g-5");
    expect(result[2].flags).toBeUndefined();
    const undo = undoManager.undo();
    const redo = undoManager.redo();
    expect(undo).toEqual(notes);
    expect(redo).toEqual(result);
  });
});
