"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { RangePreset } from "./types"

// ════════════════════════════════════════════════════════════════════
// Runtime store for the spend-analytics workflow.
// ════════════════════════════════════════════════════════════════════
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md
// § "Runtime store: useSpendAnalyticsStore".
//
// Tracks the per-action approvals the user causes (deferral batch,
// per-maverick procurement notifications, per-vendor DPO stretch
// approvals, concentration acknowledgments) plus the dashboard's
// trend-range selector. Seed state lives in lib/spend-analytics/seed-*.ts
// and is never mutated.

export type SpendAnalyticsState = {
  // Per-action approvals
  deferralBatchApproved: boolean
  maverickFlagged: Record<string, "pending" | "notified" | "switched" | "override-accepted">
  dpoStretchApproved: Record<string, "pending" | "approved" | "rejected">
  concentrationAcknowledged: Record<string, true>

  // UI state
  currentRange: RangePreset
  customRange?: { start: string; end: string }

  // Actions
  approveDeferralBatch: () => void
  notifyProcurementOnMaverick: (maverickId: string) => void
  markMaverickOverrideAccepted: (maverickId: string) => void
  approveDPOStretch: (vendorId: string) => void
  rejectDPOStretch: (vendorId: string) => void
  acknowledgeConcentration: (vendorId: string) => void
  setRange: (range: RangePreset, custom?: { start: string; end: string }) => void
  reset: () => void
}

const initialState = {
  deferralBatchApproved: false,
  maverickFlagged: {} as SpendAnalyticsState["maverickFlagged"],
  dpoStretchApproved: {} as SpendAnalyticsState["dpoStretchApproved"],
  concentrationAcknowledged: {} as SpendAnalyticsState["concentrationAcknowledged"],
  currentRange: "90d" as RangePreset,
  customRange: undefined as { start: string; end: string } | undefined,
}

export const useSpendAnalyticsStore = create<SpendAnalyticsState>()(
  persist(
    (set) => ({
      ...initialState,

      approveDeferralBatch: () => set({ deferralBatchApproved: true }),

      notifyProcurementOnMaverick: (maverickId) =>
        set((s) => ({
          maverickFlagged: { ...s.maverickFlagged, [maverickId]: "notified" },
        })),

      markMaverickOverrideAccepted: (maverickId) =>
        set((s) => ({
          maverickFlagged: { ...s.maverickFlagged, [maverickId]: "override-accepted" },
        })),

      approveDPOStretch: (vendorId) =>
        set((s) => ({
          dpoStretchApproved: { ...s.dpoStretchApproved, [vendorId]: "approved" },
        })),

      rejectDPOStretch: (vendorId) =>
        set((s) => ({
          dpoStretchApproved: { ...s.dpoStretchApproved, [vendorId]: "rejected" },
        })),

      acknowledgeConcentration: (vendorId) =>
        set((s) => ({
          concentrationAcknowledged: { ...s.concentrationAcknowledged, [vendorId]: true },
        })),

      setRange: (range, custom) => set({ currentRange: range, customRange: custom }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "neoflo-spend-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.sessionStorage,
      ),
    },
  ),
)

// SSR-safe wrapper, mirrors useHydratedCollectionsStore.
// During SSR / pre-mount we return a synthetic "empty" state so server and
// first client render match — only after mount do we expose the real store.
export function useHydratedSpendAnalyticsStore<T>(
  selector: (s: SpendAnalyticsState) => T,
): T {
  const value = useSpendAnalyticsStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return selector({
      ...initialState,
      approveDeferralBatch: () => undefined,
      notifyProcurementOnMaverick: () => undefined,
      markMaverickOverrideAccepted: () => undefined,
      approveDPOStretch: () => undefined,
      rejectDPOStretch: () => undefined,
      acknowledgeConcentration: () => undefined,
      setRange: () => undefined,
      reset: () => undefined,
    })
  }
  return value
}
