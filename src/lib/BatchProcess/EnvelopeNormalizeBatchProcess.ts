import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * エンベロープ正規化を行うためのバッチ処理。
 *
 * UTAUの仕様上、`envelope.point`はノート長に制限を受けるが、ノート長関連のパラメータと`envelope`は連動しないため、
 * `envelope.point`がノート長の制限を超えてしまう場合がある(エンベロープの破綻)
 *
 * この処理では、ノートの出力長を用いて`envelope.point`の比をとることで、エンベロープ正規化を行う。
 */
export class EnvelopeNormalizeBatchProcess extends BaseBatchProcess<void> {
  title = "batchprocess.envelopeNormalize";
  summary = "エンベロープ正規化";
  public override process(notes: Note[]): Note[] {
    return super.process(notes);
  }
  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => {
      /**
       * エンベロープが存在しない場合はdefaultエンベロープを用いるため破綻しない。
       * また、休符ノートにはエンベロープが関係ないため何もせず返す
       */
      if (n.envelope === undefined || n.lyric === "R") return;
      const sum = n.envelope.point.reduce((acc, cur) => acc + cur, 0);

      /** sum<=n.outputMsの場合、エンベロープは破綻していないといえるため何もせず返す */
      if (sum <= n.outputMs) return;

      /** エンベロープの正規化の処理 */
      const factor = n.outputMs / sum;
      n.envelope.point.forEach((p, i, arr) => {
        arr[i] = p * factor;
      });
    });
    return newNotes;
  }

  /** TODO 将来仕様が固まればUI関係の要素(もしくはnoUIオプション)を追加する */
}
