// src/stores/featureStore.js
/**
 * featureStore
 * - Holds subscription plan (free | premium) + simple helpers
 * - Persisted so UI remembers toggled demo plan across refresh
 *
 * Usage:
 * const plan = useFeatureStore(s => s.plan)
 * const isPremium = useFeatureStore(s => s.isPremium())
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFeatureStore = create(
  persist(
    (set, get) => ({
      plan: "free", // "free" | "premium"
      // set plan (e.g. after real purchase flow)
      setPlan: (p) => set({ plan: p === "premium" ? "premium" : "free" }),
      // convenience checks
      isPremium: () => get().plan === "premium",
      // toggle (dev/demo convenience)
      togglePlan: () =>
        set(({ plan }) => ({ plan: plan === "premium" ? "free" : "premium" })),
    }),
    {
      name: "rc-feature-storage",
      partialize: (s) => ({ plan: s.plan }),
    }
  )
);
