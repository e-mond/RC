// src/hooks/useLanguage.js
// Convenience hook that simply re‑exports the LanguageContext helper.
// Kept as a separate module so components can import from "hooks" consistently.

import { useLanguage as useLanguageContext } from "@/context/LanguageContext";

export default function useLanguage() {
  return useLanguageContext();
}
