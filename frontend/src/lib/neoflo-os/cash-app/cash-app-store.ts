"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { ReasonCode } from "./types"

// ════════════════════════════════════════════════════════════════════
// Runtime status of a payment's application from the user's POV.
// ════════════════════════════════════════════════════════════════════
//
// Distinct from the seed `Application["status"]` enum on purpose: the
// store only tracks transitions the user causes, leaving the seed as
// the immutable starting state.
type ApplicationRuntimeStatus =
  | "needs-review"      // Neo proposed; user hasn't acted yet
  | "user-approved"     // user clicked Approve
  | "user-edited"       // user clicked Edit reason and changed it
  | "user-rejected"     // user clicked Reject
  | "held"              // user clicked Hold for human

export type ApplicationRuntimeState = {
  status: ApplicationRuntimeStatus
  editedShortPayReasonCode?: ReasonCode
  holdNote?: string
  actedAt?: string  // ISO timestamp
}

export type UnappliedReviewStatus = "pending" | "investigating" | "matched" | "emailed"

export type CashAppState = {
  // applications keyed by paymentId
  applications: Record<string, ApplicationRuntimeState>

  // unappliedReviews keyed by paymentId
  unappliedReviews: Record<string, UnappliedReviewStatus>

  // actions
  approveApplication: (paymentId: string) => void
  editShortPayReason: (paymentId: string, newCode: ReasonCode) => void
  rejectApplication: (paymentId: string) => void
  holdApplication: (paymentId: string, note: string) => void
  markUnappliedInvestigated: (paymentId: string, action: "matched" | "emailed") => void
  reset: () => void
}

const initialState = {
  applications: {} as Record<string, ApplicationRuntimeState>,
  unappliedReviews: {} as Record<string, UnappliedReviewStatus>,
}

export const useCashAppStore = create<CashAppState>()(
  persist(
    (set) => ({
      ...initialState,

      approveApplication: (paymentId) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [paymentId]: { status: "user-approved", actedAt: new Date().toISOString() },
          },
        })),

      editShortPayReason: (paymentId, newCode) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [paymentId]: {
              ...(s.applications[paymentId] ?? {}),
              status: "user-edited",
              editedShortPayReasonCode: newCode,
              actedAt: new Date().toISOString(),
            },
          },
        })),

      rejectApplication: (paymentId) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [paymentId]: { status: "user-rejected", actedAt: new Date().toISOString() },
          },
        })),

      holdApplication: (paymentId, note) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [paymentId]: { status: "held", holdNote: note, actedAt: new Date().toISOString() },
          },
        })),

      markUnappliedInvestigated: (paymentId, action) =>
        set((s) => ({
          unappliedReviews: { ...s.unappliedReviews, [paymentId]: action },
        })),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "neoflo-cashapp-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.sessionStorage,
      ),
    },
  ),
)

// SSR-safe wrapper, mirrors useHydratedDemoStore + useHydratedWorkspaceStore.
// During SSR / pre-mount we return a synthetic "empty" state so server and
// first client render match — only after mount do we expose the real store.
export function useHydratedCashAppStore<T>(selector: (s: CashAppState) => T): T {
  const value = useCashAppStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return selector({
      ...initialState,
      approveApplication: () => undefined,
      editShortPayReason: () => undefined,
      rejectApplication: () => undefined,
      holdApplication: () => undefined,
      markUnappliedInvestigated: () => undefined,
      reset: () => undefined,
    })
  }
  return value
}
