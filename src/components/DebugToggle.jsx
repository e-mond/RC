// src/components/common/DebugToggle.jsx
import { useState, useEffect, useRef } from "react";
import { enableAllMocks, disableAllMocks, isMockMode } from "@/mocks/mockManager.js";

export default function DebugToggle() {
  const firstLoad = useRef(true);

  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("demoMockEnabled") === "true";
  });

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem("demoMockEnabled", enabled);
      enabled ? enableAllMocks() : disableAllMocks();
    }, 350);

    return () => clearTimeout(timer);
  }, [enabled]);

  if (!import.meta.env.DEV) return null;

  const isActive = isMockMode();

  return (
    <div className="fixed bottom-4 right-4 z-9999 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <label
        className={`
          flex items-center gap-0 sm:gap-3 
          px-4 sm:px-5 py-2.5 rounded-2xl 
          backdrop-blur-xl 
          bg-white/10 dark:bg-black/20 
          border border-white/20 dark:border-white/10 
          shadow-2xl 
          cursor-pointer select-none 
          transition-all duration-300 
          hover:bg-white/20 dark:hover:bg-black/30
          ${isActive ? "ring-2 ring-yellow-400/50" : ""}
        `}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="sr-only"
        />

        {/* Custom Switch - Always visible */}
        <div className="relative shrink-0">
          <div className={`w-12 h-7 rounded-full shadow-inner transition-all duration-300 
            ${isActive ? "bg-linear-to-r from-emerald-500 to-teal-600" : "bg-white/30"}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
                ${isActive 
                  ? "translate-x-5 bg-white text-emerald-600" 
                  : "translate-x-0 bg-white/80 text-gray-500"
                }`}
            >
              {isActive ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Text - Hidden on mobile, shown on sm+ */}
        <div className="hidden sm:block text-white font-medium tracking-wider text-left ml-1">
          <div className="text-sm bg-linear-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent font-bold leading-none">
            DEMO MODE
          </div>
          <div className="text-xs opacity-90 mt-0.5">
            {isActive ? "MOCK ACTIVE" : "LIVE API"}
          </div>
        </div>
      </label>
    </div>
  );
}