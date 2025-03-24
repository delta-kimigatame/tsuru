/** 配列の最後の要素を返すヘルパー関数 */
export const last = <T>(arr: T[]): T | undefined => {
  return arr[arr.length - 1];
};

/**
 * a～bの範囲の数値列を生成
 */
export const range = (a: number, b: number): number[] => {
  const small = Math.min(a, b);
  const large = Math.max(a, b);
  return Array.from({ length: large - small + 1 }, (_, i) => small + i);
};
