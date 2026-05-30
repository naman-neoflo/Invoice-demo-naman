"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// ════════════════════════════════════════════════════════════════════
// Runtime status of a collections case / dispute from the user's POV.
// ════════════════════════════════════════════════════════════════════
//
// Source of truth: docs/handoff/collections/04-data-model.md
// § "Runtime store: useCollectionsStore".
//
// Distinct from the seed `CollectionsCase["status"]` / `Dispute["status"]`
// enums on purpose: the store only tracks transitions the user causes,
// leaving the seed as the immutable starting state.

type CaseRuntimeStatus =
  | "needs-review"
  | "approved-and-sent"
  | "edited-and-sent"
  | "rejected"
  | "investigating"
  | "hold-approved"

type DisputeRuntimeStatus =
  | "pending"
  | "investigating"
  | "credit-memo-approved"
  | "refused"
  | "resolved"

type WorklistFilter =
  | "all"
  | "disputes"
  | "promises"
  | "escalations"
  | "current"
  | "1-30d"
  | "31-60d"
  | "61-90d"
  | "90+d"

export type CollectionsState = {
  // Per-case actions (keyed by caseId)
  caseActions: Record<
    string,
    {
      status: CaseRuntimeStatus
      editedEmailBody?: string
      actedAt?: string
    }
  >
  // Per-dispute reviews (keyed by disputeId)
  disputeReviews: Record<string, DisputeRuntimeStatus>
  // Ready-batch state (the dashboard's 12-email batch)
  readyBatchApproved: boolean
  // Worklist UI state (persisted so detail → back retains filter + search)
  worklistFilter: WorklistFilter
  worklistSearch: string

  // actions
  approveDunningEmail: (caseId: string) => void
  editDunningEmail: (caseId: string, body: string) => void
  rejectCase: (caseId: string) => void
  approveCreditMemo: (disputeId: string) => void
  refuseDispute: (disputeId: string) => void
  approveAccountHold: (caseId: string) => void
  approveBulkBatch: () => void
  recordPromise: (caseId: string, promisedFor: string, amount: number) => void
  setWorklistFilter: (f: WorklistFilter) => void
  setWorklistSearch: (q: string) => void
  reset: () => void
}

const initialState = {
  caseActions: {} as CollectionsState["caseActions"],
  disputeReviews: {} as CollectionsState["disputeReviews"],
  readyBatchApproved: false,
  worklistFilter: "all" as WorklistFilter,
  worklistSearch: "",
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set) => ({
      ...initialState,

      approveDunningEmail: (caseId) =>
        set((s) => ({
          caseActions: {
            ...s.caseActions,
            [caseId]: { status: "approved-and-sent", actedAt: new Date().toISOString() },
          },
        })),

      editDunningEmail: (caseId, body) =>
        set((s) => ({
          caseActions: {
            ...s.caseActions,
            [caseId]: {
              status: "edited-and-sent",
              editedEmailBody: body,
              actedAt: new Date().toISOString(),
            },
          },
        })),

      rejectCase: (caseId) =>
        set((s) => ({
          caseActions: {
            ...s.caseActions,
            [caseId]: { status: "rejected", actedAt: new Date().toISOString() },
          },
        })),

      approveCreditMemo: (disputeId) =>
        set((s) => ({
          disputeReviews: { ...s.disputeReviews, [disputeId]: "credit-memo-approved" },
        })),

      refuseDispute: (disputeId) =>
        set((s) => ({
          disputeReviews: { ...s.disputeReviews, [disputeId]: "refused" },
        })),

      approveAccountHold: (caseId) =>
        set((s) => ({
          caseActions: {
            ...s.caseActions,
            [caseId]: { status: "hold-approved", actedAt: new Date().toISOString() },
          },
        })),

      approveBulkBatch: () => set({ readyBatchApproved: true }),

      recordPromise: () => undefined, // V1 stub; full impl in M3

      setWorklistFilter: (filter) => set({ worklistFilter: filter }),
      setWorklistSearch: (q) => set({ worklistSearch: q }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "neoflo-collections-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.sessionStorage,
      ),
    },
  ),
)

// SSR-safe wrapper, mirrors useHydratedInvoiceProcessingStore.
// During SSR / pre-mount we return a synthetic "empty" state so server and
// first client render match — only after mount do we expose the real store.
export function useHydratedCollectionsStore<T>(
  selector: (s: CollectionsState) => T,
): T {
  const value = useCollectionsStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return selector({
      ...initialState,
      approveDunningEmail: () => undefined,
      editDunningEmail: () => undefined,
      rejectCase: () => undefined,
      approveCreditMemo: () => undefined,
      refuseDispute: () => undefined,
      approveAccountHold: () => undefined,
      approveBulkBatch: () => undefined,
      recordPromise: () => undefined,
      setWorklistFilter: () => undefined,
      setWorklistSearch: () => undefined,
      reset: () => undefined,
    })
  }
  return value
}
