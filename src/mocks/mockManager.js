// src/mocks/mockManager.js
import { enableMock, disableMock, isMockEnabled as isAdapterActive } from "@/mocks/axiosMock.js";

const KEY = "demoMockEnabled";

// Force mock via env (for development builds)
const FORCE_ENV = String(import.meta.env.VITE_FORCE_MOCK || "").toLowerCase() === "true";

let enabled = FORCE_ENV || localStorage.getItem(KEY) === "true";

const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener(enabled));

  window.dispatchEvent(
    new CustomEvent("demo-mode-change", { detail: { enabled } })
  );
};

const persist = (value) => {
  if (!FORCE_ENV) {
    localStorage.setItem(KEY, value.toString());
  }
};

export const onDemoModeChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const enableAllMocks = () => {
  // Always enable mock adapter when enabling demo mode
  if (!isAdapterActive()) {
    enableMock();
  }
  
  enabled = true;
  persist(true);
  console.log("%cDemo Mode: ON", "color: #10b981; font-weight: bold;");
  notify();
};

export const disableAllMocks = () => {
  if (FORCE_ENV) {
    console.warn("Demo mode forced by VITE_FORCE_MOCK — cannot disable");
    return;
  }

  // Always disable mock adapter when disabling demo mode
  if (isAdapterActive()) {
    disableMock();
  }
  
  enabled = false;
  persist(false);
  console.log("%cDemo Mode: OFF", "color: #ef4444; font-weight: bold;");
  notify();
};

export const isMockMode = () => {
  // Check both localStorage state and adapter state
  const localStorageEnabled = localStorage.getItem(KEY) === "true";
  const adapterActive = isAdapterActive();
  
  // If localStorage says enabled but adapter is not, sync them
  if (localStorageEnabled && !adapterActive && !FORCE_ENV) {
    enableMock();
    enabled = true;
    return true;
  }
  
  // If localStorage says disabled but adapter is active, sync them
  if (!localStorageEnabled && adapterActive && !FORCE_ENV) {
    disableMock();
    enabled = false;
    return false;
  }
  
  return enabled || FORCE_ENV || adapterActive;
};

export const toggleMockMode = () => {
  if (isMockMode()) {
    disableAllMocks();
  } else {
    enableAllMocks();
  }
};

// Auto-sync on storage change (in case changed from DevTools)
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    const newVal = e.newValue === "true";
    if (newVal !== enabled) {
      newVal ? enableAllMocks() : disableAllMocks();
    }
  }
});