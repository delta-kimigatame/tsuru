import { PaperGroup, UIProp } from "../types/batchProcess";
import { Note } from "./Note";
import { undoManager, UndoRedoCommand } from "./UndoManager";

/**
 * batchprocessを作成するための抽象クラス。
 * このプロジェクトにおけるbatchprocessとは、渡されたNote列に一括処理を行う操作を指します。
 *
 * このプロジェクトを継承した個別の処理は、src/lib/batchprocess/[処理クラス名].tsに保存されることが期待されます。
 * 新たなbatchprocessを作成したときには、あわせて__tests__/lib/batchprocess/[処理クラス名].test.tsも作成し、vitestでtestingを行ってください。
 * また、処理名はsrc/i18n/ja.tsなどの言語リソースファイルにおいて、batchprocess.[処理クラス名]に作成してください。
 */
export abstract class BaseBatchProcess<TOptions = any> {
  /**
   * この処理の名称。i18nの呼出しに使用するため、`batchprocess.[処理クラス名]`であることが期待されます。
   */
  abstract title: string;
  /**
   * この処理の概要。undo/redoの際に使用されます。
   */
  abstract summary: string;
  /**
   * 実際の処理はここに記述してください
   * @param notes 変更前のノート
   * @param options 処理に必要な引数
   * @returns 処理適用後のノート
   */
  protected abstract _process(notes: Note[], options?: TOptions): Note[];

  /**
   * 実際の処理を呼出し、undoManagerに適切に登録します。
   * @param notes 変更前のノート
   * @param options 処理に必要な引数
   * @returns 処理適用後のノート
   */
  public process(notes: Note[], options?: TOptions): Note[] {
    if (notes.length === 0) return [];
    const oldNotes = notes.map((n) => n.deepCopy());
    const newNotes = this._process(notes, options);
    undoManager.register({
      undo: this.undo,
      undoArgs: oldNotes,
      redo: this.redo,
      redoArgs: { notes: oldNotes, options: options },
      summary: this.summary,
    } as UndoRedoCommand);
    return newNotes;
  }

  /**
   * undo時の処理。
   * 本体処理を実行する前の状態をdeppcopyで保存しておき、そのまま返す
   * @param oldNotes 本体処理実行前のノート
   * @returns 本体処理実行前のノート
   */
  undo = (oldNotes: Note[]): Note[] => {
    return oldNotes;
  };

  /**
   * redo時の処理
   * @param redoArgs redoの引数。本体処理実行前のノートと実行オプション
   * @returns 処理適用後のノート
   */
  redo = (redoArgs: {
    /** 処理適用前のノート */
    notes: Note[];
    /** 処理に必要な引数 */
    options?: TOptions;
  }): Note[] => {
    return this._process(redoArgs.notes, redoArgs.options);
  };

  /**
   * ログ出力します。
   * @param message ログに保存する文字列
   */
  log = (message: string): void => {
    /** TODO グローバルなロギングシステムができたら処理を追加する。 */
  };

  /**
   * UI要素を自動構成するためのパラメータ
   * UIが不要な場合は空配列とする
   */
  ui: Array<UIProp | PaperGroup> = [];

  /**
   * optionsの初期値。UIにおいて状態管理をするために定義する必要がある。
   */
  initialOptions: TOptions;
}
