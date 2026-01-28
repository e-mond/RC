/**
 * DemoModeToggle Component
 * 
 * Reusable, movable demo/mock mode toggle component.
 * Can be used anywhere in the app and maintains global state.
 * 
 * Features:
 * - Globally accessible state via useDemoMode hook
 * - Clearly indicates when demo mode is active
 * - Respects forced mock mode from environment
 * - Can be positioned anywhere via props
 * - Draggable when position is "fixed"
 */

import React, { useState, useEffect, useRef } from "react";
import useDemoMode from "@/hooks/useDemoMode";
import { ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * DemoModeToggle - Reusable demo mode toggle with drag functionality
 * 
 * @param {Object} props
 * @param {string} [props.position] - Position: "fixed" | "relative" | "absolute" (default: "fixed")
 * @param {string} [props.placement] - Placement: "bottom-right" | "bottom-left" | "top-right" | "top-left" (default: "bottom-right")
 * @param {boolean} [props.showLabel] - Show label text (default: true)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function DemoModeToggle({
  position = "fixed",
  placement = "bottom-right",
  showLabel = true,
  className = "",
}) {
  const { enabled, forced, toggle } = useDemoMode();
  const [positionState, setPositionState] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const toggleRef = useRef(null);

  // Load saved position from localStorage
  useEffect(() => {
    if (position === "fixed") {
      const saved = localStorage.getItem("demoTogglePosition");
      if (saved) {
        try {
          const pos = JSON.parse(saved);
          setPositionState(pos);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [position]);

  // Calculate drag constraints based on viewport
  const getDragConstraints = () => {
    if (typeof window === "undefined") return { left: 0, right: 0, top: 0, bottom: 0 };
    
    // Estimate component size
    const componentWidth = 200;
    const componentHeight = 60;
    
    return {
      left: -window.innerWidth + componentWidth + 20,
      right: window.innerWidth - componentWidth - 20,
      top: -window.innerHeight + componentHeight + 20,
      bottom: window.innerHeight - componentHeight - 20,
    };
  };

  // Save position to localStorage when dragging ends
  const handleDragEnd = (event, info) => {
    if (position === "fixed") {
      const currentX = positionState?.x || 0;
      const currentY = positionState?.y || 0;
      const newPosition = {
        x: currentX + info.offset.x,
        y: currentY + info.offset.y,
      };
      setPositionState(newPosition);
      localStorage.setItem("demoTogglePosition", JSON.stringify(newPosition));
    }
    setIsDragging(false);
  };

  const placementClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const positionClasses = {
    fixed: "fixed",
    relative: "relative",
    absolute: "absolute",
  };

  // Only show in development or when forced
  if (!import.meta.env.DEV && !forced) return null;

  const baseStyle = position === "fixed" && positionState
    ? {
        left: "auto",
        right: "auto",
        top: "auto",
        bottom: "auto",
      }
    : {};

  return (
    <motion.div
      ref={toggleRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...(position === "fixed" && positionState ? { x: positionState.x, y: positionState.y } : {}),
      }}
      drag={position === "fixed"}
      dragMomentum={false}
      dragConstraints={getDragConstraints()}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className={`${positionClasses[position]} ${position === "fixed" && !positionState ? placementClasses[placement] : ""} z-50 ${className} ${isDragging ? "cursor-grabbing" : position === "fixed" ? "cursor-grab" : ""}`}
      style={baseStyle}
    >
      <div
        className={`
          flex items-center gap-2 sm:gap-3 
          px-4 sm:px-5 py-2.5 rounded-2xl 
          backdrop-blur-xl 
          bg-white/10 dark:bg-black/20 
          border border-white/20 dark:border-white/10 
          shadow-2xl 
          select-none 
          transition-all duration-300 
          hover:bg-white/20 dark:hover:bg-black/30
          ${enabled ? "ring-2 ring-yellow-400/50" : ""}
          ${forced ? "opacity-75" : ""}
        `}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isDragging) {
              toggle();
            }
          }}
          disabled={forced}
          className="flex items-center gap-2 sm:gap-3 w-full"
        >
          {/* Custom Switch */}
          <div className="relative shrink-0 pointer-events-none">
            <div
              className={`w-12 h-7 rounded-full shadow-inner transition-all duration-300 
                ${enabled ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-white/30"}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
                  ${enabled 
                    ? "translate-x-5 bg-white text-emerald-600" 
                    : "translate-x-0 bg-white/80 text-gray-500"
                  }`}
              >
                {enabled ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}
              </div>
            </div>
          </div>

          {/* Text Label */}
          {showLabel && (
            <div className="hidden sm:block text-white font-medium tracking-wider text-left pointer-events-none">
              <div className="text-sm bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent font-bold leading-none">
                DEMO MODE
              </div>
              <div className="text-xs opacity-90 mt-0.5 flex items-center gap-1">
                {forced && <AlertCircle size={10} />}
                {enabled ? "MOCK ACTIVE" : "LIVE API"}
              </div>
            </div>
          )}

          {/* Mobile Indicator */}
          {!showLabel && enabled && (
            <div className="sm:hidden pointer-events-none">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
