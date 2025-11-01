import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// @ts-ignore - No types available for this package
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import csTranslation from './locales/cs/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
  cs: {
    translation: csTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  // Automatically detect language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Language to use if translations in selected language are not available
    fallbackLng: 'en',
    
    // Default language
    lng: 'cs', // Set Czech as default
    
    // Debug mode
    debug: process.env.NODE_ENV === 'development',
    
    // Detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage'],
      
      // Keys to store language in localStorage
      lookupLocalStorage: 'language',
    },
    
    interpolation: {
      // React already does escaping
      escapeValue: false,
    },
    
    // Namespace separator
    nsSeparator: false,
    
    // Key separator for nested keys
    keySeparator: '.',
    
    // Return empty string for missing keys instead of key name
    returnEmptyString: false,
    
    // Return key if no translation found
    returnNull: false,
  });

export default i18n;