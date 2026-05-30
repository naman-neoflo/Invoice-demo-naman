// lib/workspace/integrations-catalog.ts
//
// Unified company-level integrations catalog. Replaces the per-workflow
// integrations panels (cash-app / invoice-processing / collections /
// spend-analytics) with one canonical view at /workspace/integrations.
//
// Pure data — no React imports — safe in server and client modules.

export type IntegrationStatus = "active" | "coming-q1" | "coming-q2" | "coming-q3" | "coming-q4"

export type IntegrationCategory =
  | "erp"
  | "procurement"
  | "banks"
  | "payments"
  | "crm"
  | "tax-compliance"
  | "communications"

export type WorkflowSlug =
  | "helpdesk"
  | "cash-app"
  | "invoice-processing"
  | "collections"
  | "spend-analytics"

export type IntegrationEntry = {
  id: string
  category: IntegrationCategory
  name: string
  /** Short initials for the logo tile, e.g. "NS" for NetSuite */
  initials: string
  /** Tailwind background class for the logo tile (semantic-ish; uses status-color allowance) */
  logoBg: string
  status: IntegrationStatus
  /** One-line scope summary (e.g. "read+write vendor-bills · AR + AP ledgers") */
  scopes?: string
  /** Workflows that consume this integration — shown as small chips on the card */
  usedBy: WorkflowSlug[]
  /** Mock last-sync (only for active integrations) */
  lastSyncMinutesAgo?: number
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  erp: "ERP",
  procurement: "Procurement",
  banks: "Banks",
  payments: "Payments",
  crm: "CRM",
  "tax-compliance": "Tax & compliance",
  communications: "Communications",
}

export const CATEGORY_SUBTITLES: Record<IntegrationCategory, string> = {
  erp: "Source of truth for AP, AR, GL — every workflow reads from here.",
  procurement: "MSAs, preferred-vendor lists, sourcing events — feeds maverick detection + dispute evidence.",
  banks: "Cash position + transaction-level reconciliation context.",
  payments: "Payment-side connectors for AP runs + AR receipts.",
  crm: "Customer + vendor relationship context — pulls recent-conversation summaries for tone-aware authoring.",
  "tax-compliance": "Tax-authority validation + e-invoicing endpoints.",
  communications: "Outbound channels for AP / AR / collections email + SMS + e-signature.",
}

export const WORKFLOW_LABELS: Record<WorkflowSlug, string> = {
  helpdesk: "Helpdesk",
  "cash-app": "Cash app",
  "invoice-processing": "Invoice processing",
  collections: "Collections",
  "spend-analytics": "Spend analytics",
}

// ════════════════════════════════════════════════════════════════════
// The canonical list. Deduplicated across all workflows.
// Each entry's `usedBy` lists which workflows consume it.
// ════════════════════════════════════════════════════════════════════

