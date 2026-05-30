// 14 integration entries shown in the Integrations panel (Surface 6).
// Source of truth: docs/handoff/invoice-processing/04-data-model.md § "integrations.ts".
// Edits here propagate to the integrations grid and the per-integration modal.

import type { IntegrationCategory, IntegrationEntry } from "./types"

export const INTEGRATIONS: IntegrationEntry[] = [
  {
    id: "netsuite",
    category: "erp",
    name: "NetSuite",
    status: "active",
    scopes: "read+write vendor-bills",
    lastSyncMinutesAgo: 2,
  },
  { id: "sage-intacct", category: "erp", name: "Sage Intacct", status: "coming-q1" },
  { id: "quickbooks", category: "erp", name: "QuickBooks", status: "coming-q1" },
  { id: "oracle-fusion", category: "erp", name: "Oracle Fusion", status: "coming-q2" },
  {
    id: "tipalti",
    category: "payments",
    name: "Tipalti",
    status: "active",
    scopes: "read payments + remittance",
  },
  {
    id: "billcom-pay",
    category: "payments",
    name: "Bill.com Pay",
    status: "active",
    scopes: "read payment status",
  },
  { id: "stripe-ap", category: "payments", name: "Stripe AP", status: "coming-q2" },
  {
    id: "billcom-portal",
    category: "supplier-portals",
    name: "Bill.com",
    status: "active",
    scopes: "poll new submissions",
  },
  {
    id: "coupa",
    category: "supplier-portals",
    name: "Coupa",
    status: "active",
    scopes: "poll new submissions",
  },
  { id: "ariba", category: "supplier-portals", name: "Ariba", status: "coming-q1" },
  {
    id: "iras-gst",
    category: "tax-compliance",
    name: "IRAS GST",
    status: "active",
    scopes: "validate GST registrations",
  },
  { id: "hmrc-vat", category: "tax-compliance", name: "HMRC VAT", status: "coming-q1" },
  { id: "avalara", category: "tax-compliance", name: "Avalara", status: "coming-q2" },
  { id: "peppol", category: "tax-compliance", name: "Peppol e-invoicing", status: "coming-q2" },
]

export function getIntegrationsByCategory(): Record<IntegrationCategory, IntegrationEntry[]> {
  const grouped: Record<IntegrationCategory, IntegrationEntry[]> = {
    erp: [],
    payments: [],
    "supplier-portals": [],
    "tax-compliance": [],
  }
  for (const entry of INTEGRATIONS) {
    grouped[entry.category].push(entry)
  }
  return grouped
}
