import { useState, useEffect } from 'react';
import { Language, TranslationKey } from '../types';
import { translations } from '../translations';
import { storage } from '../utils/storage';

const SUPPORTED_LANGUAGES: Language[] = [
  'en', 'fr', 'de', 'es', 'it', 'nl', 'pl', 'da', 'pt', 
  'bg', 'el', 'sv', 'cs', 'hr', 'sl', 'hi'
];

const isSupported = (lang: string): lang is Language => {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const determineLanguage = async (): Promise<Language> => {
      const pathLang = window.location.pathname.split('/')[1];
      const isSearchRoute = /\/search\/?$/.test(window.location.pathname);

      if (isSearchRoute && pathLang && isSupported(pathLang)) {
        return pathLang;
      }

      try {
        const stored = await storage.settings.get('language');
        if (stored && isSupported(stored)) {
          return stored;
        }
      } catch (e) {
        console.warn('Could not get lang from storage:', e);
      }

      if (pathLang && isSupported(pathLang)) {
        return pathLang;
      }

      const browserLang = navigator.language.split('-')[0];
      if (isSupported(browserLang)) {
        return browserLang;
      }

      return 'en';
    };

    const loadLanguage = async () => {
      try {
        const lang = await determineLanguage();
        setLanguage(lang);
      } catch (error) {
        console.error('Error during lang retrieval:', error);
        setLanguage('en');
      } finally {
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []); 

  useEffect(() => {
    if (!isLoaded) return;

    const saveLanguage = async () => {
      try {
        await storage.settings.set('language', language);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    };

    saveLanguage();
  }, [language, isLoaded]);


  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations.en[key] || key;
    
    if (params?.count !== undefined) {
      const count = Number(params.count);
      const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
      translation = translations[language][pluralKey] || translations.en[pluralKey] || translation;
    }
    
    if (!params) {
      return translation;
    }

    return translation.replace(/{(\w+)}/g, (match, variableName) => {
      return params[variableName]?.toString() || match;
    });
  };


  return { t, language, setLanguage };
}