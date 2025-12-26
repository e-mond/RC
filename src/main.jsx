// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { useAuthStore } from "@/stores/authStore";
import { FeatureAccessProvider } from "@/context/FeatureAccessContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { isMockMode, enableAllMocks } from "@/mocks/mockManager";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found. Check index.html");
}

// ========= INITIALIZE DEMO MODE & LOAD SESSION =========
// If demo mode was previously enabled, we must turn on all mocks
// *before* trying to hydrate the user session so that /auth/profile
// and other endpoints are served by the mock adapter instead of
// causing an unnecessary redirect to /login.
if (isMockMode()) {
  enableAllMocks();
}

await useAuthStore.getState().loadSession();

// ========= RENDER APP =========
createRoot(container).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <FeatureAccessProvider>
          <Router>
            <App />
          </Router>
        </FeatureAccessProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
);
