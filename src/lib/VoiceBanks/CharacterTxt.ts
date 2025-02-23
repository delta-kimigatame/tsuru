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
      if (lines[i].startsWith("name=")) {
        values.name = lines[i].replace("name=", "");
      } else if (lines[i].startsWith("image=")) {
        values.image = lines[i].replace("image=", "");
      } else if (lines[i].startsWith("sample=")) {
        values.sample = lines[i].replace("sample=", "");
      } else if (lines[i].startsWith("author=")) {
        values.author = lines[i].replace("author=", "");
      } else if (lines[i].startsWith("web=")) {
        values.web = lines[i].replace("web=", "");
      } else if (lines[i].startsWith("version=")) {
        values.version = lines[i].replace("version=", "");
      } else if (lines[i].startsWith("name:")) {
        values.name = lines[i].replace("name:", "");
      } else if (lines[i].startsWith("image:")) {
        values.image = lines[i].replace("image:", "");
      } else if (lines[i].startsWith("sample:")) {
        values.sample = lines[i].replace("sample:", "");
      } else if (lines[i].startsWith("author:")) {
        values.author = lines[i].replace("author:", "");
      } else if (lines[i].startsWith("web:")) {
        values.web = lines[i].replace("web:", "");
      } else if (lines[i].startsWith("version:")) {
        values.version = lines[i].replace("version:", "");
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
