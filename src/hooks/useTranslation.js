// src/hooks/useTranslation.js
import { useMemo } from "react";
import useLanguage from "@/hooks/useLanguage";
import { translations } from "@/utils/translations";

/**
 * useTranslation Hook
 * 
 * Provides translation function that updates when language changes.
 * Uses useMemo to ensure translations update when language changes.
 * 
 * @returns {Object} { t: function, language: string }
 */
export function useTranslation() {
  const { language } = useLanguage();

  const t = useMemo(() => {
    return (key, fallback) => {
      // Try current language first
      if (translations[language]?.[key]) {
        return translations[language][key];
      }
      // Fallback to English
      if (translations.en?.[key]) {
        return translations.en[key];
      }
      // Use provided fallback or key itself
      return fallback || key;
    };
  }, [language]);

  return { t, language };
}