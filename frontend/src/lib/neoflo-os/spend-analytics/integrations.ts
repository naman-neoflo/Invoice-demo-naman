// 12 integration entries shown in the spend-analytics Integrations panel
// (Surface 6). Source of truth: docs/handoff/spend-analytics/04-data-model.md
// § "integrations.ts" + docs/handoff/spend-analytics/03-screen-specs.md
// § "Surface 6: Integrations".
//
// Categories + statuses come from the spend-analytics types module so the
// type union stays the single source of truth across the workflow.

import type {
  IntegrationCategory,
  IntegrationEntry,
} from "./types"

export const SPEND_ANALYTICS_INTEGRATIONS: IntegrationEntry[] = [
  // ── ERP (4) ─────────────────────────────────────────────────────────────
  {
    id: "netsuite",
    category: "erp",
    name: "NetSuite",
    status: "active",
    scopes: "read AP ledger + balance + payment schedules",
    lastSyncMinutesAgo: 3,
  },
  { id: "sage-intacct", category: "erp", name: "Sage Intacct", status: "coming-q1" },
  { id: "quickbooks", category: "erp", name: "QuickBooks", status: "coming-q1" },
  { id: "oracle-fusion", category: "erp", name: "Oracle Fusion", status: "coming-q2" },

  // ── Procurement (3) ─────────────────────────────────────────────────────
  {
    id: "sap-ariba",
    category: "procurement",
    name: "SAP Ariba",
    status: "active",
    scopes: "read MSAs + preferred vendors + sourcing events",
  },
  {
    id: "coupa",
    category: "procurement",
    name: "Coupa",
    status: "active",
    scopes: "read spend cube",
  },
  { id: "procurify", category: "procurement", name: "Procurify", status: "coming-q2" },

  // ── Banking + payments (3) ──────────────────────────────────────────────
  {
    id: "jpmorgan-chase",
    category: "banking-payments",
    name: "JPMorgan Chase",
    status: "active",
    scopes: "read AP outflows + cash position",
  },
  {
    id: "billcom-pay",
    category: "banking-payments",
    name: "Bill.com Pay",
    status: "active",
    scopes: "read payment schedules",
  },
  {
    id: "stripe",
    category: "banking-payments",
    name: "Stripe",
    status: "active",
    scopes: "read inbound receipts",
  },

  // ── CRM (2) ─────────────────────────────────────────────────────────────
  {
    id: "salesforce",
    category: "crm",
    name: "Salesforce",
    status: "active",
    scopes: "read revenue forecast for cash-flow alignment",
  },
  { id: "hubspot", category: "crm", name: "HubSpot", status: "coming-q1" },
]

export function getSpendAnalyticsIntegrationsByCategory(): Record<
  IntegrationCategory,
  IntegrationEntry[]
> {
  const result: Record<IntegrationCategory, IntegrationEntry[]> = {
    erp: [],
    procurement: [],
    "banking-payments": [],
    crm: [],
  }
  for (const entry of SPEND_ANALYTICS_INTEGRATIONS) {
    result[entry.category].push(entry)
  }
  return result
}
