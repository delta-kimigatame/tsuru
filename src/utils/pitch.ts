import { toneToNoteNum } from "./Notenum";

const A4_NOTENUM = toneToNoteNum("A4");
const A4_FRQ = 440;
/**
 * 0～63の数値を受け取り1文字のstrを返す。
 * @param value
 * @returns
 */
const encodeBase64Core = (value: number): string => {
  if (value < 26) {
    return String.fromCharCode(value + "A".charCodeAt(0));
  } else if (value < 52) {
    return String.fromCharCode(value + "a".charCodeAt(0) - 26);
  } else if (value < 62) {
    return String.fromCharCode(value + "0".charCodeAt(0) - 52);
  } else if (value === 62) {
    return "+";
  } else {
    return "/";
  }
};

/**
 * -2048～2047の数値列を受け取り、文字列を返す。
 * @param values -2048 ～ 2047のint列
 * @returns base64にエンコードした2桁の文字列のリスト
 */
export const encodeBase64 = (values: Array<number>): Array<string> => {
  const results = [];
  values.forEach((v) => {
    const tmp = v < 0 ? v + 4096 : v;
    results.push(
      encodeBase64Core(Math.floor(tmp / 64)) + encodeBase64Core(tmp % 64)
    );
  });
  return results;
};

/**
 * base64エンコード済みのピッチ文字列を受け取りランレングス圧縮して返す。
 * 2文字一組とし、#num#はひとつ前の組の繰り返し回数を表します。
        >>> [AA, AB, AC] → AAABAC
        >>> [AA, AA, AA, AA] → AA#3#
 * @param values 
 * @returns 
 */
export const encodeRunLength = (values: Array<string>): string => {
  let result = "";
  let prevValue = "";
  let count = 0;
  values.forEach((v) => {
    if (prevValue !== v) {
      prevValue = v;
      if (count !== 0) {
        result += `#${count}#`;
      }
      count = 0;
      result += v;
    } else {
      count++;
    }
  });
  if (count !== 0) {
    result += `#${count}#`;
  }
  return result;
};

/**
 * -2048～2047の数値列を受け取り、文字列を返す。
 * @param values
 * @returns base64エンコードの上ランレングス圧縮した文字列
 */
export const encodePitch = (values: Array<number>): string => {
  return encodeRunLength(encodeBase64(values));
};

/**
 * 音高名を与えて基準ピッチの周波数(Hz)を返す
 * @param tone 音高名
 * @returns 周波数
 */
export const getFrqFromTone = (tone: string): number => {
  const notenum = toneToNoteNum(tone);
  return A4_FRQ * 2 ** ((notenum - A4_NOTENUM) / 12);
};
/**
 * 音高番号を与えて基準ピッチの周波数(Hz)を返す
 * @param notenum 音高番号
 * @returns 周波数
 */
export const getFrqFromNotenum = (notenum: number): number => {
  return A4_FRQ * 2 ** ((notenum - A4_NOTENUM) / 12);
};

/**
 * ピッチ数列のランレングス圧縮を元に戻す
 * @param value ランレングス圧縮されたピッチ文字列
 * @returns ランレングス圧縮をデコードしたピッチ文字列の配列
 */
export const decodeRunLength = (value: string): Array<string> => {
  const output = [];
  const reg = /^(..)#(\d*)#/;
  let match: RegExpExecArray | null;

  while (value.length !== 0) {
    if ((match = reg.exec(value)) !== null) {
      for (let i = 0; i < Number(match[2]) + 1; i++) {
        output.push(match[1]);
      }
      value = value.replace(match[0], "");
    } else {
      output.push(value.slice(0, 2));
      value = value.slice(2);
    }
  }
  return output;
};

/**
 * Base64圧縮されたピッチ列を与え、-2048～2047のピッチ列を返す
 * @param values Base64圧縮されたピッチ列
 * @returns -2048～2047のピッチ列
 */
export const decodeBase64 = (values: Array<string>): Array<number> => {
  return values.map((v) => {
    const tmp = decodeBase64Core(v[0]) * 64 + decodeBase64Core(v[1]);
    return tmp >= 2048 ? tmp - 4096 : tmp;
  });
};

/**
 * 1文字与えBase64デコードした値を返す
 * @param value
 * @returns
 */
const decodeBase64Core = (value: string): number => {
  let v = value.charCodeAt(0);
  if (v >= "A".charCodeAt(0) && v <= "Z".charCodeAt(0)) {
    return v - "A".charCodeAt(0);
  } else if (v >= "a".charCodeAt(0) && v <= "z".charCodeAt(0)) {
    return v - "a".charCodeAt(0) + 26;
  } else if (v >= "0".charCodeAt(0) && v <= "9".charCodeAt(0)) {
    return v - "0".charCodeAt(0) + 52;
  } else if (v === "+".charCodeAt(0)) {
    return 62;
  } else {
    return 63;
  }
};

/**
 * 圧縮されたピッチ列をデコードする
 * @param value Base64にエンコードの上ランレングス圧縮されたピッチ列
 * @returns  -2048～2047のピッチ列
 */
export const decodePitch = (value: string): Array<number> => {
  return decodeBase64(decodeRunLength(value));
};
