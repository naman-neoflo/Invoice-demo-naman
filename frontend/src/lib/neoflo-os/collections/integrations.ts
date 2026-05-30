// 13 integration entries shown in the collections Integrations panel
// (Surface 6). Source of truth: docs/handoff/collections/03-screen-specs.md
// § "Surface 6: Integrations". Edits here propagate to the integrations grid
// and the per-integration modal.
//
// Note: this module declares its own collections-local IntegrationCategory /
// IntegrationStatus types — they differ from invoice-processing's (different
// categories + four quarterly coming-soon buckets instead of two).

export type IntegrationCategory = "erp" | "payments" | "crm" | "comms"
export type IntegrationStatus =
  | "active"
  | "coming-q1"
  | "coming-q2"
  | "coming-q3"
  | "coming-q4"

export type CollectionsIntegrationEntry = {
  id: string
  category: IntegrationCategory
  name: string
  status: IntegrationStatus
  scopes?: string
  lastSyncMinutesAgo?: number
}

export const COLLECTIONS_INTEGRATIONS: CollectionsIntegrationEntry[] = [
  {
    id: "netsuite",
    category: "erp",
    name: "NetSuite",
    status: "active",
    scopes: "read AR + write credit memos + flags",
    lastSyncMinutesAgo: 3,
  },
  { id: "sage-intacct", category: "erp", name: "Sage Intacct", status: "coming-q1" },
  { id: "quickbooks", category: "erp", name: "QuickBooks", status: "coming-q1" },
  { id: "acumatica", category: "erp", name: "Acumatica", status: "coming-q2" },

  {
    id: "stripe",
    category: "payments",
    name: "Stripe",
    status: "active",
    scopes: "generate payment links",
  },
  {
    id: "billcom-pay",
    category: "payments",
    name: "Bill.com Pay",
    status: "active",
    scopes: "read payment status",
  },
  { id: "ach-direct", category: "payments", name: "ACH Direct", status: "coming-q2" },

  {
    id: "salesforce",
    category: "crm",
    name: "Salesforce",
    status: "active",
    scopes: "read relationship + write notes",
  },
  { id: "hubspot", category: "crm", name: "HubSpot", status: "coming-q1" },
  { id: "pipedrive", category: "crm", name: "Pipedrive", status: "coming-q2" },

  { id: "sendgrid", category: "comms", name: "SendGrid email", status: "coming-q3" },
  { id: "twilio-sms", category: "comms", name: "Twilio SMS", status: "coming-q3" },
  { id: "docusign", category: "comms", name: "DocuSign", status: "coming-q4" },
]

export function getCollectionsIntegrationsByCategory(): Record<
  IntegrationCategory,
  CollectionsIntegrationEntry[]
> {
  const grouped: Record<IntegrationCategory, CollectionsIntegrationEntry[]> = {
    erp: [],
    payments: [],
    crm: [],
    comms: [],
  }
  for (const entry of COLLECTIONS_INTEGRATIONS) {
    grouped[entry.category].push(entry)
  }
  return grouped
}
