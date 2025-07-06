import OtoRecord from "utauoto/dist/OtoRecord";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Note } from "../../../src/lib/Note";
import { JPCVorVCVPhonemizer } from "../../../src/lib/Phonemizer/JPCVorVCVPhonemizer";
import { BaseVoiceBank } from "../../../src/lib/VoiceBanks/BaseVoiceBank";

describe("JPCVorVCVPhonemizer", () => {
  const phonemizer = new JPCVorVCVPhonemizer();
  let vb: BaseVoiceBank;
  const createTestNotes = (lyrics: string[]): Note[] => {
    const notes = new Array<Note>();
    lyrics.forEach((lyric) => {
      const n = new Note();
      n.lyric = lyric;
      n.tempo = 120;
      n.notenum = 60;
      n.phonemizer = phonemizer;
      notes.push(n);
    });
    notes.forEach((n, i) => {
      // @ts-ignore
      n.prev = i === 0 ? undefined : notes[i - 1];
      // @ts-ignore
      n.next = i === notes.length - 1 ? undefined : notes[i + 1];
    });
    return notes;
  };
  beforeEach(() => {
    vi.clearAllMocks();
    vb = {
      getOtoRecord: vi.fn(), // vb.getOtoRecord をモック
    } as unknown as BaseVoiceBank;
  });

  it("getLastPhoneme:aの場合", () => {
    const notes = createTestNotes(["あ", "a あ", "あA4", "か", "a しゃF4"]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("a");
    });
  });
  it("getLastPhoneme:iの場合", () => {
    const notes = createTestNotes(["い", "a い", "いA4", "き", "a いぃF4"]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("i");
    });
  });
  it("getLastPhoneme:uの場合", () => {
    const notes = createTestNotes([
      "う",
      "a う",
      "うA4",
      "く",
      "a しゅF4",
      "ヴ",
    ]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("u");
    });
  });
  it("getLastPhoneme:eの場合", () => {
    const notes = createTestNotes(["え", "a え", "えA4", "け", "a しぇF4"]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("e");
    });
  });
  it("getLastPhoneme:oの場合", () => {
    const notes = createTestNotes(["お", "a お", "おA4", "こ", "a しょF4"]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("o");
    });
  });
  it("getLastPhoneme:nの場合", () => {
    const notes = createTestNotes(["ん"]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("n");
    });
  });
  it("getLastPhoneme:-の場合", () => {
    const notes = createTestNotes(["R", "unknown", "不明"]);
    notes.forEach((n) => {
      expect(phonemizer.getLastPhoneme(n)).toBe("-");
    });
    expect(phonemizer.getLastPhoneme(undefined)).toBe("-");
  });

  it("applyOto:lyricに!が含まれるときgetOtoRecordに入力値が渡る", () => {
    const notes = createTestNotes(["!あ"]);
    const mockOtoRecord = {
      alias: "あ",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(
      mockOtoRecord
    );
    phonemizer.applyOto(notes[0], vb);
    expect(vb.getOtoRecord).toHaveBeenCalledWith("あ", 60, "");
    expect(notes[0].atAlias).toBe("あ");
  });
  it("applyOto:平仮名が含まれない歌詞の時、そのままの値を返す", () => {
    const notes = createTestNotes(["?息"]);
    const mockOtoRecord = {
      alias: "息",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(
      mockOtoRecord
    );
    phonemizer.applyOto(notes[0], vb);
    expect(vb.getOtoRecord).toHaveBeenCalledWith("?息", 60, "");
    expect(notes[0].atAlias).toBe("息");
  });

  it("applyOto:suffix付きlyricをVCV化したエイリアスが見つかった場合", () => {
    const notes = createTestNotes(["あA4"]);
    const mockOtoRecord = {
      alias: "- あA4",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>).mockReturnValue(
      mockOtoRecord
    );
    phonemizer.applyOto(notes[0], vb);
    expect(vb.getOtoRecord).toHaveBeenCalledWith("- あA4", 60, "");
    expect(notes[0].atAlias).toBe("- あA4");
  });

  it("applyOto:suffix付きlyricをVCV化したエイリアスが見つかず、VCV化したエイリアスは見つかった場合", () => {
    const notes = createTestNotes(["あA4"]);
    const mockOtoRecord = {
      alias: "- あ",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null) // 1回目の呼び出しで null を返す
      .mockReturnValueOnce(mockOtoRecord); // 2回目の呼び出しで mockOtoRecord を返す
    phonemizer.applyOto(notes[0], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "- あA4", 60, ""); // 1回目
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "- あ", 60, ""); // 2回目
    expect(notes[0].atAlias).toBe("- あ");
  });
  it("applyOto:VCVエイリアスが見つからず、suffix付き母音結合エイリアスが見つかる場合", () => {
    const notes = createTestNotes(["あ", "あA4"]);
    const mockOtoRecord = {
      alias: "* あA4",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "* あA4", 60, "");
    expect(notes[1].atAlias).toBe("* あA4");
  });
  it("applyOto:VCVエイリアスが見つからず、suffix無し母音結合エイリアスが見つかる場合", () => {
    const notes = createTestNotes(["あ", "あA4"]);
    const mockOtoRecord = {
      alias: "* あ",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "* あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "* あ", 60, "");
    expect(notes[1].atAlias).toBe("* あ");
  });
  it("applyOto:VCV,母音結合が見つからずsuffix付きCVが見つかる", () => {
    const notes = createTestNotes(["あ", "あA4"]);
    const mockOtoRecord = {
      alias: "あA4",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "* あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "* あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(5, "あA4", 60, "");
    expect(notes[1].atAlias).toBe("あA4");
  });
  it("applyOto:VCV,母音結合が見つからずCVが見つかる", () => {
    const notes = createTestNotes(["あ", "あA4"]);
    const mockOtoRecord = {
      alias: "あ",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "* あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "* あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(5, "あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(6, "あ", 60, "");
    expect(notes[1].atAlias).toBe("あ");
  });
  it("applyOto:VCV,母音結合,CVまで見つからず、元のlyricが見つかる", () => {
    const notes = createTestNotes(["あ", "test/あA4"]);
    const mockOtoRecord = {
      alias: "test/あA4",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "* あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "* あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(5, "あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(6, "あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(7, "test/あA4", 60, "");
    expect(notes[1].atAlias).toBe("test/あA4");
  });
  it("applyOto:最後までエイリアスが見つからない", () => {
    const notes = createTestNotes(["あ", "test/あA4"]);
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "* あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "* あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(5, "あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(6, "あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(7, "test/あA4", 60, "");
    expect(notes[1].atAlias).toBe("R");
  });
  it("applyOto:?マークがついている場合", () => {
    const notes = createTestNotes(["あ", "?test/あA4"]);
    const mockOtoRecord = {
      alias: "test/あA4",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[1], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "?a あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "?a あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "?* あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "?* あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(5, "?あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(6, "?あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(7, "?test/あA4", 60, "");
    expect(notes[1].atAlias).toBe("test/あA4");
  });
  it("applyOto:prevPhonemeが-の場合、母音結合ノートの処理は飛ばされる", () => {
    const notes = createTestNotes(["?test/あA4", "?test/あA4"]);
    const mockOtoRecord = {
      alias: "test/あA4",
      pre: 100,
      overlap: 50,
      dirpath: "path/to",
      filename: "file.wav",
    } as OtoRecord;
    (vb.getOtoRecord as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockOtoRecord);
    phonemizer.applyOto(notes[0], vb);
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(1, "?- あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(2, "?- あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(3, "?あA4", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(4, "?あ", 60, "");
    expect(vb.getOtoRecord).toHaveBeenNthCalledWith(5, "?test/あA4", 60, "");
    expect(notes[0].atAlias).toBe("test/あA4");
  });
});
