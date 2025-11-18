// src/mocks/mockManager.js
import { enableMock, disableMock } from "@/mocks/axiosMock.js";

const KEY = "demoMockEnabled";
let enabled = localStorage.getItem(KEY) !== "false";  // default = true

export const enableAllMocks = () => {
  if (enabled) return;
  enableMock();
  enabled = true;
  localStorage.setItem(KEY, "true");
  console.log("Demo Mode: ON");
};

export const disableAllMocks = () => {
  if (!enabled) return;
  disableMock();
  enabled = false;
  localStorage.setItem(KEY, "false");
  console.log("Demo Mode: OFF");
};

export const isMockMode = () => enabled;