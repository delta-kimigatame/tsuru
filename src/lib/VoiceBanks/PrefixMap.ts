import { toneToNoteNum, noteNumToTone } from "../../utils/Notenum";
/**
 * UTAU用のprefix.mapを扱う。
 * OpenUtauのcharacter.yaml用の出力機能を持つ
 */

export class PrefixMap {
  /**voice color名称、標準UTAU向けでは""" */
  voiceColor: string = "";
  /**音高毎のprefixとsuffixを保存したArray */
  private values: Array<MapValue>;

  /**
   * 音高を指定してMapValueを受け取る
   * @param key Notenumか音高名
   * @returns
   */
  GetValue(key: number | string): MapValue {
    if (typeof key === "number") {
      return this.values[107 - key];
    } else {
      return this.values[107 - toneToNoteNum(key)];
    }
  }

  /**
   * 値を更新する
   * @param newValue 更新後の値
   */
  SetValue(newValue: MapValue): void {
    this.values[107 - toneToNoteNum(newValue.tone)] = newValue;
  }
  /**
   * rangeで指定した範囲に同じ値を設定する
   * @param range `minTone`-`maxTone`の書式の文字列
   * @param newPrefix 新しいprefix
   * @param newSuffix 新しいsuffix
   */
  SetRangeValues(range: string, newPrefix: string, newSuffix): void {
    if (range.includes("-")) {
      const [minTone, maxTone] = range.split("-");
      for (let i = toneToNoteNum(minTone); i <= toneToNoteNum(maxTone); i++) {
        this.SetValue({
          tone: noteNumToTone(i),
          prefix: newPrefix,
          suffix: newSuffix,
        });
      }
    } else {
      this.SetValue({
        tone: range,
        prefix: newPrefix,
        suffix: newSuffix,
      });
    }
  }
  /**
   *
   * @param txt prefix.map。`tone`\t`prefix`\t`suffix`\nが84音階分並んでいる。
   */
  constructor(txt?: string) {
    this.values = new Array(84);
    if (txt) {
      const lines: Array<string> = txt.replace(/\r/g, "").split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("\t")) {
          const [tone, prefix, suffix] = lines[i].split("\t");
          this.SetValue({ tone: tone, prefix: prefix, suffix: suffix });
        }
      }
    } else {
      for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
        this.SetValue({ tone: noteNumToTone(i), prefix: "", suffix: "" });
      }
    }
  }

  /**
   * UTAU形式のprefix.mapを出力する。
   * @returns UTAU形式のprefix.map
   */
  OutputMap(): string {
    const lines = new Array<string>();
    for (let i = toneToNoteNum("B7"); i >= toneToNoteNum("C1"); i--) {
      const map = this.GetValue(i);
      lines.push(map.tone + "\t" + map.prefix + "\t" + map.suffix);
    }
    return lines.join("\n");
  }

  /**
   * OpenUtauのcharacter.yamlのSubBanks形式でprefix.mapを出力する。
   * @returns OpenUtauのcharacter.yamlのSubBanks形式
   */
  OutputSubbanks(): Array<OpenUtauSubBanks> {
    const output = new Array<OpenUtauSubBanks>();
    let minTone = "C1";
    let maxTone = "B7";
    let prefix: string | undefined;
    let suffix: string | undefined;
    for (let i = toneToNoteNum("C1"); i <= toneToNoteNum("B7"); i++) {
      const map = this.GetValue(i);
      if (prefix === undefined) {
        prefix = map.prefix;
        suffix = map.suffix;
        minTone = map.tone;
        maxTone = map.tone;
      } else if (prefix === map.prefix && suffix === map.suffix) {
        maxTone = map.tone;
      } else {
        let found = false;
        for (let j = 0; j < output.length; j++) {
          if (output[j].prefix === prefix && output[j].suffix === suffix) {
            output[j].tone_ranges.push(minTone + "-" + maxTone);
            prefix = map.prefix;
            suffix = map.suffix;
            minTone = map.tone;
            maxTone = map.tone;
            found = true;
            break;
          }
        }
        if (!found) {
          output.push({
            color: this.voiceColor,
            prefix: prefix,
            suffix: suffix,
            tone_ranges: new Array<string>(minTone + "-" + maxTone),
          });
          prefix = map.prefix;
          suffix = map.suffix;
          minTone = map.tone;
          maxTone = map.tone;
        }
      }
    }
    if (prefix !== undefined) {
      let found = false;
      for (let j = 0; j < output.length; j++) {
        if (output[j].prefix === prefix && output[j].suffix === suffix) {
          output[j].tone_ranges.push(minTone + "-" + maxTone);
          found = true;
          break;
        }
      }
      if (!found) {
        output.push({
          color: this.voiceColor,
          prefix: prefix,
          suffix: suffix,
          tone_ranges: new Array<string>(minTone + "-" + maxTone),
        });
      }
    }
    return output;
  }
}

export interface MapValue {
  tone: string;
  prefix: string;
  suffix: string;
}

export interface OpenUtauSubBanks {
  color: string;
  prefix: string;
  suffix: string;
  tone_ranges: Array<string>;
}
