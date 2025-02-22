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
      encodeBase64Core(Math.floor(tmp / 64)) + encodeBase64Core(tmp % 64),
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
