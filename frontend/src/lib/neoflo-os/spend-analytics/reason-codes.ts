// Reason-code library for the spend-analytics workflow.
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "reason-codes.ts" + the Bundle A brief.
// Edits here propagate to the maverick detail screen, the deferral planner, the audit log, and the badges.

import type {
  DeferralReasonCode,
  DeferralReasonCodeDef,
  MaverickReasonCode,
  MaverickReasonCodeDef,
} from "./types"

export const MAVERICK_REASON_CODES: MaverickReasonCodeDef[] = [
  {
    code: "NO_MSA",
    label: "No MSA on file",
    description: "Vendor lacks any master service agreement; spend is fully off-contract.",
    tone: "danger",
  },
  {
    code: "OFF_PREFERRED",
    label: "Off preferred vendor",
    description:
      "Vendor has an MSA but isn't the preferred vendor for this category; consolidate.",
    tone: "warning",
  },
  {
    code: "OUT_OF_CONTRACT_PRICING",
    label: "Out-of-contract pricing",
    description: "Vendor invoiced outside agreed MSA pricing.",
    tone: "warning",
  },
  {
    code: "OFF_CATEGORY",
    label: "Off-category purchase",
    description: "Bought for a category this vendor isn't approved for.",
    tone: "warning",
  },
]

export const DEFERRAL_REASON_CODES: DeferralReasonCodeDef[] = [
  {
    code: "ALIGN_WITH_RECEIPT",
    label: "Align with customer receipt",
    description: "Shift outflow to align with a specific revenue receipt window.",
    tone: "success",
  },
  {
    code: "LIQUIDITY_BUFFER",
    label: "Liquidity buffer",
    description: "Shift to maintain a target minimum cash balance.",
    tone: "info",
  },
]

const MAVERICK_REASON_INDEX: Record<MaverickReasonCode, MaverickReasonCodeDef> =
  MAVERICK_REASON_CODES.reduce(
    (acc, def) => {
      acc[def.code] = def
      return acc
    },
    {} as Record<MaverickReasonCode, MaverickReasonCodeDef>,
  )

const DEFERRAL_REASON_INDEX: Record<DeferralReasonCode, DeferralReasonCodeDef> =
  DEFERRAL_REASON_CODES.reduce(
    (acc, def) => {
      acc[def.code] = def
      return acc
    },
    {} as Record<DeferralReasonCode, DeferralReasonCodeDef>,
  )

export function getMaverickReason(code: MaverickReasonCode): MaverickReasonCodeDef {
  return MAVERICK_REASON_INDEX[code]
}

export function getDeferralReason(code: DeferralReasonCode): DeferralReasonCodeDef {
  return DEFERRAL_REASON_INDEX[code]
}
