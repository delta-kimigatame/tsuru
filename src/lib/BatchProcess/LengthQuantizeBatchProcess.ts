import { CheckboxUIProp, SelectUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";
/**
 * ノート長を一定の値にまるめる
 */

export interface LengthQuantizeBatchProcessOptions {
  /** 丸める長さ */
  quantizeValue: number;
  /** 丸めた結果0となったノートを削除するか切り上げるか */
  isDeleteZero: boolean;
}

export class LengthQuantizeBatchProcess extends BaseBatchProcess<LengthQuantizeBatchProcessOptions> {
  title = "batchprocess.lengthQuantizeBatchProcess.title";
  summary = "length:ノート長を丸める";

  public override process(
    notes: Note[],
    options: LengthQuantizeBatchProcessOptions
  ): Note[] {
    return super.process(notes, options);
  }
  protected _process(
    notes: Note[],
    options: LengthQuantizeBatchProcessOptions
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    const quantizeValue = options.quantizeValue;

    newNotes.forEach((n) => {
      const newLength = Math.round(n.length / quantizeValue) * quantizeValue;
      if (newLength === 0 && !options.isDeleteZero) {
        n.length = quantizeValue;
      } else {
        n.length = newLength;
      }
    });
    // 長さ0のノートを除外。前段のforEachによって、isDeleteZeroがfalseの場合は長さ0のノートは存在しないはず
    return newNotes.filter((n) => n.length > 0);
  }

  ui = [
    {
      key: "quantizeValue",
      labelKey: "batchprocess.lengthQuantizeBatchProcess.quantizeValue",
      inputType: "select",
      options: [30, 40, 60, 80, 120, 160, 240, 480],
      displayOptionKey:
        "batchprocess.lengthQuantizeBatchProcess.quantizeValueOptions",
      defaultValue: "60",
    } as SelectUIProp<number>,
    {
      key: "isDeleteZero",
      labelKey: "batchprocess.lengthQuantizeBatchProcess.isDeleteZero",
      inputType: "checkbox",
      defaultValue: false,
    } as CheckboxUIProp,
  ];

  initialOptions: LengthQuantizeBatchProcessOptions = {
    quantizeValue: 60,
    isDeleteZero: false,
  };
}
