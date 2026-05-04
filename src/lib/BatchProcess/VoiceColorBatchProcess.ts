import { SelectUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * ボイスカラーを一括で設定する。
 * 選択肢は音源固有（vb.colorsから動的に取得）。
 * vbがない、またはcolorsが空の場合は選択肢なし・変更なし。
 */
export interface VoiceColorBatchProcessOptions {
  voiceColorValue: string;
}

export class VoiceColorBatchProcess extends BaseBatchProcess<VoiceColorBatchProcessOptions> {
  title = "batchprocess.voiceColorBatchProcess.title";
  summary = "voiceColor:ボイスカラーを一括設定";

  public override process(
    notes: Note[],
    options: VoiceColorBatchProcessOptions,
  ): Note[] {
    return super.process(notes, options);
  }

  protected _process(
    notes: Note[],
    options: VoiceColorBatchProcessOptions,
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());

    const colors = this.vb?.colors ?? [];
    // vbがあるがcolorsが空（音源がVoiceColorに非対応）の場合はno-op
    if (this.vb !== undefined && colors.length === 0) {
      return newNotes;
    }
    // colorsがある場合、選択肢外の値はno-op（空文字は許可）
    if (
      colors.length > 0 &&
      options.voiceColorValue !== "" &&
      !colors.includes(options.voiceColorValue)
    ) {
      return newNotes;
    }

    newNotes.forEach((n) => {
      if (n.lyric !== "R") {
        n.voiceColor = options.voiceColorValue;
      }
    });

    return newNotes;
  }

  /**
   * vb.colorsを参照してSelectの候補を動的に構築する。
   * colorsが空の場合はvoiceColorValueを空文字にして変更なしにする。
   */
  initializeOptions(): VoiceColorBatchProcessOptions {
    const colors = this.vb?.colors ?? [];
    // 先頭に空文字を追加してリセット（voiceColorなし）を選択可能にする
    const options = ["", ...colors];
    this.ui = [
      {
        key: "voiceColorValue",
        labelKey: "batchprocess.voiceColorBatchProcess.voiceColorValue",
        inputType: "select" as const,
        options,
      } as SelectUIProp<string>,
    ];
    return {
      voiceColorValue: colors[0] ?? "",
    };
  }

  ui: Array<SelectUIProp<string>> = [];

  initialOptions: VoiceColorBatchProcessOptions = {
    voiceColorValue: "",
  };
}
