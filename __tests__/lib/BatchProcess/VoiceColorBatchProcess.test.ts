import { beforeEach, describe, expect, it } from "vitest";
import { VoiceColorBatchProcess } from "../../../src/lib/BatchProcess/VoiceColorBatchProcess";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";

const createTestNotes = (): Note[] => {
  const notes = new Array<Note>();

  notes.push(new Note());
  notes[0].index = 0;
  notes[0].lyric = "R";
  notes[0].voiceColor = "Normal";

  notes.push(new Note());
  notes[1].index = 1;
  notes[1].lyric = "あ";
  notes[1].voiceColor = "Normal";

  notes.push(new Note());
  notes[2].index = 2;
  notes[2].lyric = "い";
  notes[2].voiceColor = "Normal";

  return notes;
};

/** BaseVoiceBankのモック（colors を持つ最小実装） */
const createMockVb = (colors: string[]) =>
  ({
    colors,
  }) as unknown as import("../../../src/lib/VoiceBanks/BaseVoiceBank").BaseVoiceBank;

describe("VoiceColorBatchProcess", () => {
  let bp: VoiceColorBatchProcess;

  beforeEach(() => {
    undoManager.clear();
    bp = new VoiceColorBatchProcess();
  });

  it("休符以外のvoiceColorを一括変更する", () => {
    bp.vb = createMockVb(["Normal", "Soft", "Power"]);
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "Soft" });

    expect(result[0].voiceColor).toBe("Normal"); // 休符は変更されない
    expect(result[1].voiceColor).toBe("Soft");
    expect(result[2].voiceColor).toBe("Soft");

    // 元ノートは変更されない
    expect(notes[1].voiceColor).toBe("Normal");
    expect(notes[2].voiceColor).toBe("Normal");
  });

  it("休符は変更されない", () => {
    bp.vb = createMockVb(["Normal", "Soft"]);
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "Soft" });

    expect(result[0].lyric).toBe("R");
    expect(result[0].voiceColor).toBe("Normal");
  });

  it("voiceColorValueが空文字の場合はvoiceColorをリセットする", () => {
    bp.vb = createMockVb(["Normal", "Soft"]);
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "" });

    expect(result[1].voiceColor).toBe("");
    expect(result[2].voiceColor).toBe("");
  });

  it("選択肢にない値が指定された場合はno-op", () => {
    bp.vb = createMockVb(["Normal", "Soft"]);
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "InvalidColor" });

    expect(result[1].voiceColor).toBe("Normal");
    expect(result[2].voiceColor).toBe("Normal");
  });

  it("vbがない場合はvoiceColorValueに関わらず変更される", () => {
    // vb未設定（colorsによる制限なし）
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "" });

    expect(result[1].voiceColor).toBe("");
    expect(result[2].voiceColor).toBe("");
  });

  it("vb.colorsが空（音源がVoiceColor非対応）の場合はno-op", () => {
    bp.vb = createMockVb([]);
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "" });

    expect(result[1].voiceColor).toBe("Normal");
    expect(result[2].voiceColor).toBe("Normal");
  });

  it("initializeOptionsがvb.colors[0]を返し、選択肢先頭に空文字が含まれる", () => {
    bp.vb = createMockVb(["Soft", "Power"]);
    const options = bp.initializeOptions();

    expect(options.voiceColorValue).toBe("Soft");
    expect(
      (
        bp
          .ui[0] as import("../../../src/types/batchProcess").SelectUIProp<string>
      ).options[0],
    ).toBe("");
  });

  it("initializeOptionsがcolors空の場合は空文字を返す", () => {
    bp.vb = createMockVb([]);
    const options = bp.initializeOptions();

    expect(options.voiceColorValue).toBe("");
  });

  it("process、undo、redoが正しく動作する", () => {
    bp.vb = createMockVb(["Normal", "Soft", "Power"]);
    const notes = createTestNotes();
    const result = bp.process(notes, { voiceColorValue: "Power" });

    expect(undoManager.undoSummary).toBe("voiceColor:ボイスカラーを一括設定");
    expect(result[1].voiceColor).toBe("Power");
    expect(result[2].voiceColor).toBe("Power");

    const undo = undoManager.undo();
    expect(undoManager.redoSummary).toBe("voiceColor:ボイスカラーを一括設定");
    expect(undo[1].voiceColor).toBe("Normal");
    expect(undo[2].voiceColor).toBe("Normal");

    const redo = undoManager.redo();
    expect(undoManager.undoSummary).toBe("voiceColor:ボイスカラーを一括設定");
    expect(redo[1].voiceColor).toBe("Power");
    expect(redo[2].voiceColor).toBe("Power");
  });
});
