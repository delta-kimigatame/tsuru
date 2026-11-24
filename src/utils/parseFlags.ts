export interface FlagKeys {
  name: string;
  min?: number;
  max?: number;
  type: "number" | "bool";
  default: number | undefined;
  alias?: string;
}
export const parseFlags = (
  value: string,
  flagKeys: FlagKeys[],
): { [key: string]: number | undefined } => {
  if (value === undefined) {
    value = "";
  }
  value = value.replace(/\+/g, "");
  const result = {};
  const foundFlags = new Set<string>();
  // 名前の長いフラグから順に処理し、マッチした部分を取り除く。
  // これにより、MG50のG、Mt50のtのように、長いフラグの一部が短いフラグとして誤検出されない。
  const sortedFlagKeys = [...flagKeys].sort(
    (a, b) => b.name.length - a.name.length,
  );
  sortedFlagKeys.forEach((f) => {
    if (f.type === "bool") {
      if (value.includes(f.name)) {
        result[f.name] = 0;
        value = value.replace(f.name, "");
      } else {
        result[f.name] = f.default;
      }
      return;
    }
    const reg = new RegExp(f.name + "([-0-9]+)");
    const match = value.match(reg);
    if (!match) {
      result[f.name] = f.default;
      return;
    }
    value = value.replace(match[0], "");
    const parsedValue = parseInt(match[1]);
    if (Number.isFinite(parsedValue)) {
      const flagValue_ =
        f.min === undefined ? parsedValue : Math.max(f.min, parsedValue);
      const flagValue =
        f.max === undefined ? flagValue_ : Math.min(f.max, flagValue_);
      result[f.name] = flagValue;
      foundFlags.add(f.name);
    } else {
      result[f.name] = f.default;
    }
  });

  // エイリアスフラグの解決: 正規フラグが未指定で、エイリアスフラグが指定されていれば正規フラグへ反映する
  flagKeys
    .filter((f) => f.alias !== undefined)
    .forEach((f) => {
      if (!foundFlags.has(f.alias) && foundFlags.has(f.name)) {
        result[f.alias] = result[f.name];
      }
    });

  return result;
};
