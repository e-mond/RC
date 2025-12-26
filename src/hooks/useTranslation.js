// src/hooks/useTranslation.js
import useLanguage from "@/hooks/useLanguage";
import { translations } from "@/utils/translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return { t, language };
}