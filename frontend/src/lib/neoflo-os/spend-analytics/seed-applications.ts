// 15 audit-trail records for the spend-analytics workflow.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "seed-applications.ts"
//   + Bundle C brief in docs/plans/2026-05-16-spend-analytics-phase-1-implementation.md.
//
// Composition:
//   - 1 hero deferral batch (`app-deferral-may16-batch-1`, verbatim 5-event trail)
//   - 4 maverick-procurement-notified (Westpoint hero + Rosebrook, Sterling, Blueridge)
//   - 4 dpo-stretch-approved (different vendors, spread across May)
//   - 3 other deferral-batch-approved (earlier in the month)
//   - 2 concentration-acknowledged (Acme + Pacific top-2 reviews)
//   - 1 maverick-override-accepted (CFO keeps Finch with stated reason)
//
// All timestamps fall in May 2026 (demo "now" = 2026-05-16).
// Each application has a distinct 64-char hex hash (varied leading chars).

import type {
  Application,
  ApplicationId,
  ApplicationType,
  AuditEvent,
} from "./types"

// ════════════════════════════════════════════════════════════════════════
// Hero application — verbatim 5-event audit trail per Bundle C spec
// ════════════════════════════════════════════════════════════════════════

const HERO_DEFERRAL_APPLICATION: Application = {
  id: "app-deferral-may16-batch-1",
  type: "deferral-batch-approved",
  postedAt: "2026-05-15T16:24:00Z",
  appliedBy: "Priya Mehta",
  deferralBatchId: "deferral-may30-2026",
  hash: "c8e91f6d3a2b8c4567890abcdef1234567890abcdef1234567890abcdef123456",
  auditTrail: [
    {
      id: "evt-1",
      type: "cashflow-projected",
      timestamp: "2026-05-15T15:42:11.124Z",
      actor: "neo",
      description: "Projected next-30-day net cash position; identified dip at May 30 (−$2.1M)",
      source: "AP ledger · AR forecast · payment-history model",
    },
    {
      id: "evt-2",
      type: "deferral-batch-proposed",
      timestamp: "2026-05-15T15:42:12.018Z",
      actor: "neo",
      description: "Proposed 6-invoice deferral batch ($890K) shifting 4-7 days within terms",
      source: "anthropic-claude-sonnet-4-7",
      reasoning:
        "Per-vendor elasticity scoring identifies low-risk shift candidates. Acme (14d-late avg), Sumitomo (8d-late), Pacific (6d-late) absorb easily. May 30 receipt forecast of $2.1M anchors window. Projected post-deferral net position: −$1.2M (42% improvement).",
    },
    {
      id: "evt-3",
      type: "human-approved",
      timestamp: "2026-05-15T16:24:00.000Z",
      actor: "human",
      humanName: "Priya Mehta",
      description: "Priya approved batch as-proposed, no edits",
    },
    {
      id: "evt-4",
      type: "deferral-batch-approved",
      timestamp: "2026-05-15T16:24:01.000Z",
      actor: "neo",
      description: "Batch applied; flags surfaced to invoice-processing",
    },
    {
      id: "evt-5",
      type: "signed",
      timestamp: "2026-05-15T16:24:02.000Z",
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// Maverick-procurement-notified (4 records)
// ════════════════════════════════════════════════════════════════════════

const MAVERICK_APPLICATIONS: Application[] = [
  // ── Westpoint hero — maverick procurement notification ─────────────────
  {
    id: "app-maverick-westpoint-may15",
    type: "maverick-procurement-notified",
    postedAt: "2026-05-15T14:08:00Z",
    appliedBy: "Priya Mehta",
    maverickId: "maverick-westpoint-q2-2026",
    vendorId: "vendor-westpoint-industrial-tools",
    hash: "a1b2c3d4e5f6789012345678abcdef1234567890fedcba0987654321abcdef99",
    auditTrail: [
      {
        id: "evt-1",
        type: "maverick-detected",
        timestamp: "2026-05-15T13:11:42.221Z",
        actor: "neo",
        description: "Q2 spend pattern flagged: 4 Westpoint POs ($84K, industrial-tools) outside MSA coverage",
        source: "vendor master · Q2 PO history",
      },
      {
        id: "evt-2",
        type: "vendor-switch-recommended",
        timestamp: "2026-05-15T13:11:43.014Z",
        actor: "neo",
        description: "Recommended switch to Northeast Industrial Supply ($21/unit vs $24/unit, 12% savings)",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Northeast MSA (msa-northeast-industrial-tools) is active and covers all 3 BOM lines. Specs match per the BOM mapping (industrial-fasteners-3/8, industrial-fasteners-1/2, industrial-tooling-bits). Buyer likely defaulted to Westpoint via legacy supplier list — procurement update resolves cleanly.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-15T14:07:18.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved drafted procurement email and added Daniel Park to CC",
      },
      {
        id: "evt-4",
        type: "procurement-notified",
        timestamp: "2026-05-15T14:08:00.000Z",
        actor: "neo",
        description: "Procurement notified via email; sourcing event SOURCE-2024-1208 referenced",
        source: "outbox · gmail-api",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-05-15T14:08:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },

  // ── Rosebrook Legal — maverick procurement notification ────────────────
  {
    id: "app-maverick-rosebrook-may10",
    type: "maverick-procurement-notified",
    postedAt: "2026-05-10T11:32:00Z",
    appliedBy: "Priya Mehta",
    maverickId: "maverick-rosebrook-legal-q2-2026",
    vendorId: "vendor-rosebrook-legal",
    hash: "b3a7c891e4f50d2389abc0fedcba12349876543210fedcba0987654321bcde12",
    auditTrail: [
      {
        id: "evt-1",
        type: "maverick-detected",
        timestamp: "2026-05-10T10:48:11.045Z",
        actor: "neo",
        description: "Q2 spend pattern flagged: 3 Rosebrook POs ($42K, professional-services) off preferred Cornerstone MSA",
        source: "vendor master · Legal Ops engagement log",
      },
      {
        id: "evt-2",
        type: "vendor-switch-recommended",
        timestamp: "2026-05-10T10:48:12.213Z",
        actor: "neo",
        description: "Recommended return to Cornerstone Legal ($425/hr vs $500/hr, 15% savings, ~$25K annualized)",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Cornerstone is the preferred counsel of record with an active MSA covering M&A diligence, employment counsel, and commercial review. Engagement types map cleanly; the recent Rosebrook usage likely originated from a specific M&A sprint that wasn't transitioned back.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-10T11:31:42.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved drafted email; CC'd Legal Ops lead",
      },
      {
        id: "evt-4",
        type: "procurement-notified",
        timestamp: "2026-05-10T11:32:00.000Z",
        actor: "neo",
        description: "Procurement + Legal Ops notified via email",
        source: "outbox · gmail-api",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-05-10T11:32:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },

  // ── Sterling SaaS — maverick procurement notification ──────────────────
  {
    id: "app-maverick-sterling-may06",
    type: "maverick-procurement-notified",
    postedAt: "2026-05-06T09:18:00Z",
    appliedBy: "Priya Mehta",
    maverickId: "maverick-sterling-saas-2026",
    vendorId: "vendor-sterling-saas",
    hash: "d92f1e8a47b6c503d0f9876543210abcdef98765432fedcba0987654321def34",
    auditTrail: [
      {
        id: "evt-1",
        type: "maverick-detected",
        timestamp: "2026-05-06T08:42:09.812Z",
        actor: "neo",
        description: "Recurring monthly Sterling subscription flagged; equivalent observability bundled in Summit IT MSA",
        source: "vendor master · Engineering SaaS inventory",
      },
      {
        id: "evt-2",
        type: "vendor-switch-recommended",
        timestamp: "2026-05-06T08:42:10.745Z",
        actor: "neo",
        description: "Recommended consolidation under Summit IT ($78/seat vs $100/seat, 22% savings)",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Feature parity confirmed: Sterling Observability and Summit IT's bundled APM cover the same Datadog-equivalent surface. Migration window ~60 days; consolidate dashboards then let the Sterling contract lapse at May anniversary.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-06T09:17:34.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved with no edits",
      },
      {
        id: "evt-4",
        type: "procurement-notified",
        timestamp: "2026-05-06T09:18:00.000Z",
        actor: "neo",
        description: "Procurement + Engineering Ops notified via email",
        source: "outbox · gmail-api",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-05-06T09:18:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },

  // ── Blueridge Freight — maverick procurement notification ──────────────
  {
    id: "app-maverick-blueridge-may13",
    type: "maverick-procurement-notified",
    postedAt: "2026-05-13T15:44:00Z",
    appliedBy: "Daniel Park",
    maverickId: "maverick-blueridge-freight-2026",
    vendorId: "vendor-blueridge-freight",
    hash: "e57a3c9bd24f01e289abcdef0123456789fedcba9876543210fedcba9876ab45",
    auditTrail: [
      {
        id: "evt-1",
        type: "maverick-detected",
        timestamp: "2026-05-13T14:22:18.301Z",
        actor: "neo",
        description: "3 Blueridge dispatches flagged ($35K Q2, no MSA) on lanes covered by Pacific Logistics",
        source: "vendor master · Pacific MSA lane schedule · Q2 dispatch log",
      },
      {
        id: "evt-2",
        type: "vendor-switch-recommended",
        timestamp: "2026-05-13T14:22:19.114Z",
        actor: "neo",
        description: "Recommended re-routing through Pacific Logistics ($410 vs $500 per shipment, 18% savings)",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Blueridge usage originated from Plant B Logistics dispatching directly during a perceived Pacific capacity squeeze. Pacific confirmed capacity on audit. Process fix: all PNW/Midwest dispatch routes through the freight desk going forward.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-13T15:43:08.000Z",
        actor: "human",
        humanName: "Daniel Park",
        description: "Daniel approved; added freight-desk distro to CC",
      },
      {
        id: "evt-4",
        type: "procurement-notified",
        timestamp: "2026-05-13T15:44:00.000Z",
        actor: "neo",
        description: "Procurement + freight desk notified via email",
        source: "outbox · gmail-api",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-05-13T15:44:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════
// DPO-stretch-approved (4 records, different vendors)
// ════════════════════════════════════════════════════════════════════════

const DPO_STRETCH_APPLICATIONS: Application[] = [
  // ── Sumitomo Heavy stretch ─────────────────────────────────────────────
  {
    id: "app-dpo-sumitomo-may12",
    type: "dpo-stretch-approved",
    postedAt: "2026-05-12T10:32:00Z",
    appliedBy: "Priya Mehta",
    vendorId: "vendor-sumitomo-heavy",
    hash: "f15b9d6a72e30c4d5678901234567890abcdef0123456789abcdef0123456701",
    auditTrail: [
      {
        id: "evt-1",
        type: "dpo-opportunity-identified",
        timestamp: "2026-05-12T09:48:11.402Z",
        actor: "neo",
        description: "Sumitomo Heavy flagged: 5-day stretch within payment-history tolerance, $250K freed",
        source: "AP ledger · payment-history model",
      },
      {
        id: "evt-2",
        type: "working-capital-analyzed",
        timestamp: "2026-05-12T09:48:12.221Z",
        actor: "neo",
        description: "Per-vendor elasticity scoring: Sumitomo pays 4d late on average, 0 disputes 24mo, strong elasticity",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Sumitomo is standard-tier (not strategic), with a consistent 4d-late payment pattern and no dispute history. Stretching 5d on the next payment batch frees $250K with low risk. No single-source exposure.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-12T10:31:42.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved stretch as-proposed",
      },
      {
        id: "evt-4",
        type: "signed",
        timestamp: "2026-05-12T10:32:00.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
  // ── Skyharbor Logistics stretch ────────────────────────────────────────
  {
    id: "app-dpo-skyharbor-may09",
    type: "dpo-stretch-approved",
    postedAt: "2026-05-09T13:18:00Z",
    appliedBy: "Priya Mehta",
    vendorId: "vendor-skyharbor-logistics",
    hash: "29c4e07f8b3a1d6e89abc0fedcba9876543210fedcba9876543210fedcba8a23",
    auditTrail: [
      {
        id: "evt-1",
        type: "dpo-opportunity-identified",
        timestamp: "2026-05-09T12:42:08.115Z",
        actor: "neo",
        description: "Skyharbor flagged: 6-day stretch tolerable, $220K freed",
        source: "AP ledger · payment-history model",
      },
      {
        id: "evt-2",
        type: "working-capital-analyzed",
        timestamp: "2026-05-09T12:42:09.018Z",
        actor: "neo",
        description: "Logistics vendor with 7d-late pattern; high billing tolerance",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Skyharbor's invoices clear with a 7-day cushion in payment history; a 6-day stretch keeps us within that envelope without triggering follow-up. Standard tier, no concentration risk.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-09T13:17:24.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved",
      },
      {
        id: "evt-4",
        type: "signed",
        timestamp: "2026-05-09T13:18:00.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
  // ── Pinewood Supplies stretch ──────────────────────────────────────────
  {
    id: "app-dpo-pinewood-may05",
    type: "dpo-stretch-approved",
    postedAt: "2026-05-05T16:02:00Z",
    appliedBy: "Daniel Park",
    vendorId: "vendor-pinewood-supplies",
    hash: "3df618b9c4e72a05901234567890abcdef0123456789abcdef0123456789cd45",
    auditTrail: [
      {
        id: "evt-1",
        type: "dpo-opportunity-identified",
        timestamp: "2026-05-05T15:24:18.014Z",
        actor: "neo",
        description: "Pinewood Supplies flagged: 5-day stretch within tolerance, $180K freed",
        source: "AP ledger · payment-history model",
      },
      {
        id: "evt-2",
        type: "working-capital-analyzed",
        timestamp: "2026-05-05T15:24:19.114Z",
        actor: "neo",
        description: "Facilities supplier paying 4d late; standard tier; no risk indicators",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Pinewood is a facilities supplier with consistent 4d-late timing, 0 disputes, and no MSA renewal pressure. Standard tier — fits the low-risk stretch profile cleanly.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-05T16:01:11.000Z",
        actor: "human",
        humanName: "Daniel Park",
        description: "Daniel approved",
      },
      {
        id: "evt-4",
        type: "signed",
        timestamp: "2026-05-05T16:02:00.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
  // ── Fairhaven IT stretch ───────────────────────────────────────────────
  {
    id: "app-dpo-fairhaven-may07",
    type: "dpo-stretch-approved",
    postedAt: "2026-05-07T11:14:00Z",
    appliedBy: "Priya Mehta",
    vendorId: "vendor-fairhaven-it",
    hash: "47e91f2d6b8a3c509876543210abcdef0123456789abcdef0123456789abcd67",
    auditTrail: [
      {
        id: "evt-1",
        type: "dpo-opportunity-identified",
        timestamp: "2026-05-07T10:38:18.211Z",
        actor: "neo",
        description: "Fairhaven IT flagged: 5-day stretch tolerable, $140K freed",
        source: "AP ledger · payment-history model",
      },
      {
        id: "evt-2",
        type: "working-capital-analyzed",
        timestamp: "2026-05-07T10:38:19.045Z",
        actor: "neo",
        description: "IT services vendor with 5d-late pattern; strong elasticity",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Fairhaven's standard IT-services contract clears with a 5-day late cushion historically. A 5-day stretch keeps us within that pattern. No risk to renewal or strategic dependencies.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-07T11:13:38.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved",
      },
      {
        id: "evt-4",
        type: "signed",
        timestamp: "2026-05-07T11:14:00.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════
// Earlier deferral-batch-approved records (3)
// ════════════════════════════════════════════════════════════════════════

const EARLIER_DEFERRAL_APPLICATIONS: Application[] = [
  // ── Deferral batch May 8 ───────────────────────────────────────────────
  {
    id: "app-deferral-may08-batch-1",
    type: "deferral-batch-approved",
    postedAt: "2026-05-08T14:52:00Z",
    appliedBy: "Priya Mehta",
    deferralBatchId: "deferral-may22-2026",
    hash: "5a8e2c47d903f1b689abcdef0123456789fedcba9876543210fedcba98765e89",
    auditTrail: [
      {
        id: "evt-1",
        type: "cashflow-projected",
        timestamp: "2026-05-08T14:08:11.018Z",
        actor: "neo",
        description: "Projected dip at May 22 (−$1.4M); proposed 4-invoice batch totaling $520K",
        source: "AP ledger · AR forecast",
      },
      {
        id: "evt-2",
        type: "deferral-batch-proposed",
        timestamp: "2026-05-08T14:08:12.114Z",
        actor: "neo",
        description: "Proposed shifts of 3-5 days within terms; post-deferral net position: −$880K",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Smaller pre-month-end window. Pinewood, Skyharbor, Trailhead, Cascadia absorb shift based on elasticity scoring. 37% improvement vs do-nothing baseline.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-08T14:51:42.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved batch as-proposed",
      },
      {
        id: "evt-4",
        type: "deferral-batch-approved",
        timestamp: "2026-05-08T14:52:00.000Z",
        actor: "neo",
        description: "Batch applied; flags surfaced to invoice-processing",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-05-08T14:52:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
  // ── Deferral batch May 02 ──────────────────────────────────────────────
  {
    id: "app-deferral-may02-batch-1",
    type: "deferral-batch-approved",
    postedAt: "2026-05-02T11:18:00Z",
    appliedBy: "Daniel Park",
    deferralBatchId: "deferral-may15-2026",
    hash: "6b9f3d58e1402c7023456789abcdef0123456789abcdef0123456789ef0125ab",
    auditTrail: [
      {
        id: "evt-1",
        type: "cashflow-projected",
        timestamp: "2026-05-02T10:42:08.214Z",
        actor: "neo",
        description: "Projected dip at May 15 (−$1.1M); proposed 3-invoice batch totaling $410K",
        source: "AP ledger · AR forecast",
      },
      {
        id: "evt-2",
        type: "deferral-batch-proposed",
        timestamp: "2026-05-02T10:42:09.114Z",
        actor: "neo",
        description: "Proposed shifts of 4-6 days; post-deferral net position: −$690K (37% improvement)",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Sumitomo, Skyharbor, Cascadia identified as low-risk shift candidates. Anchored to May 16 customer receipt forecast of $1.5M.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-02T11:17:32.000Z",
        actor: "human",
        humanName: "Daniel Park",
        description: "Daniel approved with no edits",
      },
      {
        id: "evt-4",
        type: "deferral-batch-approved",
        timestamp: "2026-05-02T11:18:00.000Z",
        actor: "neo",
        description: "Batch applied; flags surfaced to invoice-processing",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-05-02T11:18:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
  // ── Deferral batch Apr 28 (carry-over from April planning) ─────────────
  {
    id: "app-deferral-apr28-batch-1",
    type: "deferral-batch-approved",
    postedAt: "2026-04-28T15:42:00Z",
    appliedBy: "Priya Mehta",
    deferralBatchId: "deferral-may10-2026",
    hash: "7c0a4e69f2513081345678901abcdef0123456789abcdef0123456789ab0177c",
    auditTrail: [
      {
        id: "evt-1",
        type: "cashflow-projected",
        timestamp: "2026-04-28T15:08:11.114Z",
        actor: "neo",
        description: "Projected dip at May 10 (−$1.3M); proposed 5-invoice batch totaling $620K",
        source: "AP ledger · AR forecast",
      },
      {
        id: "evt-2",
        type: "deferral-batch-proposed",
        timestamp: "2026-04-28T15:08:12.118Z",
        actor: "neo",
        description: "Proposed shifts of 5-7 days; post-deferral net position: −$680K (48% improvement)",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "5 standard-tier vendors absorbed the shift cleanly. Largest single contributor was Sumitomo at $190K.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-04-28T15:41:42.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya approved",
      },
      {
        id: "evt-4",
        type: "deferral-batch-approved",
        timestamp: "2026-04-28T15:42:00.000Z",
        actor: "neo",
        description: "Batch applied; flags surfaced to invoice-processing",
      },
      {
        id: "evt-5",
        type: "signed",
        timestamp: "2026-04-28T15:42:01.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════
// Concentration-acknowledged (2 records)
// ════════════════════════════════════════════════════════════════════════

const CONCENTRATION_APPLICATIONS: Application[] = [
  // ── Acme acknowledgement (CFO review) ──────────────────────────────────
  {
    id: "app-concentration-acme-may11",
    type: "concentration-acknowledged",
    postedAt: "2026-05-11T17:08:00Z",
    appliedBy: "Daniel Park",
    vendorId: "vendor-acme-industrial-supplies",
    hash: "8d1b5f7a36e24912678901abcdef0123456789abcdef0123456789ab012cdef0",
    auditTrail: [
      {
        id: "evt-1",
        type: "concentration-flagged",
        timestamp: "2026-05-11T16:32:08.114Z",
        actor: "neo",
        description: "Acme Industrial Supplies @ 18% YTD share — above 15% threshold, single-source for 12 SKUs",
        source: "vendor master · spend ledger",
      },
      {
        id: "evt-2",
        type: "working-capital-analyzed",
        timestamp: "2026-05-11T16:32:09.018Z",
        actor: "neo",
        description: "Risk briefing surfaced: industry benchmark 8% per vendor; single-source dependency for critical line items",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Acme concentration is a known strategic dependency tied to multi-year supply agreement. Action items: diversify 4 SKUs to Northeast over Q3, do not stretch DPO, monitor delivery performance monthly.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-11T17:07:24.000Z",
        actor: "human",
        humanName: "Daniel Park",
        description: "Daniel acknowledged concentration; flagged for Q3 sourcing review",
      },
      {
        id: "evt-4",
        type: "signed",
        timestamp: "2026-05-11T17:08:00.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
  // ── Pacific Logistics acknowledgement ──────────────────────────────────
  {
    id: "app-concentration-pacific-may04",
    type: "concentration-acknowledged",
    postedAt: "2026-05-04T13:42:00Z",
    appliedBy: "Priya Mehta",
    vendorId: "vendor-pacific-logistics",
    hash: "9e2c608b471a3523567890abcdef0123456789abcdef0123456789abcd0e123f",
    auditTrail: [
      {
        id: "evt-1",
        type: "concentration-flagged",
        timestamp: "2026-05-04T13:12:08.214Z",
        actor: "neo",
        description: "Pacific Logistics @ 13% YTD share — second-largest concentration, multi-lane dependency",
        source: "vendor master · spend ledger",
      },
      {
        id: "evt-2",
        type: "working-capital-analyzed",
        timestamp: "2026-05-04T13:12:09.114Z",
        actor: "neo",
        description: "Westside Logistics covers ~30% of overlapping lanes as a fallback; not full-coverage backup",
        source: "anthropic-claude-sonnet-4-7",
        reasoning:
          "Pacific is the preferred logistics vendor under an active MSA; concentration is intentional. Action items: maintain Westside as warm secondary, run quarterly continuity drill.",
      },
      {
        id: "evt-3",
        type: "human-approved",
        timestamp: "2026-05-04T13:41:24.000Z",
        actor: "human",
        humanName: "Priya Mehta",
        description: "Priya acknowledged; no action change",
      },
      {
        id: "evt-4",
        type: "signed",
        timestamp: "2026-05-04T13:42:00.000Z",
        actor: "neo",
        description: "SHA-256 hash signed",
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════
// Maverick-override-accepted (1 record) — CFO chose to keep maverick
// ════════════════════════════════════════════════════════════════════════

const MAVERICK_OVERRIDE_APPLICATION: Application = {
  id: "app-maverick-override-finch-may14",
  type: "maverick-override-accepted",
  postedAt: "2026-05-14T10:18:00Z",
  appliedBy: "Daniel Park",
  maverickId: "maverick-finch-stationery-2026",
  vendorId: "vendor-finch-stationery",
  hash: "ae3d712c582b463012345678abcdef0123456789abcdef0123456789ab01f432",
  auditTrail: [
    {
      id: "evt-1",
      type: "maverick-detected",
      timestamp: "2026-05-14T09:48:11.214Z",
      actor: "neo",
      description: "Finch Stationery flagged ($8K Q2 office-supplies) off preferred Keystone MSA",
      source: "vendor master · Coupa reorder defaults",
    },
    {
      id: "evt-2",
      type: "vendor-switch-recommended",
      timestamp: "2026-05-14T09:48:12.014Z",
      actor: "neo",
      description: "Recommended switch to Keystone Office ($17 vs $20 blended, 15% savings, ~$5K/yr)",
      source: "anthropic-claude-sonnet-4-7",
    },
    {
      id: "evt-3",
      type: "human-rejected",
      timestamp: "2026-05-14T10:17:08.000Z",
      actor: "human",
      humanName: "Daniel Park",
      description:
        "Daniel chose to keep Finch — office admin's existing rep relationship and same-day delivery from local Finch warehouse outweigh the $5K/yr saving at this scale.",
    },
    {
      id: "evt-4",
      type: "human-approved",
      timestamp: "2026-05-14T10:17:42.000Z",
      actor: "human",
      humanName: "Daniel Park",
      description: "Override logged with stated reasoning; revisit in Q4 sourcing review",
    },
    {
      id: "evt-5",
      type: "signed",
      timestamp: "2026-05-14T10:18:00.000Z",
      actor: "neo",
      description: "SHA-256 hash signed",
    },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// Combined export + lookups
// ════════════════════════════════════════════════════════════════════════

export const SEED_APPLICATIONS: Application[] = [
  HERO_DEFERRAL_APPLICATION,
  ...MAVERICK_APPLICATIONS,
  ...DPO_STRETCH_APPLICATIONS,
  ...EARLIER_DEFERRAL_APPLICATIONS,
  ...CONCENTRATION_APPLICATIONS,
  MAVERICK_OVERRIDE_APPLICATION,
]

const APPLICATION_INDEX: Record<ApplicationId, Application> = SEED_APPLICATIONS.reduce(
  (acc, a) => {
    acc[a.id] = a
    return acc
  },
  {} as Record<ApplicationId, Application>,
)

export function getApplication(id: ApplicationId): Application | undefined {
  return APPLICATION_INDEX[id]
}

export function getApplicationsByType(type: ApplicationType): Application[] {
  return SEED_APPLICATIONS.filter((a) => a.type === type)
}
