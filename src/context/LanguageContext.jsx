/* src/context/LanguageContext.jsx
 * Simple language context for multi‑language readiness.
 * 
 * - Wraps the app with a provider exposing current language and setter.
 * - Persists language to localStorage and updates <html lang="...">.
 * - Actual string translation can be wired via i18next or Google later;
 *   this keeps the surface area minimal but production‑ready.
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "rc-language";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  availableLanguages: [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
  ],
});

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const browser = navigator.language || navigator.userLanguage || "en";
  return browser.startsWith("fr") ? "fr" : "en";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (code) => {
    setLanguageState(code === "fr" ? "fr" : "en");
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages: [
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
      ],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
