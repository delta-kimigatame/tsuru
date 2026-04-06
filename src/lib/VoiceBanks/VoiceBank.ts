/**
 * UTAU音源ライブラリを利用する処理全般を扱う
 */

import yaml from "js-yaml";
import type JSZip from "jszip";

import { Oto } from "utauoto";
import { Wave } from "utauwav";

import { extractFileFromZip } from "../../services/extractFileFromZip";
import { readTextFile } from "../../services/readTextFile";
import { LOG } from "../Logging";
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
  override get zip(): { [filename: string]: JSZip.JSZipObject } {
    const root = this._root !== undefined ? this._root + "/" : "";
    if (this._root === "") {
      return Object.fromEntries(Object.entries(this._zip));
    } else {
      return Object.fromEntries(
        Object.entries(this._zip)
          .filter(([key, value]) => key.startsWith(root))
          .map(([key, value]) => [key.replace(root, ""), value]),
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
        try {
          const buf = await extractFileFromZip(this._zip[root + filename]);
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
      if (Object.keys(this._zip).includes(root + frqFilename)) {
        try {
          const buf = await extractFileFromZip(this._zip[root + frqFilename]);
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
    const characterBuf = await extractFileFromZip(this._zip[path]);
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
      if (this._filenames.includes(iconPath)) {
        this._icon = await extractFileFromZip(this._zip[iconPath]);
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
      if (this._filenames.includes(samplePath)) {
        this._sample = await extractFileFromZip(this._zip[samplePath]);
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
      if (this._filenames.includes(readmePath)) {
        const readmeBuf = await extractFileFromZip(this._zip[readmePath]);
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
      if (this._filenames.includes(yamlPath)) {
        try {
          const yamlBuf = await extractFileFromZip(this._zip[yamlPath]);
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
      if (this._filenames.includes(portraitPath)) {
        this._portrait = await extractFileFromZip(this._zip[portraitPath]);
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
      if (this._filenames.includes(prefixMapPath)) {
        const prefixmapBuf = await extractFileFromZip(this._zip[prefixMapPath]);
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
    return new Promise(async (resolve) => {
      const presampPath = this.getFullPath("presamp.ini");
      if (this._filenames.includes(presampPath)) {
        this._presamp = new Presamp();
        const iniBuf = await extractFileFromZip(this._zip[presampPath]);
        const iniTxt = await readTextFile(iniBuf, "UTF8");
        this._presamp.parseIni(iniTxt);
        console.log(this._presamp);
      }
      resolve();
    });
  }
}
