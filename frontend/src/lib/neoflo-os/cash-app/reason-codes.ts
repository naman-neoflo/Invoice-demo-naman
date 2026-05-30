// 12 reason codes used by Neo when proposing short-pay (or overpayment) treatments.
// Source of truth: docs/handoff/cash-app/04-data-model.md § "lib/cash-app/reason-codes.ts".
// Edits here propagate to the short-pay reason picker, the audit log, and the dashboard cards.

import type { ReasonCode, ReasonCodeDef } from "./types"

export const REASON_CODES: ReasonCodeDef[] = [
  {
    code: "FREIGHT_DISCOUNT",
    label: "Freight discount",
    description: "Customer deducted freight per their agreement.",
    accountingTreatment: "Debit Freight expense, Credit AR",
    requiresApproval: false,
  },
  {
    code: "RETURN_CREDIT",
    label: "Return credit",
    description: "Customer deducted credit from a previously processed return.",
    accountingTreatment: "Debit Returns reserve, Credit AR",
    requiresApproval: true,
  },
  {
    code: "DISPUTED_LINE",
    label: "Disputed line",
    description: "Customer flagged a specific line item as disputed.",
    accountingTreatment: "Hold pending dispute resolution",
    requiresApproval: true,
  },
  {
    code: "BANK_FEE",
    label: "Bank/wire fee",
    description: "Difference is a bank or wire transfer fee.",
    accountingTreatment: "Debit Bank fees, Credit AR",
    requiresApproval: false,
  },
  {
    code: "EARLY_PAY_DISCOUNT",
    label: "Early pay discount",
    description: "Customer took the early-pay discount per terms (e.g., 2/10 net 30).",
    accountingTreatment: "Debit Sales discounts, Credit AR",
    requiresApproval: false,
  },
  {
    code: "VOLUME_TIER_DISCOUNT",
    label: "Volume tier discount",
    description: "Customer deducted per their volume tier in the master agreement.",
    accountingTreatment: "Debit Volume rebate, Credit AR",
    requiresApproval: false,
  },
  {
    code: "MISSING_REMITTANCE",
    label: "Missing remittance",
    description: "No remittance arrived; needs investigation.",
    accountingTreatment: "Hold in unapplied",
    requiresApproval: true,
  },
  {
    code: "CUSTOMER_NAME_MISMATCH",
    label: "Customer name mismatch",
    description: "Payer name doesn't match any vendor record exactly.",
    accountingTreatment: "Hold pending identification",
    requiresApproval: true,
  },
  {
    code: "PAYER_UNKNOWN",
    label: "Unknown payer",
    description: "Cannot identify the payer at all.",
    accountingTreatment: "Hold in suspense",
    requiresApproval: true,
  },
  {
    code: "PARTIAL_PAYMENT_AGREED",
    label: "Partial payment (agreed)",
    description: "Pre-agreed partial payment plan with customer.",
    accountingTreatment: "Apply partial; balance remains open",
    requiresApproval: true,
  },
  {
    code: "OVERPAYMENT_CREDIT",
    label: "Overpayment credit",
    description: "Customer paid more than invoiced; roll forward as credit.",
    accountingTreatment: "Debit AR, Credit Customer credit balance",
    requiresApproval: true,
  },
  {
    code: "BANK_ROUNDING",
    label: "Bank rounding",
    description: "Sub-dollar difference from FX or bank rounding.",
    accountingTreatment: "Auto-write-off (if < $5)",
    requiresApproval: false,
  },
]

const REASON_CODE_INDEX: Record<ReasonCode, ReasonCodeDef> = REASON_CODES.reduce(
  (acc, def) => {
    acc[def.code] = def
    return acc
  },
  {} as Record<ReasonCode, ReasonCodeDef>,
)

export function getReasonCode(code: ReasonCode): ReasonCodeDef | undefined {
  return REASON_CODE_INDEX[code]
}
