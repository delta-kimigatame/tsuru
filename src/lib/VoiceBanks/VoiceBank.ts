/**
 * UTAU音源ライブラリを利用する処理全般を扱う
 */

import yaml from "js-yaml";
import type JSZip from "jszip";

import { Oto } from "utauoto";
import type OtoRecord from "utauoto/dist/OtoRecord";
import { Wave } from "utauwav";

import { extractFileFromZip } from "../../services/extractFileFromZip";
import { readTextFile } from "../../services/readTextFile";
import { CharacterTxt } from "./CharacterTxt";
import { PrefixMap } from "./PrefixMap";
import { Frq } from "./UtauFrq";

export class VoiceBank {
  /**
   * UTAU音源として操作するzipファイル
   */
  private _zip: {
    [filename: string]: JSZip.JSZipObject;
  };

  /**
   * zip内のファイル一覧
   */
  private _filenames: Array<string>;

  /**
   * character.txt
   */
  private _character: CharacterTxt;

  /**
   * character.yaml
   */
  private _characterYaml: {
    voice?: string;
    portrait?: string;
    portrait_opacity?: number;
    portrait_height?: number;
    subbanks?: Array<{
      color: string;
      prefix: string;
      suffix: string;
      tone_ranges: Array<string>;
    }>;
  };
  /**
   * prefix.map
   */
  private _prefixmaps: { [color: string]: PrefixMap };

  /**
   * 原音設定データ
   */
  private _oto: Oto;

  /**
   * readme.txt
   */
  private _readme: string;

  /**
   * zipファイル内における音源ルートの相対パス
   */
  private _root: string;

  /**
   * アイコンファイル
   */
  private _icon: ArrayBuffer;

  /**
   * サンプル音声
   */
  private _sample: ArrayBuffer;

  /**
   * 立ち絵
   */
  private _portrait: ArrayBuffer;

  /**
   * 初期化完了済みフラグ
   */
  private _initialized: boolean;

  get initialized(): boolean {
    return this._initialized;
  }

  /**
   * UTAU音源ライブラリを利用する処理全般を扱う
   * @param zip character.txtを含むzip
   * @throws character.txtが存在しない場合。
   */
  constructor(zip: { [filename: string]: JSZip.JSZipObject }) {
    this._zip = zip;
    this._filenames = Object.keys(this._zip);
    this._prefixmaps = {};
    this._oto = new Oto();
    this._initialized = false;
  }

  /**
   * character.txtで定義された音源名
   */
  get name(): string | undefined {
    return this._character.name;
  }

  /**
   * character.txtで参照するアイコン画像
   */
  get image(): ArrayBuffer | undefined {
    return this._icon;
  }

  /**
   * character.txtで参照するサンプル音声
   */
  get sample(): ArrayBuffer | undefined {
    return this._sample;
  }

  /**
   * character.txtで定義された管理者名
   */
  get author(): string | undefined {
    return this._character.author;
  }

  /**
   * character.txtで定義されたurl
   */
  get web(): string | undefined {
    return this._character.web;
  }

  /**
   * character.txtで定義されたバージョン情報
   */
  get version(): string | undefined {
    return this._character.version;
  }

  /**
   * character.yamlで定義された音声提供者情報
   */
  get voice(): string | undefined {
    if (this._characterYaml) {
      return this._characterYaml.voice;
    } else {
      return undefined;
    }
  }

  /**
   * character.yamlで参照される立ち絵
   */
  get portrait(): ArrayBuffer | undefined {
    return this._portrait;
  }

  /**
   * character.yamlで定義された立ち絵の透過度。デフォルト値は0.67
   */
  get portraitOpacity(): number {
    if (this._characterYaml) {
      return this._characterYaml.portrait_opacity
        ? this._characterYaml.portrait_opacity
        : 0.67;
    } else {
      return 0.67;
    }
  }

  /**
   * character.yamlで定義された立ち絵の縦幅。デフォルト値は800
   */
  get portraitHeight(): number {
    if (this._characterYaml) {
      return this._characterYaml.portrait_height
        ? this._characterYaml.portrait_height
        : 800;
    } else {
      return 800;
    }
  }

  /**
   * readme.txt
   */
  get readme(): string | undefined {
    return this._readme;
  }

  /**
   * 原音設定データ
   */
  get oto(): Oto {
    return this._oto;
  }

  /**
   * prefix.mapデータ
   */
  get prefixmaps(): { [color: string]: PrefixMap } {
    return this._prefixmaps;
  }

