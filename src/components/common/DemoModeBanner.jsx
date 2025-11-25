// src/components/common/DemoModeBanner.jsx
import { Sparkles } from "lucide-react";
import useDemoMode from "@/hooks/useDemoMode";

export default function DemoModeBanner() {
  const { enabled, toggle, forced } = useDemoMode();

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-999 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="
        px-4 py-2.5 
        rounded-2xl 
        backdrop-blur-xl 
        bg-white/10 dark:bg-black/20 
        border border-white/20 dark:border-white/10 
        shadow-2xl 
        flex items-center gap-3 
        text-white 
        font-medium 
        text-sm 
        tracking-wider 
        transition-all 
        hover:bg-white/20 dark:hover:bg-black/30
      ">
        <Sparkles className="w-4 h-4 animate-pulse text-yellow-300" />

        <span className="bg-linear-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent font-bold">
          DEMO MODE
        </span>

        <div className="h-5 w-px bg-white/30 mx-1" />

        <button
          type="button"
          onClick={toggle}
          disabled={forced}
          className="
            text-xs 
            font-semibold 
            text-white/90 
            underline underline-offset-2 
            decoration-white/40 
            hover:decoration-white 
            hover:text-white 
            transition-all 
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {forced ? "Locked" : "Go Live"}
        </button>
      </div>
    </div>
  );
}