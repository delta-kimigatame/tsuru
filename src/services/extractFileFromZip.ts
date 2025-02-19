import type { JSZipObject } from "jszip";

/**
 * ファイルを1つzipから抽出する。
 * @param file 取り出すファイル
 * @returns 
 */
export const extractFileFromZip = async (
  file: JSZipObject,
): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    file.async("arraybuffer").then(async (buf) => {
      resolve(buf);
    });
  });
};
