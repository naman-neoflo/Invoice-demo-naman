"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// ════════════════════════════════════════════════════════════════════
// Runtime status of an invoice's application from the user's POV.
// ════════════════════════════════════════════════════════════════════
//
// Distinct from the seed `Invoice["status"]` and `Application["status"]`
// enums on purpose: the store only tracks transitions the user causes,
// leaving the seed as the immutable starting state.
type InvoiceRuntimeStatus =
  | "needs-review"          // initial — Neo proposed, user hasn't acted
  | "user-approved"         // user clicked Approve & Post
  | "user-edited-gl"        // user edited GL coding
  | "user-edited-tax"       // user edited tax treatment
  | "duplicate-confirmed"   // user confirmed duplicate, will not post
  | "duplicate-overridden"  // user overrode the duplicate flag and posted
  | "user-rejected"         // user rejected outright
  | "investigating"         // moved to "investigating" in exceptions queue
  | "vendor-emailed"        // user clicked draft-and-send vendor email

type InboxFilter = "all" | "auto-posted" | "match-review" | "exception"

export type InvoiceProcessingState = {
  // applications keyed by invoiceId — what the user has done
  applications: Record<
    string,
    {
      status: InvoiceRuntimeStatus
      editedGL?: { account: string; costCenter: string; entity: string }
      editedTaxTreatment?: string
      actedAt?: string // ISO timestamp
    }
  >

  // exceptionReviews keyed by invoiceId — disposition in exceptions queue
  exceptionReviews: Record<
    string,
    "pending" | "investigating" | "approved" | "rejected" | "vendor-emailed"
  >

  // early-pay batch state
  earlyPayBatchApproved: boolean

  // inbox UI state (persisted so navigating to detail and back retains)
  inboxFilter: InboxFilter
  inboxSearch: string

  // New for inbox extensions
  inboxDateFrom: string | null
  inboxDateTo: string | null
  inboxAmountBucket: "all" | "lt-1k" | "1k-10k" | "10k-50k" | "gt-50k"
  inboxVendorIds: string[]
  inboxSortKey: "receivedAt" | "amount" | "vendorName" | null
  inboxSortDir: "asc" | "desc"

  // Faktur Pajak per-invoice state (IDR invoices only)
  fakturPajakEdits: Record<string, Record<string, string>>          // invoiceId → fieldName → newValue
  fakturPajakAcknowledgements: Record<string, string[]>             // invoiceId → acknowledged fieldNames

  // actions
  approveInvoice: (invoiceId: string) => void
  editGLCoding: (
    invoiceId: string,
    gl: { account: string; costCenter: string; entity: string },
  ) => void
  editTaxTreatment: (invoiceId: string, treatment: string) => void
  confirmDuplicate: (invoiceId: string) => void
  overrideDuplicateAndPost: (invoiceId: string) => void
  rejectInvoice: (invoiceId: string) => void
  markExceptionInvestigating: (invoiceId: string) => void
  draftVendorEmail: (invoiceId: string) => void
  approveEarlyPayBatch: () => void
  setInboxFilter: (filter: InboxFilter) => void
  setInboxSearch: (q: string) => void

  // New action setters
  setInboxDateRange: (from: string | null, to: string | null) => void
  setInboxAmountBucket: (b: InvoiceProcessingState["inboxAmountBucket"]) => void
  setInboxVendorIds: (ids: string[]) => void
  setInboxSort: (key: InvoiceProcessingState["inboxSortKey"], dir: "asc" | "desc") => void
  clearInboxAdvancedFilters: () => void

  editFakturPajakField: (invoiceId: string, fieldName: string, value: string) => void
  acknowledgeFakturPajakField: (invoiceId: string, fieldName: string) => void

  reset: () => void
}

const initialState = {
  applications: {} as InvoiceProcessingState["applications"],
  exceptionReviews: {} as InvoiceProcessingState["exceptionReviews"],
  earlyPayBatchApproved: false,
  fakturPajakEdits: {} as InvoiceProcessingState["fakturPajakEdits"],
  fakturPajakAcknowledgements: {} as InvoiceProcessingState["fakturPajakAcknowledgements"],
  inboxFilter: "all" as InboxFilter,
  inboxSearch: "",
  inboxDateFrom: null as string | null,
  inboxDateTo: null as string | null,
  inboxAmountBucket: "all" as InvoiceProcessingState["inboxAmountBucket"],
  inboxVendorIds: [] as string[],
  inboxSortKey: null as InvoiceProcessingState["inboxSortKey"],
  inboxSortDir: "desc" as "asc" | "desc",
}

