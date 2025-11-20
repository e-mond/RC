import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import App from "./App";
import "./index.css";

// ---------------------------------------------------------------------------
// MOCK MODE INITIALIZATION (DEV ONLY)
// ---------------------------------------------------------------------------
// This block runs *before* the React app initializes.
// It ensures mock API behavior is ready before AuthProvider mounts,
// preventing real API calls from firing unintentionally.
//
// Logic:
// - Only runs in Vite DEV mode.
// - If demoMockEnabled is NOT explicitly set to "false",
//   we auto-enable a fake login + demo role.
// - This guarantees every dev session starts with a logged-in "tenant"
//   unless the user manually disables demo mode.
// ---------------------------------------------------------------------------
if (import.meta.env.DEV) {
  // Auto-login with tenant role unless demoMockEnabled === "false"
  if (localStorage.getItem("demoMockEnabled") !== "false") {
    // Inject a fake token + role BEFORE AuthProvider loads
    localStorage.setItem("token", "dev-jwt-demo");
    localStorage.setItem("userRole", "tenant");

    // Dynamically load and activate all mock API handlers
    import("@/mocks/mockManager.js").then(({ enableAllMocks }) => {
      enableAllMocks();
    });
  }
}

// ---------------------------------------------------------------------------
// ROOT RENDER SETUP
// ---------------------------------------------------------------------------
// - Ensures the #root element exists
// - Creates React root using modern createRoot API
// - Wraps the app with:
//      • StrictMode — extra dev warnings
//      • Router — client-side routing
//      • AuthProvider — global user authentication context
// ---------------------------------------------------------------------------
const container = document.getElementById("root");
if (!container) throw new Error('Root element with id="root" not found');

createRoot(container).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </StrictMode>
);
