import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * タイミング関係のパラメータに原音設定値を適用する
 */

export class ApplyOtoBatchProcess extends BaseBatchProcess<void> {
  title = "batchprocess.applyOtoBatchProcess.title";
  summary = "timing:原音設定値を適用";
  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => {
      if (n.oto) {
        n.preutter = n.otoPreutter ?? 0;
        n.overlap = n.otoOverlap ?? 0;
      }
    });
    return newNotes;
  }
}
