export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
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
    if (
      typeof window !== "undefined" &&
      window.location &&
      (window.location.hostname === "localhost" ||
        /^(?:\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname))
    ) {
      console.log(entry);
    }
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

  gtag = (
    eventName: string,
    eventParams?: {
      [key: string]: string | number | boolean;
    }
  ) => {
    /** nodeなどwindowがundefinedの場合何もせず返す */
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    if (hostname === "localhost" || /^[0-9.]+$/.test(hostname)) {
      /** 開発環境ではgtagは送付せず、gtagに送付される予定の内容を記録する */
      LOG.debug(
        `eventName:${eventName}, eventParams:${JSON.stringify(eventParams)}`,
        "Logging.gtag"
      );
    } else if (typeof window.gtag === "function") {
      /** 本番環境 */
      window.gtag("event", eventName, eventParams);
    } else {
      /** storybookはここに来るはず */
      LOG.debug(
        `eventName:${eventName}, eventParams:${JSON.stringify(eventParams)}`,
        "Logging.gtag"
      );
    }
  };

  /**
   * 蓄積したログを削除する
   */
  clear = () => {
    this.datas = new Array();
  };
}

export const LOG = new Logging();
