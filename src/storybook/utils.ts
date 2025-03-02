/**
 * storybookでtestする際のみに使用する純粋関数をまとめる。
 */
/**
 * Base64文字列をArrayBufferに変換する関数
 * @param base64 - base64エンコードされた文字列
 * @returns ArrayBuffer
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
