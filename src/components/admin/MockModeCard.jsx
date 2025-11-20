import useDemoMode from "@/hooks/useDemoMode";
import { ShieldAlert, ToggleLeft } from "lucide-react";

export default function MockModeCard() {
  const { enabled, forced, toggle } = useDemoMode();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${enabled ? "bg-emerald-50" : "bg-slate-100"}`}>
          <ShieldAlert className={`h-6 w-6 ${enabled ? "text-emerald-600" : "text-slate-500"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm uppercase tracking-wide text-gray-500">Demo Mode</p>
          <p className="text-lg font-semibold text-gray-900">{enabled ? "Mocks Enabled" : "Live Data"}</p>
          <p className="text-xs text-gray-500">
            {enabled ? "All API calls are intercepted by mock adapters." : "Requests go directly to the real backend."}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={forced}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ToggleLeft className={`h-4 w-4 ${enabled ? "text-emerald-600" : "text-gray-500"}`} />
          {forced ? "Locked" : "Toggle"}
        </button>
      </div>
    </div>
  );
}

