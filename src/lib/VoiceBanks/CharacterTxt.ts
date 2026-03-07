/**
 * UTAUの音源用character.txtファイルを扱う
 */

export class CharacterTxt {
  /** UTAU音源の名前 */
  private _name: string;

  /** アイコン画像への相対パス */
  private _image: string;

  /** sample音声への相対パス */
  private _sample?: string;

  /** 管理人の名義 */
  private _author?: string;

  /** webページ */
  private _web?: string;

  /** バージョン */
  private _version?: string;

  /** UTAU音源の名前 */
  get name(): string {
    return this._name;
  }

  /** アイコン画像への相対パス */
  get image(): string {
    return this._image;
  }
  /** sample音声への相対パス */
  get sample(): string {
    return this._sample;
  }
  /** 管理人の名義 */
  get author(): string {
    return this._author;
  }
  /** webページ */
  get web(): string {
    return this._web;
  }
  /** バージョン */
  get version(): string {
    return this._version;
  }
  /**
   *
   * @param values
   */
  constructor(values: CharacterTxtValue) {
    if (!values.txt && !values.name) {
      throw new Error("txtかnameのどちらかが必要です");
    }
    if (values.txt) {
      values = this.parseTxt(values.txt);
    }
    this._name = values.name;
    if (values.image) {
      this._image = values.image;
    }
    if (values.sample) {
      this._sample = values.sample;
    }
    if (values.author) {
      this._author = values.author;
    }
    if (values.web) {
      this._web = values.web;
    }
    if (values.version) {
      this._version = values.version;
    }
    /** 読み込みが終了した時点で`this._name`が未定義の場合、何かがおかしいのでエラーを返す */
    if (!this._name) {
      throw new Error("Invalid character.txt.");
    }
  }

  /**
   *
   * @param txt character.txt
   * @returns character.txtから読み取られたパラメーター
   */
  private parseTxt(txt: string): CharacterTxtValue {
    /** character.txtを1行毎に格納したArray */
    const lines: Array<string> = txt.replace(/\r/g, "").split("\n");
    const values: CharacterTxtValue = { name: "" };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }
      const match = line.match(/^([^:=：＝]+)\s*[:=：＝]\s*(.*)$/);
      if (!match) {
        continue;
      }
      const rawKey = match[1].trim();
      const value = match[2];
      const key = rawKey === "名前" ? "name" : rawKey.toLowerCase();

      if (key === "name") {
        values.name = value;
      } else if (key === "image") {
        values.image = value;
      } else if (key === "sample") {
        values.sample = value;
      } else if (key === "author") {
        values.author = value;
      } else if (key === "web") {
        values.web = value;
      } else if (key === "version") {
        values.version = value;
      }
    }
    return values;
  }

  outputTxt(): string {
    const txt =
      "name=" +
      this._name +
      "\r\n" +
      (this._image ? "image=" + this._image + "\r\n" : "") +
      (this._sample ? "sample=" + this._sample + "\r\n" : "") +
      (this._author ? "author=" + this._author + "\r\n" : "") +
      (this._web ? "web=" + this._web + "\r\n" : "") +
      (this._version ? "version=" + this._version + "\r\n" : "");
    return txt;
  }
}

export interface CharacterTxtValue {
  /** 読み込んだテキストデータ */
  txt?: string;
  /** UTAU音源の名前 */
  name?: string;
  /** アイコン画像への相対パス */
  image?: string;
  /** sample音声への相対パス */
  sample?: string;
  /** 管理人の名義 */
  author?: string;
  /** webページ */
  web?: string;
  /** バージョン */
  version?: string;
}