export const useInvoiceProcessingStore = create<InvoiceProcessingState>()(
  persist(
    (set) => ({
      ...initialState,

      approveInvoice: (invoiceId) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [invoiceId]: { status: "user-approved", actedAt: new Date().toISOString() },
          },
        })),

      editGLCoding: (invoiceId, gl) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [invoiceId]: {
              ...(s.applications[invoiceId] ?? {}),
              status: "user-edited-gl",
              editedGL: gl,
              actedAt: new Date().toISOString(),
            },
          },
        })),

      editTaxTreatment: (invoiceId, treatment) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [invoiceId]: {
              ...(s.applications[invoiceId] ?? {}),
              status: "user-edited-tax",
              editedTaxTreatment: treatment,
              actedAt: new Date().toISOString(),
            },
          },
        })),

      confirmDuplicate: (invoiceId) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [invoiceId]: { status: "duplicate-confirmed", actedAt: new Date().toISOString() },
          },
          exceptionReviews: { ...s.exceptionReviews, [invoiceId]: "vendor-emailed" },
        })),

      overrideDuplicateAndPost: (invoiceId) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [invoiceId]: { status: "duplicate-overridden", actedAt: new Date().toISOString() },
          },
        })),

      rejectInvoice: (invoiceId) =>
        set((s) => ({
          applications: {
            ...s.applications,
            [invoiceId]: { status: "user-rejected", actedAt: new Date().toISOString() },
          },
        })),

      markExceptionInvestigating: (invoiceId) =>
        set((s) => ({
          exceptionReviews: { ...s.exceptionReviews, [invoiceId]: "investigating" },
        })),

      draftVendorEmail: (invoiceId) =>
        set((s) => ({
          exceptionReviews: { ...s.exceptionReviews, [invoiceId]: "vendor-emailed" },
        })),

      approveEarlyPayBatch: () => set({ earlyPayBatchApproved: true }),

      setInboxFilter: (filter) => set({ inboxFilter: filter }),
      setInboxSearch: (q) => set({ inboxSearch: q }),

      setInboxDateRange: (from, to) => set({ inboxDateFrom: from, inboxDateTo: to }),
      setInboxAmountBucket: (b) => set({ inboxAmountBucket: b }),
      setInboxVendorIds: (ids) => set({ inboxVendorIds: ids }),
      setInboxSort: (key, dir) => set({ inboxSortKey: key, inboxSortDir: dir }),
      clearInboxAdvancedFilters: () =>
        set({
          inboxDateFrom: null,
          inboxDateTo: null,
          inboxAmountBucket: "all",
          inboxVendorIds: [],
        }),

      editFakturPajakField: (invoiceId, fieldName, value) =>
        set((s) => ({
          fakturPajakEdits: {
            ...s.fakturPajakEdits,
            [invoiceId]: { ...(s.fakturPajakEdits[invoiceId] ?? {}), [fieldName]: value },
          },
        })),

      acknowledgeFakturPajakField: (invoiceId, fieldName) =>
        set((s) => {
          const existing = s.fakturPajakAcknowledgements[invoiceId] ?? []
          if (existing.includes(fieldName)) return s
          return {
            fakturPajakAcknowledgements: {
              ...s.fakturPajakAcknowledgements,
              [invoiceId]: [...existing, fieldName],
            },
          }
        }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "neoflo-invoice-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.sessionStorage,
      ),
    },
  ),
)

// SSR-safe wrapper, mirrors useHydratedDemoStore + useHydratedWorkspaceStore + useHydratedCashAppStore.
// During SSR / pre-mount we return a synthetic "empty" state so server and
// first client render match — only after mount do we expose the real store.
export function useHydratedInvoiceProcessingStore<T>(
  selector: (s: InvoiceProcessingState) => T,
): T {
  const value = useInvoiceProcessingStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return selector({
      ...initialState,
      approveInvoice: () => undefined,
      editGLCoding: () => undefined,
      editTaxTreatment: () => undefined,
      confirmDuplicate: () => undefined,
      overrideDuplicateAndPost: () => undefined,
      rejectInvoice: () => undefined,
      markExceptionInvestigating: () => undefined,
      draftVendorEmail: () => undefined,
      approveEarlyPayBatch: () => undefined,
      setInboxFilter: () => undefined,
      setInboxSearch: () => undefined,
      setInboxDateRange: () => undefined,
      setInboxAmountBucket: () => undefined,
      setInboxVendorIds: () => undefined,
      setInboxSort: () => undefined,
      clearInboxAdvancedFilters: () => undefined,
      editFakturPajakField: () => undefined,
      acknowledgeFakturPajakField: () => undefined,
      reset: () => undefined,
    })
  }
  return value
}
