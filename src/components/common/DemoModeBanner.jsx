// src/components/common/DemoModeBanner.jsx
import { Sparkles } from "lucide-react";
import useDemoMode from "@/hooks/useDemoMode";

export default function DemoModeBanner() {
  const { enabled, toggle, forced } = useDemoMode();

  if (!enabled) return null;

  return (
    <div className="fixed top-3 left-1/2 z-[999] -translate-x-1/2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 shadow-md flex items-center gap-2 text-amber-900 text-sm">
      <Sparkles className="w-4 h-4" aria-hidden />
      <span className="font-medium tracking-wide">Demo Mode Active</span>
      <button
        type="button"
        onClick={toggle}
        disabled={forced}
        className="ml-2 text-xs font-semibold underline decoration-dotted disabled:opacity-50"
      >
        {forced ? "Locked" : "Switch to Live"}
      </button>
    </div>
  );
}

