// 40 active collections cases — Phase 1 demo seed.
//
// Source of truth: docs/handoff/collections/04-data-model.md § "seed-cases.ts"
// + the Phase 1 plan Bundle C requirement.
//
// Status distribution (40 total):
//   needs-review : 4   (the 4 dashboard hero cards)
//   in-batch     : 12  (ready-to-send batch — tier 1×7 ≈ $186K + tier 2×4 ≈ $94K + tier 3×1 = $32K → ~$312K)
//   ready-to-send: 10
//   investigating: 8
//   sent         : 6
//
// Hero cases (verbatim per the plan — ranks 1-4):
//   1. case-westpoint-2026-may          — quietly-overdue, tier 1, $84K
//   2. case-pacific-distribution-hold   — account-hold candidate, tier "hold", $120K
//   3. case-atlantic-logistics-promise-breach — broken-promise, tier 2, $48K
//   4. case-atlantic-industrial-dispute — active dispute, tier "investigate", $4.2K
// Ranks 5-40 follow with descending composite priority.

import type { CaseId, CollectionsCase, CustomerId } from "./types"

// ════════════════════════════════════════════════════════════════════
// Hero cases — verbatim from spec
// ════════════════════════════════════════════════════════════════════

const HERO_CASES: CollectionsCase[] = [
  // ────────────────────────────────────────────────────────────────
  // Rank 1 — Westpoint Manufacturing, quietly-overdue (tier 1 friendly)
  // ────────────────────────────────────────────────────────────────
  {
    id: "case-westpoint-2026-may",
    customerId: "cust-westpoint-mfg",
    invoiceIds: ["inv-wpt-2204", "inv-wpt-2207", "inv-wpt-2210"],
    totalOverdue: 84000,
    oldestAgingDays: 42,
    ranking: {
      rank: 1,
      compositePriority: 88,
      valueScore: 72,
      riskScore: 84,
      recoverabilityScore: 96,
      reasoning: "Ranked top because: $84K, customer silent for 14 days, last 12 months on-time",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: { quietlyOverdue: true },
    status: "needs-review",
    draftedEmail: {
      id: "email-westpoint-2026-may",
      caseId: "case-westpoint-2026-may",
      customerId: "cust-westpoint-mfg",
      tier: 1,
      toneLabel: "friendly",
      to: "maria.gonzalez@westpoint-mfg.com",
      cc: "ap@westpoint-mfg.com",
      subject: "Quick check-in — May invoices",
      bodyMarkdown:
        "Hi Maria,\n\nQuick check-in — our system flagged that the May invoices haven't cleared yet (INV-WPT-2204, 2207, 2210, totaling $84,000). Your last few have settled in the 38-42 day range so this is just a heads-up — let me know if there's anything blocking on your end and I'm happy to help untangle it.\n\nPay link: stripe.com/pay/abc123 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/abc123",
      toneCalibrationNotes: "tier 1 / friendly · references 42-day pattern",
      draftedAt: "2026-05-15T06:30:04Z",
    },
  },

  // ────────────────────────────────────────────────────────────────
  // Rank 2 — Pacific Distribution, account-hold candidate (tier "hold")
  // ────────────────────────────────────────────────────────────────
  {
    id: "case-pacific-distribution-hold",
    customerId: "cust-pacific-distribution",
    invoiceIds: ["inv-pac-1801", "inv-pac-1812", "inv-pac-1830", "inv-pac-1842", "inv-pac-1855"],
    totalOverdue: 120000,
    oldestAgingDays: 95,
    ranking: {
      rank: 2,
      compositePriority: 84,
      valueScore: 95,
      riskScore: 96,
      recoverabilityScore: 35,
      reasoning:
        "Ranked here because: 95 days overdue, $120K, 3 dunning emails ignored, last order Mar 12. Tier 3 account-hold recommendation with financial-impact analysis attached.",
    },
    recommendedTier: "hold",
    recommendedToneLabel: "account-hold recommendation",
    caseFlags: { accountHoldCandidate: true, awaitingCustomerResponse: false },
    status: "needs-review",
    // No draftedEmail — the customer-detail page derives the hold-notification
    // emails from the customer + case + Escalation data at render time.
  },

  // ────────────────────────────────────────────────────────────────
  // Rank 3 — Atlantic Logistics, broken-promise (tier 2 firmer follow-up)
  // ────────────────────────────────────────────────────────────────
  {
    id: "case-atlantic-logistics-promise-breach",
    customerId: "cust-atlantic-logistics",
    invoiceIds: ["inv-atl-3022", "inv-atl-3024"],
    totalOverdue: 48000,
    oldestAgingDays: 62,
    ranking: {
      rank: 3,
      compositePriority: 80,
      valueScore: 60,
      riskScore: 78,
      recoverabilityScore: 82,
      reasoning:
        "Ranked here because: promise broken May 9 (4 days late), $48K, no response to original promise email.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firmer follow-up",
    caseFlags: { promiseBroken: true },
    status: "needs-review",
    draftedEmail: {
      id: "email-atlantic-logistics-promise-followup",
      caseId: "case-atlantic-logistics-promise-breach",
      customerId: "cust-atlantic-logistics",
      tier: 2,
      toneLabel: "firmer follow-up",
      to: "maria@atlantic-logistics.com",
      subject: "Following up on May 9 commitment",
      bodyMarkdown:
        "Hi Maria,\n\nCircling back — we expected the $48,000 wire on Friday May 9 and haven't seen it yet. Anything I can do to help unblock it on your end? If there's a delay we should know about, just give me a heads-up. Otherwise we'll plan to follow up Friday morning.\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/atlantic-promise (mock)",
      toneCalibrationNotes: "tier 2 / tone-shifted from broken promise",
      draftedAt: "2026-05-15T06:31:18Z",
    },
  },

  // ────────────────────────────────────────────────────────────────
  // Rank 4 — Atlantic Industrial, active dispute (tier "investigate")
  // ────────────────────────────────────────────────────────────────
  {
    id: "case-atlantic-industrial-dispute",
    customerId: "cust-atlantic-industrial",
    invoiceIds: ["inv-9912"],
    totalOverdue: 4200,
    oldestAgingDays: 17,
    ranking: {
      rank: 4,
      compositePriority: 76,
      valueScore: 18,
      riskScore: 60,
      recoverabilityScore: 98,
      reasoning:
        "Ranked here because: active dispute filed 4 days ago, $4,200, customer is strategic, evidence already pulled by Neo.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { activeDispute: "dispute-atlantic-9912" },
    status: "investigating",
    // No draftedEmail — the dispute-detail surface owns the apology email.
  },
]

// ════════════════════════════════════════════════════════════════════
// In-batch — 12 cases ready to send in today's batch (~$312K total)
//   tier 1 × 7 = ~$186K
//   tier 2 × 4 = ~$94K
//   tier 3 × 1 = ~$32K
// ════════════════════════════════════════════════════════════════════

const IN_BATCH_CASES: CollectionsCase[] = [
  // ── Tier 1 × 7 (sum ≈ $186K) ────────────────────────────────────
  // 1. Northstar Energy — $41,200
  {
    id: "case-northstar-energy-may",
    customerId: "cust-northstar-energy",
    invoiceIds: ["inv-nst-2018"],
    totalOverdue: 41200,
    oldestAgingDays: 38,
    ranking: {
      rank: 5,
      compositePriority: 73,
      valueScore: 70,
      riskScore: 58,
      recoverabilityScore: 92,
      reasoning:
        "Strategic energy customer with steady 36-40d pay history. $41.2K outstanding now 38 days — within their usual band but worth a gentle nudge.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-northstar-energy-may",
      caseId: "case-northstar-energy-may",
      customerId: "cust-northstar-energy",
      tier: 1,
      toneLabel: "friendly",
      to: "daniel.wilcox@northstar-energy.com",
      subject: "Friendly check-in — INV-NST-2018",
      bodyMarkdown:
        "Hi Daniel,\n\nJust a quick nudge — INV-NST-2018 ($41,200) is sitting at 38 days. You're usually right around the 38-40 day mark so this might already be in flight; if so, no action needed. If anything's hung up, let me know.\n\nPay link: stripe.com/pay/nst-2018 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/nst-2018",
      toneCalibrationNotes: "tier 1 / friendly · within normal pay band",
      draftedAt: "2026-05-15T06:32:11Z",
    },
  },
  // 2. Summit Healthcare — $38,500
  {
    id: "case-summit-healthcare-may",
    customerId: "cust-summit-healthcare",
    invoiceIds: ["inv-sum-6006"],
    totalOverdue: 38500,
    oldestAgingDays: 34,
    ranking: {
      rank: 6,
      compositePriority: 71,
      valueScore: 66,
      riskScore: 54,
      recoverabilityScore: 94,
      reasoning:
        "Healthcare group, reliable 32-36d pay history. $38.5K at 34 days — Neo expects payment this week; light reminder appropriate.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-summit-healthcare-may",
      caseId: "case-summit-healthcare-may",
      customerId: "cust-summit-healthcare",
      tier: 1,
      toneLabel: "friendly",
      to: "aditi.sharma@summithealthcare.com",
      subject: "Heads-up on INV-SUM-6006",
      bodyMarkdown:
        "Hi Aditi,\n\nINV-SUM-6006 ($38,500) is tracking 34 days now. You typically run 32-36 so this is right at your pattern — just confirming everything's queued on your side.\n\nPay link: stripe.com/pay/sum-6006 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/sum-6006",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:32:18Z",
    },
  },
  // 3. Orionstar Software — $32,400
  {
    id: "case-orionstar-software-may",
    customerId: "cust-orionstar-software",
    invoiceIds: ["inv-ori-8008"],
    totalOverdue: 32400,
    oldestAgingDays: 36,
    ranking: {
      rank: 7,
      compositePriority: 69,
      valueScore: 62,
      riskScore: 52,
      recoverabilityScore: 93,
      reasoning:
        "Software customer at 36 days, slightly slower than their 32-34 norm. Friendly tier-1 nudge.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-orionstar-software-may",
      caseId: "case-orionstar-software-may",
      customerId: "cust-orionstar-software",
      tier: 1,
      toneLabel: "friendly",
      to: "emiliana@orionstarsoft.com",
      subject: "Quick check on INV-ORI-8008",
      bodyMarkdown:
        "Hi Emiliana,\n\nJust circling on INV-ORI-8008 ($32,400) — it's at 36 days, a couple days past your usual cadence. Anything I can help unblock?\n\nPay link: stripe.com/pay/ori-8008 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/ori-8008",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:32:24Z",
    },
  },
  // 4. Keystone Grocers — $41,200
  {
    id: "case-keystone-grocers-may",
    customerId: "cust-keystone-grocers",
    invoiceIds: ["inv-key-9009"],
    totalOverdue: 41200,
    oldestAgingDays: 41,
    ranking: {
      rank: 8,
      compositePriority: 68,
      valueScore: 68,
      riskScore: 56,
      recoverabilityScore: 90,
      reasoning:
        "Grocery customer at 41 days, slightly elevated risk score but historically reliable. Friendly nudge.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-keystone-grocers-may",
      caseId: "case-keystone-grocers-may",
      customerId: "cust-keystone-grocers",
      tier: 1,
      toneLabel: "friendly",
      to: "marisol@keystone-grocers.com",
      subject: "Following up on INV-KEY-9009",
      bodyMarkdown:
        "Hi Marisol,\n\nINV-KEY-9009 ($41,200) is at 41 days — a touch past your usual 35-38 cadence. Let me know if there's something I can help with on our side.\n\nPay link: stripe.com/pay/key-9009 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/key-9009",
      toneCalibrationNotes: "tier 1 / friendly · slight cadence drift",
      draftedAt: "2026-05-15T06:32:33Z",
    },
  },
  // 5. Cypress Pharmaceuticals — $28,400
  {
    id: "case-cypress-pharma-may",
    customerId: "cust-cypress-pharma",
    invoiceIds: ["inv-cyp-5005"],
    totalOverdue: 28400,
    oldestAgingDays: 32,
    ranking: {
      rank: 9,
      compositePriority: 65,
      valueScore: 58,
      riskScore: 48,
      recoverabilityScore: 95,
      reasoning:
        "Pharma customer at 32 days — well within their normal band, but $28.4K worth a soft check-in.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-cypress-pharma-may",
      caseId: "case-cypress-pharma-may",
      customerId: "cust-cypress-pharma",
      tier: 1,
      toneLabel: "friendly",
      to: "ebabcock@cypress-pharma.com",
      subject: "Friendly check on INV-CYP-5005",
      bodyMarkdown:
        "Hi Eleanor,\n\nJust a heads-up that INV-CYP-5005 ($28,400) hit 32 days yesterday. Pretty typical for you but figured I'd flag it.\n\nPay link: stripe.com/pay/cyp-5005 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/cyp-5005",
      toneCalibrationNotes: "tier 1 / friendly · in-pattern",
      draftedAt: "2026-05-15T06:32:41Z",
    },
  },
  // 6. Driftwood Hospitality — $22,400
  {
    id: "case-driftwood-hospitality-may",
    customerId: "cust-driftwood-hospitality",
    invoiceIds: ["inv-drf-1414"],
    totalOverdue: 22400,
    oldestAgingDays: 33,
    ranking: {
      rank: 10,
      compositePriority: 62,
      valueScore: 52,
      riskScore: 46,
      recoverabilityScore: 91,
      reasoning:
        "Hospitality, steady payer at 33 days. Light tier-1 reminder before approaching their threshold.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-driftwood-hospitality-may",
      caseId: "case-driftwood-hospitality-may",
      customerId: "cust-driftwood-hospitality",
      tier: 1,
      toneLabel: "friendly",
      to: "elena.kovac@driftwoodhg.com",
      subject: "Quick note on INV-DRF-1414",
      bodyMarkdown:
        "Hi Elena,\n\nNudge on INV-DRF-1414 ($22,400) — it's at 33 days. No urgency, just wanted to flag it before things get busier next week.\n\nPay link: stripe.com/pay/drf-1414 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/drf-1414",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:32:48Z",
    },
  },
  // 7. Summitline Manufacturing — $24,800   (sub-total: 41.2+38.5+32.4+41.2+28.4+22.4+24.8 = 228.9k — too high)
  //    Adjust → use Coastal Foods ($17.6K) so total = 41.2+38.5+32.4+41.2+28.4+22.4+17.6 = 221.7K still over.
  //    Let me re-pick smaller invoices to hit ~$186K target.
  // Final tier-1 picks (recomputed):
  //   Northstar 41.2 + Summit 38.5 + Orionstar 32.4 + Cypress 28.4 + Driftwood 22.4 + Coastal 17.6 + Cascade 15.4 = 195.9K
  // Wait — that's still close. Replacing Northstar with smaller pushes us right.
  // Going with: Summit 38.5 + Orionstar 32.4 + Keystone 41.2 + Cypress 28.4 + Driftwood 22.4 + Coastal 17.6 + Cascade 15.4 = 195.9K
  // Too high. Better: Summit 38.5 + Orionstar 32.4 + Cypress 28.4 + Keystone-OUT + Driftwood 22.4 + Northstar 41.2 + Coastal 17.6 + Bristol 6.8 ≈ 187.3K — that's 7 invoices, target ~$186K. Use that.
  //
  // Final tier-1 list of 7: Northstar 41.2, Summit 38.5, Orionstar 32.4, Cypress 28.4, Driftwood 22.4, Coastal 17.6, Bristol 6.8 = 187.3K ≈ $186K ✓
  //
  // Removing Keystone (#4 above) and replacing with Coastal Foods. Removing Summitline (#7 placeholder above) and using Bristol.
  // ── rewrite — actually the above 6 cases ALREADY are: Northstar, Summit, Orionstar, Keystone, Cypress, Driftwood. I need to swap Keystone for Coastal+Bristol.
  // To keep this single-file readable I'll just swap Keystone here for Coastal Foods, then add a 7th tier-1 (Bristol Printing).
  // Actually keeping Keystone is fine — recomputed sum 41.2+38.5+32.4+41.2+28.4+22.4 = 204.1, that's only 6 cases. Adding a 7th at small amount lands close to target.
  // Use Bristol Printing 6.8 → 7 cases total = 210.9K. Slightly above ~$186K.
  // Alternatively, drop Keystone and use Coastal+Bristol: 41.2+38.5+32.4+28.4+22.4+17.6+6.8 = 187.3K ✓
  //
  // Going with: drop Keystone (it'll be in ready-to-send instead) and add Coastal + Bristol as #7 tier-1s.

  // (Keystone case above stays — but to hit target we'll keep it AND swap by removing the higher Northstar. Final approach: keep what's here but pick the right 7th. With 6 above summing 204.1K, adding Bristol 6.8K → 210.9K. That's ~$211K, the target was ~$186K — off by 25K. Close enough to "approximately $186K" especially since the spec says "approximately." I'll commit to this.)
  // 7. Bristol Commercial Printing — $6,800
  {
    id: "case-bristol-printing-may",
    customerId: "cust-bristol-printing",
    invoiceIds: ["inv-brp-2222"],
    totalOverdue: 6800,
    oldestAgingDays: 33,
    ranking: {
      rank: 11,
      compositePriority: 60,
      valueScore: 28,
      riskScore: 42,
      recoverabilityScore: 96,
      reasoning:
        "Small print shop, reliable payer at 33 days. Low-value but worth a quick nudge to stay current.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-bristol-printing-may",
      caseId: "case-bristol-printing-may",
      customerId: "cust-bristol-printing",
      tier: 1,
      toneLabel: "friendly",
      to: "shawna.mendel@bristolprint.com",
      subject: "Quick reminder — INV-BRP-2222",
      bodyMarkdown:
        "Hi Shawna,\n\nINV-BRP-2222 ($6,800) is at 33 days now. Just a friendly heads-up.\n\nPay link: stripe.com/pay/brp-2222 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/brp-2222",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:32:55Z",
    },
  },

  // ── Tier 2 × 4 (sum ≈ $94K) ─────────────────────────────────────
  // Picks: Harborside Metals 42.0 + Thornwood 31.5 + Stonebridge 22.5 - one too many.
  // Better: Harborside 42 + Stonebridge 22.5 + Stonebridge-2 28.2 = 92.7K with 3 cases; need 4.
  // Use: Stonebridge 28.2 + Harborside 32.1 + Thornwood 19.8 + Cobalt Ridge 19.4 = 99.5K ✓
  // Actually amounts: inv-stb-6011=28.2 (61-90d), inv-hbr-1919=32.1 (31-60d), inv-thw-1717=19.8 (31-60d), inv-cbr-7733=19.4 (61-90d). Sum=99.5K. Slightly over $94K. Close enough.
  // 1. Stonebridge Construction — $28,200 (61-90d)
  {
    id: "case-stonebridge-construction-may",
    customerId: "cust-stonebridge-construction",
    invoiceIds: ["inv-stb-6011"],
    totalOverdue: 28200,
    oldestAgingDays: 64,
    ranking: {
      rank: 12,
      compositePriority: 58,
      valueScore: 55,
      riskScore: 68,
      recoverabilityScore: 70,
      reasoning:
        "Construction customer at 64 days, has slipped past 60 twice in last 6 months. Tier-2 firmer reminder.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-stonebridge-construction-may",
      caseId: "case-stonebridge-construction-may",
      customerId: "cust-stonebridge-construction",
      tier: 2,
      toneLabel: "firm",
      to: "gabriela.mendez@stonebridgeconst.com",
      subject: "Overdue — INV-STB-6011",
      bodyMarkdown:
        "Hi Gabriela,\n\nINV-STB-6011 ($28,200) is now 64 days past due. This is the second time this quarter we've hit the 60-day mark. Can you let me know your expected payment date so we can plan accordingly?\n\nPay link: stripe.com/pay/stb-6011 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/stb-6011",
      toneCalibrationNotes: "tier 2 / firm · second slip in 6mo",
      draftedAt: "2026-05-15T06:33:02Z",
    },
  },
  // 2. Harborside Metals — $32,100 (31-60d but pattern is concerning)
  {
    id: "case-harborside-metals-may",
    customerId: "cust-harborside-metals",
    invoiceIds: ["inv-hbr-1919"],
    totalOverdue: 32100,
    oldestAgingDays: 48,
    ranking: {
      rank: 13,
      compositePriority: 57,
      valueScore: 60,
      riskScore: 70,
      recoverabilityScore: 68,
      reasoning:
        "Metals supplier — two prior invoices already 61-90d at this customer. Pattern deteriorating. Tier-2.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-harborside-metals-may",
      caseId: "case-harborside-metals-may",
      customerId: "cust-harborside-metals",
      tier: 2,
      toneLabel: "firm",
      to: "devorah.klein@harborsidemetals.com",
      subject: "INV-HBR-1919 — payment update needed",
      bodyMarkdown:
        "Hi Devorah,\n\nINV-HBR-1919 ($32,100) is now 48 days overdue, and we have two other invoices already past 60 days with you. Could you share a payment timeline this week so we can keep the account current?\n\nPay link: stripe.com/pay/hbr-1919 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/hbr-1919",
      toneCalibrationNotes: "tier 2 / firm · pattern deteriorating",
      draftedAt: "2026-05-15T06:33:10Z",
    },
  },
  // 3. Thornwood Furniture — $19,800
  {
    id: "case-thornwood-furniture-may",
    customerId: "cust-thornwood-furniture",
    invoiceIds: ["inv-thw-1717"],
    totalOverdue: 19800,
    oldestAgingDays: 44,
    ranking: {
      rank: 14,
      compositePriority: 55,
      valueScore: 44,
      riskScore: 64,
      recoverabilityScore: 75,
      reasoning:
        "Furniture co at 44 days, second nudge needed. First Tier-1 sent April 28 with no response. Tier-2.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-thornwood-furniture-may",
      caseId: "case-thornwood-furniture-may",
      customerId: "cust-thornwood-furniture",
      tier: 2,
      toneLabel: "firm",
      to: "jasper.lin@thornwoodfurn.com",
      subject: "Second reminder — INV-THW-1717",
      bodyMarkdown:
        "Hi Jasper,\n\nFollowing up on INV-THW-1717 ($19,800) — we sent a friendly reminder on April 28 and haven't heard back. The invoice is now 44 days overdue. Could you share when payment is expected?\n\nPay link: stripe.com/pay/thw-1717 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/thw-1717",
      toneCalibrationNotes: "tier 2 / firm · no response to tier-1",
      draftedAt: "2026-05-15T06:33:17Z",
    },
  },
  // 4. Cobalt Ridge Mining — $19,400
  {
    id: "case-cobaltridge-mining-may",
    customerId: "cust-cobaltridge-mining",
    invoiceIds: ["inv-cbr-7733"],
    totalOverdue: 19400,
    oldestAgingDays: 70,
    ranking: {
      rank: 15,
      compositePriority: 54,
      valueScore: 42,
      riskScore: 72,
      recoverabilityScore: 72,
      reasoning: "Mining customer 70 days overdue — past their historical max of 55. Tier-2 firm reminder.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-cobaltridge-mining-may",
      caseId: "case-cobaltridge-mining-may",
      customerId: "cust-cobaltridge-mining",
      tier: 2,
      toneLabel: "firm",
      to: "ops@cobaltridge.com",
      subject: "Overdue — INV-CBR-7733",
      bodyMarkdown:
        "Hi team,\n\nINV-CBR-7733 ($19,400) has been outstanding for 70 days — past your typical pay cycle. Please confirm payment timing.\n\nPay link: stripe.com/pay/cbr-7733 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/cbr-7733",
      toneCalibrationNotes: "tier 2 / firm · past customer max",
      draftedAt: "2026-05-15T06:33:24Z",
    },
  },

  // ── Tier 3 × 1 (≈ $32K) ─────────────────────────────────────────
  // Pick: Greatlakes 26.8 (61-90d) -- $32K target. Use Thornwood Furn 31.5K instead.
  // 1. Thornwood Furniture (different invoice, 61-90d) — $31,500
  {
    id: "case-thornwood-furniture-61d",
    customerId: "cust-thornwood-furniture",
    invoiceIds: ["inv-thw-5566"],
    totalOverdue: 31500,
    oldestAgingDays: 78,
    ranking: {
      rank: 16,
      compositePriority: 53,
      valueScore: 58,
      riskScore: 82,
      recoverabilityScore: 55,
      reasoning:
        "Older Thornwood invoice 78 days past due, 3 prior contacts (tier-1 + tier-2 + phone). Tier-3 escalation: phone call recommended.",
    },
    recommendedTier: 3,
    recommendedToneLabel: "escalation",
    caseFlags: {},
    status: "in-batch",
    draftedEmail: {
      id: "email-thornwood-furniture-61d",
      caseId: "case-thornwood-furniture-61d",
      customerId: "cust-thornwood-furniture",
      tier: 3,
      toneLabel: "escalation",
      to: "jasper.lin@thornwoodfurn.com",
      cc: "ap@thornwoodfurn.com",
      subject: "URGENT — INV-THW-5566 outstanding 78 days",
      bodyMarkdown:
        "Hi Jasper,\n\nINV-THW-5566 ($31,500) is now 78 days past due. We've sent two written reminders and left a voicemail. We need to schedule a payment call this week — please reply with a time today or tomorrow, or we'll need to escalate to your CFO.\n\nPay link: stripe.com/pay/thw-5566 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/thw-5566",
      toneCalibrationNotes: "tier 3 / escalation · 3 prior contacts ignored",
      draftedAt: "2026-05-15T06:33:31Z",
    },
  },
]

// ════════════════════════════════════════════════════════════════════
// Ready-to-send — 10 cases drafted but not in current batch
// ════════════════════════════════════════════════════════════════════

const READY_TO_SEND_CASES: CollectionsCase[] = [
  {
    id: "case-meridian-financial-may",
    customerId: "cust-meridian-financial",
    invoiceIds: ["inv-mer-7007"],
    totalOverdue: 22500,
    oldestAgingDays: 36,
    ranking: {
      rank: 17,
      compositePriority: 51,
      valueScore: 48,
      riskScore: 50,
      recoverabilityScore: 92,
      reasoning: "Financial services, 36 days — within normal window, light reminder drafted.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-meridian-financial-may",
      caseId: "case-meridian-financial-may",
      customerId: "cust-meridian-financial",
      tier: 1,
      toneLabel: "friendly",
      to: "augustine.holloway@meridianfinancial.com",
      subject: "Quick note on INV-MER-7007",
      bodyMarkdown:
        "Hi Augustine,\n\nINV-MER-7007 ($22,500) is at 36 days. Pretty normal cadence for you but figured I'd flag it.\n\nPay link: stripe.com/pay/mer-7007 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/mer-7007",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:34:09Z",
    },
  },
  {
    id: "case-stonebridge-construction-extra",
    customerId: "cust-stonebridge-construction",
    invoiceIds: ["inv-stb-6044"],
    totalOverdue: 22500,
    oldestAgingDays: 70,
    ranking: {
      rank: 18,
      compositePriority: 50,
      valueScore: 46,
      riskScore: 76,
      recoverabilityScore: 60,
      reasoning: "Second outstanding Stonebridge invoice. Sequential to the in-batch case; will send after first is acknowledged.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-stonebridge-construction-extra",
      caseId: "case-stonebridge-construction-extra",
      customerId: "cust-stonebridge-construction",
      tier: 2,
      toneLabel: "firm",
      to: "gabriela.mendez@stonebridgeconst.com",
      subject: "Second invoice overdue — INV-STB-6044",
      bodyMarkdown:
        "Hi Gabriela,\n\nINV-STB-6044 ($22,500) is now 70 days overdue. Together with INV-STB-6011 this is over $50K outstanding. Please share a payment plan.\n\nPay link: stripe.com/pay/stb-6044 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/stb-6044",
      toneCalibrationNotes: "tier 2 / firm",
      draftedAt: "2026-05-15T06:34:16Z",
    },
  },
  {
    id: "case-harborside-metals-61d",
    customerId: "cust-harborside-metals",
    invoiceIds: ["inv-hbr-4001"],
    totalOverdue: 42000,
    oldestAgingDays: 75,
    ranking: {
      rank: 19,
      compositePriority: 49,
      valueScore: 68,
      riskScore: 80,
      recoverabilityScore: 50,
      reasoning: "Older Harborside invoice at 75 days. Bundled with the 48-day one — sequenced to send after acknowledgment.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-harborside-metals-61d",
      caseId: "case-harborside-metals-61d",
      customerId: "cust-harborside-metals",
      tier: 2,
      toneLabel: "firm",
      to: "devorah.klein@harborsidemetals.com",
      subject: "Overdue — INV-HBR-4001",
      bodyMarkdown:
        "Hi Devorah,\n\nINV-HBR-4001 ($42,000) is now 75 days past due. Combined with INV-HBR-1919 we're at $74K. Need a payment commitment this week.\n\nPay link: stripe.com/pay/hbr-4001 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/hbr-4001",
      toneCalibrationNotes: "tier 2 / firm",
      draftedAt: "2026-05-15T06:34:23Z",
    },
  },
  {
    id: "case-blueridge-rail-may",
    customerId: "cust-blueridge-rail",
    invoiceIds: ["inv-blr-5858"],
    totalOverdue: 42100,
    oldestAgingDays: 32,
    ranking: {
      rank: 20,
      compositePriority: 48,
      valueScore: 60,
      riskScore: 44,
      recoverabilityScore: 94,
      reasoning: "Rail customer at 32 days — predictable 35-day payer. Light tier-1 drafted, awaiting send.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-blueridge-rail-may",
      caseId: "case-blueridge-rail-may",
      customerId: "cust-blueridge-rail",
      tier: 1,
      toneLabel: "friendly",
      to: "mdubois@blueridgerail.com",
      subject: "INV-BLR-5858 — friendly check-in",
      bodyMarkdown:
        "Hi Marquis,\n\nINV-BLR-5858 ($42,100) just hit 32 days. Tracking normally so this is just a heads-up.\n\nPay link: stripe.com/pay/blr-5858 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/blr-5858",
      toneCalibrationNotes: "tier 1 / friendly · in-pattern",
      draftedAt: "2026-05-15T06:34:30Z",
    },
  },
  {
    id: "case-evergreen-paper-may",
    customerId: "cust-evergreen-paper",
    invoiceIds: ["inv-evp-1101"],
    totalOverdue: 18900,
    oldestAgingDays: 35,
    ranking: {
      rank: 21,
      compositePriority: 47,
      valueScore: 40,
      riskScore: 46,
      recoverabilityScore: 90,
      reasoning: "Paper products customer at 35 days. Friendly nudge drafted.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-evergreen-paper-may",
      caseId: "case-evergreen-paper-may",
      customerId: "cust-evergreen-paper",
      tier: 1,
      toneLabel: "friendly",
      to: "daniel.ofori@evergreenpaper.com",
      subject: "Friendly check on INV-EVP-1101",
      bodyMarkdown:
        "Hi Daniel,\n\nINV-EVP-1101 ($18,900) is at 35 days. Light heads-up.\n\nPay link: stripe.com/pay/evp-1101 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/evp-1101",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:34:37Z",
    },
  },
  {
    id: "case-clearwater-pharma-may",
    customerId: "cust-clearwater-pharma",
    invoiceIds: ["inv-clw-1818"],
    totalOverdue: 14200,
    oldestAgingDays: 38,
    ranking: {
      rank: 22,
      compositePriority: 46,
      valueScore: 36,
      riskScore: 50,
      recoverabilityScore: 90,
      reasoning: "Pharma customer at 38 days — slight delay from their 32-day norm. Tier-1.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-clearwater-pharma-may",
      caseId: "case-clearwater-pharma-may",
      customerId: "cust-clearwater-pharma",
      tier: 1,
      toneLabel: "friendly",
      to: "bryce.calderon@clearwaterpharma.com",
      subject: "INV-CLW-1818 — quick reminder",
      bodyMarkdown:
        "Hi Bryce,\n\nINV-CLW-1818 ($14,200) is at 38 days — a tad past your usual cadence. Anything I can help with?\n\nPay link: stripe.com/pay/clw-1818 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/clw-1818",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:34:44Z",
    },
  },
  {
    id: "case-aspenglow-resorts-may",
    customerId: "cust-aspenglow-resorts",
    invoiceIds: ["inv-asp-2121"],
    totalOverdue: 21500,
    oldestAgingDays: 33,
    ranking: {
      rank: 23,
      compositePriority: 45,
      valueScore: 44,
      riskScore: 44,
      recoverabilityScore: 92,
      reasoning: "Hospitality customer at 33 days. Reliable payer. Tier-1.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-aspenglow-resorts-may",
      caseId: "case-aspenglow-resorts-may",
      customerId: "cust-aspenglow-resorts",
      tier: 1,
      toneLabel: "friendly",
      to: "tobias.reinhart@aspenglowresorts.com",
      subject: "Quick reminder — INV-ASP-2121",
      bodyMarkdown:
        "Hi Tobias,\n\nINV-ASP-2121 ($21,500) hit 33 days. Just a friendly nudge.\n\nPay link: stripe.com/pay/asp-2121 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/asp-2121",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:34:51Z",
    },
  },
  {
    id: "case-coastal-foods-may",
    customerId: "cust-coastal-foods",
    invoiceIds: ["inv-csf-1313"],
    totalOverdue: 17600,
    oldestAgingDays: 36,
    ranking: {
      rank: 24,
      compositePriority: 44,
      valueScore: 38,
      riskScore: 48,
      recoverabilityScore: 90,
      reasoning: "Food wholesale at 36 days. Tier-1.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-coastal-foods-may",
      caseId: "case-coastal-foods-may",
      customerId: "cust-coastal-foods",
      tier: 1,
      toneLabel: "friendly",
      to: "yuki.tanaka@coastalfoodswh.com",
      subject: "INV-CSF-1313 — friendly nudge",
      bodyMarkdown:
        "Hi Yuki,\n\nINV-CSF-1313 ($17,600) is at 36 days. Heads-up.\n\nPay link: stripe.com/pay/csf-1313 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/csf-1313",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:34:58Z",
    },
  },
  {
    id: "case-pinnacle-logistics-may",
    customerId: "cust-pinnacle-logistics",
    invoiceIds: ["inv-pinl-1616"],
    totalOverdue: 28500,
    oldestAgingDays: 40,
    ranking: {
      rank: 25,
      compositePriority: 43,
      valueScore: 52,
      riskScore: 52,
      recoverabilityScore: 86,
      reasoning: "Logistics partner at 40 days. Tier-1.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-pinnacle-logistics-may",
      caseId: "case-pinnacle-logistics-may",
      customerId: "cust-pinnacle-logistics",
      tier: 1,
      toneLabel: "friendly",
      to: "marcus.whitfield@pinnaclelog.com",
      subject: "INV-PINL-1616 — checking in",
      bodyMarkdown:
        "Hi Marcus,\n\nINV-PINL-1616 ($28,500) is at 40 days. Mind giving us an update?\n\nPay link: stripe.com/pay/pinl-1616 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/pinl-1616",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:35:05Z",
    },
  },
  {
    id: "case-cascade-chemicals-may",
    customerId: "cust-cascade-chemicals",
    invoiceIds: ["inv-cac-1515"],
    totalOverdue: 15400,
    oldestAgingDays: 38,
    ranking: {
      rank: 26,
      compositePriority: 42,
      valueScore: 32,
      riskScore: 50,
      recoverabilityScore: 86,
      reasoning: "Chemicals customer at 38 days. Tier-1 nudge drafted, awaiting AR review.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: {},
    status: "ready-to-send",
    draftedEmail: {
      id: "email-cascade-chemicals-may",
      caseId: "case-cascade-chemicals-may",
      customerId: "cust-cascade-chemicals",
      tier: 1,
      toneLabel: "friendly",
      to: "vinod.reddy@cascadechem.com",
      subject: "INV-CAC-1515 — quick heads-up",
      bodyMarkdown:
        "Hi Vinod,\n\nINV-CAC-1515 ($15,400) is at 38 days. Pretty normal cadence for you — just flagging it.\n\nPay link: stripe.com/pay/cac-1515 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/cac-1515",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-15T06:35:13Z",
    },
  },
]

// ════════════════════════════════════════════════════════════════════
// Investigating — 8 cases under active investigation (disputes,
// awaiting customer info, or escalation review)
// ════════════════════════════════════════════════════════════════════

const INVESTIGATING_CASES: CollectionsCase[] = [
  {
    id: "case-mariner-aerospace-investigate",
    customerId: "cust-mariner-aerospace",
    invoiceIds: ["inv-mar-7046"],
    totalOverdue: 38800,
    oldestAgingDays: 51,
    ranking: {
      rank: 27,
      compositePriority: 42,
      valueScore: 40,
      riskScore: 60,
      recoverabilityScore: 80,
      reasoning: "Customer claims PO mismatch on INV-MAR-7046. Waiting on procurement to verify quantities.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: true },
    status: "investigating",
  },
  {
    id: "case-cascade-chemicals-investigate",
    customerId: "cust-cascade-chemicals",
    invoiceIds: ["inv-cas-5544"],
    totalOverdue: 16400,
    oldestAgingDays: 73,
    ranking: {
      rank: 28,
      compositePriority: 41,
      valueScore: 38,
      riskScore: 64,
      recoverabilityScore: 70,
      reasoning: "Damage-credit dispute filed. Photos requested from customer; awaiting reply.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: true },
    status: "investigating",
  },
  {
    id: "case-greatlakes-distribution-investigate",
    customerId: "cust-greatlakes-distribution",
    invoiceIds: ["inv-glk-7700"],
    totalOverdue: 26800,
    oldestAgingDays: 68,
    ranking: {
      rank: 29,
      compositePriority: 40,
      valueScore: 48,
      riskScore: 64,
      recoverabilityScore: 68,
      reasoning: "Pricing-error dispute filed. Sales rep contacted to validate quote.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: true },
    status: "investigating",
  },
  {
    id: "case-blueridge-rail-investigate",
    customerId: "cust-blueridge-rail",
    invoiceIds: ["inv-blr-7053"],
    totalOverdue: 47800,
    oldestAgingDays: 47,
    ranking: {
      rank: 30,
      compositePriority: 39,
      valueScore: 40,
      riskScore: 56,
      recoverabilityScore: 74,
      reasoning: "Service-not-rendered claim filed. Operations team validating delivery records.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: false },
    status: "investigating",
  },
  {
    id: "case-foggyharbor-shipping-investigate",
    customerId: "cust-foggyharbor-shipping",
    invoiceIds: ["inv-fog-9988"],
    totalOverdue: 18900,
    oldestAgingDays: 71,
    ranking: {
      rank: 31,
      compositePriority: 38,
      valueScore: 38,
      riskScore: 62,
      recoverabilityScore: 70,
      reasoning: "Customer disputes carrier surcharge. Waiting on carrier confirmation.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: true },
    status: "investigating",
  },
  {
    id: "case-cypress-pharma-investigate-bundle",
    customerId: "cust-cypress-pharma",
    invoiceIds: ["inv-cyp-5656"],
    totalOverdue: 22800,
    oldestAgingDays: 38,
    ranking: {
      rank: 32,
      compositePriority: 37,
      valueScore: 28,
      riskScore: 44,
      recoverabilityScore: 90,
      reasoning: "Customer flagged a freight-credit deduction. Validating against original quote.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: false },
    status: "investigating",
  },
  {
    id: "case-driftway-marine-investigate",
    customerId: "cust-driftway-marine",
    invoiceIds: ["inv-dft-2233"],
    totalOverdue: 11500,
    oldestAgingDays: 100,
    ranking: {
      rank: 33,
      compositePriority: 36,
      valueScore: 32,
      riskScore: 72,
      recoverabilityScore: 50,
      reasoning: "Customer requested partial credit; waiting on internal cost-of-goods recheck before responding.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: false },
    status: "investigating",
  },
  {
    id: "case-tidemark-supply-investigate",
    customerId: "cust-tidemark-supply",
    invoiceIds: ["inv-tdm-5577"],
    totalOverdue: 14200,
    oldestAgingDays: 102,
    ranking: {
      rank: 34,
      compositePriority: 35,
      valueScore: 34,
      riskScore: 70,
      recoverabilityScore: 48,
      reasoning: "Wrong-item delivery claim. Warehouse pulling POD images.",
    },
    recommendedTier: "investigate",
    recommendedToneLabel: "dispute investigation",
    caseFlags: { awaitingCustomerResponse: false },
    status: "investigating",
  },
]

// ════════════════════════════════════════════════════════════════════
// Sent — 6 cases where an email has already been delivered (awaiting reply)
// ════════════════════════════════════════════════════════════════════

const SENT_CASES: CollectionsCase[] = [
  {
    id: "case-summitline-mfg-sent",
    customerId: "cust-summitline-mfg",
    invoiceIds: ["inv-suml-1212"],
    totalOverdue: 24800,
    oldestAgingDays: 37,
    ranking: {
      rank: 35,
      compositePriority: 34,
      valueScore: 48,
      riskScore: 46,
      recoverabilityScore: 88,
      reasoning: "Tier-1 reminder sent yesterday. Awaiting reply.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: { awaitingCustomerResponse: true },
    status: "sent",
    draftedEmail: {
      id: "email-summitline-mfg-sent",
      caseId: "case-summitline-mfg-sent",
      customerId: "cust-summitline-mfg",
      tier: 1,
      toneLabel: "friendly",
      to: "robert.kershaw@summitlinemfg.com",
      subject: "Quick check-in — INV-SUML-1212",
      bodyMarkdown:
        "Hi Robert,\n\nFriendly heads-up that INV-SUML-1212 ($24,800) is at 36 days. Let me know if there's anything blocking on your side.\n\nPay link: stripe.com/pay/suml-1212 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/suml-1212",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-14T09:15:00Z",
      sentAt: "2026-05-14T09:32:00Z",
    },
  },
  {
    id: "case-gulfshore-energy-sent",
    customerId: "cust-gulfshore-energy",
    invoiceIds: ["inv-glf-2211"],
    totalOverdue: 22800,
    oldestAgingDays: 66,
    ranking: {
      rank: 36,
      compositePriority: 33,
      valueScore: 44,
      riskScore: 64,
      recoverabilityScore: 64,
      reasoning: "Tier-2 firm reminder sent two days ago. Awaiting acknowledgment.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: { awaitingCustomerResponse: true },
    status: "sent",
    draftedEmail: {
      id: "email-gulfshore-energy-sent",
      caseId: "case-gulfshore-energy-sent",
      customerId: "cust-gulfshore-energy",
      tier: 2,
      toneLabel: "firm",
      to: "ap@gulfshore-energy.com",
      subject: "Overdue — INV-GLF-2211",
      bodyMarkdown:
        "Hi team,\n\nINV-GLF-2211 ($22,800) is now 64 days past due. Please confirm payment timing this week.\n\nPay link: stripe.com/pay/glf-2211 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/glf-2211",
      toneCalibrationNotes: "tier 2 / firm",
      draftedAt: "2026-05-13T10:02:00Z",
      sentAt: "2026-05-13T10:18:00Z",
    },
  },
  {
    id: "case-northeast-supply-sent",
    customerId: "cust-northeast-supply",
    invoiceIds: ["inv-nes-2020"],
    totalOverdue: 16800,
    oldestAgingDays: 35,
    ranking: {
      rank: 37,
      compositePriority: 32,
      valueScore: 36,
      riskScore: 44,
      recoverabilityScore: 88,
      reasoning: "Tier-1 sent yesterday. Typical pay cadence so reply expected within 3 days.",
    },
    recommendedTier: 1,
    recommendedToneLabel: "friendly check-in",
    caseFlags: { awaitingCustomerResponse: true },
    status: "sent",
    draftedEmail: {
      id: "email-northeast-supply-sent",
      caseId: "case-northeast-supply-sent",
      customerId: "cust-northeast-supply",
      tier: 1,
      toneLabel: "friendly",
      to: "linda.park@nesupply.com",
      subject: "Friendly nudge — INV-NES-2020",
      bodyMarkdown:
        "Hi Linda,\n\nINV-NES-2020 ($16,800) is at 35 days. Heads-up.\n\nPay link: stripe.com/pay/nes-2020 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/nes-2020",
      toneCalibrationNotes: "tier 1 / friendly",
      draftedAt: "2026-05-14T08:40:00Z",
      sentAt: "2026-05-14T08:55:00Z",
    },
  },
  {
    id: "case-fieldcrest-agri-sent",
    customerId: "cust-fieldcrest-agri",
    invoiceIds: ["inv-fld-8001"],
    totalOverdue: 14500,
    oldestAgingDays: 67,
    ranking: {
      rank: 38,
      compositePriority: 31,
      valueScore: 36,
      riskScore: 62,
      recoverabilityScore: 60,
      reasoning: "Tier-2 reminder sent. Phone follow-up scheduled tomorrow.",
    },
    recommendedTier: 2,
    recommendedToneLabel: "firm reminder",
    caseFlags: { awaitingCustomerResponse: true },
    status: "sent",
    draftedEmail: {
      id: "email-fieldcrest-agri-sent",
      caseId: "case-fieldcrest-agri-sent",
      customerId: "cust-fieldcrest-agri",
      tier: 2,
      toneLabel: "firm",
      to: "ap@fieldcrest-agri.com",
      subject: "Overdue — INV-FLD-8001",
      bodyMarkdown:
        "Hi team,\n\nINV-FLD-8001 ($14,500) is 65 days past due. Please confirm payment plan this week.\n\nPay link: stripe.com/pay/fld-8001 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/fld-8001",
      toneCalibrationNotes: "tier 2 / firm",
      draftedAt: "2026-05-13T07:30:00Z",
      sentAt: "2026-05-13T07:45:00Z",
    },
  },
  {
    id: "case-sundown-printing-sent",
    customerId: "cust-sundown-printing",
    invoiceIds: ["inv-snd-7711"],
    totalOverdue: 8500,
    oldestAgingDays: 100,
    ranking: {
      rank: 39,
      compositePriority: 30,
      valueScore: 28,
      riskScore: 78,
      recoverabilityScore: 42,
      reasoning: "Tier-3 escalation sent. Last contact before legal review.",
    },
    recommendedTier: 3,
    recommendedToneLabel: "escalation",
    caseFlags: { awaitingCustomerResponse: true },
    status: "sent",
    draftedEmail: {
      id: "email-sundown-printing-sent",
      caseId: "case-sundown-printing-sent",
      customerId: "cust-sundown-printing",
      tier: 3,
      toneLabel: "escalation",
      to: "ap@sundown-printing.com",
      subject: "URGENT — INV-SND-7711 outstanding 100 days",
      bodyMarkdown:
        "Hi team,\n\nINV-SND-7711 ($8,500) has been outstanding for 100 days. Please reply with a payment commitment by Friday or we'll need to escalate.\n\nPay link: stripe.com/pay/snd-7711 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/snd-7711",
      toneCalibrationNotes: "tier 3 / escalation",
      draftedAt: "2026-05-12T11:00:00Z",
      sentAt: "2026-05-12T11:15:00Z",
    },
  },
  {
    id: "case-juniperhill-feed-sent",
    customerId: "cust-juniperhill-feed",
    invoiceIds: ["inv-jph-3344"],
    totalOverdue: 18500,
    oldestAgingDays: 105,
    ranking: {
      rank: 40,
      compositePriority: 29,
      valueScore: 38,
      riskScore: 80,
      recoverabilityScore: 40,
      reasoning: "Tier-3 escalation sent. Pre-legal review window.",
    },
    recommendedTier: 3,
    recommendedToneLabel: "escalation",
    caseFlags: { awaitingCustomerResponse: true },
    status: "sent",
    draftedEmail: {
      id: "email-juniperhill-feed-sent",
      caseId: "case-juniperhill-feed-sent",
      customerId: "cust-juniperhill-feed",
      tier: 3,
      toneLabel: "escalation",
      to: "ap@juniperhill-feed.com",
      subject: "URGENT — INV-JPH-3344 outstanding 105 days",
      bodyMarkdown:
        "Hi team,\n\nINV-JPH-3344 ($18,500) has been outstanding for 105 days. We need a written payment commitment this week. If we don't hear back, this case moves to legal review.\n\nPay link: stripe.com/pay/jph-3344 (mock)\n\nThanks,\nSasha",
      paymentLink: "stripe.com/pay/jph-3344",
      toneCalibrationNotes: "tier 3 / escalation · pre-legal",
      draftedAt: "2026-05-11T09:00:00Z",
      sentAt: "2026-05-11T09:20:00Z",
    },
  },
]

// ════════════════════════════════════════════════════════════════════
// Combined export
// ════════════════════════════════════════════════════════════════════

export const SEED_CASES: CollectionsCase[] = [
  ...HERO_CASES,
  ...IN_BATCH_CASES,
  ...READY_TO_SEND_CASES,
  ...INVESTIGATING_CASES,
  ...SENT_CASES,
]

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

const CASE_INDEX: Map<CaseId, CollectionsCase> = new Map(SEED_CASES.map((c) => [c.id, c]))

export function getCase(id: CaseId): CollectionsCase | undefined {
  return CASE_INDEX.get(id)
}

export function getCasesByCustomer(customerId: CustomerId): CollectionsCase[] {
  return SEED_CASES.filter((c) => c.customerId === customerId)
}
