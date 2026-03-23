/**
 * Safety Quest Game - Lightweight i18n Utility
 *
 * Custom internationalization solution using localStorage.
 * No external dependencies required.
 *
 * Supported languages: ko (default), en, vi, zh
 * Translation key format: 'section.key' (e.g., 'nav.home', 'quest.reward')
 * Parameter interpolation: t('quest.reward', { points: 100, exp: 50 })
 */

import { translations } from '../data/translations';

const STORAGE_KEY = 'safety_quest_language';
const DEFAULT_LANGUAGE = 'ko';
const SUPPORTED_LANGUAGES = ['ko', 'en', 'vi', 'zh'];

/**
 * Language metadata for UI display.
 */
const LANGUAGES = [
  { code: 'ko', name: '\ud55c\uad6d\uc5b4', nativeName: 'Korean', flag: '\ud83c\uddf0\ud83c\uddf7' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { code: 'vi', name: 'Ti\u1ebfng Vi\u1ec7t', nativeName: 'Vietnamese', flag: '\ud83c\uddfb\ud83c\uddf3' },
  { code: 'zh', name: '\u4e2d\u6587', nativeName: 'Chinese', flag: '\ud83c\udde8\ud83c\uddf3' },
];

/**
 * Get the current language code from localStorage.
 * Falls back to DEFAULT_LANGUAGE if not set or invalid.
 * @returns {string} Language code (ko, en, vi, or zh)
 */
export function getCurrentLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch (e) {
    // localStorage may be unavailable (e.g., SSR or privacy mode)
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Set the current language and persist to localStorage.
 * @param {string} lang - Language code to set
 * @returns {boolean} true if language was set successfully
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    console.warn(`[i18n] Unsupported language: "${lang}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    return true;
  } catch (e) {
    console.warn('[i18n] Failed to save language preference to localStorage:', e);
    return false;
  }
}

/**
 * Translate a key with optional parameter interpolation.
 *
 * Key format: 'section.key' (e.g., 'nav.home', 'quest.reward')
 *
 * Fallback chain:
 *   1. Current language translation
 *   2. Korean (ko) translation (default fallback)
 *   3. The raw key string itself
 *
 * @param {string} key - Translation key in 'section.key' format
 * @param {Object} [params={}] - Parameters for interpolation (e.g., { points: 100 })
 * @param {string} [lang] - Optional language override (defaults to current language)
 * @returns {string} Translated string with parameters applied
 *
 * @example
 *   t('nav.home')                           // '홈' (in Korean)
 *   t('quest.reward', { points: 100, exp: 50 }) // '보상: +100P +50EXP'
 *   t('nav.home', {}, 'en')                 // 'Home' (explicit language)
 */
export function t(key, params = {}, lang) {
  const currentLang = lang || getCurrentLanguage();

  // Split key into section and subkey (supports nested keys like 'section.key')
  const parts = key.split('.');
  if (parts.length < 2) {
    console.warn(`[i18n] Invalid key format: "${key}". Expected format: "section.key"`);
    return key;
  }

  // Resolve the translation value by traversing the key path
  let value = resolveKey(translations[currentLang], parts);

  // Fallback to Korean if not found in current language
  if (value === undefined && currentLang !== DEFAULT_LANGUAGE) {
    value = resolveKey(translations[DEFAULT_LANGUAGE], parts);
  }

  // Fallback to the raw key if still not found
  if (value === undefined) {
    console.warn(`[i18n] Missing translation for key: "${key}"`);
    return key;
  }

  // Apply parameter interpolation: replace {paramName} with param values
  return interpolate(value, params);
}

/**
 * Get the list of all supported languages with metadata.
 * @returns {Array<{code: string, name: string, nativeName: string, flag: string}>}
 */
export function getLanguages() {
  return [...LANGUAGES];
}

/**
 * Get metadata for a specific language code.
 * @param {string} code - Language code
 * @returns {Object|undefined} Language metadata or undefined if not found
 */
export function getLanguageByCode(code) {
  return LANGUAGES.find((lang) => lang.code === code);
}

// --- Internal helpers ---

/**
 * Resolve a dotted key path against a translation object.
 * @param {Object} obj - Translation object for a language
 * @param {string[]} parts - Key path parts
 * @returns {string|undefined} Resolved string or undefined
 */
function resolveKey(obj, parts) {
  if (!obj) return undefined;
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace {paramName} placeholders with values from params object.
 * @param {string} str - String with placeholders
 * @param {Object} params - Key-value pairs to substitute
 * @returns {string} Interpolated string
 */
function interpolate(str, params) {
  if (!params || Object.keys(params).length === 0) {
    return str;
  }
  return str.replace(/\{(\w+)\}/g, (match, paramName) => {
    return params[paramName] !== undefined ? String(params[paramName]) : match;
  });
}
