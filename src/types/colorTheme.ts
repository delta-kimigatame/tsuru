export const colors = [
  "default",
  "red",
  "orange",
  "yellow",
  "lightgreen",
  "green",
  "blue",
  "aqua",
  "pink",
  "brown",
] as const;
export type ColorTheme = (typeof colors)[number];
