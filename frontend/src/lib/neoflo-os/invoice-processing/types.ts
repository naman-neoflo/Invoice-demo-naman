import type { PersonaId } from "@/lib/neoflo-os/neoflo-workspace/personas"

// ════════════════════════════════════════════════════════════════════
// Static seed entities (don't change at runtime in P1; production = DB)
// ════════════════════════════════════════════════════════════════════

export type VendorId = string  // e.g., "vendor-aclng-001"

export type Vendor = {
  id: VendorId
  name: string
  domain: string                 // for email matching
  primaryContactName: string
  primaryContactEmail: string
  jurisdiction: "US" | "SG" | "GB" | "EU" | "AU" | "ID" | "OTHER"
  taxRegistration?: {
    type: "GST" | "VAT" | "SALES_TAX_NEXUS"
    id: string                   // e.g., GST reg number "202012345W"
    validatedAt?: string         // ISO timestamp of last IRAS/HMRC validation
    validatedSource?: string     // "IRAS GST registry"
  }
  paymentTermsDays: number
  earlyPayDiscount?: {
    discountPercent: number      // e.g., 2 for 2/10 net 30
    daysToQualify: number        // e.g., 10
  }
  // Master agreement excerpts that Neo references for GL coding + variance reasoning
  agreementClauses?: {
    section: string              // e.g., "§2.3"
    text: string                 // verbatim excerpt
    relatesTo: "GL_CODING" | "PRICING" | "FREIGHT" | "TAX" | "TERMS"
  }[]
  // Default GL coding when present (vendors with master agreements)
  defaultGL?: {
    account: string              // e.g., "62100"
    accountLabel: string         // e.g., "Maintenance & Supplies"
    costCenter: string           // e.g., "PLANT-A"
    entity: string               // e.g., "AcmeCo US"
  }
  // Behavioral signals Neo uses for confidence
  behavior?: {
    averageInvoicesPerMonth?: number
    typicalAmountRange?: { min: number; max: number }
    duplicateAttemptHistory?: number    // count over last 12mo
    historicalShortShipPercent?: number  // 0-1
  }
}

export type PurchaseOrderId = string  // e.g., "po-1389"

export type POStatus = "open" | "closed" | "cancelled"

export type PurchaseOrder = {
  id: PurchaseOrderId
  poNumber: string               // human-readable, e.g., "PO-1389"
  vendorId: VendorId
  status: POStatus
  issuedAt: string               // ISO date
  expectedDeliveryAt?: string
  approver: string               // e.g., "Daniel Park"
  totalAmount: number
  currency: "USD" | "SGD" | "GBP" | "EUR" | "AUD"
  lines: POLine[]
  // Default coding inherited if invoice doesn't override
  glDefault?: {
    account: string
    costCenter: string
    entity: string
  }
}

export type POLine = {
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  unitOfMeasure: string          // "ea", "mo" (month), "lb", etc.
  lineTotal: number
}

export type GoodsReceiptNoteId = string  // e.g., "grn-441"

export type GoodsReceiptNote = {
  id: GoodsReceiptNoteId
  grnNumber: string
  poId: PurchaseOrderId
  vendorId: VendorId
  receivedAt: string             // ISO timestamp
  verifiedBy: string             // e.g., "Plant A mgr"
  verifiedAt: string
  lines: GRNLine[]
  // For services: the GRN is the "service confirmation"
  isServiceConfirmation?: boolean
  serviceperiod?: { start: string; end: string }
}

export type GRNLine = {
  lineNumber: number
  poLineNumber: number           // links to POLine
  quantityReceived: number
  condition: "good" | "damaged" | "partial"
  notes?: string
}

export type InvoiceId = string  // e.g., "inv-998123-b"

export type InvoiceChannel = "email" | "edi-810" | "billcom" | "coupa" | "ariba" | "photo" | "manual"

export type InvoiceStatus =
  | "auto-posted"          // Neo posted automatically
  | "human-approved"       // user clicked Approve & Post
  | "needs-review"         // in match-detail review queue (the 5 dashboard items)
  | "exception"            // in exception queue (the 8 items)
  | "duplicate-suspected"  // flagged duplicate (the hero item)
  | "duplicate-confirmed"  // user confirmed duplicate, will not post
  | "rejected"             // user rejected outright

