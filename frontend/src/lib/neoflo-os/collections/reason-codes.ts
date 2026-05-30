// 21 reason codes across 3 categories used by Neo when classifying disputes,
// coding deductions, and recommending escalations.
// Source of truth: docs/handoff/collections/04-data-model.md § "reason-codes.ts".
// Edits here propagate to the dispute-detail evidence panel, the deduction
// coder, the escalation recommender, and the audit log.

import type {
  DeductionReason,
  DeductionReasonDef,
  DisputeReason,
  DisputeReasonDef,
  EscalationReasonCode,
  EscalationReasonDef,
} from "./types"

// ════════════════════════════════════════════════════════════════════
// Dispute reason codes (10)
// ════════════════════════════════════════════════════════════════════

export const DISPUTE_REASON_CODES: DisputeReasonDef[] = [
  {
    code: "QTY_SHORT_DELIVERED",
    label: "Quantity short delivered",
    description: "Customer received fewer units than invoiced.",
    defaultDispositionPath: "credit-memo",
    requiresApproval: false,
    tone: "warning",
  },
  {
    code: "QTY_OVER_DELIVERED",
    label: "Quantity over delivered",
    description: "Customer received more units than invoiced; bill-back may be warranted.",
    defaultDispositionPath: "investigate",
    requiresApproval: true,
    tone: "info",
  },
  {
    code: "PRICE_MISMATCH",
    label: "Price mismatch",
    description: "Invoice price differs from the agreed quote or contract price.",
    defaultDispositionPath: "investigate",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "DAMAGED_ON_ARRIVAL",
    label: "Damaged on arrival",
    description: "Goods arrived damaged; customer requests credit for damaged units.",
    defaultDispositionPath: "credit-memo",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "WRONG_ITEM_DELIVERED",
    label: "Wrong item delivered",
    description: "Customer received a different SKU than ordered.",
    defaultDispositionPath: "credit-memo",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "SERVICE_NOT_RENDERED",
    label: "Service not rendered",
    description: "Customer disputes that the billed service was performed.",
    defaultDispositionPath: "investigate",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "LATE_DELIVERY_CREDIT",
    label: "Late-delivery credit",
    description: "Customer claims a contractual late-delivery credit.",
    defaultDispositionPath: "credit-memo",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "NO_POD_AVAILABLE",
    label: "No proof of delivery",
    description: "Customer denies receipt and we cannot produce a signed POD.",
    defaultDispositionPath: "investigate",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "CUSTOMER_DISPUTES_AGREEMENT",
    label: "Disputes agreement terms",
    description: "Customer disputes the underlying contractual or pricing terms.",
    defaultDispositionPath: "refuse",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "UNCLEAR_DEDUCTION",
    label: "Unclear deduction",
    description: "Customer deducted without specifying a reason; needs clarification.",
    defaultDispositionPath: "investigate",
    requiresApproval: true,
    tone: "neutral",
  },
]

// ════════════════════════════════════════════════════════════════════
// Deduction reason codes (6)
// ════════════════════════════════════════════════════════════════════

export const DEDUCTION_REASON_CODES: DeductionReasonDef[] = [
  {
    code: "PRICING_ERROR",
    label: "Pricing error",
    description: "Customer paid the old or contracted price rather than the invoiced price.",
    proposedAccountingTreatment: "Debit Sales discounts, Credit AR",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "SHORT_SHIPMENT",
    label: "Short shipment",
    description: "Customer deducted for units they did not receive.",
    proposedAccountingTreatment: "Debit Sales returns, Credit AR",
    requiresApproval: false,
    tone: "warning",
  },
  {
    code: "FREIGHT_CREDIT",
    label: "Freight credit",
    description: "Customer deducted freight per their freight-policy agreement.",
    proposedAccountingTreatment: "Debit Freight expense, Credit AR",
    requiresApproval: false,
    tone: "info",
  },
  {
    code: "DAMAGE_CREDIT",
    label: "Damage credit",
    description: "Customer deducted for damaged units received.",
    proposedAccountingTreatment: "Debit Sales returns, Credit AR",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "RETURN_CREDIT",
    label: "Return credit",
    description: "Customer deducted credit from a previously authorized return.",
    proposedAccountingTreatment: "Debit Returns reserve, Credit AR",
    requiresApproval: true,
    tone: "neutral",
  },
  {
    code: "EARLY_PAY_DISCOUNT_TAKEN",
    label: "Early-pay discount taken",
    description: "Customer took the early-pay discount per terms (e.g., 2/10 net 30).",
    proposedAccountingTreatment: "Debit Sales discounts, Credit AR",
    requiresApproval: false,
    tone: "success",
  },
]

// ════════════════════════════════════════════════════════════════════
// Escalation reason codes (5)
// ════════════════════════════════════════════════════════════════════

export const ESCALATION_REASON_CODES: EscalationReasonDef[] = [
  {
    code: "UNRESPONSIVE_60D",
    label: "Unresponsive 60+ days",
    description: "Customer has not responded to dunning outreach for 60+ days.",
    recommendedTier: "tier-2",
    requiresApproval: false,
    tone: "warning",
  },
  {
    code: "UNRESPONSIVE_90D",
    label: "Unresponsive 90+ days",
    description: "Customer has not responded to dunning outreach for 90+ days.",
    recommendedTier: "tier-3",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "PROMISE_BROKEN",
    label: "Promise broken",
    description: "Customer committed to a payment date that has passed.",
    recommendedTier: "tier-2",
    requiresApproval: false,
    tone: "warning",
  },
  {
    code: "LARGE_OVERDUE_THRESHOLD",
    label: "Large overdue threshold",
    description: "Overdue balance exceeds the configured large-account threshold.",
    recommendedTier: "tier-3",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "CUSTOMER_PATTERN_DETERIORATION",
    label: "Pattern deterioration",
    description: "Customer payment behavior has materially deteriorated vs. their 12-month baseline.",
    recommendedTier: "account-hold",
    requiresApproval: true,
    tone: "danger",
  },
]

// ════════════════════════════════════════════════════════════════════
// Lookup helpers
// ════════════════════════════════════════════════════════════════════

const DISPUTE_REASON_INDEX: Record<DisputeReason, DisputeReasonDef> =
  DISPUTE_REASON_CODES.reduce(
    (acc, def) => {
      acc[def.code] = def
      return acc
    },
    {} as Record<DisputeReason, DisputeReasonDef>,
  )

const DEDUCTION_REASON_INDEX: Record<DeductionReason, DeductionReasonDef> =
  DEDUCTION_REASON_CODES.reduce(
    (acc, def) => {
      acc[def.code] = def
      return acc
    },
    {} as Record<DeductionReason, DeductionReasonDef>,
  )

const ESCALATION_REASON_INDEX: Record<EscalationReasonCode, EscalationReasonDef> =
  ESCALATION_REASON_CODES.reduce(
    (acc, def) => {
      acc[def.code] = def
      return acc
    },
    {} as Record<EscalationReasonCode, EscalationReasonDef>,
  )

export function getDisputeReason(code: DisputeReason): DisputeReasonDef {
  return DISPUTE_REASON_INDEX[code]
}

export function getDeductionReason(code: DeductionReason): DeductionReasonDef {
  return DEDUCTION_REASON_INDEX[code]
}

export function getEscalationReason(code: EscalationReasonCode): EscalationReasonDef {
  return ESCALATION_REASON_INDEX[code]
}
