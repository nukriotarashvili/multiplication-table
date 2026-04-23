import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import kaCommon from "./locales/ka/common.json";

export const LANGUAGE_STORAGE_KEY = "multiplication-language";

const savedLanguage = typeof window !== "undefined" ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;

const fallbackLanguage = "en";
const initialLanguage = savedLanguage === "ka" || savedLanguage === "en" ? savedLanguage : fallbackLanguage;

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    ka: { common: kaCommon }
  },
  lng: initialLanguage,
  fallbackLng: fallbackLanguage,
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  }
});

export default i18n;
