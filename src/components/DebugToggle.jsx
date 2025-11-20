import { useState, useEffect, useRef } from "react";
import { enableAllMocks, disableAllMocks, isMockMode } from "@/mocks/mockManager.js";

export default function DebugToggle() {
  // Prevent instant toggling on page load
  const firstLoad = useRef(true);

  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("demoMockEnabled") === "true";
  });

  // Apply toggle only when user interacts, not on first load
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    //Delay (300–500ms natural)
    const timer = setTimeout(() => {
      localStorage.setItem("demoMockEnabled", enabled);
      enabled ? enableAllMocks() : disableAllMocks();
    }, 350);

    return () => clearTimeout(timer);
  }, [enabled]);

  if (!import.meta.env.DEV) return null;

  const isActive = isMockMode();

  return (
    <div className="fixed bottom-5 right-5 z-9999">
      <label
        className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl cursor-pointer select-none transition-all duration-300
        ${isActive ? "bg-linear-to-r from-emerald-600 to-teal-700 text-white" : "bg-gray-800 text-gray-300"}`}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="sr-only"
        />

        {/* Switch */}
        <div className="relative">
          <div className={`w-11 h-6 rounded-full shadow-inner transition ${isActive ? "bg-white/40" : "bg-gray-600"}`}>
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
              ${isActive ? "translate-x-5 bg-white" : "translate-x-0 bg-gray-400"}`}
            >
              {isActive && (
                <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm">DEMO MODE</span>
          <span className="text-xs opacity-90">{isActive ? "MOCK ON" : "Real API"}</span>
        </div>
      </label>
    </div>
  );
}
