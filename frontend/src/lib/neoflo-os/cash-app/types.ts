// ════════════════════════════════════════════════════════════════════
// Static seed entities (don't change at runtime in P1; production = DB)
// ════════════════════════════════════════════════════════════════════

export type CustomerId = string  // e.g., "cust-acme-industrial"

export type Customer = {
  id: CustomerId
  name: string
  domain: string                // for email matching
  primaryContactName: string
  primaryContactEmail: string
  paymentTermsDays: number      // typical Net-30, etc.
  // Master agreement excerpts that Neo references for short-pay reasoning
  agreementClauses?: {
    section: string             // e.g., "§4.2"
    text: string                // e.g., "Buyer may deduct freight charges if delivered later than agreed ship date."
    relatesTo: ReasonCode       // e.g., "FREIGHT_DISCOUNT"
  }[]
  // Behavioral signals Neo uses for confidence scoring
  paymentBehavior?: {
    typicalShortPayPattern?: string  // e.g., "Multi-invoice, freight discount avg $620"
    averageDaysToPay?: number        // e.g., 42
    multiInvoicePaymentLikelihood?: number  // 0-1, e.g., 0.75
  }
}

export type InvoiceId = string  // e.g., "inv-4421"

export type Invoice = {
  id: InvoiceId
  customerId: CustomerId
  invoiceNumber: string          // human-readable, e.g., "INV-4421"
  amount: number                 // in dollars (cents in production)
  issuedAt: string               // ISO date
  dueAt: string                  // ISO date
  termsLabel: string             // "Net-30"
  status: "open" | "partial" | "paid"
  poNumber?: string
  lineSummary?: string           // short description for UI
}

export type PaymentId = string

export type PaymentChannel = "ach-email" | "ach-edi-820" | "ach-portal" | "ach-bank-stmt-only" | "wire-portal"

export type Payment = {
  id: PaymentId
  amount: number
  receivedAt: string             // ISO timestamp
  channel: PaymentChannel
  bankReference: string          // e.g., "TXN-3392-2026"
  bank: string                   // e.g., "JPMorgan Chase"
  // What Neo extracted about who sent it (may differ from actual customer if name mismatch)
  extractedPayer: {
    name: string                 // as it appeared on the bank/remittance
    matchedCustomerId?: CustomerId  // null if Neo couldn't auto-match
    matchConfidence?: number     // 0-1
  }
  // Remittance details if any
  remittance?: {
    rawText?: string             // the original "payment for INV-4421, INV-4422, INV-4423"
    parsedInvoiceIds?: string[]  // resolved invoice IDs
  }
  // Initial classification by Neo
  classification: {
    label: "1:1 match" | "1:many match" | "many:1 match" | "short-pay" | "overpayment" | "unapplied"
    confidence: number           // 0-1
  }
}

export type ApplicationId = string

export type Application = {
  id: ApplicationId
  paymentId: PaymentId
  customerId: CustomerId
  // The invoice(s) this application clears
  invoiceIds: InvoiceId[]
  // Distribution of payment amount across the invoices
  invoiceAmounts: { invoiceId: InvoiceId; appliedAmount: number }[]
  // Short-pay (or overpayment) details
  shortPay?: {
    amount: number               // > 0 = short, < 0 = over
    reasonCode: ReasonCode
    reasoning: string            // Neo's "why this code" explanation
    accountingTreatment: string  // e.g., "Debit Freight expense, Credit AR"
  }
  // Status
  status: "auto-applied" | "human-approved" | "needs-review" | "held" | "rejected"
  // Audit trail
  audit: AuditEvent[]
  // ERP write-back
  postedToErpAt?: string         // ISO; null until written
}

export type ReasonCode =
  | "FREIGHT_DISCOUNT"
  | "RETURN_CREDIT"
  | "DISPUTED_LINE"
  | "BANK_FEE"
  | "EARLY_PAY_DISCOUNT"
  | "VOLUME_TIER_DISCOUNT"
  | "MISSING_REMITTANCE"
  | "CUSTOMER_NAME_MISMATCH"
  | "PAYER_UNKNOWN"
  | "PARTIAL_PAYMENT_AGREED"
  | "OVERPAYMENT_CREDIT"
  | "BANK_ROUNDING"

export type ReasonCodeDef = {
  code: ReasonCode
  label: string                  // human-readable
  description: string
  accountingTreatment: string    // default treatment in plain English
  requiresApproval: boolean      // true = always queue for human; false = auto-apply if confidence high
}

export type UnappliedItem = {
  paymentId: PaymentId
  diagnostic: string             // Neo's explanation of why it can't auto-apply
  proposedMatch?: {
    customerId: CustomerId
    invoiceIds: InvoiceId[]
    confidence: number
  }
  proposedAction: "confirm-match" | "draft-customer-email" | "manual-investigation"
  agingBucket: "current" | "1-7d" | "8-30d" | "30+d"
}

// ════════════════════════════════════════════════════════════════════
// Audit events (mirrors helpdesk audit log)
// ════════════════════════════════════════════════════════════════════

export type AuditEventType =
  | "ingested"
  | "classified"
  | "lookup"            // querying NetSuite / customer record / agreement
  | "proposed-match"
  | "auto-applied"
  | "human-approved"
  | "erp-write-back"
  | "bank-rec-flagged"
  | "signed"

export type AuditEvent = {
  id: string
  type: AuditEventType
  timestamp: string              // ISO with milliseconds
  actor: "neo" | "human"
  humanName?: string             // if actor = "human"
  description: string            // 1-line summary
  source?: string                // "Tipalti webhook", "NetSuite REST API", etc.
  reasoning?: string             // longer prose, plain English
  payload?: Record<string, unknown>  // raw data for debugging
}
