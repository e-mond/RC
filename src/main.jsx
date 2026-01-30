/**
 * main.jsx - Application Entry Point
 * 
 * This is the entry point for the RentalConnects React application.
 * It handles:
 * - Root element validation
 * - Session restoration before initial render
 * - Provider setup (Theme, FeatureAccess, Router)
 * - Service worker registration (production only)
 * 
 * Execution Flow:
 * 1. Validates root DOM element exists
 * 2. Loads user session from localStorage (if available)
 * 3. Renders app with all context providers
 * 4. Registers PWA service worker in production
 * 
 * @module main
 * @requires react
 * @requires react-dom/client
 * @requires react-router-dom
 */


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";

import { useAuthStore } from "@/stores/authStore";
import { FeatureAccessProvider } from "@/context/FeatureAccessContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { registerServiceWorker } from "@/utils/registerServiceWorker";
import { enableAllMocks, isMockMode } from "@/mocks/mockManager";
import apiClient from "@/services/apiClient.js";               // ← added this import

/**
 * Root DOM Element Validation
 * Ensures the root element exists in index.html before attempting to render
 */
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found. Check index.html");
}

/**
 * Session Restoration
 * Loads user session from localStorage before initial render to prevent
 * authentication flicker and ensure user state is available immediately
 */
await useAuthStore.getState().loadSession();

/**
 * Mock Mode Initialization
 * Enable mock mode if it was previously enabled (stored in localStorage)
 * This ensures mock mode persists across page refreshes
 */
if (isMockMode()) {
  enableAllMocks(apiClient);                                // ← changed: pass apiClient
}

/**
 * Application Render
 * Renders the app with all necessary providers:
 * - ThemeProvider: Dark/light mode and theme persistence
 * - FeatureAccessProvider: Freemium/premium feature access control
 * - Router: React Router for client-side navigation
 * - StrictMode: React development mode checks
 */
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

/**
 * Service Worker Registration
 * Registers PWA service worker for offline functionality and app installation.
 * Only runs in production builds to avoid development server conflicts.
 */
if (import.meta.env.PROD) {
  registerServiceWorker();
}