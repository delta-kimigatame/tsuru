import { TextBoxStringUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * フラグを一括で設定する。
 */
export interface FlagsBatchProcessOptions {
  flagsValue: string;
}

export class FlagsBatchProcess extends BaseBatchProcess<FlagsBatchProcessOptions> {
  title = "batchprocess.flagsBatchProcess.title";
  summary = "flags:フラグを一括設定";

  public override process(
    notes: Note[],
    options: FlagsBatchProcessOptions,
  ): Note[] {
    return super.process(notes, options);
  }

  protected _process(notes: Note[], options: FlagsBatchProcessOptions): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());

    newNotes.forEach((n) => {
      if (n.lyric !== "R") {
        n.flags = options.flagsValue;
      }
    });

    return newNotes;
  }

  ui = [
    {
      key: "flagsValue",
      labelKey: "batchprocess.flagsBatchProcess.flagsValue",
      inputType: "textbox-string",
    } as TextBoxStringUIProp,
  ];

  initialOptions: FlagsBatchProcessOptions = {
    flagsValue: "",
  };
}
