import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * 歌詞を一括で休符にする
 */

export class LyricTorestBatchProcess extends BaseBatchProcess<void> {
  title = "batchprocess.lyricTorestBatchProcess.title";
  summary = "lyric:歌詞を休符に一括変更";
  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.map((n) => (n.lyric = "R"));
    return newNotes;
  }
}
