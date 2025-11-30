/**
 * UTAU音源ライブラリを利用する処理全般を扱う
 */

import yaml from "js-yaml";
import type JSZip from "jszip";

import { Wave } from "utauwav";

import { extractFileFromZip } from "../../services/extractFileFromZip";
import { readTextFile } from "../../services/readTextFile";
import { BaseVoiceBank } from "./BaseVoiceBank";
import { CharacterTxt } from "./CharacterTxt";
import { PrefixMap } from "./PrefixMap";
import { Presamp } from "./Presamp";
import { Frq } from "./UtauFrq";

export class VoiceBank extends BaseVoiceBank {
  /**
   * UTAU音源として操作するzipファイル
   */
  private _zip: {
    [filename: string]: JSZip.JSZipObject;
  };

  /**
   * UTAU音源ライブラリを利用する処理全般を扱う
   * @param zip character.txtを含むzip
   * @throws character.txtが存在しない場合。
   */
  constructor(zip: { [filename: string]: JSZip.JSZipObject }) {
    super();
    this._zip = zip;
    this._filenames = Object.keys(this._zip);
  }

  /**
   * zipデータ
   */
  override get zip(): { [filename: string]: JSZip.JSZipObject } {
    const root = this._root !== undefined ? this._root + "/" : "";
    if (this._root === "") {
      return Object.fromEntries(Object.entries(this._zip));
    } else {
      return Object.fromEntries(
        Object.entries(this._zip)
          .filter(([key, value]) => key.startsWith(root))
          .map(([key, value]) => [key.replace(root, ""), value])
      );
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
      const root =
        this._root !== undefined && this._root !== "" ? this._root + "/" : "";
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
      const root =
        this._root !== undefined && this._root !== "" ? this._root + "/" : "";
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
      f.endsWith("character.txt")
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
          asyncs.push(this.extractPresampIni());
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
    const root =
      this._root !== undefined && this._root !== "" ? this._root + "/" : "";
    return new Promise(async (resolve) => {
      if (
        this._character.image !== undefined &&
        this._filenames.includes(
          root + this._character.image.replace(/\\/g, "/")
        )
      ) {
        this._icon = await extractFileFromZip(
          this._zip[root + this._character.image.replace(/\\/g, "/")]
        );
      }
      resolve();
    });
  }
  /**
   * character.txtにおいてsampleで定義されているファイルがzip内にあれば、this._sampleを更新する。
   */
  async extractSample(): Promise<void> {
    const root =
      this._root !== undefined && this._root !== "" ? this._root + "/" : "";
    return new Promise(async (resolve) => {
      if (
        this._character.sample !== undefined &&
        this._filenames.includes(
          root + this._character.sample.replace(/\\/g, "/")
        )
      ) {
        this._sample = await extractFileFromZip(
          this._zip[root + this._character.sample.replace(/\\/g, "/")]
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
          this._zip[this._root + "/readme.txt"]
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
          this._zip[this._root + "/character.yaml"]
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
          this._root + "/" + this._characterYaml.portrait.replace(/\\/g, "/")
        )
      ) {
        this._portrait = await extractFileFromZip(
          this._zip[
            this._root + "/" + this._characterYaml.portrait.replace(/\\/g, "/")
          ]
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
          this._zip[this._root + "/prefix.map"]
        );
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

  async extractPresampIni(): Promise<void> {
    const root =
      this._root !== undefined && this._root !== "" ? this._root + "/" : "";
    return new Promise(async (resolve) => {
      if (this._filenames.includes(root + "presamp.ini")) {
        this._presamp = new Presamp();
        const iniBuf = await extractFileFromZip(
          this._zip[root + "presamp.ini"]
        );
        const iniTxt = await readTextFile(iniBuf, "UTF8");
        this._presamp.parseIni(iniTxt);
        console.log(this._presamp);
      }
      resolve();
    });
  }
}
