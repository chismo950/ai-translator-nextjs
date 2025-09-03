"use client";

import * as React from "react";
import {
  SupportedLanguage,
  getSystemLanguage,
  getTranslation,
} from "@/lib/i18n";

type LanguageContextType = {
  currentLanguage: SupportedLanguage;
  setCurrentLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
};

const LanguageContext = React.createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] =
    React.useState<SupportedLanguage>("en");

  // Initialize from system or persisted preference
  React.useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("ui_language") : null;
      if (saved && ["en","zh","es","fr","de","ja","ko","pt","ru","it"].includes(saved)) {
        setCurrentLanguage(saved as SupportedLanguage);
        return;
      }
    } catch {
      // ignore storage errors
    }
    setCurrentLanguage(getSystemLanguage());
  }, []);

  // Persist preference
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ui_language", currentLanguage);
      }
    } catch {
      // ignore storage errors
    }
  }, [currentLanguage]);

  const t = React.useCallback((key: string) => getTranslation(key, currentLanguage), [currentLanguage]);

  const value = React.useMemo(() => ({ currentLanguage, setCurrentLanguage, t }), [currentLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    // Fallback to system language without provider (shouldn't happen when wrapped)
    const lang = getSystemLanguage();
    return {
      currentLanguage: lang,
      setCurrentLanguage: () => {},
      t: (key: string) => getTranslation(key, lang),
    } as LanguageContextType;
  }
  return ctx;
}

