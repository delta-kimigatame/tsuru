export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];