export const INTEGRATIONS_CATALOG: IntegrationEntry[] = [
  // ─── ERP ────────────────────────────────────────────────────────────
  {
    id: "netsuite",
    category: "erp",
    name: "Oracle NetSuite",
    initials: "NS",
    logoBg: "bg-cyan-600",
    status: "active",
    scopes: "read AR + AP ledgers · write vendor-bills + credit memos + payment-schedule flags",
    usedBy: ["helpdesk", "cash-app", "invoice-processing", "collections", "spend-analytics"],
    lastSyncMinutesAgo: 2,
  },
  {
    id: "sage-intacct",
    category: "erp",
    name: "Sage Intacct",
    initials: "SI",
    logoBg: "bg-emerald-600",
    status: "coming-q1",
    usedBy: ["cash-app", "invoice-processing", "collections", "spend-analytics"],
  },
  {
    id: "quickbooks",
    category: "erp",
    name: "QuickBooks Online",
    initials: "QB",
    logoBg: "bg-emerald-500",
    status: "coming-q1",
    usedBy: ["cash-app", "invoice-processing", "collections", "spend-analytics"],
  },
  {
    id: "oracle-fusion",
    category: "erp",
    name: "Oracle Fusion",
    initials: "OF",
    logoBg: "bg-red-700",
    status: "coming-q2",
    usedBy: ["invoice-processing", "spend-analytics"],
  },
  {
    id: "acumatica",
    category: "erp",
    name: "Acumatica",
    initials: "Ac",
    logoBg: "bg-amber-600",
    status: "coming-q2",
    usedBy: ["collections"],
  },

  // ─── Procurement ────────────────────────────────────────────────────
  {
    id: "sap-ariba",
    category: "procurement",
    name: "SAP Ariba",
    initials: "Ar",
    logoBg: "bg-blue-700",
    status: "active",
    scopes: "read MSAs + preferred-vendor list + sourcing events",
    usedBy: ["invoice-processing", "spend-analytics"],
    lastSyncMinutesAgo: 14,
  },
  {
    id: "coupa",
    category: "procurement",
    name: "Coupa",
    initials: "Co",
    logoBg: "bg-rose-600",
    status: "active",
    scopes: "read spend cube + invoice submissions + supplier-portal events",
    usedBy: ["invoice-processing", "spend-analytics"],
    lastSyncMinutesAgo: 8,
  },
  {
    id: "ariba-portal",
    category: "procurement",
    name: "Ariba supplier portal",
    initials: "AP",
    logoBg: "bg-blue-600",
    status: "coming-q1",
    usedBy: ["invoice-processing"],
  },
  {
    id: "procurify",
    category: "procurement",
    name: "Procurify",
    initials: "Pf",
    logoBg: "bg-violet-700",
    status: "coming-q2",
    usedBy: ["spend-analytics"],
  },

  // ─── Banks ──────────────────────────────────────────────────────────
  {
    id: "jpmorgan-chase",
    category: "banks",
    name: "JPMorgan Chase",
    initials: "JP",
    logoBg: "bg-blue-700",
    status: "active",
    scopes: "read AP outflows + AR receipts + cash position",
    usedBy: ["cash-app", "invoice-processing", "collections", "spend-analytics"],
    lastSyncMinutesAgo: 4,
  },
  {
    id: "bank-of-america",
    category: "banks",
    name: "Bank of America",
    initials: "BA",
    logoBg: "bg-rose-700",
    status: "coming-q1",
    usedBy: ["cash-app", "spend-analytics"],
  },
  {
    id: "mercury",
    category: "banks",
    name: "Mercury",
    initials: "Mc",
    logoBg: "bg-zinc-700",
    status: "coming-q2",
    usedBy: ["cash-app"],
  },

  // ─── Payments ───────────────────────────────────────────────────────
  {
    id: "tipalti",
    category: "payments",
    name: "Tipalti",
    initials: "Ti",
    logoBg: "bg-violet-600",
    status: "active",
    scopes: "read payments + remittance · write payment schedules",
    usedBy: ["cash-app", "invoice-processing"],
    lastSyncMinutesAgo: 6,
  },
  {
    id: "billcom-pay",
    category: "payments",
    name: "Bill.com Pay",
    initials: "Bc",
    logoBg: "bg-sky-600",
    status: "active",
    scopes: "read payment status + schedules",
    usedBy: ["cash-app", "invoice-processing", "collections", "spend-analytics"],
    lastSyncMinutesAgo: 11,
  },
  {
    id: "stripe",
    category: "payments",
    name: "Stripe",
    initials: "St",
    logoBg: "bg-indigo-600",
    status: "active",
    scopes: "generate payment links · read inbound receipts",
    usedBy: ["collections", "spend-analytics"],
    lastSyncMinutesAgo: 9,
  },
  {
    id: "ach-direct",
    category: "payments",
    name: "ACH Direct",
    initials: "AD",
    logoBg: "bg-teal-600",
    status: "coming-q2",
    usedBy: ["collections"],
  },
  {
    id: "stripe-ap",
    category: "payments",
    name: "Stripe AP",
    initials: "Sa",
    logoBg: "bg-indigo-500",
    status: "coming-q2",
    usedBy: ["invoice-processing"],
  },

  // ─── CRM ────────────────────────────────────────────────────────────
  {
    id: "salesforce",
    category: "crm",
    name: "Salesforce",
    initials: "Sf",
    logoBg: "bg-sky-700",
    status: "active",
    scopes: "read customer + vendor relationship context · write account notes · revenue forecast",
    usedBy: ["collections", "spend-analytics"],
    lastSyncMinutesAgo: 18,
  },
  {
    id: "hubspot",
    category: "crm",
    name: "HubSpot",
    initials: "Hs",
    logoBg: "bg-orange-600",
    status: "coming-q1",
    usedBy: ["collections", "spend-analytics"],
  },
  {
    id: "pipedrive",
    category: "crm",
    name: "Pipedrive",
    initials: "Pd",
    logoBg: "bg-green-700",
    status: "coming-q2",
    usedBy: ["collections"],
  },

  // ─── Tax & compliance ───────────────────────────────────────────────
  {
    id: "iras-gst",
    category: "tax-compliance",
    name: "IRAS GST",
    initials: "IR",
    logoBg: "bg-rose-600",
    status: "active",
    scopes: "validate GST registrations · classify input tax credit eligibility",
    usedBy: ["invoice-processing"],
    lastSyncMinutesAgo: 22,
  },
  {
    id: "hmrc-vat",
    category: "tax-compliance",
    name: "HMRC VAT",
    initials: "Hm",
    logoBg: "bg-blue-600",
    status: "coming-q1",
    usedBy: ["invoice-processing"],
  },
  {
    id: "avalara",
    category: "tax-compliance",
    name: "Avalara",
    initials: "Av",
    logoBg: "bg-orange-700",
    status: "coming-q2",
    usedBy: ["invoice-processing"],
  },
  {
    id: "peppol",
    category: "tax-compliance",
    name: "Peppol e-invoicing",
    initials: "Pp",
    logoBg: "bg-emerald-700",
    status: "coming-q2",
    usedBy: ["invoice-processing"],
  },

  // ─── Communications ─────────────────────────────────────────────────
  {
    id: "slack",
    category: "communications",
    name: "Slack",
    initials: "Sl",
    logoBg: "bg-purple-600",
    status: "active",
    usedBy: ["helpdesk", "collections", "invoice-processing"],
  },
  {
    id: "ms-teams",
    category: "communications",
    name: "Microsoft Teams",
    initials: "MT",
    logoBg: "bg-indigo-600",
    status: "coming-q1",
    usedBy: ["helpdesk", "collections"],
  },
  {
    id: "sendgrid",
    category: "communications",
    name: "SendGrid email",
    initials: "Sg",
    logoBg: "bg-sky-600",
    status: "coming-q3",
    usedBy: ["helpdesk", "collections", "invoice-processing"],
  },
  {
    id: "twilio-sms",
    category: "communications",
    name: "Twilio SMS",
    initials: "Tw",
    logoBg: "bg-rose-600",
    status: "coming-q3",
    usedBy: ["collections"],
  },
  {
    id: "docusign",
    category: "communications",
    name: "DocuSign",
    initials: "Ds",
    logoBg: "bg-amber-600",
    status: "coming-q4",
    usedBy: ["collections", "invoice-processing"],
  },
]

export function getIntegrationsByCategory(): Record<IntegrationCategory, IntegrationEntry[]> {
  const result: Record<IntegrationCategory, IntegrationEntry[]> = {
    erp: [],
    procurement: [],
    banks: [],
    payments: [],
    crm: [],
    "tax-compliance": [],
    communications: [],
  }
  for (const entry of INTEGRATIONS_CATALOG) result[entry.category].push(entry)
  return result
}

export function getActiveIntegrationsCount(): number {
  return INTEGRATIONS_CATALOG.filter((e) => e.status === "active").length
}

export function getComingIntegrationsCount(): number {
  return INTEGRATIONS_CATALOG.filter((e) => e.status !== "active").length
}
