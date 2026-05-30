// Domain types for the Collections, Dunning & Dispute workflow.
// Source of truth: docs/handoff/collections/04-data-model.md § "Domain types".
// Edits here propagate to seeds, the runtime store, derived helpers, and the UI surfaces.

// ════════════════════════════════════════════════════════════════════
// Static seed entities
// ════════════════════════════════════════════════════════════════════

export type CustomerId = string  // e.g., "cust-westpoint-mfg"

export type Customer = {
  id: CustomerId
  name: string
  accountNumber: string         // e.g., "WPT-04451"
  domain: string                // for email matching
  primaryContactName: string
  primaryContactEmail: string
  primaryContactRole?: string   // "AR Manager", "AP Lead"
  paymentTermsDays: number
  industry?: string             // for tone calibration
  // Behavioral signals Neo uses for ranking + tone
  behavior: {
    averageDaysToPay: number    // e.g., 41.5
    monthsOnTimeHistory: number // 0-24+
    silentDays?: number         // null if currently responsive; days since last reply
    breachedPromiseCount?: number  // last 12 months
    disputeCount?: number       // last 12 months
    relationshipTier?: "strategic" | "standard" | "long-tail"
    last6MonthsOrderVolume?: number
  }
  // CRM-shape relationship context (canned in seed; Salesforce-shape in M3)
  crm?: {
    accountOwner: string        // sales rep name
    lastConversationAt?: string // ISO
    lastConversationSummary?: string  // 1-line summary of what was discussed
  }
}

export type OpenInvoiceId = string  // e.g., "inv-wpt-2204"

export type OpenInvoice = {
  id: OpenInvoiceId
  invoiceNumber: string
  customerId: CustomerId
  amount: number
  currency: "USD" | "SGD" | "GBP" | "EUR" | "AUD"
  issuedAt: string              // ISO date
  dueAt: string                 // ISO date
  termsLabel: string
  agingBucket: "current" | "1-30d" | "31-60d" | "61-90d" | "90+d"
  agingDays: number
  description?: string          // 1-line line-summary
  // Linked payment if partially paid
  partiallyPaidAmount?: number
}

export type CaseId = string   // e.g., "case-westpoint-2026-may"

export type CollectionsCase = {
  id: CaseId
  customerId: CustomerId
  invoiceIds: OpenInvoiceId[]
  totalOverdue: number
  oldestAgingDays: number
  // Neo's prioritization
  ranking: {
    valueScore: number          // 0-100
    riskScore: number           // 0-100
    recoverabilityScore: number // 0-100
    compositePriority: number   // 0-100
    rank: number                // 1..N (1 is top)
    reasoning: string           // "Ranked top because: ..."
  }
  // Neo's recommended action
  recommendedTier: 1 | 2 | 3 | 4 | "hold" | "investigate"
  recommendedToneLabel: string  // e.g., "friendly check-in", "firm reminder"
  // Status flags driving the customer-detail render variant
  caseFlags: {
    quietlyOverdue?: boolean
    promiseBroken?: boolean
    accountHoldCandidate?: boolean
    activeDispute?: DisputeId | null
    awaitingCustomerResponse?: boolean
  }
  draftedEmail?: DunningEmail   // null if no email drafted yet
  status: "ready-to-send" | "needs-review" | "in-batch" | "sent" | "investigating" | "escalated"
}

export type DunningTier = 1 | 2 | 3 | 4
// Tier 1: gentle, friendly, no pressure
// Tier 2: firmer reminder + payment link
// Tier 3: escalation language, phone-call recommendation
// Tier 4: legal / collections-agency language

export type DunningEmail = {
  id: string
  caseId: CaseId
  customerId: CustomerId
  tier: DunningTier
  toneLabel: string             // "friendly", "firm", "escalation", "final-notice"
  to: string
  cc?: string
  subject: string
  bodyMarkdown: string          // Neo's drafted body
  paymentLink?: string          // mock Stripe link
  toneCalibrationNotes: string  // "references 42-day pattern", "tone-shifted from broken promise"
  draftedAt: string             // ISO
  sentAt?: string               // ISO; null until human approves + sends
}

export type DisputeId = string  // e.g., "dispute-atlantic-9912"

export type DisputeReason =
  | "QTY_SHORT_DELIVERED"
  | "QTY_OVER_DELIVERED"
  | "PRICE_MISMATCH"
  | "DAMAGED_ON_ARRIVAL"
  | "WRONG_ITEM_DELIVERED"
  | "SERVICE_NOT_RENDERED"
  | "LATE_DELIVERY_CREDIT"
  | "NO_POD_AVAILABLE"
  | "CUSTOMER_DISPUTES_AGREEMENT"
  | "UNCLEAR_DEDUCTION"

export type Dispute = {
  id: DisputeId
  customerId: CustomerId
  invoiceId: OpenInvoiceId
  invoiceNumber: string
  disputeAmount: number
  reason: DisputeReason
  reasonLabel: string           // human-readable
  customerStatedReason: string  // verbatim quote from customer email
  filedAt: string               // ISO
  agingDays: number
  status: "filed" | "investigating" | "evidence-pulled" | "credit-memo-proposed" | "credit-memo-approved" | "resolved-refused" | "resolved-paid"
  // Neo's evidence panel
  evidence?: {
    poId?: string               // PO reference (canned link)
    poRecord?: { number: string; quantity: number; unitPrice: number; approver: string; issuedAt: string }
    grnId?: string
    grnRecord?: { number: string; receivedQty: number; verifiedBy: string; receivedAt: string; condition: "good" | "damaged" | "partial" }
    podId?: string
    podRecord?: { signedAt: string; signedBy: string; carrierName: string; quantityDelivered: number; condition: string }
    originalQuote?: { unitPrice: number; quantity: number; total: number }
    discrepancySummary?: string  // Neo's prose
  }
  // Neo's recommendation
  recommendation?: {
    action: "issue-credit-memo" | "refuse-with-evidence" | "investigate-further" | "human-review"
    confidence: number
    creditMemoAmount?: number
    creditMemoReason?: string
    reasoning: string
    sources: string[]
    draftedCreditMemo?: CreditMemo
    draftedEmail?: { to: string; cc?: string; subject: string; bodyMarkdown: string }
  }
}

