/**
 * 与えられた文字列が有効なurlか検証する。
 * @param value
 * @returns
 */
export const urlValidation = (value: string): boolean => {
  const reg =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
  return reg.test(value);
};
