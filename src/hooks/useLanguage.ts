"use client";

import { useState, useEffect } from "react";
import {
  SupportedLanguage,
  getSystemLanguage,
  getTranslation,
} from "@/lib/i18n";

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>("en");

  useEffect(() => {
    setCurrentLanguage(getSystemLanguage());
  }, []);

  const t = (key: string) => getTranslation(key, currentLanguage);

  return {
    currentLanguage,
    setCurrentLanguage,
    t,
  };
}