export type CreditMemo = {
  id: string                    // "CM-2026-0812"
  customerId: CustomerId
  linkedDisputeId: DisputeId
  linkedInvoiceId: OpenInvoiceId
  amount: number
  reason: DisputeReason
  reasonLabel: string
  accountingTreatment: string   // "Debit Sales returns, Credit AR"
  approvalRequired: boolean     // false if under $100 threshold
  status: "draft" | "approved" | "posted-to-erp"
  approvedAt?: string
  postedAt?: string
}

export type PromiseToPay = {
  id: string
  customerId: CustomerId
  invoiceIds: OpenInvoiceId[]
  amount: number
  promisedAt: string            // ISO timestamp when promise was made
  promisedFor: string           // ISO date the customer promised to pay
  recordedBy: "neo" | "human"   // who logged the promise
  status: "open" | "kept" | "broken" | "extended"
  daysLate?: number             // computed if broken
  followUpDraft?: DunningEmail  // tone-shifted follow-up if breached
}

export type EscalationTier = "tier-1" | "tier-2" | "tier-3" | "legal" | "collections-agency" | "account-hold"

export type Escalation = {
  id: string
  customerId: CustomerId
  caseId: CaseId
  recommendedTier: EscalationTier
  reason: string
  reasoningSources: string[]
  financialImpact?: {
    overdueAmount: number
    last6MonthsOrderVolume: number
    holdImpactPerMonth?: number
    recoveryProbabilityWithoutAction: number  // 0-1
    recoveryProbabilityWithAction: number     // 0-1
  }
  draftedNotificationEmail?: { to: string; subject: string; bodyMarkdown: string }
  draftedInternalEmail?: { to: string; subject: string; bodyMarkdown: string }  // Sales notification etc.
  status: "proposed" | "human-approved" | "human-rejected" | "applied"
}

export type AccountHold = {
  id: string
  customerId: CustomerId
  appliedAt?: string            // ISO; null until human approves
  appliedBy?: string
  reason: string
  expectedRecoveryUplift: number  // dollars
  notifiedSales?: boolean
  notifiedCustomer?: boolean
}

export type DeductionReason =
  | "PRICING_ERROR"
  | "SHORT_SHIPMENT"
  | "FREIGHT_CREDIT"
  | "DAMAGE_CREDIT"
  | "RETURN_CREDIT"
  | "EARLY_PAY_DISCOUNT_TAKEN"

export type Deduction = {
  id: string
  customerId: CustomerId
  invoiceId: OpenInvoiceId
  amount: number
  reason: DeductionReason
  reasonLabel: string
  customerStatedReason?: string
  proposedAccountingTreatment: string
  status: "auto-coded" | "needs-review" | "approved" | "disputed"
}

export type EscalationReasonCode =
  | "UNRESPONSIVE_60D"
  | "UNRESPONSIVE_90D"
  | "PROMISE_BROKEN"
  | "LARGE_OVERDUE_THRESHOLD"
  | "CUSTOMER_PATTERN_DETERIORATION"

// ════════════════════════════════════════════════════════════════════
// Reason-code definitions (one DefShape per category)
// ════════════════════════════════════════════════════════════════════

export type DisputeReasonDef = {
  code: DisputeReason
  label: string
  description: string
  defaultDispositionPath: "credit-memo" | "refuse" | "investigate"
  requiresApproval: boolean
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}

export type DeductionReasonDef = {
  code: DeductionReason
  label: string
  description: string
  proposedAccountingTreatment: string
  requiresApproval: boolean
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}

export type EscalationReasonDef = {
  code: EscalationReasonCode
  label: string
  description: string
  recommendedTier: EscalationTier
  requiresApproval: boolean
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}

// ════════════════════════════════════════════════════════════════════
// Application = audit-log holder for every action Neo took
// ════════════════════════════════════════════════════════════════════

export type ApplicationId = string

export type Application = {
  id: ApplicationId
  type: "dunning-sent" | "dispute-resolved" | "credit-memo-issued" | "escalation-applied" | "account-hold-applied" | "promise-followup-sent"
  customerId: CustomerId
  // Linked entity ids depending on type
  caseId?: CaseId
  disputeId?: DisputeId
  creditMemoId?: string
  escalationId?: string
  // Audit trail
  auditTrail: AuditEvent[]
  hash: string                  // SHA-256 hex
  postedAt: string              // ISO
}

// ════════════════════════════════════════════════════════════════════
// Audit events (mirrors existing audit log shape)
// ════════════════════════════════════════════════════════════════════

export type AuditEventType =
  | "case-prioritized"
  | "email-drafted"
  | "tone-calibrated"
  | "evidence-pulled"
  | "dispute-investigated"
  | "credit-memo-issued"
  | "escalation-recommended"
  | "account-hold-flagged"
  | "promise-recorded"
  | "promise-breached"
  | "human-approved"
  | "human-edited"
  | "human-rejected"
  | "email-sent"
  | "signed"

export type AuditEvent = {
  id: string
  type: AuditEventType
  timestamp: string
  actor: "neo" | "human"
  humanName?: string
  description: string
  source?: string
  reasoning?: string
  payload?: Record<string, unknown>
}
