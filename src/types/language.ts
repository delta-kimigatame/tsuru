export const languages = ["ja", "en", "zh"] as const;
export type Language = (typeof languages)[number];
