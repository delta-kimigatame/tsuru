import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { translationEn } from "./en";
import { translationJa } from "./ja";
import { translationPt } from "./pt";
import { translationZh } from "./zh";
const resources = {
  ja: {
    translation: translationJa,
  },
  en: {
    translation: translationEn,
  },
  zh: {
    translation: translationZh,
  },
  pt: {
    translation: translationPt,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ja",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