  /**
   * colorとnotenumを使ってprefix.mapからprefixとsuffixを参照し、aliasを活用してoto.iniから該当のデータを返す。
   * @param alias ノートに指定されたエイリアス。?で始まる場合prefix.mapを無視する。
   * @param notenum ノートの音高
   * @param color ボイスカラー
   * @returns prefix.mapを反映した指定エイリアスの原音設定データ。それがなければprefix.mapを無視した原音設定データ
   */
  getOtoRecord(alias: string, notenum: number, color: string = ""): OtoRecord {
    const c = Object.keys(this._prefixmaps).includes(color) ? color : "";
    const p = this._prefixmaps[c].getValue(notenum);
    if (alias.startsWith("?")) {
      return this._oto.GetRecordFromAlias(alias.slice(1));
    }
    const r = this._oto.GetRecordFromAlias(p.prefix + alias + p.suffix);
    if (r !== null) {
      return r;
    } else {
      return this._oto.GetRecordFromAlias(alias);
    }
  }

  /**
   * ファイル名からwavのデータを返す
   * @param filename ファイル名
   * @returns　wavデータ
   * @throws wavが存在しない場合。
   */
  async getWave(filename: string): Promise<Wave> {
    return new Promise(async (resolve, reject) => {
      const root = this._root !== undefined ? this._root + "/" : "";
      if (Object.keys(this._zip).includes(root + filename)) {
        const buf = await extractFileFromZip(this._zip[root + filename]);
        resolve(new Wave(buf));
      } else {
        reject(`${root + filename} not found.`);
      }
    });
  }

  /**
   * 対応するwavのファイル名からfrqを返す
   * @param wavFilename wavのファイル名
   * @returns frqデータ
   * @throws frqが存在しない場合。
   */
  async getFrq(wavFilename: string): Promise<Frq> {
    return new Promise(async (resolve, reject) => {
      const root = this._root !== undefined ? this._root + "/" : "";
      const frqFilename = wavFilename.replace(".wav", "_wav.frq");
      if (Object.keys(this._zip).includes(root + frqFilename)) {
        const buf = await extractFileFromZip(this._zip[root + frqFilename]);
        resolve(new Frq({ buf: buf }));
      } else {
        reject(`${root + frqFilename} not found.`);
      }
    });
  }

  /**
   * zip内からcharacter.txt,character.yaml,prefix.map,oto.ini,readme.txtを読み込む。
   * @param encoding default shift-jis、character.txt,prefix.map,oto.ini,readme.txtをお読み込む際の文字コード
   * @throws character.txtが存在しない場合。
   */
  async initialize(encoding: string = "SJIS"): Promise<void> {
    const characterTxtPath = this._filenames.find((f) =>
      f.endsWith("character.txt"),
    );
    if (characterTxtPath === undefined) {
      throw new Error("character.txt not found.");
    }
    return new Promise(async (resolve) => {
      this._root = characterTxtPath.split("/").slice(0, -1).join("/");
      this.extractCharacterTxt(characterTxtPath, encoding).then(async (c) => {
        this._character = c;
        const asyncs = new Array<Promise<void>>();
        this.extractCharacterYaml().then(async () => {
          this.subbanksToPrefixmaps();
          asyncs.push(this.extractReadme(encoding));
          asyncs.push(this.extractIcon());
          asyncs.push(this.extractSample());
          asyncs.push(this.extractPortrait());
          asyncs.push(this.extractPrefixmaps(encoding));
          asyncs.push(this.extractOtoAll(encoding));
          Promise.all(asyncs).then(() => {
            if (!Object.keys(this._prefixmaps).includes("")) {
              this._prefixmaps[""] = new PrefixMap();
            }
            this._initialized = true;
            resolve();
          });
        });
      });
    });
  }

  /**
   * character.txtを抽出し、その内容を返す。
   * @param path zipファイル内におけるcharacter.txtのパス。事前にファイルの存在を確認していること
   * @param encoding character.txtを読み込む際の文字コード
   */
  async extractCharacterTxt(path: string, encoding): Promise<CharacterTxt> {
    return new Promise(async (resolve) => {
      const characterBuf = await extractFileFromZip(this._zip[path]);
      const character = await readTextFile(characterBuf, encoding);
      resolve(new CharacterTxt({ txt: character }));
    });
  }

