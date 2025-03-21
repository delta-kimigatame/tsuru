/** 配列の最後の要素を返すヘルパー関数 */
export const last = <T>(arr: T[]): T | undefined => {
  return arr[arr.length - 1];
};
