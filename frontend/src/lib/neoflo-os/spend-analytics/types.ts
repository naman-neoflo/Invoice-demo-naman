// Domain types for the spend-analytics workflow.
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "Domain types".
// Edits here propagate to the spend-analytics screens, the chat snapshot, and the audit log.

// ════════════════════════════════════════════════════════════════════
// Vendor + MSA + spend
// ════════════════════════════════════════════════════════════════════

export type VendorId = string  // e.g., "vendor-westpoint-industrial-tools"

export type VendorElasticityTier = "strategic" | "standard" | "long-tail"

export type SpendCategory =
  | "industrial-tools"
  | "professional-services"
  | "IT"
  | "facilities"
  | "marketing"
  | "logistics"
  | "office-supplies"
  | "travel"
  | "legal"
  | "other"

export type Vendor = {
  id: VendorId
  name: string
  category: SpendCategory
  ytdSpend: number               // current YTD spend through today
  ttmSpend: number               // trailing twelve months
  concentrationShare: number     // 0-1, share of total YTD spend
  msaActive: boolean
  msaId?: string                 // id into SEED_MSAS
  isPreferredForCategory: boolean // true if this is the preferred vendor for its category
  elasticityTier: VendorElasticityTier
  averageDaysToPay: number       // historical actual; for AcmeCo, target = paymentTermsDays, actual ~averageDaysToPay
  paymentTermsDays: number       // e.g., 30, 45, 60
  paymentHistorySummary?: string // 1-line "pays 6d late, 0 disputes, strong elasticity"
  strategicNotes?: string        // for the "DO NOT stretch" vendors
  industry?: string
  singleSourceRisk?: boolean     // true if no alt vendor for category
}

export type MSAId = string

export type MSA = {
  id: MSAId
  vendorId: VendorId
  category: SpendCategory
  effectiveFrom: string          // ISO date
  effectiveUntil: string         // ISO date
  agreedPricingSummary: string   // demo-only string, e.g. "Industrial fasteners $21/unit; tooling $18/unit; vol tier at 5K+"
  signedBy: string               // e.g. "Daniel Park (CFO)"
  sourcingEventId?: string       // e.g. "SOURCE-2024-1208"
  status: "active" | "pending-renewal" | "expired"
}

// Map of category → preferred-vendor (for maverick detection)
export type PreferredVendorMap = Partial<Record<SpendCategory, VendorId>>

// ════════════════════════════════════════════════════════════════════
// Time-series (the chart's data)
// ════════════════════════════════════════════════════════════════════

export type TimeSeriesPoint = {
  date: string                   // ISO date "YYYY-MM-DD"
  payables: number               // dollars (positive = AP outflow magnitude)
  receivables: number            // dollars (positive = AR inflow magnitude)
  netWorkingCapital: number      // receivables − payables (can be negative)
}

export type TimeSeriesForecastPoint = TimeSeriesPoint & {
  // 1-sigma uncertainty bands. Width grows with horizon: ±2% day 1 → ±5%
  // day 14 → ±12% day 30 → ±20% day 60.
  payablesLow: number
  payablesHigh: number
  receivablesLow: number
  receivablesHigh: number
  netWcLow: number
  netWcHigh: number
}

export type RangePreset = "30d" | "90d" | "ytd" | "ttm" | "custom"

// ════════════════════════════════════════════════════════════════════
// Maverick spend
// ════════════════════════════════════════════════════════════════════

export type MaverickId = string  // e.g., "maverick-westpoint-q2-2026"

export type MaverickReasonCode =
  | "NO_MSA"                     // vendor has no MSA at all
  | "OFF_PREFERRED"              // vendor has MSA but not preferred for category
  | "OUT_OF_CONTRACT_PRICING"    // vendor has MSA but invoiced outside agreed pricing
  | "OFF_CATEGORY"               // bought for a category vendor wasn't approved for

export type MaverickPO = {
  poNumber: string               // human-readable
  amount: number
  date: string                   // ISO
  buyer: string                  // e.g. "Plant A Operations"
  costCenter: string
  unitsOrdered?: number
  unitPrice?: number
}

export type MaverickEvent = {
  id: MaverickId
  vendorId: VendorId             // the off-MSA vendor
  category: SpendCategory
  reason: MaverickReasonCode
  timePeriod: string             // e.g. "Q2 2026"
  totalSpend: number             // sum of pos
  pos: MaverickPO[]
  severity: "low" | "medium" | "high"
  // Preferred alternative
  preferredVendorId: VendorId
  preferredVendorMsaId: MSAId
  // Switching analysis
  switchingAnalysis: {
    currentPaceUnits: number
    currentPaceCostPerUnit: number
    currentPaceTotal: number     // = units × cost
    preferredCostPerUnit: number
    preferredPaceTotal: number   // = units × preferred cost
    annualizedSavings: number    // 4× the savings if pos cover a quarter
    savingsPercent: number       // 0-1
    bomMappingNote: string       // "Specifications match per BOM mapping"
    reasoning: string            // long-form prose for the screen
    sources: string[]
    confidence: number           // 0-1
  }
  // Drafted procurement notification email (rendered on the detail screen)
  draftedProcurementEmail: {
    to: string
    cc?: string
    subject: string
    bodyMarkdown: string
  }
}