export type Invoice = {
  id: InvoiceId
  invoiceNumber: string          // human-readable, e.g., "INV-998123-B"
  vendorId: VendorId
  amount: number                 // grand total in invoice currency
  currency: "USD" | "SGD" | "GBP" | "EUR" | "AUD" | "IDR"
  channel: InvoiceChannel
  receivedAt: string             // ISO timestamp
  issuedAt: string               // ISO date (vendor's invoice date)
  dueAt: string                  // ISO date
  termsLabel: string             // "Net-30", "2/10 net 30"
  status: InvoiceStatus
  poRef?: string                 // human-readable PO reference if vendor included it
  poId?: PurchaseOrderId         // resolved PO link (Neo's match)
  // OCR / extraction confidence (per-field detail in production; aggregate here)
  ocrConfidence: number          // 0-1
  // Parsed line items
  lines: InvoiceLine[]
  // Tax line (if any)
  taxLine?: {
    type: "GST" | "VAT" | "SALES_TAX" | "USE_TAX"
    rate: number                 // e.g., 0.08 for 8%
    base: number                 // amount tax was computed on
    amount: number               // tax amount
    jurisdiction: string         // "Singapore", "California", etc.
  }
  // Neo's analyses (all optional — only present if Neo ran them)
  matchProposal?: MatchProposal
  duplicateFinding?: DuplicateFinding
  glProposal?: GLProposal
  taxProposal?: TaxProposal
  earlyPayDiscount?: EarlyPayDiscount
  exception?: {
    reasonCode: ExceptionReasonCode
    neoInvestigation: string     // Neo's plain-English summary
    proposedAction: string       // e.g., "Send GRN request"
    draftedEmail?: { to: string; cc?: string; subject: string; body: string }
  }
  // Determines which match-detail render mode is used
  matchMode: "3way" | "2way" | "duplicate" | "tax" | "exception" | "faktur-pajak"
  // Indonesia-specific: Faktur Pajak comparison data (only present when currency is IDR)
  fakturPajak?: FakturPajakData
  assignedTo?: PersonaId
}

export type InvoiceLine = {
  lineNumber: number
  sku?: string
  description: string
  quantity: number
  unitPrice: number
  unitOfMeasure: string
  lineTotal: number
  // Match against PO line (filled by Neo)
  matchedPoLineNumber?: number
  matchedGrnLineNumber?: number
  variance?: {
    type: "price" | "quantity" | "both"
    amount: number               // signed: positive = over, negative = under
    explanation?: string         // Neo's reasoning
  }
}

export type MatchProposal = {
  type: "3way" | "2way"
  poId: PurchaseOrderId
  grnId?: GoodsReceiptNoteId     // null for 2-way
  totalVariance: number          // signed dollars
  confidence: number             // 0-1
  reasoning: string              // Neo's prose
  sources: string[]              // ["PO record", "GRN record", "vendor history"]
}

export type DuplicateFinding = {
  duplicateOfInvoiceId: InvoiceId  // the original invoice that was paid
  duplicateOfApplicationId?: ApplicationId
  similarityScore: number        // 0-1
  matchSignals: {
    sameInvoiceNumber: boolean   // exact
    sameAmount: boolean
    sameVendor: boolean
    lineItemSimilarity: number   // 0-1
    daysApart: number
  }
  reasoning: string              // Neo's prose
  recommendedAction: "do-not-post" | "investigate" | "human-review"
  draftedVendorEmail?: { to: string; cc?: string; subject: string; body: string }
}

export type GLProposal = {
  account: string                // e.g., "62100"
  accountLabel: string           // e.g., "Maintenance & Supplies"
  costCenter: string             // e.g., "PLANT-A"
  entity: string                 // e.g., "AcmeCo US"
  confidence: number             // 0-1
  reasoning: string              // Neo's prose, citing sources
  sources: string[]              // ["master agreement §2.3", "vendor history (12 invoices)", "GL chart"]
  alternatives?: { account: string; accountLabel: string; confidence: number }[]
}

export type TaxProposal = {
  treatment: "INPUT_TAX_CREDIT_ELIGIBLE" | "INPUT_TAX_CREDIT_INELIGIBLE" | "USE_TAX_ACCRUAL" | "EXEMPT" | "NEEDS_HUMAN_REVIEW"
  taxAccount?: string            // e.g., "21800 GST Input Tax Credit Receivable"
  amount: number                 // tax amount in invoice currency
  confidence: number             // 0-1
  reasoning: string
  sources: string[]              // ["IRAS GST registry", "invoice format check", "master agreement"]
  eligibilityChecks: {
    label: string                // e.g., "Vendor is GST-registered"
    passed: boolean
  }[]
}

export type FakturPajakField = {
  field_name: string           // e.g. "vendor_name"
  display_name: string         // e.g. "Vendor Name"
  fp_value: string | null      // extracted from FP document
  invoice_value: string | null // from invoice metadata
  match_status: "match" | "mismatch" | null
  required: boolean
}

