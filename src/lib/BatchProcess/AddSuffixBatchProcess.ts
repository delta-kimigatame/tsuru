import { TextBoxStringUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * 歌詞の末尾に一括でsuffixを追加する。
 */

export interface AddSuffixBatchProcessOptions {
  suffixValue: string;
}

export class AddSuffixBatchProcess extends BaseBatchProcess<AddSuffixBatchProcessOptions> {
  title = "batchprocess.addSuffixBatchProcess.title";
  summary = "歌詞末尾にサフィックスを一括追加";
  public override process(
    notes: Note[],
    options: AddSuffixBatchProcessOptions
  ): Note[] {
    return super.process(notes, options);
  }
  protected _process(
    notes: Note[],
    options: AddSuffixBatchProcessOptions
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());

    // lyricが休符の場合何もしない
    newNotes.forEach((n) => {
      if (n.lyric !== "R") {
        n.lyric = n.lyric + options.suffixValue;
      }
    });
    return newNotes;
  }
  ui = [
    {
      key: "suffixValue",
      labelKey: "batchprocess.addSuffixBatchProcess.suffixValue",
      inputType: "textbox-string",
    } as TextBoxStringUIProp,
  ];
  initialOptions: AddSuffixBatchProcessOptions = {
    suffixValue: "",
  };
}
