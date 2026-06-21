import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      app: {
        name: "Golden Age",
        tagline: "Child Growth & Development Tracking",
      },
    },
  },
  id: {
    translation: {
      app: {
        name: "Golden Age",
        tagline: "Pemantauan Tumbuh Kembang Anak",
      },
    },
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export { i18next };
