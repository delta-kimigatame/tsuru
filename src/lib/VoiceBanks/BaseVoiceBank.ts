import { Oto } from "utauoto";
import type OtoRecord from "utauoto/dist/OtoRecord";
import { Wave } from "utauwav";

import { CharacterTxt } from "./CharacterTxt";
import { PrefixMap } from "./PrefixMap";
import { Presamp } from "./Presamp";
import { Frq } from "./UtauFrq";

export abstract class BaseVoiceBank {
  /**
   * ファイル一覧
   */
  protected _filenames: Array<string>;

  /**
   * character.txt
   */
  protected _character: CharacterTxt;

  /**
   * character.yaml
   */
  protected _characterYaml: {
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
  protected _prefixmaps: { [color: string]: PrefixMap };

  /**
   * 原音設定データ
   */
  protected _oto: Oto;

  /**
   * readme.txt
   */
  protected _readme: string;

  /**
   * zipファイル内における音源ルートの相対パス
   */
  protected _root: string;

  /**
   * アイコンファイル
   */
  protected _icon: ArrayBuffer;

  /**
   * サンプル音声
   */
  protected _sample: ArrayBuffer;

  /**
   * 立ち絵
   */
  protected _portrait: ArrayBuffer;

  /**
   * 初期化完了済みフラグ
   */
  protected _initialized: boolean;

  protected _presamp: Presamp;

  /** ユーザー同意済みフラグ */
  agree: boolean = false;

  get initialized(): boolean {
    return this._initialized;
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
   * character.yamlのsubbanksで定義されたcolorの一覧(重複は削除される)
   */
  get colors(): Array<string> {
    if (this._characterYaml && this._characterYaml.subbanks) {
      return Array.from(
        new Set(this._characterYaml.subbanks.map((subbank) => subbank.color))
      );
    } else {
      return [];
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

  get root(): string {
    return this._root;
  }
  /**
   * zipデータ
   */
  get zip() {
    return null;
  }

  get files() {
    return null;
  }

  get presamp(): Presamp {
    return this._presamp;
  }

  constructor() {
    this._prefixmaps = {};
    this._oto = new Oto();
    this._initialized = false;
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
   * colorとnotenumを使ってprefix.mapからsuffixを返す。
   * @param notenum ノートの音高
   * @param color ボイスカラー
   * @returns prefix.mapから取得したsuffix
   */
  getSuffix(notenum: number, color: string = ""): string {
    const c = Object.keys(this._prefixmaps).includes(color) ? color : "";
    const p = this._prefixmaps[c].getValue(notenum);
    return p.suffix;
  }

  /**
   * ファイル名からwavのデータを返す
   * @param filename ファイル名
   * @returns　wavデータ
   * @throws wavが存在しない場合。
   */
  abstract getWave(filename: string): Promise<Wave>;
  /**
   * 対応するwavのファイル名からfrqを返す
   * @param wavFilename wavのファイル名
   * @returns frqデータ
   * @throws frqが存在しない場合。
   */
  abstract getFrq(wavFilename: string): Promise<Frq>;
  /**
   * zip内からcharacter.txt,character.yaml,prefix.map,oto.ini,readme.txtを読み込む。
   * @param encoding default shift-jis、character.txt,prefix.map,oto.ini,readme.txtをお読み込む際の文字コード
   * @throws character.txtが存在しない場合。
   */
  abstract initialize(encoding): Promise<void>;

  abstract extractCharacterTxt(path: string, encoding): Promise<CharacterTxt>;
  abstract extractIcon(): Promise<void>;
  abstract extractSample(): Promise<void>;
  abstract extractReadme(encoding): Promise<void>;
  abstract extractCharacterYaml(): Promise<void>;
  abstract extractPortrait(): Promise<void>;
  abstract extractPrefixmaps(encoding): Promise<void>;
  abstract extractPresampIni(): Promise<void>;
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
  abstract extractOto(path: string, encoding: string): Promise<void>;
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
