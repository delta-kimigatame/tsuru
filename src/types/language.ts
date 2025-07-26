export const languages = ["ja", "en", "zh", "pt"] as const;
export type Language = (typeof languages)[number];
