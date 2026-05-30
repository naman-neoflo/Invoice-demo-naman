"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { ALL_INQUIRIES, INTERACTIVE_INQUIRY_IDS } from "./demo-data"

export type InquiryStatus =
  | "unread"
  | "processing"
  | "auto-resolved"
  | "queued"
  | "sent"
  | "verifying"

export type InquiryRuntime = {
  status: InquiryStatus
  processedAt?: string
  sentAt?: string
}

/**
 * Per-inquiry classifier override captured when the user re-labels via the
 * label picker. Persisted alongside runtime status so the override stays
 * stable across navigation and feeds the "training data" narrative.
 */
export type ClassifierOverride = {
  label: string
  /** "danger" if the chosen label is in DANGER_LABELS, otherwise "info" */
  tone: "danger" | "info"
  /** ISO timestamp — surfaced in the audit log entry */
  at: string
}

type DemoState = {
  inquiries: Record<string, InquiryRuntime>
  classifierOverrides: Record<string, ClassifierOverride>
  beginProcessing: (id: string) => void
  completeProcessing: (id: string, outcome: "auto-resolved" | "queued") => void
  markSent: (id: string) => void
  markVerifying: (id: string) => void
  relabel: (id: string, label: string, tone: "danger" | "info") => void
  reset: () => void
}

function buildInitialInquiries(): Record<string, InquiryRuntime> {
  const map: Record<string, InquiryRuntime> = {}
  for (const seed of ALL_INQUIRIES) {
    map[seed.id] = {
      status: INTERACTIVE_INQUIRY_IDS.includes(
        seed.id as (typeof INTERACTIVE_INQUIRY_IDS)[number]
      )
        ? "unread"
        : seed.defaultStatus,
    }
  }
  return map
}

const initialInquiries = buildInitialInquiries()

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      inquiries: initialInquiries,
      classifierOverrides: {},
      beginProcessing: (id) =>
        set((s) => ({
          inquiries: {
            ...s.inquiries,
            [id]: { ...s.inquiries[id], status: "processing" },
          },
        })),
      completeProcessing: (id, outcome) =>
        set((s) => ({
          inquiries: {
            ...s.inquiries,
            [id]: {
              ...s.inquiries[id],
              status: outcome,
              processedAt: new Date().toISOString(),
            },
          },
        })),
      markSent: (id) =>
        set((s) => ({
          inquiries: {
            ...s.inquiries,
            [id]: {
              ...s.inquiries[id],
              status: "sent",
              sentAt: new Date().toISOString(),
            },
          },
        })),
      markVerifying: (id) =>
        set((s) => ({
          inquiries: {
            ...s.inquiries,
            [id]: { ...s.inquiries[id], status: "verifying" },
          },
        })),
      relabel: (id, label, tone) =>
        set((s) => ({
          classifierOverrides: {
            ...s.classifierOverrides,
            [id]: { label, tone, at: new Date().toISOString() },
          },
        })),
      reset: () =>
        set(() => ({
          inquiries: buildInitialInquiries(),
          classifierOverrides: {},
        })),
    }),
    {
      name: "neoflo-demo-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : window.sessionStorage
      ),
    }
  )
)

// SSR-safe wrapper: returns the persisted store after hydration; before that returns the initial values.
// Avoids the React hydration mismatch when sessionStorage and SSR-rendered HTML disagree.
export function useHydratedDemoStore<T>(selector: (s: DemoState) => T): T {
  const value = useDemoStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return selector({
      inquiries: initialInquiries,
      classifierOverrides: {},
      beginProcessing: () => undefined,
      completeProcessing: () => undefined,
      markSent: () => undefined,
      markVerifying: () => undefined,
      relabel: () => undefined,
      reset: () => undefined,
    })
  }
  return value
}
