/**
 * UTAUの音源用install.txtファイルを扱う
 */

export class InstallTxt {
  /** UTAU音源であればvoiceset固定 */
  private _archiveType: string = "voiceset";

  /** 解凍先フォルダ */
  private _folder: string;

  /** インストールしたいファイルが入っているフォルダ */
  private _contentsDir?: string;

  /** インストール時に表示される一行の説明 */
  private _description?: string;

  /** UTAU音源であればvoiceset固定 */
  get archiveType(): string {
    return this._archiveType;
  }

  /** 解凍先フォルダ */
  get folder(): string {
    return this._folder;
  }
  /** インストールしたいファイルが入っているフォルダ */
  get contentsDir(): string {
    return this._contentsDir;
  }
  /** インストール時に表示される一行の説明 */
  get description(): string {
    return this._description;
  }
  /**
   *
   * @param values
   */
  constructor(values: InstallTxtValue) {
    if (!values.txt && !values.folder) {
      throw new Error("txtかfolderのどちらかが必要です");
    }
    if (values.txt) {
      values = this.ParseTxt(values.txt);
    }
    this._folder = values.folder;
    if (values.contentsDir) {
      this._contentsDir = values.contentsDir;
    }
    if (values.description) {
      this._description = values.description;
    }
  }

  private ParseTxt(txt: string): InstallTxtValue {
    /** install.txtを1行毎に格納したArray */
    const lines: Array<string> = txt.replace(/\r/g, "").split("\n");
    const values: InstallTxtValue = { folder: "" };
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("type=")) {
      } else if (lines[i].startsWith("folder=")) {
        values.folder = lines[i].replace("folder=", "");
      } else if (lines[i].startsWith("contentsdir=")) {
        values.contentsDir = lines[i].replace("contentsdir=", "");
      } else if (lines[i].startsWith("description=")) {
        values.description = lines[i].replace("description=", "");
      }
    }
    return values;
  }

  OutputTxt(): string {
    const txt =
      "type=voiceset\r\n" +
      "folder=" +
      this._folder +
      "\r\n" +
      (this._contentsDir ? "contentsdir=" + this._contentsDir + "\r\n" : "") +
      (this._description ? "description=" + this._description + "\r\n" : "");
    return txt;
  }
}

export interface InstallTxtValue {
  /** 読み込んだテキストデータ */
  txt?: string;
  /** 解凍先フォルダ */
  folder?: string;
  /** インストールしたいファイルが入っているフォルダ */
  contentsDir?: string;
  /** インストール時に表示される一行の説明 */
  description?: string;
}
