// 14 exception reason codes used by Neo when holding an invoice in the exception queue.
// Source of truth: docs/handoff/invoice-processing/04-data-model.md § "reason-codes.ts".
// Edits here propagate to the exception row, the edit dropdown, and the audit log.

import type { ExceptionReasonCode, ExceptionReasonCodeDef } from "./types"

export const EXCEPTION_REASON_CODES: ExceptionReasonCodeDef[] = [
  {
    code: "PRICE_VARIANCE",
    label: "Price variance",
    description: "Invoice price differs from PO price beyond tolerance.",
    accountingTreatment: "Hold pending price reconciliation",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "QTY_SHORT_RECEIVED",
    label: "Quantity short",
    description: "Invoice quantity exceeds GRN quantity.",
    accountingTreatment: "Apply received quantity, hold delta",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "QTY_OVER_RECEIVED",
    label: "Quantity over",
    description: "GRN quantity exceeds invoice quantity (overage).",
    accountingTreatment: "Apply invoice qty; flag overage to receiving",
    requiresApproval: false,
    tone: "info",
  },
  {
    code: "NO_MATCHING_PO",
    label: "No matching PO",
    description: "Cannot find an open PO for this invoice.",
    accountingTreatment: "Hold pending PO creation or vendor clarification",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "MISSING_GRN",
    label: "Missing GRN",
    description: "PO matched but no GRN logged.",
    accountingTreatment: "Hold pending receiving confirmation",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "DUPLICATE_DETECTED",
    label: "Duplicate detected",
    description: "Invoice appears to duplicate one already paid.",
    accountingTreatment: "Do not post; investigate",
    requiresApproval: true,
    tone: "danger",
  },
  {
    code: "TAX_INELIGIBLE",
    label: "Tax ineligible",
    description: "Tax line claimed but eligibility checks fail.",
    accountingTreatment: "Code as expense (no tax credit)",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "TAX_AMBIGUOUS",
    label: "Tax ambiguous",
    description: "Tax treatment unclear; needs human review.",
    accountingTreatment: "Hold pending tax-team review",
    requiresApproval: true,
    tone: "info",
  },
  {
    code: "GL_AMBIGUOUS",
    label: "GL ambiguous",
    description: "Multiple plausible GL accounts; confidence too low to auto-post.",
    accountingTreatment: "Hold pending coding decision",
    requiresApproval: true,
    tone: "neutral",
  },
  {
    code: "VENDOR_NOT_REGISTERED",
    label: "Vendor not registered",
    description: "Tax registration cannot be validated.",
    accountingTreatment: "Hold pending vendor verification",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "MASTER_AGREEMENT_REVIEW",
    label: "Master agreement review",
    description: "Variance is potentially explained by an unrecorded agreement update.",
    accountingTreatment: "Hold pending agreement library update",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "EARLY_PAY_FLAGGED",
    label: "Early-pay opportunity",
    description: "Invoice qualifies for early-pay discount; flag to treasury.",
    accountingTreatment: "Approve via early-pay batch",
    requiresApproval: false,
    tone: "success",
  },
  {
    code: "OCR_LOW_CONFIDENCE",
    label: "OCR low confidence",
    description: "Field extraction fell below threshold; manual entry required.",
    accountingTreatment: "Hold pending data validation",
    requiresApproval: true,
    tone: "warning",
  },
  {
    code: "MULTI_CURRENCY_REVIEW",
    label: "Multi-currency review",
    description: "Cross-currency invoice with FX considerations; hold for treasury.",
    accountingTreatment: "Hold pending FX policy check",
    requiresApproval: true,
    tone: "info",
  },
]

const EXCEPTION_REASON_CODE_INDEX: Record<ExceptionReasonCode, ExceptionReasonCodeDef> =
  EXCEPTION_REASON_CODES.reduce(
    (acc, def) => {
      acc[def.code] = def
      return acc
    },
    {} as Record<ExceptionReasonCode, ExceptionReasonCodeDef>,
  )

export function getReasonCode(code: ExceptionReasonCode): ExceptionReasonCodeDef {
  return EXCEPTION_REASON_CODE_INDEX[code]
}
