import { SliderUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * 選択したノートの音階を指定したセミトーン数だけ上下します。
 * 閾値は -11 ～ 11（1オクターブ上下はOctaveUp/DownBatchProcessを使用）。
 */
export interface TransposeBatchProcessOptions {
  semitones: number;
}

export class TransposeBatchProcess extends BaseBatchProcess<TransposeBatchProcessOptions> {
  title = "batchprocess.transposeBatchProcess.title";
  summary = "notenum:音階を移調する";

  protected _process(
    notes: Note[],
    options: TransposeBatchProcessOptions,
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    if (options.semitones === 0) return newNotes;
    newNotes.forEach((n) => {
      n.notenum = n.notenum + options.semitones;
    });
    return newNotes;
  }

  ui: SliderUIProp[] = [
    {
      key: "semitones",
      labelKey: "batchprocess.transposeBatchProcess.semitones",
      inputType: "slider",
      min: -11,
      max: 11,
      step: 1,
      defaultValue: 0,
    },
  ];

  initialOptions: TransposeBatchProcessOptions = {
    semitones: 0,
  };
}
