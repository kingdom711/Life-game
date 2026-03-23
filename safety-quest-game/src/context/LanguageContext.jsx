/**
 * Safety Quest Game - Language Context
 *
 * React Context provider for internationalization.
 * Wraps the lightweight i18n utility with React reactivity so that
 * all consuming components re-render when the language changes.
 *
 * Usage:
 *   // In App.jsx or root component:
 *   import { LanguageProvider } from './context/LanguageContext';
 *   <LanguageProvider>
 *     <App />
 *   </LanguageProvider>
 *
 *   // In any child component:
 *   import { useLanguage } from '../context/LanguageContext';
 *   const { language, setLanguage, t } = useLanguage();
 *   <h1>{t('dashboard.title')}</h1>
 *   <p>{t('quest.reward', { points: 100, exp: 50 })}</p>
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  getCurrentLanguage,
  setLanguage as setStoredLanguage,
  t as translate,
  getLanguages,
  getLanguageByCode,
} from '../utils/i18n';

const LanguageContext = createContext(null);

/**
 * LanguageProvider - Wraps children with language context.
 *
 * Initializes with the stored language preference (from localStorage)
 * or falls back to 'ko' (Korean).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getCurrentLanguage());

  /**
   * Change the current language.
   * Updates both localStorage and React state to trigger re-renders.
   * @param {string} lang - Language code (ko, en, vi, zh)
   * @returns {boolean} true if the language was changed successfully
   */
  const setLanguage = useCallback((lang) => {
    const success = setStoredLanguage(lang);
    if (success) {
      setLanguageState(lang);
    }
    return success;
  }, []);

  /**
   * Translation function bound to the current language.
   * Re-created when language changes so consuming components get fresh translations.
   *
   * @param {string} key - Translation key (e.g., 'nav.home')
   * @param {Object} [params] - Interpolation parameters
   * @returns {string} Translated string
   */
  const t = useCallback(
    (key, params = {}) => {
      return translate(key, params, language);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getLanguages,
      getLanguageByCode,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage - Hook to access the language context.
 *
 * Must be used within a <LanguageProvider>.
 *
 * @returns {{
 *   language: string,
 *   setLanguage: (lang: string) => boolean,
 *   t: (key: string, params?: Object) => string,
 *   getLanguages: () => Array,
 *   getLanguageByCode: (code: string) => Object|undefined
 * }}
 *
 * @example
 *   const { language, setLanguage, t } = useLanguage();
 *   console.log(t('nav.home')); // '홈' or 'Home' etc.
 *   setLanguage('en');           // Switch to English
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      'useLanguage() must be used within a <LanguageProvider>. ' +
      'Wrap your app or component tree with <LanguageProvider>.'
    );
  }
  return context;
}

export default LanguageContext;