  /**
   * character.txtにおいてimageで定義されているファイルがzip内にあれば、this._iconを更新する。
   */
  async extractIcon(): Promise<void> {
    return new Promise(async (resolve) => {
      if (
        this._character.image !== undefined &&
        this._filenames.includes(this._root + "/" + this._character.image)
      ) {
        this._icon = await extractFileFromZip(
          this._zip[this._root + "/" + this._character.image],
        );
      }
      resolve();
    });
  }
  /**
   * character.txtにおいてsampleで定義されているファイルがzip内にあれば、this._sampleを更新する。
   */
  async extractSample(): Promise<void> {
    return new Promise(async (resolve) => {
      if (
        this._character.sample !== undefined &&
        this._filenames.includes(this._root + "/" + this._character.sample)
      ) {
        this._sample = await extractFileFromZip(
          this._zip[this._root + "/" + this._character.sample],
        );
      }
      resolve();
    });
  }
  /**
   * 音源ルートにreadme.txtがあれば、this._readmeを更新する。
   * @param encoding readme.txtを読み込む際の文字コード
   */
  async extractReadme(encoding): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._filenames.includes(this._root + "/readme.txt")) {
        const readmeBuf = await extractFileFromZip(
          this._zip[this._root + "/readme.txt"],
        );
        this._readme = await readTextFile(readmeBuf, encoding);
      }
      resolve();
    });
  }
  /**
   * 音源ルートにcharacter.yamlがあれば、this._characterYamlを更新する。
   */
  async extractCharacterYaml(): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._filenames.includes(this._root + "/character.yaml")) {
        const yamlBuf = await extractFileFromZip(
          this._zip[this._root + "/character.yaml"],
        );
        this._characterYaml = yaml.load(await readTextFile(yamlBuf, "UTF8"));
      }
      resolve();
    });
  }
  /**
   * character.yamlにおいてportraitで定義されているファイルがzip内にあれば、this._portraitを更新する。
   */
  async extractPortrait(): Promise<void> {
    if (this._characterYaml === undefined) {
      return;
    }
    return new Promise(async (resolve) => {
      if (
        this._characterYaml.portrait !== undefined &&
        this._filenames.includes(
          this._root + "/" + this._characterYaml.portrait,
        )
      ) {
        this._portrait = await extractFileFromZip(
          this._zip[this._root + "/" + this._characterYaml.portrait],
        );
      }
      resolve();
    });
  }
  /**
   * 音源ルートにprefix.mapがあれば、this._prefixmapsを更新する。
   * @param encoding prefix.mapを読み込む際の文字コード
   */
  async extractPrefixmaps(encoding): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._filenames.includes(this._root + "/prefix.map")) {
        const prefixmapBuf = await extractFileFromZip(
          this._zip[this._root + "/prefix.map"],
        );
        this._prefixmaps[""] = new PrefixMap(
          await readTextFile(prefixmapBuf, encoding),
        );
      }
      resolve();
    });
  }

  /**
   * rootフォルダ以下にあるすべてのoto.iniを読み込み、this._otoを更新する
   * @param encoding oto.ini読み込み時の文字コード
   */
  async extractOtoAll(encoding): Promise<void> {
    return new Promise(async (resolve) => {
      const otoPaths = this._filenames
        .filter((f) => f.endsWith("oto.ini"))
        .filter((f) => f.startsWith(this._root));
      const asyncs = new Array();
      otoPaths.forEach(async (p) => {
        asyncs.push(this.extractOto(p, encoding));
      });
      Promise.all(asyncs).then(() => {
        resolve();
      });
    });
  }

  /**
   * pathで指定したoto.iniを読み込む
   * @param path oto.iniのパス
   * @param encoding oto.ini読み込み時の文字コード
   */
  async extractOto(path: string, encoding: string): Promise<void> {
    const reg = new RegExp("^" + this._root);
    return new Promise(async (resolve) => {
      const dirPath = path
        .split("/")
        .slice(0, -1)
        .join("/")
        .replace(reg, "")
        .replace(/^\//, "");
      const otoBuf = await extractFileFromZip(this._zip[path]);
      readTextFile(otoBuf, encoding).then((otoTxt) => {
        this._oto.ParseOto(dirPath, otoTxt);
        resolve();
      });
    });
  }

  /**
   * character.yamlにsubbanksが含まれていれば、this._prefixmapを更新する
   */
  subbanksToPrefixmaps(): void {
    if (this._characterYaml === undefined) {
      return;
    }
    if (this._characterYaml.subbanks === undefined) {
      return;
    }
    this._characterYaml.subbanks.forEach((s) => {
      if (!Object.keys(this._prefixmaps).includes(s.color)) {
        this._prefixmaps[s.color] = new PrefixMap();
      }
      s.tone_ranges.forEach((r) => {
        this._prefixmaps[s.color].setRangeValues(r, s.prefix, s.suffix);
      });
    });
  }
}
