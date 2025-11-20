// src/hooks/useDemoMode.js
import { useCallback, useEffect, useState } from "react";
import { enableAllMocks, disableAllMocks, isMockMode, onDemoModeChange } from "@/mocks/mockManager";

const FORCED = String(import.meta.env.VITE_FORCE_MOCK || "").toLowerCase() === "true";

export default function useDemoMode() {
  const [enabled, setEnabled] = useState(() => isMockMode());

  useEffect(() => {
    const unsubscribe = onDemoModeChange(setEnabled);
    return unsubscribe;
  }, []);

  const enable = useCallback(() => {
    enableAllMocks();
  }, []);

  const disable = useCallback(() => {
    if (FORCED) return;
    disableAllMocks();
  }, []);

  const toggle = useCallback(() => {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  }, [enabled, enable, disable]);

  return {
    enabled,
    forced: FORCED,
    enable,
    disable,
    toggle,
    label: enabled ? "Demo Mode" : "Live Mode",
  };
}

