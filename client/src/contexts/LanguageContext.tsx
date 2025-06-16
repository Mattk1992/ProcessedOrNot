import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred-language';

function detectBrowserLanguage(): Language {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'en';
  }
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'nl'];
  
  if (supportedLanguages.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  
  return 'en'; // Default to English
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 'en';
    
    try {
      // Check localStorage first, then browser language, then default to English
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in translations) {
        return stored as Language;
      }
    } catch (error) {
      // localStorage might not be available
      console.warn('localStorage not available:', error);
    }
    return detectBrowserLanguage();
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLanguage);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Save the current language to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}