import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * 選択したノートを全て1オクターブ下げます。
 */
export class OctaveDownBatchProcess extends BaseBatchProcess<void> {
  title = "batchprocess.octaveDown";
  summary = "notenum:1オクターブ下げる";
  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => (n.notenum = n.notenum - 12));
    return newNotes;
  }

  /** UIは不要 */
}
