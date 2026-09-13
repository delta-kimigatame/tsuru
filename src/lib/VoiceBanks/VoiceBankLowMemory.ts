/**
 * UTAU音源ライブラリを利用する処理全般を扱う。zipの扱いをフルスクラッチとすることで省メモリーを期する
 */
import yaml from "js-yaml";
import { Oto } from "utauoto";
import { Wave } from "utauwav";
import { readTextFile } from "../../services/readTextFile";
import { zipReader } from "../../services/zipReader";
import { LOG } from "../Logging";
import { BaseVoiceBank } from "./BaseVoiceBank";
import { CharacterTxt } from "./CharacterTxt";
import { PrefixMap } from "./PrefixMap";
import { Presamp } from "./Presamp";
import { Frq } from "./UtauFrq";

export class VoiceBankLowMemory extends BaseVoiceBank {
  /** UTAU音源として操作するzip。このクラスでconstructorが呼ばれる前にinitializeしていることを想定 */
  private _zip: zipReader;

  /**
   * UTAU音源ライブラリを利用する処理全般を扱う
   * @param zip initialize済みのzip
   */
  constructor(zip: zipReader) {
    super();
    this._zip = zip;
    this._filenames = zip.GetFileList();
  }
  /**
   * ルートパスとファイル名を結合してフルパスを返す
   * @param filename ファイル名
   * @returns フルパス
   */
  private getFullPath(filename: string): string {
    if (this._root === "" || this._root === undefined) {
      return filename;
    }
    return this._root + "/" + filename;
  }
  /**
   * zipデータ
   */
  override get zip(): zipReader {
    return this._zip;
  }

  override getRootFileNames(): string[] {
    const root =
      this._root !== undefined && this._root !== "" ? this._root + "/" : "";
    return this._filenames
      .filter((filename) => filename.startsWith(root))
      .map((filename) => filename.slice(root.length));
  }

  async loadRootFile(filename: string): Promise<ArrayBuffer> {
    return this._zip.LoadFile(this.getFullPath(filename));
  }

