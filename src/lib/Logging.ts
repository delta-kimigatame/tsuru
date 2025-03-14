enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}
/**
 * プロジェクト全体のログ管理
 */
class Logging {
  /** ログのデータの蓄積 */
  datas: Array<string>;
  constructor() {
    this.datas = new Array();
  }
  /**
   * ログを成型して蓄積する
   * @param level ログレベル
   * @param value ログメッセージ
   * @param source ログ送出元となったコンポーネントやクラス
   */
  private log(level: LogLevel, value: any, source: string): void {
    const message =
      typeof value === "object" ? JSON.stringify(value) : value.toString();
    const entry = `${new Date().toISOString()}\t${source}\t${level}\t${message}`;
    this.datas.push(entry);
  }

  /**
   * デバッグログを蓄積する
   * @param value ログメッセージ
   * @param source ログ送出元となったコンポーネントやクラス
   */
  debug = (value: any, source: string): void => {
    this.log(LogLevel.DEBUG, value, source);
  };

  /**
   * インフォログを蓄積する
   * @param value ログメッセージ
   * @param source ログ送出元となったコンポーネントやクラス
   */
  info = (value: any, source: string): void => {
    this.log(LogLevel.INFO, value, source);
  };

  /**
   * 警告ログを蓄積する
   * @param value ログメッセージ
   * @param source ログ送出元となったコンポーネントやクラス
   */
  warn = (value: any, source: string): void => {
    this.log(LogLevel.WARN, value, source);
  };

  /**
   * エラーログを蓄積する
   * @param value ログメッセージ
   * @param source ログ送出元となったコンポーネントやクラス
   */
  error = (value: any, source: string): void => {
    this.log(LogLevel.ERROR, value, source);
  };

  /**
   * 蓄積したログを削除する
   */
  clear = () => {
    this.datas = new Array();
  };
}

export const LOG = new Logging();
