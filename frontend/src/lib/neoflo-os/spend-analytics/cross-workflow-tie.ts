// Cross-workflow tie helpers between spend-analytics + invoice-processing.
//
// Source of truth: docs/plans/2026-05-16-spend-analytics-phase-1-implementation.md
//   § "Task 10 — Cross-workflow tie helper".
//
// These hardcoded IDs link the spend-analytics hero deferral batch + maverick
// vendor switch back into invoice-processing's seed, so the inbox can render
// "deferred to <date>" and "in maverick switch batch" badges on the same rows.
//
// Companion: lib/invoice-processing/seed-invoices.ts has been extended with
// minimal Invoice records for any of these IDs that didn't already exist.

// IDs of invoices in the spend-analytics hero deferral batch
// (deferral-may30-2026; see seed-applications.ts).
export const HERO_DEFERRAL_BATCH_INVOICE_IDS = [
  "inv-pacific-pl-2299",
  "inv-sumitomo-sh-4471",
  "inv-coastal-cp-9112",
  "inv-atlantic-ai-77103",
  "inv-westside-wl-3022",
  "inv-northeast-ni-2107",
]

// Parallel array of "deferred to" new due dates — index-matched to the
// HERO_DEFERRAL_BATCH_INVOICE_IDS list above.
export const HERO_DEFERRAL_NEW_DUE_DATES = [
  "2026-06-02",
  "2026-06-03",
  "2026-06-04",
  "2026-06-05",
  "2026-06-04",
  "2026-06-05",
]

// IDs of the 4 Westpoint Industrial Tools invoices that the maverick switch
// recommendation flagged (the same 4 POs in maverick-westpoint-q2-2026).
export const HERO_MAVERICK_VENDOR_INVOICE_IDS = [
  "inv-westpoint-industrial-wp-2204",
  "inv-westpoint-industrial-wp-2207",
  "inv-westpoint-industrial-wp-2210",
  "inv-westpoint-industrial-wp-2213",
]

// Lookup: given an invoice id, return its deferred new due date (or undefined
// if it isn't in the hero deferral batch).
export function getDeferredDueDate(invoiceId: string): string | undefined {
  const idx = HERO_DEFERRAL_BATCH_INVOICE_IDS.indexOf(invoiceId)
  return idx >= 0 ? HERO_DEFERRAL_NEW_DUE_DATES[idx] : undefined
}

// Predicate: true if the invoice is one of the 4 Westpoint POs in the hero
// maverick switch recommendation.
export function isInMaverickSwitchedBatch(invoiceId: string): boolean {
  return HERO_MAVERICK_VENDOR_INVOICE_IDS.includes(invoiceId)
}