  /**
   * ファイル名からwavのデータを返す
   * @param filename ファイル名
   * @returns　wavデータ
   * @throws wavが存在しない場合。
   */
  async getWave(filename: string): Promise<Wave> {
    return new Promise(async (resolve, reject) => {
      const root =
        this._root !== undefined && this._root !== "" ? this._root + "/" : "";
      if (this.zip.HasFile(root + filename)) {
        try {
          const buf = await this.zip.LoadFile(root + filename);
          const wave = new Wave(buf);
          resolve(wave);
        } catch (error) {
          reject(error);
        }
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
      const root =
        this._root !== undefined && this._root !== "" ? this._root + "/" : "";
      const frqFilename = wavFilename.replace(".wav", "_wav.frq");
      if (this.zip.HasFile(root + frqFilename)) {
        try {
          const buf = await this.zip.LoadFile(root + frqFilename);
          const frq = new Frq({ buf: buf });
          resolve(frq);
        } catch (error) {
          reject(error);
        }
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
    // 再初期化時に以前のデータをクリア
    this._oto = new Oto();
    this._prefixmaps = {};
    this._root = characterTxtPath.split("/").slice(0, -1).join("/");

    // 必須: 失敗時はエラーをそのまま伝播
    this._character = await this.extractCharacterTxt(
      characterTxtPath,
      encoding,
    );

    // オプション: 失敗しても続行
    await this.extractCharacterYaml().catch(() => {});

    // character.yaml が読み込めた場合のみ実行
    if (this._characterYaml !== undefined) {
      this.subbanksToPrefixmaps();
    }

    const asyncs: Promise<void>[] = [
      this.extractReadme(encoding),
      this.extractIcon(),
      this.extractSample(),
      this.extractPrefixmaps(encoding),
      this.extractOtoAll(encoding),
      this.extractPresampIni(),
    ];
    // character.yaml が読み込めた場合のみ実行
    if (this._characterYaml !== undefined) {
      asyncs.push(this.extractPortrait());
    }

    await Promise.allSettled(asyncs);

    if (!Object.keys(this._prefixmaps).includes("")) {
      this._prefixmaps[""] = new PrefixMap();
    }
    this._initialized = true;
  }
  /**
   * character.txtを抽出し、その内容を返す。
   * @param path zipファイル内におけるcharacter.txtのパス。事前にファイルの存在を確認していること
   * @param encoding character.txtを読み込む際の文字コード
   */
  async extractCharacterTxt(path: string, encoding): Promise<CharacterTxt> {
    const characterBuf = await this.zip.LoadFile(path);
    const character = await readTextFile(characterBuf, encoding);
    return new CharacterTxt({ txt: character });
  }

  /**
   * character.txtにおいてimageで定義されているファイルがzip内にあれば、this._iconを更新する。
   */
  async extractIcon(): Promise<void> {
    return new Promise(async (resolve) => {
      const image = this._character.image;
      if (typeof image !== "string" || image.trim() === "") {
        resolve();
        return;
      }
      const iconPath = this.getFullPath(image.replace(/\\/g, "/"));
      if (this.zip.HasFile(iconPath)) {
        this._icon = await this.zip.LoadFile(iconPath);
      }
      resolve();
    });
  }

  /**
   * character.txtにおいてsampleで定義されているファイルがzip内にあれば、this._sampleを更新する。
   */
  async extractSample(): Promise<void> {
    return new Promise(async (resolve) => {
      const sample = this._character.sample;
      if (typeof sample !== "string" || sample.trim() === "") {
        resolve();
        return;
      }
      const samplePath = this.getFullPath(sample.replace(/\\/g, "/"));
      if (this.zip.HasFile(samplePath)) {
        this._sample = await this.zip.LoadFile(samplePath);
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
      const readmePath = this.getFullPath("readme.txt");
      if (this.zip.HasFile(readmePath)) {
        const readmeBuf = await this.zip.LoadFile(readmePath);
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
      const yamlPath = this.getFullPath("character.yaml");
      if (this.zip.HasFile(yamlPath)) {
        try {
          const yamlBuf = await this.zip.LoadFile(yamlPath);
          this._characterYaml = yaml.load(await readTextFile(yamlBuf, "UTF8"));
        } catch {
          LOG.warn("character.yamlの読み込みに失敗しました", "VoiceBank");
          this._characterYaml = undefined;
        }
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
      const portrait = this._characterYaml.portrait;
      if (typeof portrait !== "string" || portrait.trim() === "") {
        resolve();
        return;
      }
      const portraitPath = this.getFullPath(portrait.replace(/\\/g, "/"));
      if (this.zip.HasFile(portraitPath)) {
        this._portrait = await this.zip.LoadFile(portraitPath);
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
      const prefixMapPath = this.getFullPath("prefix.map");
      if (this.zip.HasFile(prefixMapPath)) {
        const prefixmapBuf = await this.zip.LoadFile(prefixMapPath);
        this._prefixmaps[""] = new PrefixMap(
          await readTextFile(prefixmapBuf, encoding),
        );
      }
      resolve();
    });
  }

  /**
   * pathで指定したoto.iniを読み込む
   * @param path oto.iniのパス
   * @param encoding oto.ini読み込み時の文字コード
   */
  async extractOto(path: string, encoding: string): Promise<void> {
    const reg = new RegExp(
      "^" + this._root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );
    return new Promise(async (resolve) => {
      const dirPath = path
        .split("/")
        .slice(0, -1)
        .join("/")
        .replace(reg, "")
        .replace(/^\//, "");
      const otoBuf = await this.zip.LoadFile(path);
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

  async extractPresampIni(): Promise<void> {
    return new Promise(async (resolve) => {
      const presampPath = this.getFullPath("presamp.ini");
      if (this.zip.HasFile(presampPath)) {
        this._presamp = new Presamp();
        const iniBuf = await this.zip.LoadFile(presampPath);
        const iniTxt = await readTextFile(iniBuf, "UTF8");
        this._presamp.parseIni(iniTxt);
        console.log(this._presamp);
      }
      resolve();
    });
  }
}
