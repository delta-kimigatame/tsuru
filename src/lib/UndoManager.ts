/**
 * UndoやRedo時の動作のためのコールバック
 */
type Callback<T = any> = (args: T) => void;

/**
 * undo/redoのコマンドオブジェクトの型定義
 */
export interface UndoRedoCommand<TUndo = any, TRedo = any> {
  /**
   * Undo用のコールバック
   */
  undo: Callback<TUndo>;
  /**
   * Undo用の引数
   */
  undoArgs: TUndo;
  /**
   * redo用のコールバック
   */
  redo: Callback<TRedo>;
  /**
   * redo用の引数
   */
  redoArgs: TRedo;
  /**
   * 処理内容の概要
   */
  summary: string;
}

/**
 * プロジェクト内においてNoteを編集する処理のUndoとRedoを管理する。
 */
export class UndoManager {
  /**
   * undo用のスタック。新たに実行されたコマンドが随時蓄積される。
   */
  private _undoStack: Array<UndoRedoCommand<any, any>>;
  /**
   * redo用のスタック。undoを実行された際にコマンドが蓄積され、
   * undo後redo以外の動作が行われた際に初期化される。
   */
  private _redoStack: Array<UndoRedoCommand<any, any>>;
  constructor() {
    this._undoStack = [];
    this._redoStack = [];
  }

  /**
   * undoスタックに新しいコマンドを追加し、redoスタックを初期化する。
   * @param command 新しいコマンド
   */
  register = (command: UndoRedoCommand) => {
    this._undoStack.push(command);
    this._redoStack = [];
  };

  /**
   * undoを実行し、実行したコマンドをredoスタックに追加する。
   */
  undo = (): void => {
    if (this._undoStack.length === 0) return;
    const command = this._undoStack.pop();
    command.undo(command.undoArgs);
    this._redoStack.push(command);
  };

  /**
   * redoを実行し、実行したコマンドをundoスタックに追加する。
   */
  redo = (): void => {
    if (this._redoStack.length === 0) return;
    const command = this._redoStack.pop();
    command.redo(command.redoArgs);
    this._undoStack.push(command);
  };

  /**
   * UIから呼ばれることを想定。
   * @returns 次にUndoを実行した際に行う処理の概要を返す。Undoする処理がないときはundefinedを返す。
   */
  get undoSummary(): string | undefined {
    if (this._undoStack.length === 0) return undefined;
    return this._undoStack.slice(-1)[0].summary;
  }

  /**
   * UIから呼ばれることを想定。
   * @returns 次にRedoを実行した際に行う処理の概要を返す。Redoする処理がないときはundefinedを返す。
   */
  get redoSummary(): string | undefined {
    if (this._redoStack.length === 0) return undefined;
    return this._redoStack.slice(-1)[0].summary;
  }
}
