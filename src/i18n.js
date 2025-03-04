import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationFR from './locales/fr/translation.json';
import translationDE from './locales/de/translation.json';
import translationZH from './locales/zh/translation.json';
import translationJA from './locales/ja/translation.json';
import translationRU from './locales/ru/translation.json';
import translationHI from './locales/hi/translation.json';
import translationAR from './locales/ar/translation.json';
import translationHE from './locales/he/translation.json';
import translationHA from './locales/ha/translation.json';
import translationYO from './locales/yo/translation.json';
import translationIG from './locales/ig/translation.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  fr: { translation: translationFR },
  de: { translation: translationDE },
  zh: { translation: translationZH },
  ja: { translation: translationJA },
  ru: { translation: translationRU },
  hi: { translation: translationHI },
  ar: { translation: translationAR },
  he: { translation: translationHE },
  ha: { translation: translationHA },
  yo: { translation: translationYO },
  ig: { translation: translationIG },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;