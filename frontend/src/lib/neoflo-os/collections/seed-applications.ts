// ~30 audit-trail Application records for the collections demo.
//
// Source of truth: docs/handoff/collections/04-data-model.md § "seed-applications.ts"
// + the Phase 1 plan Bundle C requirement.
//
// Type distribution (29 total):
//   dunning-sent          : 12  (1 hero w/ 6-event trail + 11 routine sends, varied tiers)
//   dispute-resolved      :  6
//   credit-memo-issued    :  4
//   escalation-applied    :  3  + account-hold-applied : 1 = 4
//   promise-followup-sent :  3
//
// Each Application has 5-10 chronologically ordered AuditEvents,
// a 64-char hex hash (deterministic but unique), and ISO postedAt
// timestamps spread across May 2026.

import type { Application, ApplicationId, AuditEvent, CustomerId } from "./types"

// ════════════════════════════════════════════════════════════════════
// Hero application — verbatim from spec
// ════════════════════════════════════════════════════════════════════

const HERO_APPLICATION: Application = {
  id: "app-westpoint-2206-may-tier1-sent",
  type: "dunning-sent",
  customerId: "cust-westpoint-mfg",
  caseId: "case-westpoint-2026-may",
  postedAt: "2026-05-15T07:33:00Z",
  hash: "c7e91f6d3a2b8c45f1e0a8b9c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8",
  auditTrail: [
    {
      id: "ev-1",
      type: "case-prioritized",
      timestamp: "2026-05-15T06:30:01.000Z",
      actor: "neo",
      description: "Westpoint Mfg ranked #1 of 40 active cases",
      source: "ranking model",
      reasoning:
        "Composite priority 88: $84K (value 72), 14d silence + 12mo on-time = elevated risk score 84, recoverability 96 (good payment history)",
    },
    {
      id: "ev-2",
      type: "tone-calibrated",
      timestamp: "2026-05-15T06:30:02.000Z",
      actor: "neo",
      description: "Selected tier 1 (friendly check-in)",
      source: "tone calibration model",
      reasoning:
        "Customer normally pays at 42 days; current aging 31-42d. 12mo on-time history. Silence pattern unusual but not yet alarming. Tier 1 protects relationship; tier 2 risks unnecessary friction.",
    },
    {
      id: "ev-3",
      type: "email-drafted",
      timestamp: "2026-05-15T06:30:04.000Z",
      actor: "neo",
      description: "Drafted tier-1 email to Maria Gonzalez",
      source: "anthropic-claude-sonnet-4-7",
      reasoning:
        "Email references 42-day pattern from 24-month payment history. Tone: friendly, no pressure. Includes payment link. Subject: 'Quick check-in — May invoices'.",
    },
    {
      id: "ev-4",
      type: "human-approved",
      timestamp: "2026-05-15T07:33:00.000Z",
      actor: "human",
      humanName: "Sasha Patel",
      description: "Sasha approved drafted email as-is, no edits",
    },
    {
      id: "ev-5",
      type: "email-sent",
      timestamp: "2026-05-15T07:33:00.500Z",
      actor: "neo",
      description: "Email sent to maria.gonzalez@westpoint-mfg.com",
    },
    {
      id: "ev-6",
      type: "signed",
      timestamp: "2026-05-15T07:33:01.000Z",
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ],
}

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

function bumpIso(iso: string, ms: number): string {
  const d = new Date(iso)
  d.setTime(d.getTime() + ms)
  return d.toISOString()
}

// 5-event tier-1 dunning trail (auto-sent after human approval, no edits)
function buildTier1DunningTrail(args: {
  customerName: string
  rank: number
  toneRationale: string
  toEmail: string
  approver: string
  startedAt: string
}): AuditEvent[] {
  const t = args.startedAt
  return [
    {
      id: "ev-1",
      type: "case-prioritized",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: `${args.customerName} ranked #${args.rank} in today's batch`,
      source: "ranking model",
    },
    {
      id: "ev-2",
      type: "tone-calibrated",
      timestamp: bumpIso(t, 1100),
      actor: "neo",
      description: "Selected tier 1 (friendly check-in)",
      source: "tone calibration model",
      reasoning: args.toneRationale,
    },
    {
      id: "ev-3",
      type: "email-drafted",
      timestamp: bumpIso(t, 3000),
      actor: "neo",
      description: "Drafted tier-1 email",
      source: "anthropic-claude-sonnet-4-7",
    },
    {
      id: "ev-4",
      type: "human-approved",
      timestamp: bumpIso(t, 7800),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} approved drafted email as-is`,
    },
    {
      id: "ev-5",
      type: "email-sent",
      timestamp: bumpIso(t, 8300),
      actor: "neo",
      description: `Email sent to ${args.toEmail}`,
    },
    {
      id: "ev-6",
      type: "signed",
      timestamp: bumpIso(t, 8800),
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ]
}

// 7-event tier-2 dunning trail (firmer, with edits applied)
function buildTier2DunningTrail(args: {
  customerName: string
  rank: number
  toneRationale: string
  toEmail: string
  approver: string
  startedAt: string
  edited?: boolean
}): AuditEvent[] {
  const t = args.startedAt
  const trail: AuditEvent[] = [
    {
      id: "ev-1",
      type: "case-prioritized",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: `${args.customerName} ranked #${args.rank} (tier-2 candidate)`,
      source: "ranking model",
    },
    {
      id: "ev-2",
      type: "tone-calibrated",
      timestamp: bumpIso(t, 1500),
      actor: "neo",
      description: "Selected tier 2 (firm reminder)",
      source: "tone calibration model",
      reasoning: args.toneRationale,
    },
    {
      id: "ev-3",
      type: "email-drafted",
      timestamp: bumpIso(t, 3400),
      actor: "neo",
      description: "Drafted tier-2 email with payment-plan ask",
      source: "anthropic-claude-sonnet-4-7",
    },
  ]
  if (args.edited) {
    trail.push({
      id: "ev-4",
      type: "human-edited",
      timestamp: bumpIso(t, 6200),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} edited 2 lines (softer opening, kept ask)`,
    })
  }
  trail.push(
    {
      id: args.edited ? "ev-5" : "ev-4",
      type: "human-approved",
      timestamp: bumpIso(t, 7400),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} approved final email`,
    },
    {
      id: args.edited ? "ev-6" : "ev-5",
      type: "email-sent",
      timestamp: bumpIso(t, 8200),
      actor: "neo",
      description: `Email sent to ${args.toEmail}`,
    },
    {
      id: args.edited ? "ev-7" : "ev-6",
      type: "signed",
      timestamp: bumpIso(t, 8700),
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  )
  return trail
}

// 6-event dispute-resolved trail
function buildDisputeResolvedTrail(args: {
  customerName: string
  disputeReason: string
  startedAt: string
  approver: string
  refused?: boolean
}): AuditEvent[] {
  const t = args.startedAt
  const verdict = args.refused ? "refused-with-evidence" : "credit-memo-issued"
  return [
    {
      id: "ev-1",
      type: "evidence-pulled",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: `Pulled PO, GRN, POD, and original quote for ${args.customerName}`,
      source: "ERP + warehouse system",
    },
    {
      id: "ev-2",
      type: "dispute-investigated",
      timestamp: bumpIso(t, 4000),
      actor: "neo",
      description: `Investigated ${args.disputeReason} claim`,
      reasoning: args.refused
        ? "Evidence supports the original invoice; recommend refusal with documentation."
        : "Evidence confirms customer's claim; recommend credit memo.",
    },
    args.refused
      ? {
          id: "ev-3",
          type: "human-approved",
          timestamp: bumpIso(t, 90000),
          actor: "human",
          humanName: args.approver,
          description: `${args.approver} approved refusal package with PO + POD attachments`,
        }
      : {
          id: "ev-3",
          type: "credit-memo-issued",
          timestamp: bumpIso(t, 8000),
          actor: "neo",
          description: "Credit memo drafted and queued",
        },
    {
      id: "ev-4",
      type: "human-approved",
      timestamp: bumpIso(t, args.refused ? 95000 : 92000),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} approved ${verdict}`,
    },
    {
      id: "ev-5",
      type: "email-sent",
      timestamp: bumpIso(t, args.refused ? 96000 : 93000),
      actor: "neo",
      description: args.refused
        ? "Refusal email sent with evidence attached"
        : "Credit-memo + apology email sent",
    },
    {
      id: "ev-6",
      type: "signed",
      timestamp: bumpIso(t, args.refused ? 96500 : 93500),
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ]
}

// 5-event credit-memo-issued trail (smaller, no dispute origin)
function buildCreditMemoTrail(args: {
  customerName: string
  amount: number
  reason: string
  startedAt: string
  approver: string
}): AuditEvent[] {
  const t = args.startedAt
  return [
    {
      id: "ev-1",
      type: "evidence-pulled",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: `Pulled supporting docs for $${args.amount} credit memo (${args.customerName})`,
    },
    {
      id: "ev-2",
      type: "credit-memo-issued",
      timestamp: bumpIso(t, 3500),
      actor: "neo",
      description: `Drafted credit memo: ${args.reason}`,
    },
    {
      id: "ev-3",
      type: "human-approved",
      timestamp: bumpIso(t, 90000),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} approved credit memo`,
    },
    {
      id: "ev-4",
      type: "email-sent",
      timestamp: bumpIso(t, 91000),
      actor: "neo",
      description: "Credit-memo notification email sent",
    },
    {
      id: "ev-5",
      type: "signed",
      timestamp: bumpIso(t, 91500),
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ]
}

// 7-event escalation trail
function buildEscalationTrail(args: {
  customerName: string
  tier: string
  startedAt: string
  approver: string
  hold?: boolean
}): AuditEvent[] {
  const t = args.startedAt
  const trail: AuditEvent[] = [
    {
      id: "ev-1",
      type: "case-prioritized",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: `${args.customerName} flagged for escalation`,
      source: "ranking model",
    },
    {
      id: "ev-2",
      type: "escalation-recommended",
      timestamp: bumpIso(t, 4500),
      actor: "neo",
      description: `Recommended ${args.tier}`,
      reasoning: args.hold
        ? "95 days overdue + 3 ignored dunning emails + last order Mar 12. Financial impact: hold-cost < expected recovery uplift."
        : "Pattern deterioration + multiple slips. Phone follow-up + escalation tier appropriate.",
    },
  ]
  if (args.hold) {
    trail.push({
      id: "ev-3",
      type: "account-hold-flagged",
      timestamp: bumpIso(t, 9000),
      actor: "neo",
      description: "Account-hold candidate identified",
    })
  }
  trail.push(
    {
      id: args.hold ? "ev-4" : "ev-3",
      type: "email-drafted",
      timestamp: bumpIso(t, 12000),
      actor: "neo",
      description: "Drafted internal sales notification + customer notification",
      source: "anthropic-claude-sonnet-4-7",
    },
    {
      id: args.hold ? "ev-5" : "ev-4",
      type: "human-approved",
      timestamp: bumpIso(t, 180000),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} approved ${args.hold ? "account hold" : "escalation"}`,
    },
    {
      id: args.hold ? "ev-6" : "ev-5",
      type: "email-sent",
      timestamp: bumpIso(t, 181000),
      actor: "neo",
      description: args.hold
        ? "Hold notification sent to sales + customer"
        : "Escalation email sent to customer CFO",
    },
    {
      id: args.hold ? "ev-7" : "ev-6",
      type: "signed",
      timestamp: bumpIso(t, 181500),
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  )
  return trail
}

// 6-event promise-followup-sent trail
function buildPromiseFollowupTrail(args: {
  customerName: string
  startedAt: string
  approver: string
}): AuditEvent[] {
  const t = args.startedAt
  return [
    {
      id: "ev-1",
      type: "promise-recorded",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: `Promise recorded: ${args.customerName} committed to payment`,
    },
    {
      id: "ev-2",
      type: "promise-breached",
      timestamp: bumpIso(t, 86400000),
      actor: "neo",
      description: "Promise breached — no payment on commit date",
    },
    {
      id: "ev-3",
      type: "email-drafted",
      timestamp: bumpIso(t, 86405000),
      actor: "neo",
      description: "Drafted tone-shifted follow-up (firmer)",
      source: "anthropic-claude-sonnet-4-7",
    },
    {
      id: "ev-4",
      type: "human-approved",
      timestamp: bumpIso(t, 86412000),
      actor: "human",
      humanName: args.approver,
      description: `${args.approver} approved follow-up`,
    },
    {
      id: "ev-5",
      type: "email-sent",
      timestamp: bumpIso(t, 86413000),
      actor: "neo",
      description: "Promise-breach follow-up sent",
    },
    {
      id: "ev-6",
      type: "signed",
      timestamp: bumpIso(t, 86413500),
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ]
}

// ════════════════════════════════════════════════════════════════════
// Application records
// ════════════════════════════════════════════════════════════════════

// 11 routine dunning-sent applications (rank 5-26 mostly)
const DUNNING_APPLICATIONS: Application[] = [
  {
    id: "app-northstar-2018-may",
    type: "dunning-sent",
    customerId: "cust-northstar-energy",
    caseId: "case-northstar-energy-may",
    postedAt: "2026-05-15T07:33:09Z",
    hash: "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    auditTrail: buildTier1DunningTrail({
      customerName: "Northstar Energy",
      rank: 5,
      toneRationale: "36-40d pay history; gentle tier-1 is appropriate.",
      toEmail: "daniel.wilcox@northstar-energy.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-15T07:33:00.000Z",
    }),
  },
  {
    id: "app-summit-healthcare-may",
    type: "dunning-sent",
    customerId: "cust-summit-healthcare",
    caseId: "case-summit-healthcare-may",
    postedAt: "2026-05-15T07:33:18Z",
    hash: "b2c3d4e5f6071829a3b4c5d6e7f8091a2b3c4d5e6f70819a2b3c4d5e6f7081a2",
    auditTrail: buildTier1DunningTrail({
      customerName: "Summit Healthcare",
      rank: 6,
      toneRationale: "32-36d normal range; light reminder.",
      toEmail: "aditi.sharma@summithealthcare.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-15T07:33:09.000Z",
    }),
  },
  {
    id: "app-orionstar-software-may",
    type: "dunning-sent",
    customerId: "cust-orionstar-software",
    caseId: "case-orionstar-software-may",
    postedAt: "2026-05-15T07:33:27Z",
    hash: "c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f70",
    auditTrail: buildTier1DunningTrail({
      customerName: "Orionstar Software",
      rank: 7,
      toneRationale: "Slight cadence drift; soft nudge.",
      toEmail: "emiliana@orionstarsoft.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-15T07:33:18.000Z",
    }),
  },
  {
    id: "app-stonebridge-6011-may",
    type: "dunning-sent",
    customerId: "cust-stonebridge-construction",
    caseId: "case-stonebridge-construction-may",
    postedAt: "2026-05-15T07:35:00Z",
    hash: "d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081",
    auditTrail: buildTier2DunningTrail({
      customerName: "Stonebridge Construction",
      rank: 12,
      toneRationale: "Second slip past 60d in 6mo; tier-2 firm reminder.",
      toEmail: "gabriela.mendez@stonebridgeconst.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-15T07:34:50.000Z",
      edited: true,
    }),
  },
  {
    id: "app-harborside-1919-may",
    type: "dunning-sent",
    customerId: "cust-harborside-metals",
    caseId: "case-harborside-metals-may",
    postedAt: "2026-05-15T07:35:12Z",
    hash: "e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a2",
    auditTrail: buildTier2DunningTrail({
      customerName: "Harborside Metals",
      rank: 13,
      toneRationale: "Two prior invoices already 61-90d; pattern deteriorating.",
      toEmail: "devorah.klein@harborsidemetals.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-15T07:35:00.000Z",
    }),
  },
  {
    id: "app-keystone-grocers-may",
    type: "dunning-sent",
    customerId: "cust-keystone-grocers",
    caseId: "case-keystone-grocers-may",
    postedAt: "2026-05-14T09:01:00Z",
    hash: "f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234",
    auditTrail: buildTier1DunningTrail({
      customerName: "Keystone Grocers",
      rank: 8,
      toneRationale: "Slight cadence drift but historically reliable.",
      toEmail: "marisol@keystone-grocers.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-14T09:00:48.000Z",
    }),
  },
  {
    id: "app-cypress-pharma-may",
    type: "dunning-sent",
    customerId: "cust-cypress-pharma",
    caseId: "case-cypress-pharma-may",
    postedAt: "2026-05-14T09:01:12Z",
    hash: "1718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5",
    auditTrail: buildTier1DunningTrail({
      customerName: "Cypress Pharma",
      rank: 9,
      toneRationale: "In-pattern at 32 days.",
      toEmail: "ebabcock@cypress-pharma.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-14T09:01:00.000Z",
    }),
  },
  {
    id: "app-summitline-mfg-yest",
    type: "dunning-sent",
    customerId: "cust-summitline-mfg",
    caseId: "case-summitline-mfg-sent",
    postedAt: "2026-05-14T09:32:00Z",
    hash: "18293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6",
    auditTrail: buildTier1DunningTrail({
      customerName: "Summitline Manufacturing",
      rank: 35,
      toneRationale: "Light tier-1; awaiting response.",
      toEmail: "robert.kershaw@summitlinemfg.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-14T09:31:48.000Z",
    }),
  },
  {
    id: "app-gulfshore-energy-tier2",
    type: "dunning-sent",
    customerId: "cust-gulfshore-energy",
    caseId: "case-gulfshore-energy-sent",
    postedAt: "2026-05-13T10:18:00Z",
    hash: "293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7",
    auditTrail: buildTier2DunningTrail({
      customerName: "Gulfshore Energy",
      rank: 36,
      toneRationale: "Past customer max; firm reminder appropriate.",
      toEmail: "ap@gulfshore-energy.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-13T10:17:48.000Z",
    }),
  },
  {
    id: "app-northeast-supply-may",
    type: "dunning-sent",
    customerId: "cust-northeast-supply",
    caseId: "case-northeast-supply-sent",
    postedAt: "2026-05-14T08:55:00Z",
    hash: "3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8",
    auditTrail: buildTier1DunningTrail({
      customerName: "Northeast Supply",
      rank: 37,
      toneRationale: "Typical pay cadence; light nudge.",
      toEmail: "linda.park@nesupply.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-14T08:54:48.000Z",
    }),
  },
  {
    id: "app-fieldcrest-agri-tier2",
    type: "dunning-sent",
    customerId: "cust-fieldcrest-agri",
    caseId: "case-fieldcrest-agri-sent",
    postedAt: "2026-05-13T07:45:00Z",
    hash: "4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9",
    auditTrail: buildTier2DunningTrail({
      customerName: "Fieldcrest Agri",
      rank: 38,
      toneRationale: "65 days past due; firm reminder + phone follow-up planned.",
      toEmail: "ap@fieldcrest-agri.com",
      approver: "Sasha Patel",
      startedAt: "2026-05-13T07:44:48.000Z",
    }),
  },
]

// 6 dispute-resolved applications
const DISPUTE_APPLICATIONS: Application[] = [
  {
    id: "app-northstar-7001-credit",
    type: "dispute-resolved",
    customerId: "cust-northstar-energy",
    disputeId: "dispute-northstar-7001",
    creditMemoId: "CM-2026-0788",
    postedAt: "2026-05-02T14:23:00Z",
    hash: "5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0",
    auditTrail: buildDisputeResolvedTrail({
      customerName: "Northstar Energy",
      disputeReason: "QTY_SHORT_DELIVERED",
      startedAt: "2026-05-02T12:50:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-driftwood-1414-credit",
    type: "dispute-resolved",
    customerId: "cust-driftwood-hospitality",
    disputeId: "dispute-driftwood-1414",
    creditMemoId: "CM-2026-0795",
    postedAt: "2026-04-28T10:22:00Z",
    hash: "6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1",
    auditTrail: buildDisputeResolvedTrail({
      customerName: "Driftwood Hospitality",
      disputeReason: "PRICE_MISMATCH",
      startedAt: "2026-04-28T08:48:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-cypress-6006-credit",
    type: "dispute-resolved",
    customerId: "cust-cypress-pharma",
    disputeId: "dispute-cypress-6006",
    creditMemoId: "CM-2026-0801",
    postedAt: "2026-04-24T09:43:00Z",
    hash: "7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2",
    auditTrail: buildDisputeResolvedTrail({
      customerName: "Cypress Pharma",
      disputeReason: "LATE_DELIVERY_CREDIT",
      startedAt: "2026-04-24T08:09:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-stonebridge-6011-refused",
    type: "dispute-resolved",
    customerId: "cust-stonebridge-construction",
    disputeId: "dispute-stonebridge-6011",
    postedAt: "2026-04-27T15:50:00Z",
    hash: "8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3",
    auditTrail: buildDisputeResolvedTrail({
      customerName: "Stonebridge Construction",
      disputeReason: "QTY_SHORT_DELIVERED",
      startedAt: "2026-04-27T14:13:00.000Z",
      approver: "Sasha Patel",
      refused: true,
    }),
  },
  {
    id: "app-sundown-7711-refused",
    type: "dispute-resolved",
    customerId: "cust-sundown-printing",
    disputeId: "dispute-sundown-7711",
    postedAt: "2026-04-21T11:30:00Z",
    hash: "9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4",
    auditTrail: buildDisputeResolvedTrail({
      customerName: "Sundown Printing",
      disputeReason: "NO_POD_AVAILABLE",
      startedAt: "2026-04-21T09:53:00.000Z",
      approver: "Sasha Patel",
      refused: true,
    }),
  },
  {
    id: "app-bristol-2222-paid",
    type: "dispute-resolved",
    customerId: "cust-bristol-printing",
    disputeId: "dispute-bristol-2222",
    postedAt: "2026-05-14T15:00:00Z",
    hash: "0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5",
    auditTrail: buildDisputeResolvedTrail({
      customerName: "Bristol Printing",
      disputeReason: "CUSTOMER_DISPUTES_AGREEMENT",
      startedAt: "2026-05-14T13:23:00.000Z",
      approver: "Sasha Patel",
      refused: true,
    }),
  },
]

// 4 credit-memo-issued applications (independent of disputes)
const CREDIT_MEMO_APPLICATIONS: Application[] = [
  {
    id: "app-cm-northstar-0788",
    type: "credit-memo-issued",
    customerId: "cust-northstar-energy",
    creditMemoId: "CM-2026-0788",
    postedAt: "2026-05-02T14:22:30Z",
    hash: "1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6",
    auditTrail: buildCreditMemoTrail({
      customerName: "Northstar Energy",
      amount: 492,
      reason: "QTY_SHORT_DELIVERED",
      startedAt: "2026-05-02T12:51:30.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-cm-driftwood-0795",
    type: "credit-memo-issued",
    customerId: "cust-driftwood-hospitality",
    creditMemoId: "CM-2026-0795",
    postedAt: "2026-04-28T10:21:30Z",
    hash: "2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7",
    auditTrail: buildCreditMemoTrail({
      customerName: "Driftwood Hospitality",
      amount: 2240,
      reason: "PRICE_MISMATCH",
      startedAt: "2026-04-28T08:50:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-cm-cypress-0801",
    type: "credit-memo-issued",
    customerId: "cust-cypress-pharma",
    creditMemoId: "CM-2026-0801",
    postedAt: "2026-04-24T09:42:30Z",
    hash: "3e4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    auditTrail: buildCreditMemoTrail({
      customerName: "Cypress Pharma",
      amount: 1740,
      reason: "LATE_DELIVERY_CREDIT",
      startedAt: "2026-04-24T08:11:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-cm-keystone-0822",
    type: "credit-memo-issued",
    customerId: "cust-keystone-grocers",
    creditMemoId: "CM-2026-0822",
    postedAt: "2026-05-10T16:18:30Z",
    hash: "4f5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
    auditTrail: buildCreditMemoTrail({
      customerName: "Keystone Grocers",
      amount: 880,
      reason: "FREIGHT_CREDIT",
      startedAt: "2026-05-10T14:46:30.000Z",
      approver: "Sasha Patel",
    }),
  },
]

// 4 escalation / account-hold applications
const ESCALATION_APPLICATIONS: Application[] = [
  {
    id: "app-thornwood-thw-5566-escalation",
    type: "escalation-applied",
    customerId: "cust-thornwood-furniture",
    caseId: "case-thornwood-furniture-61d",
    escalationId: "esc-thornwood-tier3",
    postedAt: "2026-05-12T15:30:00Z",
    hash: "5a6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
    auditTrail: buildEscalationTrail({
      customerName: "Thornwood Furniture",
      tier: "tier-3 escalation (phone follow-up)",
      startedAt: "2026-05-12T12:30:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-sundown-snd-7711-escalation",
    type: "escalation-applied",
    customerId: "cust-sundown-printing",
    caseId: "case-sundown-printing-sent",
    escalationId: "esc-sundown-tier3",
    postedAt: "2026-05-12T11:18:00Z",
    hash: "6b7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
    auditTrail: buildEscalationTrail({
      customerName: "Sundown Printing",
      tier: "tier-3 pre-legal escalation",
      startedAt: "2026-05-12T08:18:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-juniperhill-jph-3344-escalation",
    type: "escalation-applied",
    customerId: "cust-juniperhill-feed",
    caseId: "case-juniperhill-feed-sent",
    escalationId: "esc-juniperhill-tier3",
    postedAt: "2026-05-11T09:23:00Z",
    hash: "7c8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    auditTrail: buildEscalationTrail({
      customerName: "Juniperhill Feed",
      tier: "tier-3 pre-legal escalation",
      startedAt: "2026-05-11T06:23:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-tidemark-tdm-5577-hold",
    type: "account-hold-applied",
    customerId: "cust-tidemark-supply",
    caseId: "case-tidemark-supply-investigate",
    escalationId: "esc-tidemark-hold",
    postedAt: "2026-05-09T13:50:00Z",
    hash: "8d9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
    auditTrail: buildEscalationTrail({
      customerName: "Tidemark Supply",
      tier: "account-hold",
      startedAt: "2026-05-09T10:48:00.000Z",
      approver: "Sasha Patel",
      hold: true,
    }),
  },
]

// 3 promise-followup-sent applications
const PROMISE_APPLICATIONS: Application[] = [
  {
    id: "app-atlantic-logistics-promise-followup",
    type: "promise-followup-sent",
    customerId: "cust-atlantic-logistics",
    caseId: "case-atlantic-logistics-promise-breach",
    postedAt: "2026-05-13T07:00:00Z",
    hash: "9e0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
    auditTrail: buildPromiseFollowupTrail({
      customerName: "Atlantic Logistics",
      startedAt: "2026-05-08T07:00:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-coastal-foods-promise-followup",
    type: "promise-followup-sent",
    customerId: "cust-coastal-foods",
    postedAt: "2026-05-06T08:30:00Z",
    hash: "0f1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
    auditTrail: buildPromiseFollowupTrail({
      customerName: "Coastal Foods",
      startedAt: "2026-05-01T08:30:00.000Z",
      approver: "Sasha Patel",
    }),
  },
  {
    id: "app-meridian-financial-promise-followup",
    type: "promise-followup-sent",
    customerId: "cust-meridian-financial",
    postedAt: "2026-05-04T10:15:00Z",
    hash: "1a2b3c4d5e6f7081a234b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
    auditTrail: buildPromiseFollowupTrail({
      customerName: "Meridian Financial",
      startedAt: "2026-04-29T10:15:00.000Z",
      approver: "Sasha Patel",
    }),
  },
]

// ════════════════════════════════════════════════════════════════════
// Combined export
// ════════════════════════════════════════════════════════════════════

export const SEED_APPLICATIONS: Application[] = [
  HERO_APPLICATION,
  ...DUNNING_APPLICATIONS,
  ...DISPUTE_APPLICATIONS,
  ...CREDIT_MEMO_APPLICATIONS,
  ...ESCALATION_APPLICATIONS,
  ...PROMISE_APPLICATIONS,
]

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

const APPLICATION_INDEX: Map<ApplicationId, Application> = new Map(
  SEED_APPLICATIONS.map((a) => [a.id, a]),
)

export function getApplication(id: ApplicationId): Application | undefined {
  return APPLICATION_INDEX.get(id)
}

export function getApplicationsByCustomer(customerId: CustomerId): Application[] {
  return SEED_APPLICATIONS.filter((a) => a.customerId === customerId)
}
