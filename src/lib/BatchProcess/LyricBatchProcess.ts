import { TextBoxStringUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * 歌詞を一括で変更する。
 */

export interface LyricBatchProcessOptions {
  lyricsValue: string;
}
export class LyricBatchProcess extends BaseBatchProcess<LyricBatchProcessOptions> {
  title = "batchprocess.lyricBatchProcess.title";
  summary = "歌詞一括変更";

  public override process(
    notes: Note[],
    options: LyricBatchProcessOptions
  ): Note[] {
    return super.process(notes, options);
  }

  protected _process(notes: Note[], options: LyricBatchProcessOptions): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    let syllables: string[];

    // 入力がすべて英数字かどうかをチェック
    if (/^[a-zA-Z0-9\s]*$/.test(options.lyricsValue)) {
      // 英数字の場合は半角スペースで分割
      syllables = options.lyricsValue.split(" ").filter((s) => s.length > 0);
    } else {
      // ひらがなを1音節ずつ分割（拗音を考慮）もしくはR
      syllables =
        options.lyricsValue.match(/[ぁ-んR][ぁぃぅぇぉゃゅょゎ]?/g) || [];
    }

    // 各ノートに音節を割り当て（短い方の長さまで）
    const assignCount = Math.min(newNotes.length, syllables.length);
    for (let i = 0; i < assignCount; i++) {
      newNotes[i].lyric = syllables[i];
    }

    return newNotes;
  }

  ui = [
    {
      key: "lyricsValue",
      labelKey: "batchprocess.lyricBatchProcess.lyricsValue",
      inputType: "textbox-string",
    } as TextBoxStringUIProp,
  ];

  initializeOptions(selectedNotes: Note[]): LyricBatchProcessOptions {
    const combinedLyrics = selectedNotes.map((n) => n.lyric).join("");

    // 結合した歌詞がすべて半角英数字の場合、半角スペース区切りに変換
    let processedLyrics: string;
    if (/^[a-zA-Z0-9]*$/.test(combinedLyrics)) {
      // 英数字のみの場合、1文字ずつ半角スペースで区切る
      processedLyrics = selectedNotes.map((n) => n.lyric).join(" ");
    } else {
      // それ以外はそのまま
      processedLyrics = combinedLyrics;
    }

    return {
      lyricsValue: processedLyrics || "",
    };
  }
}
