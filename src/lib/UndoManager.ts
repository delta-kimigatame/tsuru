import { LOG } from "./Logging";

/**
 * UndoやRedo時の動作のためのコールバック
 */
type Callback<Targs = any, TReturn = any> = (args: Targs) => TReturn;

/**
 * undo/redoのコマンドオブジェクトの型定義
 */
export interface UndoRedoCommand<
  TUndo = any,
  TRedo = any,
  TUndoReturn = any,
  TRedoReturn = any
> {
  /**
   * Undo用のコールバック
   */
  undo: Callback<TUndo, TUndoReturn>;
  /**
   * Undo用の引数
   */
  undoArgs: TUndo;
  /**
   * redo用のコールバック
   */
  redo: Callback<TRedo, TRedoReturn>;
  /**
   * redo用の引数
   */
  redoArgs: TRedo;
  /**
   * 処理内容の概要
   */
  summary: string;
  /** ノートの増減を伴う場合使用するフラグ */
  all?: boolean;
}

/**
 * プロジェクト内においてNoteを編集する処理のUndoとRedoを管理する。
 */
export class UndoManager {
  /**
   * undo用のスタック。新たに実行されたコマンドが随時蓄積される。
   */
  private _undoStack: Array<UndoRedoCommand<any, any, any, any>>;
  /**
   * redo用のスタック。undoを実行された際にコマンドが蓄積され、
   * undo後redo以外の動作が行われた際に初期化される。
   */
  private _redoStack: Array<UndoRedoCommand<any, any, any, any>>;
  constructor() {
    LOG.debug("UndoManagerの初期化", "UndoManager");
    this._undoStack = [];
    this._redoStack = [];
  }

  /**
   * undoスタックに新しいコマンドを追加し、redoスタックを初期化する。
   * @param command 新しいコマンド
   */
  register = (command: UndoRedoCommand) => {
    LOG.info(`undostackの追加:${command.summary}`, "UndoManager");
    this._undoStack.push(command);
    this._redoStack = [];
  };

  /**
   * undoを実行し、実行したコマンドをredoスタックに追加する。
   */
  undo = () => {
    if (this._undoStack.length === 0) {
      /** 通常はUI側の制約によりこの処理に入らない予定 */
      LOG.warn("undostackが空です", "UndoManager");
      return;
    }
    const command = this._undoStack.pop();
    this._redoStack.push(command);
    LOG.info(
      `undoの実行:${command.summary}、args:${command.undoArgs}`,
      "UndoManager"
    );
    return command.undo(command.undoArgs);
  };

  /**
   * redoを実行し、実行したコマンドをundoスタックに追加する。
   */
  redo = () => {
    if (this._redoStack.length === 0) {
      /** 通常はUI側の制約によりこの処理に入らない予定 */
      LOG.warn("redostackが空です", "UndoManager");
      return;
    }
    const command = this._redoStack.pop();
    this._undoStack.push(command);
    LOG.info(
      `redoの実行:${command.summary}、${command.redoArgs}`,
      "UndoManager"
    );
    return command.redo(command.redoArgs);
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

  /**
   * UIから呼ばれることを想定
   * @returns 次にundoを実行した際に行う処理がノート数の増減を伴うかを返す
   */
  get undoAll(): boolean {
    if (this._undoStack.length === 0) return false;
    return this._undoStack.slice(-1)[0].all !== undefined;
  }

  /**
   * UIから呼ばれることを想定
   * @returns 次にredoを実行した際に行う処理がノート数の増減を伴うかを返す
   */
  get redoAll(): boolean {
    if (this._redoStack.length === 0) return false;
    return this._redoStack.slice(-1)[0].all !== undefined;
  }

  /**
   * スタックを初期化する。
   */
  clear(): void {
    LOG.debug("undostackの消去", "UndoManager");
    this._undoStack = [];
    this._redoStack = [];
  }
}

export const undoManager = new UndoManager();
