/**
 * 文字コードの選択肢を扱う列挙型
 */
export enum EncodingOption {
  UTF8 = "utf8",
  SHIFT_JIS = "shiftJis",
}

interface EncodingMapping {
  textDecoder: string;
  fileReader: string;
}

export const encodingMappings: Record<EncodingOption, EncodingMapping> = {
  [EncodingOption.UTF8]: { textDecoder: "utf-8", fileReader: "UTF-8" },
  [EncodingOption.SHIFT_JIS]: { textDecoder: "Shift-Jis", fileReader: "SJIS" },
};

export const getTextDecoderEncoding = (option: EncodingOption): string => {
  return encodingMappings[option].textDecoder;
};

export const getFileReaderEncoding = (option: EncodingOption): string => {
  return encodingMappings[option].fileReader;
};