export type FakturPajakData = {
  fp_number: string            // e.g. "010.000-26.00123456"
  fp_date?: string             // ISO date on the FP
  fields: FakturPajakField[]   // vendor_name, customer_name, taxable_amount, vat_amount
}

export type EarlyPayDiscount = {
  eligible: boolean
  discountAmount: number         // dollars
  payByDate: string              // ISO date
  deadlineDays: number           // days remaining
  termsLabel: string             // e.g., "2/10 net 30"
}

export type ExceptionReasonCode =
  | "PRICE_VARIANCE"
  | "QTY_SHORT_RECEIVED"
  | "QTY_OVER_RECEIVED"
  | "NO_MATCHING_PO"
  | "MISSING_GRN"
  | "DUPLICATE_DETECTED"
  | "TAX_INELIGIBLE"
  | "TAX_AMBIGUOUS"
  | "GL_AMBIGUOUS"
  | "VENDOR_NOT_REGISTERED"
  | "MASTER_AGREEMENT_REVIEW"
  | "EARLY_PAY_FLAGGED"
  | "OCR_LOW_CONFIDENCE"
  | "MULTI_CURRENCY_REVIEW"

export type ExceptionReasonCodeDef = {
  code: ExceptionReasonCode
  label: string
  description: string
  accountingTreatment: string
  requiresApproval: boolean
  tone: "success" | "warning" | "danger" | "info" | "neutral"
}

export type ApplicationId = string

export type Application = {
  id: ApplicationId
  invoiceId: InvoiceId
  vendorId: VendorId
  // The PO + GRN this application clears (for 3-way) or just PO (2-way)
  poId?: PurchaseOrderId
  grnId?: GoodsReceiptNoteId
  // Final coding
  finalGL: {
    account: string
    costCenter: string
    entity: string
  }
  finalTax?: {
    treatment: TaxProposal["treatment"]
    taxAccount?: string
    amount: number
  }
  // Status
  status: "auto-posted" | "human-approved" | "duplicate-confirmed" | "held-in-exceptions"
  // Audit trail
  auditTrail: AuditEvent[]
  // ERP write-back
  postedToErpAt?: string         // ISO; null until written
  erpTransactionId?: string      // e.g., "NS-7748412"
  // Hash (computed from full audit trail + extracted fields)
  hash: string                   // SHA-256 hex
  humanActions?: HumanAction[]
}

// ─────────────────────────────────────────────────────────────────
// Human action attribution — drives the Insights workload table
// ─────────────────────────────────────────────────────────────────

export type HumanActionType =
  | "exception-resolved"
  | "duplicate-confirmed"
  | "gl-override"
  | "classifier-override"
  | "approval"

export type HumanAction = {
  personaId: PersonaId
  actionType: HumanActionType
  timestamp: string         // ISO
  invoiceId: InvoiceId
}

// ════════════════════════════════════════════════════════════════════
// Audit events (mirrors helpdesk + cash-app audit log shape)
// ════════════════════════════════════════════════════════════════════

export type AuditEventType =
  | "ingested"
  | "ocr-extracted"
  | "vendor-lookup"
  | "po-matched"
  | "grn-matched"
  | "duplicate-checked"
  | "gl-coded"
  | "tax-checked"
  | "threshold-checked"
  | "auto-posted"
  | "human-approved"
  | "human-rejected"
  | "human-edited"
  | "duplicate-confirmed"
  | "vendor-emailed"
  | "erp-write-back"
  | "signed"

export type AuditEvent = {
  id: string
  type: AuditEventType
  timestamp: string              // ISO with milliseconds
  actor: "neo" | "human"
  humanName?: string             // if actor = "human"
  description: string            // 1-line summary
  source?: string                // "anthropic-vision-2026-04", "NetSuite REST API", "IRAS GST registry"
  reasoning?: string             // longer prose, plain English
  payload?: Record<string, unknown>  // raw data for debugging
}

// ════════════════════════════════════════════════════════════════════
// Integrations metadata (static, for the Integrations panel)
// ════════════════════════════════════════════════════════════════════

export type IntegrationCategory = "erp" | "payments" | "supplier-portals" | "tax-compliance"

export type IntegrationStatus = "active" | "coming-q1" | "coming-q2"

export type IntegrationEntry = {
  id: string
  category: IntegrationCategory
  name: string                   // "NetSuite"
  status: IntegrationStatus
  scopes?: string                // "read+write vendor-bills"
  lastSyncMinutesAgo?: number    // for the modal
}
