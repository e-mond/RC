// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";


import { useAuthStore } from "@/stores/authStore";
import { FeatureAccessProvider } from "@/context/FeatureAccessContext";
import { ThemeProvider } from "@/context/ThemeContext";



// ========= ENSURE ROOT EXISTS =========
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found. Check index.html");
}

// ========= LOAD USER SESSION BEFORE RENDER =========
await useAuthStore.getState().loadSession();

// ========= RENDER APP =========
createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <FeatureAccessProvider>
        <Router>
          <App />
        </Router>
      </FeatureAccessProvider>
    </ThemeProvider>
  </StrictMode>
);
