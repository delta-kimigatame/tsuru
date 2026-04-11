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
  flagKeys
    .filter((f) => f.type === "bool")
    .forEach((f) => {
      if (value.includes(f.name)) {
        result[f.name] = 0;
        value = value.replace(f.name, "");
      } else {
        result[f.name] = f.default;
      }
    });
  const foundFlags = new Set<string>();
  flagKeys
    .filter((f) => f.type === "number")
    .forEach((f) => {
      const reg = new RegExp(f.name + "([-0-9]+)");
      const match = value.match(reg);
      if (match) {
        const flagValue_ =
          f.min === undefined
            ? parseInt(match[1])
            : Math.max(f.min, parseInt(match[1]));
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
