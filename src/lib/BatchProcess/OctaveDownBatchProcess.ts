import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * 選択したノートを全て1オクターブ下げます。
 */
export class OctaveDownBatchProcess extends BaseBatchProcess<void> {
  title = "batchprocess.octaveDown";
  summary = "1オクターブ下げる";
  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => (n.notenum = n.notenum - 12));
    return newNotes;
  }

  /** TODO 将来仕様が固まればUI関係の要素(もしくはnoUIオプション)を追加する */
}