// ════════════════════════════════════════════════════════════════════
// Concentration ranking
// ════════════════════════════════════════════════════════════════════

export type ConcentrationEntry = {
  vendorId: VendorId
  rank: number                   // 1..N
  share: number                  // 0-1, percentage of total spend
  spendYtd: number
  isSingleSource: boolean
  alertNote?: string             // e.g. "single-source concentration risk above 15% threshold"
}

// ════════════════════════════════════════════════════════════════════
// DPO opportunity (for the working capital reveal hero)
// ════════════════════════════════════════════════════════════════════

export type DPOStretchOpportunity = {
  vendorId: VendorId
  currentDaysToPay: number       // actual recent average
  recommendedStretchDays: number // how many additional days Neo recommends
  freedDollars: number           // working capital freed by this vendor's stretch
  elasticityReasoning: string    // "12mo on-time, 0 disputes, strong elasticity"
  riskScore: "low" | "medium" | "high"
}

export type DPOOpportunitySummary = {
  totalFreedDollars: number      // sum across all opportunities — $1.8M for hero
  currentDPO: number             // 38
  targetDPO: number              // 42
  perVendor: DPOStretchOpportunity[]
  globalReasoning: string        // 1-line summary
}

// ════════════════════════════════════════════════════════════════════
// Deferral batch (cash-flow planner hero)
// ════════════════════════════════════════════════════════════════════

export type DeferralBatchItem = {
  invoiceId: string              // references invoice-processing inv id
  invoiceNumber: string
  vendorId: VendorId
  vendorName: string             // denormalized for display
  amount: number
  currentDueDate: string         // ISO
  proposedNewDate: string        // ISO (later within terms)
  elasticityRationale: string    // "pays 6d late on average · 0 disputes · strong elasticity"
}

export type DeferralBatchProposal = {
  id: string                     // e.g. "deferral-may30-2026"
  totalDollars: number           // $890K for hero
  itemCount: number              // 6
  windowAnchorEvent: string      // "May 30 customer receipt forecast"
  windowAnchorDollars: number    // $2.1M (the forecast amount)
  preDeferralNetPosition: number // −$2.1M
  postDeferralNetPosition: number // −$1.2M
  improvementPercent: number     // 0.42 = 42%
  reasoning: string              // prose for the screen
  sources: string[]
  confidence: number             // 0-1
  items: DeferralBatchItem[]
}

// ════════════════════════════════════════════════════════════════════
// Application = audit-log holder for any user action
// ════════════════════════════════════════════════════════════════════

export type ApplicationId = string

export type ApplicationType =
  | "working-capital-analyzed"
  | "dpo-stretch-approved"
  | "maverick-procurement-notified"
  | "maverick-override-accepted"
  | "deferral-batch-approved"
  | "concentration-acknowledged"

export type Application = {
  id: ApplicationId
  type: ApplicationType
  postedAt: string               // ISO
  appliedBy?: string             // human name; absent if "human" actor implicit
  // Linked entity (depending on type)
  vendorId?: VendorId
  maverickId?: MaverickId
  deferralBatchId?: string
  // Audit trail
  auditTrail: AuditEvent[]
  hash: string                   // SHA-256 hex
}

// ════════════════════════════════════════════════════════════════════
// Audit events
// ════════════════════════════════════════════════════════════════════

export type AuditEventType =
  | "working-capital-analyzed"
  | "dpo-opportunity-identified"
  | "maverick-detected"
  | "vendor-switch-recommended"
  | "procurement-notified"
  | "concentration-flagged"
  | "cashflow-projected"
  | "deferral-batch-proposed"
  | "deferral-batch-approved"
  | "human-approved"
  | "human-rejected"
  | "human-edited"
  | "signed"

export type AuditEvent = {
  id: string
  type: AuditEventType
  timestamp: string              // ISO with milliseconds
  actor: "neo" | "human"
  humanName?: string
  description: string
  source?: string
  reasoning?: string
  payload?: Record<string, unknown>
}

// ════════════════════════════════════════════════════════════════════
// Integrations
// ════════════════════════════════════════════════════════════════════

export type IntegrationCategory = "erp" | "procurement" | "banking-payments" | "crm"
export type IntegrationStatus = "active" | "coming-q1" | "coming-q2" | "coming-q3"

export type IntegrationEntry = {
  id: string
  category: IntegrationCategory
  name: string
  status: IntegrationStatus
  scopes?: string
  lastSyncMinutesAgo?: number
}

// ════════════════════════════════════════════════════════════════════
// Reason-code definitions (consumed by lib/spend-analytics/reason-codes.ts)
// ════════════════════════════════════════════════════════════════════

export type MaverickReasonCodeDef = {
  code: MaverickReasonCode
  label: string
  description: string
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}

export type DeferralReasonCode = "ALIGN_WITH_RECEIPT" | "LIQUIDITY_BUFFER"

export type DeferralReasonCodeDef = {
  code: DeferralReasonCode
  label: string
  description: string
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}
