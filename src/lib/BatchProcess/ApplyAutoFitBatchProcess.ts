import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * タイミング関係のパラメータに自動調整結果を適用する
 */

export class ApplyAutoFitBatchProcess extends BaseBatchProcess<void> {
  title = "batchprocess.applyAutoFitBatchProcess.title";
  summary = "timing:自動調整結果を適用";
  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => {
      if (n.lyric !== "R") {
        // stpを最初に更新しなければ、preutterを更新した際の副作用でat系のパラメータが変わってしまう
        n.stp = n.atStp ?? 0;
        n.preutter = n.atPreutter ?? 0;
        n.overlap = n.atOverlap ?? 0;
      }
    });
    return newNotes;
  }
}
