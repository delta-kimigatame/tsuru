import { SelectUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";
/**
 * 歌詞の末尾のsuffixを一括で削除する。
 */

const hiraganaReg = /^([^ぁ-んァ-ヶ]*)([ぁ-んァ-ヶ]+)([^ ]*)$/;

export interface RemoveSuffixBatchProcessOptions {
  suffixRemoveMode: "all" | "underbar" | "number" | "none";
  prefixRemoveMode: "all" | "blank" | "none";
}

export class RemoveSuffixBatchProcess extends BaseBatchProcess<RemoveSuffixBatchProcessOptions> {
  title = "batchprocess.removeSuffixBatchProcess.title";
  summary = "歌詞末尾のサフィックスを一括削除";
  public override process(
    notes: Note[],
    options: RemoveSuffixBatchProcessOptions
  ): Note[] {
    return super.process(notes, options);
  }
  protected _process(
    notes: Note[],
    options: RemoveSuffixBatchProcessOptions
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => {
      // 休符の場合何もしない
      if (n.lyric === "R") return;

      /** 接頭辞の処理 */
      /**
       * allの場合、ひらがなより前の文字をすべて削除
       * blankの場合、半角スペース以前の文字をすべて削除(半角スペース自体も削除)
       * noneの場合、何もしない
       * */
      if (options.prefixRemoveMode === "all") {
        const match = n.lyric.match(hiraganaReg);
        if (match) {
          n.lyric = match[2] + match[3];
        }
      } else if (options.prefixRemoveMode === "blank") {
        const index = n.lyric.indexOf(" ");
        if (index >= 0) {
          n.lyric = n.lyric.slice(index + 1);
        }
      }

      /** 接尾辞の処理 */
      /**
       * allの場合、ひらがなより後ろの文字をすべて削除
       * underbarの場合、アンダーバー以降の文字を削除(アンダーバー自体も削除)
       * numberの場合、ひらがなより後ろの半角数字をすべて削除
       * noneの場合、何もしない
       */
      if (options.suffixRemoveMode === "all") {
        const match = n.lyric.match(hiraganaReg);
        if (match) {
          n.lyric = match[1] + match[2];
        }
      } else if (options.suffixRemoveMode === "underbar") {
        const index = n.lyric.indexOf("_");
        if (index >= 0) {
          n.lyric = n.lyric.slice(0, index);
        }
      } else if (options.suffixRemoveMode === "number") {
        const match = n.lyric.match(hiraganaReg);
        if (match) {
          const prefix = match[1];
          const kana = match[2];
          const suffix = match[3].replace(/[0-9]/g, "");
          n.lyric = prefix + kana + suffix;
        }
      }
    });
    return newNotes;
  }

  ui = [
    {
      key: "suffixRemoveMode",
      labelKey: "batchprocess.removeSuffixBatchProcess.suffixRemoveMode",
      inputType: "select",
      options: ["all", "underbar", "number", "none"],
      displayOptionKey:
        "batchprocess.removeSuffixBatchProcess.suffixRemoveModeOptions",
      defaultValue: "all",
    } as SelectUIProp,
    {
      key: "prefixRemoveMode",
      labelKey: "batchprocess.removeSuffixBatchProcess.prefixRemoveMode",
      inputType: "select",
      options: ["all", "blank", "none"],
      displayOptionKey:
        "batchprocess.removeSuffixBatchProcess.prefixRemoveModeOptions",
      defaultValue: "all",
    } as SelectUIProp,
  ];

  initialOptions: RemoveSuffixBatchProcessOptions = {
    suffixRemoveMode: "all",
    prefixRemoveMode: "all",
  };
}
