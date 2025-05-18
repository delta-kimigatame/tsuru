export interface FlagKeys {
  name: string;
  min?: number;
  max?: number;
  type: "number" | "bool";
  default: number | undefined;
}
export const parseFlags = (
  value: string,
  flagKeys: FlagKeys[]
): { [key: string]: number | undefined } => {
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
      } else {
        result[f.name] = f.default;
      }
    });

  return result;
};
