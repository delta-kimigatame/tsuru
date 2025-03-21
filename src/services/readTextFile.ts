/**
 * 文字コードを指定してテキストファイルをbufferから読み込む
 * @param buf
 * @param encoding テキストファイルを読み込む文字コード
 * @returns
 */
export const readTextFile = async (
  buf: ArrayBuffer,
  encoding = "SJIS",
): Promise<string> => {
  const reader: FileReader = new FileReader();
  reader.readAsText(new Blob([buf], { type: "text/plain" }), encoding);
  return new Promise((resolve, reject) => {
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("file can't read");
      }
    });
  });
};
