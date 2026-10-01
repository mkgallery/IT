import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import sw from "./locales/sw.json";

// Get saved language from localStorage, fallback to browser, then English
function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("language");
  if (saved === "en" || saved === "sw") return saved;
  const browser = (navigator.language || "").toLowerCase();
  if (browser.startsWith("sw")) return "sw";
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Persist choice
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;