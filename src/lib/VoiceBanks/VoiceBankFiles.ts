/**
 * UTAU音源ライブラリを利用する処理全般を扱う
 */

import yaml from "js-yaml";

import { Wave } from "utauwav";

import { readTextFile } from "../../services/readTextFile";
import { BaseVoiceBank } from "./BaseVoiceBank";
import { CharacterTxt } from "./CharacterTxt";
import { PrefixMap } from "./PrefixMap";
import { Presamp } from "./Presamp";
import { Frq } from "./UtauFrq";

export class VoiceBankFiles extends BaseVoiceBank {
  private _files: File[];
  /**
   * UTAU音源ライブラリを利用する処理全般を扱う
   * @param zip character.txtを含むzip
   * @throws character.txtが存在しない場合。
   */
  constructor(files: File[]) {
    super();
    this._files = files;
    this._filenames = files.map((f) => f.webkitRelativePath.normalize("NFC"));
  }

  override get files(): { [filename: string]: File } {
    const root = this._root !== undefined ? this._root + "/" : "";
    return Object.fromEntries(
      this._files
        .filter((f) => f.webkitRelativePath.normalize("NFC").startsWith(root))
        .map((f) => [
          f.webkitRelativePath.normalize("NFC").replace(root, ""),
          f,
        ])
    );
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
      if (this._filenames.includes(root + filename)) {
        const buf = await this._files[
          this._filenames.indexOf(root + filename)
        ].arrayBuffer();
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
      const root =
        this._root !== undefined && this._root !== "" ? this._root + "/" : "";
      const frqFilename = wavFilename.replace(".wav", "_wav.frq");
      if (this._filenames.includes(root + frqFilename)) {
        const buf = await this._files[
          this._filenames.indexOf(root + frqFilename)
        ].arrayBuffer();
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
      f.endsWith("character.txt")
    );
    if (characterTxtPath === undefined) {
      throw new Error("character.txt not found.");
    }
    return new Promise(async (resolve, reject) => {
      this._root = characterTxtPath.split("/").slice(0, -1).join("/");
      this.extractCharacterTxt(characterTxtPath, encoding)
        .then(async (c) => {
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
            asyncs.push(this.extractPresampIni());
            Promise.all(asyncs).then(() => {
              if (!Object.keys(this._prefixmaps).includes("")) {
                this._prefixmaps[""] = new PrefixMap();
              }
              this._initialized = true;
              resolve();
            });
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  /**
   * character.txtを抽出し、その内容を返す。
   * @param path zipファイル内におけるcharacter.txtのパス。事前にファイルの存在を確認していること
   * @param encoding character.txtを読み込む際の文字コード
   */
  async extractCharacterTxt(path: string, encoding): Promise<CharacterTxt> {
    const characterBuf = await this._files[
      this._filenames.indexOf(path)
    ].arrayBuffer();
    const character = await readTextFile(characterBuf, encoding);
    return new CharacterTxt({ txt: character });
  }
  /**
   * character.txtにおいてimageで定義されているファイルがzip内にあれば、this._iconを更新する。
   */
  async extractIcon(): Promise<void> {
    return new Promise(async (resolve) => {
      if (
        this._character.image !== undefined &&
        this._filenames.includes(
          this._root + "/" + this._character.image.replace(/\\/g, "/")
        )
      ) {
        this._icon = await this._files[
          this._filenames.indexOf(
            this._root + "/" + this._character.image.replace(/\\/g, "/")
          )
        ].arrayBuffer();
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
        this._filenames.includes(
          this._root + "/" + this._character.sample.replace(/\\/g, "/")
        )
      ) {
        this._sample = await this._files[
          this._filenames.indexOf(
            this._root + "/" + this._character.sample.replace(/\\/g, "/")
          )
        ].arrayBuffer();
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
        const readmeBuf = await this._files[
          this._filenames.indexOf(this._root + "/readme.txt")
        ].arrayBuffer();
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
        const yamlBuf = await this._files[
          this._filenames.indexOf(this._root + "/character.yaml")
        ].arrayBuffer();
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
          this._root + "/" + this._characterYaml.portrait.replace(/\\/g, "/")
        )
      ) {
        this._portrait = await this._files[
          this._filenames.indexOf(
            this._root + "/" + this._characterYaml.portrait.replace(/\\/g, "/")
          )
        ].arrayBuffer();
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
        const prefixmapBuf = await this._files[
          this._filenames.indexOf(this._root + "/prefix.map")
        ].arrayBuffer();
        this._prefixmaps[""] = new PrefixMap(
          await readTextFile(prefixmapBuf, encoding)
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
      "^" + this._root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    return new Promise(async (resolve) => {
      const dirPath = path
        .split("/")
        .slice(0, -1)
        .join("/")
        .replace(reg, "")
        .replace(/^\//, "");
      const otoBuf = await this._files[
        this._filenames.indexOf(path)
      ].arrayBuffer();
      readTextFile(otoBuf, encoding).then((otoTxt) => {
        this._oto.ParseOto(dirPath, otoTxt);
        resolve();
      });
    });
  }
  async extractPresampIni(): Promise<void> {
    const root =
      this._root !== undefined && this._root !== "" ? this._root + "/" : "";
    return new Promise(async (resolve) => {
      if (this._filenames.includes(this._root + "/presamp.ini")) {
        this._presamp = new Presamp();
        const iniBuf = await this._files[
          this._filenames.indexOf(this._root + "/presamp.ini")
        ].arrayBuffer();
        const iniTxt = await readTextFile(iniBuf, "UTF8");
        this._presamp.parseIni(iniTxt);
        console.log(this._presamp);
      }
      resolve();
    });
  }
}
