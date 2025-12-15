// src/mocks/mockManager.js
import { enableMock, disableMock, isMockEnabled as isAdapterActive } from "@/mocks/axiosMock.js";

const KEY = "demoMockEnabled";
const FORCE_ENV = String(import.meta.env.VITE_FORCE_MOCK || "").toLowerCase() === "true";
let enabled = FORCE_ENV ? true : localStorage.getItem(KEY) === "true"; // default = false
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(enabled);
    } catch (err) {
      console.warn("Demo mode listener failed", err);
    }
  });

  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("demo-mode-change", { detail: { enabled } }));
  }
};

const persist = (value) => {
  if (!FORCE_ENV) {
    localStorage.setItem(KEY, value ? "true" : "false");
  }
};

export const onDemoModeChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const enableAllMocks = () => {
  if (!isAdapterActive()) {
    enableMock();
  }
  enabled = true;
  persist(true);
  console.log("Demo Mode: ON");
  notify();
};

export const disableAllMocks = () => {
  if (FORCE_ENV) {
    console.warn("Demo mode is forced via VITE_FORCE_MOCK; cannot disable.");
    return;
  }

  if (isAdapterActive()) {
    disableMock();
  }
  enabled = false;
  persist(false);
  console.log("Demo Mode: OFF");
  notify();
};

export const isMockMode = () => enabled || FORCE_ENV;