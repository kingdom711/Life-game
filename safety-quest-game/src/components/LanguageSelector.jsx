/**
 * Safety Quest Game - Language Selector Component
 *
 * Compact dropdown for switching between supported languages.
 * Shows current language flag + name, expands to show all options.
 * Displays a brief toast notification on language change.
 *
 * Dark theme inline styles -- no external CSS required.
 *
 * Usage:
 *   import LanguageSelector from './components/LanguageSelector';
 *   <LanguageSelector />
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage, t, getLanguages, getLanguageByCode } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);

  const languages = getLanguages();
  const currentLang = getLanguageByCode(language);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSelect = (langCode) => {
    if (langCode === language) {
      setIsOpen(false);
      return;
    }
    const success = setLanguage(langCode);
    if (success) {
      setToast(t('settings.languageChanged'));
    }
    setIsOpen(false);
  };

  // --- Inline Styles (Dark Theme) ---

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
      fontFamily: "'Noto Sans KR', 'Noto Sans', sans-serif",
      fontSize: '14px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      backgroundColor: '#2a2a3e',
      color: '#e0e0e0',
      border: '1px solid #3a3a52',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      whiteSpace: 'nowrap',
    },
    buttonHover: {
      backgroundColor: '#353550',
      borderColor: '#5a5a7a',
    },
    arrow: {
      fontSize: '10px',
      marginLeft: '4px',
      transition: 'transform 0.2s ease',
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: '0',
      minWidth: '180px',
      backgroundColor: '#1e1e2f',
      border: '1px solid #3a3a52',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'fadeIn 0.15s ease-out',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 14px',
      cursor: 'pointer',
      color: '#c0c0d0',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      fontSize: '14px',
      textAlign: 'left',
      transition: 'background-color 0.15s ease',
    },
    optionHover: {
      backgroundColor: '#2a2a3e',
    },
    optionActive: {
      backgroundColor: '#353550',
      color: '#7c7cff',
      fontWeight: '600',
    },
    flag: {
      fontSize: '18px',
      lineHeight: '1',
    },
    checkmark: {
      marginLeft: 'auto',
      color: '#7c7cff',
      fontSize: '14px',
    },
    toast: {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#2a2a3e',
      color: '#a0e0a0',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      border: '1px solid #3a5a3a',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      animation: 'slideUp 0.25s ease-out',
      whiteSpace: 'nowrap',
    },
  };

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div ref={dropdownRef} style={styles.container}>
        {/* Trigger Button */}
        <button
          style={styles.button}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.buttonHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
            e.currentTarget.style.borderColor = styles.button.border.split(' ')[2];
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={t('settings.selectLanguage')}
        >
          <span style={styles.flag}>{currentLang?.flag}</span>
          <span>{currentLang?.name}</span>
          <span style={styles.arrow}>&#9660;</span>
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <div style={styles.dropdown} role="listbox" aria-label={t('settings.selectLanguage')}>
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  style={{
                    ...styles.option,
                    ...(isSelected ? styles.optionActive : {}),
                  }}
                  onClick={() => handleSelect(lang.code)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = styles.optionHover.backgroundColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? styles.optionActive.backgroundColor
                      : 'transparent';
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span style={styles.flag}>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {isSelected && <span style={styles.checkmark}>&#10003;</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
