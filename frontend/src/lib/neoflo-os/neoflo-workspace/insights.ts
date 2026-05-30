// lib/neoflo-workspace/insights.ts
//
// Strategic insights surfaced by Neo at /neoflo-workspace/insights.
// Each insight is a pattern Neo noticed across multiple systems
// (NetSuite, bank feeds, contracts, vendor master, customer health,
// FX positions, etc.) and is tagged with the personas it matters to.
//
// Unlike briefing action items — which are tactical "do this today"
// queue entries — insights are strategic: "Neo noticed X; want to talk
// about it?". They open the chat with a pre-seeded prompt rather than
// linking into a workflow surface.

import type { PersonaId } from "./personas"

export type InsightCategory =
  | "working-capital"
  | "cost-reduction"
  | "risk"
  | "vendor-strategy"
  | "customer-strategy"
  | "close-efficiency"
  | "compliance"
  | "strategic"

export interface InsightImpact {
  /** Headline value, e.g. "$1.8M" or "+4 days" */
  value: string
  /** Short label, e.g. "trapped working capital" */
  label: string
  /** Direction — drives tint of the impact pill */
  tone: "positive" | "negative" | "neutral"
}

export interface Insight {
  /** Stable id */
  id: string
  /** Topical bucket — shown as a small uppercase pill on the card */
  category: InsightCategory
  /** Headline — one assertive sentence ("Q2 working capital trapped by JPM rec latency") */
  headline: string
  /** Body — 2-3 lines of analysis that explain what Neo saw and why it matters */
  analysis: string
  /** Systems / artifacts Neo consulted to find this pattern */
  dataSources: string[]
  /** Personas this insight is relevant to. Filtering mirrors briefing/feed. */
  relevantPersonas: PersonaId[]
  /** Optional impact callout shown bottom-right */
  impact?: InsightImpact
  /** Pre-seeded chat prompt when the user clicks "Explore with Neo" */
  chatPrompt: string
}

export const INSIGHT_CATEGORY_LABEL: Record<InsightCategory, string> = {
  "working-capital": "Working capital",
  "cost-reduction": "Cost reduction",
  risk: "Risk",
  "vendor-strategy": "Vendor strategy",
  "customer-strategy": "Customer strategy",
  "close-efficiency": "Close efficiency",
  compliance: "Compliance",
  strategic: "Strategic",
}

export const SEED_INSIGHTS: Insight[] = [
  // ───────────────────────────────────────────────────────────────
  // CFO-anchored insights
  // ───────────────────────────────────────────────────────────────
  {
    id: "insight-cfo-working-capital-stretch",
    category: "working-capital",
    headline: "$1.8M working capital is sitting on the table — 12 vendors can absorb a DPO stretch with no relationship risk",
    analysis:
      "I ran the concentration analysis across 47 active suppliers. 12 of them — averaging 18 months of clean payment history and zero churn signals — can absorb a DPO 38→42 stretch without escalation. Estimated cash release: $1.8M against next quarter's working capital target.",
    dataSources: ["NetSuite AP", "Vendor master", "MSA terms", "Payment history (24 mo)"],
    relevantPersonas: ["cfo", "treasurer", "cpo"],
    impact: { value: "$1.8M", label: "cash to release", tone: "positive" },
    chatPrompt: "Walk me through the 12 vendors you'd stretch — what's the relationship-risk score for each, and what's the staged rollout?",
  },
  {
    id: "insight-cfo-margin-compression",
    category: "strategic",
    headline: "Q2 gross margin is compressing 2.1pp YoY — three shipments explain 80% of the gap",
    analysis:
      "Cross-referencing 217 May invoices against COGS, 3 shipments to Westpoint, Atlantic Industrial, and Pacific Distribution account for the bulk of the margin slide. All three involve expedited freight that wasn't billed back. There's a $186K recovery opportunity if you pursue billing recovery in the next 30 days.",
    dataSources: ["NetSuite GL", "Shipping records", "Customer MSAs (freight clauses)"],
    relevantPersonas: ["cfo", "controller"],
    impact: { value: "$186K", label: "recoverable", tone: "positive" },
    chatPrompt: "Pull up the three shipments — show me the freight-clause language in each MSA and draft the recovery memo.",
  },
  {
    id: "insight-cfo-concentration-acme",
    category: "risk",
    headline: "Acme is 23% of receivables and their pay-cycle just slipped 6 days",
    analysis:
      "Acme moved from a 28-day average to 34 days over the last 60 days — first measurable slip since the relationship started. They're 23% of total AR. If the trend continues, you'll need to either accelerate them via early-pay incentives or pre-emptively factor that exposure. I'd flag it to the CFO before next board.",
    dataSources: ["NetSuite AR", "Customer payment history", "AR aging snapshots"],
    relevantPersonas: ["cfo", "ar-manager"],
    impact: { value: "23%", label: "of receivables", tone: "negative" },
    chatPrompt: "Show me the Acme payment-pattern chart over the last 12 months and benchmark it against similar accounts at this size.",
  },
  {
    id: "insight-cfo-fx-exposure",
    category: "risk",
    headline: "$4.2M of FX exposure is unhedged across Singapore and AU subs",
    analysis:
      "I rolled up the 90-day FX position from the entity ledgers. SGD and AUD are running with a $4.2M unhedged delta. Natural hedging covers it for the next 90 days, then drift opens. Worth a hedging review with Treasury before September — the implied cost of a 5% move is ~$210K.",
    dataSources: ["Entity ledgers (SG, AU)", "Spot rates", "Forward curve"],
    relevantPersonas: ["cfo", "treasurer"],
    impact: { value: "$4.2M", label: "unhedged", tone: "negative" },
    chatPrompt: "Model the FX exposure across +5%, +10%, and +15% scenarios — what would each cost us at current revenue mix?",
  },
  {
    id: "insight-cfo-ma-opportunity",
    category: "strategic",
    headline: "A competitor exit creates an 8-vendor onboarding wave — estimated 11% category-cost reduction",
    analysis:
      "Tracking the recent CompetitorCo Q1 filing — they're divesting their finance-ops vertical. 8 of their vendors overlap our IT-services category. If we onboard the top 3 (preliminary diligence available), category cost could drop 11% over 18 months. Worth a sourcing-led conversation this quarter.",
    dataSources: ["Public filings", "Vendor overlap analysis", "Category benchmark"],
    relevantPersonas: ["cfo", "cpo"],
    impact: { value: "11%", label: "category savings", tone: "positive" },
    chatPrompt: "Which 3 vendors should we approach first, and what's the timeline if we want to lock pricing before the M&A close?",
  },
  {
    id: "insight-cfo-audit-posture",
    category: "compliance",
    headline: "4 quarters of clean STP — you're ready to defend the ERP migration to the audit committee",
    analysis:
      "Across the last 4 quarters, straight-through-processing rates exceeded 70% with zero material weaknesses logged. The control framework around tax coding, duplicate detection, and vendor onboarding is well-evidenced. If the ERP migration goes to audit this fall, you have a defensible posture.",
    dataSources: ["SOC 1 trail", "Control evidence (4Q)", "Internal audit logs"],
    relevantPersonas: ["cfo", "controller"],
    impact: { value: "70%+", label: "STP, 4Q clean", tone: "positive" },
    chatPrompt: "Draft the one-pager for the audit committee — what's our STP trend, where are the gaps, what's the migration de-risking plan?",
  },
  {
    id: "insight-cfo-board-narrative",
    category: "strategic",
    headline: "The Q2 board narrative writes itself: cash up 6%, DSO flat, vendor mix de-risked",
    analysis:
      "I pulled the metrics that will matter in the Q2 board deck: operating cash +6% QoQ, DSO held at 41, vendor concentration dropped from 31% to 24%, and discount capture is up 18%. The story is 'finance is quietly de-risking the operating model' — that's the slide.",
    dataSources: ["NetSuite metrics", "Vendor concentration", "AR aging", "Discount tracking"],
    relevantPersonas: ["cfo"],
    impact: { value: "+6%", label: "operating cash QoQ", tone: "positive" },
    chatPrompt: "Build me a 3-slide board narrative on these metrics, in the tone of last quarter's deck.",
  },
  {
    id: "insight-cfo-stretch-with-discount",
    category: "working-capital",
    headline: "9 vendors offer prompt-pay discounts that beat our cost of capital — $84K/yr left on the table",
    analysis:
      "Cross-referencing vendor terms with current weighted-average cost of capital (5.8%), 9 vendors are offering 1.5–2% discounts for net-10 payment. We're paying net-30 by default. Annualised, $84K is being left on the table. Worth a payment-terms policy update — Treasury already endorsed.",
    dataSources: ["Vendor MSAs", "Payment terms registry", "WACC model"],
    relevantPersonas: ["cfo", "treasurer", "ap-manager"],
    impact: { value: "$84K", label: "annual savings", tone: "positive" },
    chatPrompt: "List the 9 vendors, the discount terms, and what the payment-policy update needs to look like.",
  },

  // ───────────────────────────────────────────────────────────────
  // Controller-anchored insights
  // ───────────────────────────────────────────────────────────────
  {
    id: "insight-controller-jpm-rec-drift",
    category: "close-efficiency",
    headline: "JPMorgan bank-feed reconciliation is adding 4 days to month-end close",
    analysis:
      "JPM's auto-match rate has held at 71% for the last 6 closes. Citibank — same volume, similar mix — runs at 92% via direct API. The JPM 21pp gap maps to ~4 days of manual reconciliation in the close. Switching to JPM's host-to-host integration would close the gap. ROI clears in one quarter.",
    dataSources: ["Close calendar", "Bank-rec match rates", "Citibank vs JPM benchmark"],
    relevantPersonas: ["controller", "treasurer"],
    impact: { value: "+4 days", label: "close time", tone: "negative" },
    chatPrompt: "Draft the case for migrating JPM to host-to-host — costs, timeline, and what we'd say to JPM's RM.",
  },
  {
    id: "insight-controller-duplicate-pattern",
    category: "risk",
    headline: "The Acme duplicate isn't isolated — 7 vendors fit the same fraud-vector profile",
    analysis:
      "Looking at the Acme Cleaning duplicate I flagged today, I ran the same heuristic across the full vendor base. 7 other vendors have similar patterns: invoices submitted from a secondary domain within 14 days of the original. None have produced a confirmed duplicate yet, but the profile warrants a proactive vendor-master cleanup.",
    dataSources: ["Vendor master", "Invoice submission metadata", "Duplicate detection log"],
    relevantPersonas: ["controller", "ap-manager"],
    impact: { value: "7", label: "vendors to review", tone: "negative" },
    chatPrompt: "List the 7 vendors and the specific pattern markers — I want to review before the next vendor-master cleanse.",
  },
  {
    id: "insight-controller-tax-provision-variance",
    category: "compliance",
    headline: "Q2 tax provision is drifting from accrual on cross-border invoices",
    analysis:
      "Q2 actual tax expense is running 2.3% above the accrual. The variance maps almost entirely to cross-border invoices where input-tax claim timing differs from accrual recognition. Not yet material, but worth re-baselining the accrual model before Q3 to avoid a Q4 catch-up surprise.",
    dataSources: ["Tax provision model", "Cross-border invoice register", "Tax accrual snapshots"],
    relevantPersonas: ["controller", "cfo"],
    impact: { value: "2.3%", label: "accrual variance", tone: "negative" },
    chatPrompt: "Show me the cross-border invoices driving the variance and propose an accrual-model adjustment.",
  },
  {
    id: "insight-controller-close-compression",
    category: "close-efficiency",
    headline: "Moving accruals to T-1 would compress month-end close by 2 days with zero accuracy loss",
    analysis:
      "I tested a counterfactual: ran the May close with accruals computed at T-1 instead of T+2. The variance from final-close accruals was 0.4% — well inside the materiality threshold. The 2-day compression is real. Worth piloting in June.",
    dataSources: ["Close calendar", "May accrual run", "Materiality threshold"],
    relevantPersonas: ["controller"],
    impact: { value: "-2 days", label: "close compression", tone: "positive" },
    chatPrompt: "What's the implementation plan to move accruals to T-1, and what would I tell the team in the close kickoff?",
  },
  {
    id: "insight-controller-gl-coding-hotspots",
    category: "close-efficiency",
    headline: "6 vendors drive 80% of manual GL-coding overrides — fix those and STP jumps 7pp",
    analysis:
      "Of the 217 manual GL coding overrides this quarter, 80% came from 6 vendors: Atlantic Industrial, Westpoint, Pacific Office, Coastal Print, Singapore Stationery, and Acme Cleaning. Each has a recurring pattern I can lock into a rule. Fixing all 6 would lift STP by an estimated 7pp.",
    dataSources: ["GL coding override log", "Vendor invoice patterns", "STP rate"],
    relevantPersonas: ["controller", "ap-manager"],
    impact: { value: "+7pp", label: "STP lift", tone: "positive" },
    chatPrompt: "For each of the 6 vendors, draft the GL coding rule — I want to review before pushing to production.",
  },
  {
    id: "insight-controller-vendor-master-quality",
    category: "compliance",
    headline: "14 vendors have stale W-9s and 3 just appeared on the OFAC update",
    analysis:
      "Quarterly vendor-master hygiene check: 14 vendors have W-9s older than 36 months (renewal threshold), and the May OFAC update added 3 vendors to the screening list. None have active POs, but two have outstanding invoices. Worth running the cleanse before Q3.",
    dataSources: ["Vendor master", "W-9 registry", "OFAC SDN list (May update)"],
    relevantPersonas: ["controller", "ap-manager"],
    impact: { value: "17", label: "vendors to action", tone: "negative" },
    chatPrompt: "Walk me through the 17 — which are urgent and which can wait for Q3 cleanse?",
  },
  {
    id: "insight-controller-auditor-prep",
    category: "compliance",
    headline: "18 of 21 SOX controls have audit-ready evidence — the 3 gaps are tactical, not structural",
    analysis:
      "Pre-audit health check across the 21 SOX controls in scope: 18 have evidence packages that would pass on first review. The 3 gaps are all on segregation-of-duties for vendor onboarding — fixable with a 2-week workflow tweak and zero policy change. Worth handling before external audit fieldwork.",
    dataSources: ["SOX control matrix", "Evidence repository", "Vendor onboarding workflow"],
    relevantPersonas: ["controller"],
    impact: { value: "18/21", label: "audit-ready", tone: "positive" },
    chatPrompt: "Describe the 3 SOD gaps in detail and the workflow tweak that fixes them.",
  },

  // ───────────────────────────────────────────────────────────────
  // AR Manager-anchored insights
  // ───────────────────────────────────────────────────────────────
  {
    id: "insight-ar-tone-analysis",
    category: "customer-strategy",
    headline: "Softer dunning tone collects 14% faster on accounts under 60 days overdue",
    analysis:
      "I A/B'd the two dunning tones across 240 cases over the last 90 days. The empathetic variant ('reaching out to make sure nothing slipped through') outperformed the firm variant on accounts <60d overdue: 14% faster collection, 22% fewer dispute openings. Over 60d, the firm variant still wins. Worth codifying the rule.",
    dataSources: ["Dunning send log", "Collections response times", "Dispute open rate"],
    relevantPersonas: ["ar-manager"],
    impact: { value: "+14%", label: "faster collection", tone: "positive" },
    chatPrompt: "Codify this as a dunning policy and draft the team comms.",
  },
  {
    id: "insight-ar-pacific-default-pattern",
    category: "risk",
    headline: "Pacific Distribution's 95-day pattern matches 3 prior accounts that defaulted within 6 months",
    analysis:
      "Pacific is now 95 days past due with 3 ignored outreach attempts. I ran the pattern against 5 years of historical defaults: 3 accounts matched this exact signature (silent over 90, 3+ ignored emails, no dispute opened) — all 3 defaulted within 6 months for an average loss of $94K. Strong recommendation: account hold + escalation now.",
    dataSources: ["Collections history (5yr)", "Default patterns", "Outreach response log"],
    relevantPersonas: ["ar-manager", "cfo"],
    impact: { value: "$120K", label: "at risk", tone: "negative" },
    chatPrompt: "Pull the 3 historical default cases — what did we miss, and how does Pacific compare on each signal?",
  },
  {
    id: "insight-ar-best-time-to-collect",
    category: "customer-strategy",
    headline: "Collections outreach between 9–11am customer-local time gets 2.3x the reply rate",
    analysis:
      "Looking at 1,400 outbound collections emails over 6 months, send-time matters more than I'd expected. 9–11am in the customer's timezone gets 2.3x the reply rate of the next-best window (2–4pm). Auto-scheduling by customer geo would move first-touch resolution rate from 37% to ~60%.",
    dataSources: ["Outreach log", "Reply timestamps", "Customer geo data"],
    relevantPersonas: ["ar-manager"],
    impact: { value: "2.3x", label: "reply rate", tone: "positive" },
    chatPrompt: "Build me the auto-scheduling rule and show what next Monday's batch would look like with it applied.",
  },
  {
    id: "insight-ar-dispute-leading-indicator",
    category: "customer-strategy",
    headline: "Invoices with 3+ PO line changes have 6x the dispute rate",
    analysis:
      "Pattern check across Q2: invoices generated against POs with 3 or more line-item changes ended up in dispute 6x more often than clean POs. The fix is upstream — better PO discipline at the order entry stage. Sales ops owns this, but you have the data to make the case.",
    dataSources: ["PO change log", "Dispute register", "Order-to-cash funnel"],
    relevantPersonas: ["ar-manager"],
    impact: { value: "6x", label: "dispute risk", tone: "negative" },
    chatPrompt: "Quantify the cost of the 6x dispute rate and draft the talking points for the Sales Ops meeting.",
  },
  {
    id: "insight-ar-customer-health-trending",
    category: "risk",
    headline: "5 customers are trending into orange and they're not yet in your queue",
    analysis:
      "Composite customer-health score (aging + dispute volume + PO velocity + email sentiment) flagged 5 accounts moving into the orange band over the last 30 days: Coastal Print, Singapore Stationery, Westside Holdings, Acme Cleaning, and Atlantic Industrial. None are in your active queue yet — worth pre-emptive outreach this week.",
    dataSources: ["Aging snapshots", "Dispute volume", "PO velocity", "Email sentiment model"],
    relevantPersonas: ["ar-manager"],
    impact: { value: "5", label: "accounts trending", tone: "negative" },
    chatPrompt: "Show me the composite scorecard for each of the 5 — what's the leading indicator for each?",
  },
  {
    id: "insight-ar-rep-concentration",
    category: "customer-strategy",
    headline: "One sales rep's deals account for 41% of overdue receivables",
    analysis:
      "Slicing aging by originating sales rep: 41% of overdue invoices trace to deals closed by one rep. The pattern isn't credit risk (their accounts are well-rated) — it's contract terms. Their MSAs default to net-60 vs. our standard net-30. Worth a conversation with Sales Ops about template defaults.",
    dataSources: ["Sales rep deal log", "Contract terms registry", "AR aging"],
    relevantPersonas: ["ar-manager", "cfo"],
    impact: { value: "41%", label: "of overdue", tone: "negative" },
    chatPrompt: "Quantify the working-capital impact of net-60 vs net-30 across this rep's pipeline and draft the Sales Ops ask.",
  },
  {
    id: "insight-ar-portal-underuse",
    category: "customer-strategy",
    headline: "38% of dispute volume could resolve in the self-service portal without you",
    analysis:
      "Of the 87 disputes opened in Q2, 33 (38%) were for issues the customer self-service portal can resolve via auto-credit-memo: pricing variance under threshold, freight discrepancies under $500, and duplicate-payment refunds. They're hitting your queue because customers don't know the portal can handle them. A guided email outreach would shift the volume.",
    dataSources: ["Dispute register", "Portal usage logs", "Auto-credit-memo rules"],
    relevantPersonas: ["ar-manager"],
    impact: { value: "38%", label: "deflectable volume", tone: "positive" },
    chatPrompt: "Draft the customer email that guides them to use the portal for these dispute types — keep it warm.",
  },
  {
    id: "insight-ar-promise-day-of-week",
    category: "customer-strategy",
    headline: "Payment promises landing on Mondays slip 3x more than Thursday promises",
    analysis:
      "Cross-cut of 180 promised-to-pay dates over the last 90 days: Monday-due promises broke 24% of the time vs. 8% for Thursday-due promises. When you're negotiating a promise date, anchor toward Thursday. Worth a one-line update to the collections playbook.",
    dataSources: ["Promise log", "Actual pay dates", "Day-of-week analysis"],
    relevantPersonas: ["ar-manager"],
    impact: { value: "3x", label: "slip rate", tone: "negative" },
    chatPrompt: "Update the collections playbook with this rule — show me the change you'd make.",
  },

  // ───────────────────────────────────────────────────────────────
  // AP Manager-anchored insights
  // ───────────────────────────────────────────────────────────────
  {
    id: "insight-ap-vendor-consolidation",
    category: "vendor-strategy",
    headline: "Top 3 office-supplies vendors overlap on 64% of SKUs — one contract opportunity",
    analysis:
      "SKU-level overlap analysis across Acme Office, Coastal Print, and Westside Holdings: 64% of the 312 SKUs you buy from them are common. Consolidating to one master agreement with volume pricing would save an estimated 9–12% on category spend. Worth bringing to CPO for an RFP.",
    dataSources: ["Invoice line-item history", "SKU normalisation", "Vendor MSAs"],
    relevantPersonas: ["ap-manager", "cpo"],
    impact: { value: "9–12%", label: "category savings", tone: "positive" },
    chatPrompt: "Draft the consolidation case for CPO — show the SKU overlap, the savings model, and the migration risk.",
  },
  {
    id: "insight-ap-duplicate-vendors",
    category: "compliance",
    headline: "Acme Cleaning and Acme Cleaning Services Inc share an EIN — they're the same vendor",
    analysis:
      "Vendor-master hygiene scan caught it: two vendor records for the same EIN. Acme Cleaning was created in 2019, Acme Cleaning Services Inc in 2022. $312K of spend has been split across the two records this fiscal year, which masks the volume and creates the duplicate-payment risk we caught today. Clean merger needed.",
    dataSources: ["Vendor master", "EIN registry", "Payment history"],
    relevantPersonas: ["ap-manager", "controller"],
    impact: { value: "$312K", label: "spend split", tone: "negative" },
    chatPrompt: "Walk me through the safe merger — what gets moved, what gets archived, what's the audit trail look like?",
  },
  {
    id: "insight-ap-stp-regression",
    category: "close-efficiency",
    headline: "May STP dropped to 64% — the new GL chart introduced last month is the cause",
    analysis:
      "April STP was 73%, May dropped to 64%. Root-cause: the new GL chart added 18 sub-accounts that aren't yet mapped in the auto-coding rules. Vendors are routing through manual review unnecessarily. Updating the auto-coding rule set — straightforward, 2 hours of work — would restore April's STP rate.",
    dataSources: ["STP rate by month", "GL chart change log", "Auto-coding rule set"],
    relevantPersonas: ["ap-manager", "controller"],
    impact: { value: "-9pp", label: "STP regression", tone: "negative" },
    chatPrompt: "List the 18 sub-accounts and the auto-coding mappings I should add — I want to push these today.",
  },
  {
    id: "insight-ap-channel-migration",
    category: "close-efficiency",
    headline: "Moving Singapore subs from email to portal saves 12 minutes per invoice",
    analysis:
      "Singapore subsidiary invoices currently arrive by email and need manual OCR + classification. Average handling time: 14 min/invoice. Vendors that submit via the portal: 2 min/invoice. Singapore processes 240 invoices/month — that's 48 hours of labour you could recover by migrating their submission channel.",
    dataSources: ["Handling-time logs", "Invoice channel registry", "Singapore subsidiary volume"],
    relevantPersonas: ["ap-manager"],
    impact: { value: "48 hrs/mo", label: "labour saved", tone: "positive" },
    chatPrompt: "Draft the migration plan and the comms I'd send to Singapore — keep the change manageable for them.",
  },
  {
    id: "insight-ap-po-compliance-trend",
    category: "compliance",
    headline: "8 vendors are slipping on PO discipline — 3-way match failure rate is climbing",
    analysis:
      "PO compliance trend across the vendor base: 8 vendors have submitted 3+ invoices without referencing a valid PO this quarter, vs. zero in Q1. Three-way match failure rate is up 4pp. Pattern suggests their AR teams aren't getting our PO numbers reliably. Worth a procurement-led nudge.",
    dataSources: ["3-way match log", "PO reference registry", "Vendor invoice submission"],
    relevantPersonas: ["ap-manager", "cpo"],
    impact: { value: "+4pp", label: "match failure", tone: "negative" },
    chatPrompt: "List the 8 vendors and draft the standard procurement-team email I should send to each AR contact.",
  },
  {
    id: "insight-ap-early-pay-leakage",
    category: "cost-reduction",
    headline: "12 invoices/month should shift from net-30 to early-pay — $14K/yr unclaimed",
    analysis:
      "Cross-referencing our payment schedule against vendor MSAs: 12 monthly invoices have early-pay discount clauses (1.5–2% for net-10) that we're not capturing. Annualised, $14K. The fix is a flag in the payment-scheduling rule — vendors with discount terms get bumped to early-pay by default. 30 minutes to implement.",
    dataSources: ["Vendor MSAs", "Payment schedule", "Discount terms registry"],
    relevantPersonas: ["ap-manager", "treasurer"],
    impact: { value: "$14K/yr", label: "savings", tone: "positive" },
    chatPrompt: "Write the rule change and show me the next payment run with the new logic applied.",
  },
  {
    id: "insight-ap-wire-fee-leakage",
    category: "cost-reduction",
    headline: "JPM wire fees are absorbing 0.3% of total spend — most should be ACH",
    analysis:
      "47% of payments routed through JPM wires last quarter qualified for ACH but defaulted to wire because of a stale routing-instruction setup in the payment templates. That's $8.4K/quarter in unnecessary fees. Updating the payment-template logic resolves it.",
    dataSources: ["JPM fee statements", "Payment template registry", "ACH eligibility rules"],
    relevantPersonas: ["ap-manager", "treasurer"],
    impact: { value: "$8.4K/Q", label: "fee leakage", tone: "negative" },
    chatPrompt: "Show me the payment templates that need updating and what the corrected routing looks like.",
  },
  {
    id: "insight-ap-tax-coding-quality",
    category: "compliance",
    headline: "Singapore GST rejection rate dropped 2.1pp since the rule update — keep going",
    analysis:
      "The Singapore GST rule update we deployed in March is working: GST rejection rate at IRAS dropped from 4.7% to 2.6% over 3 months. Two more vendor patterns are candidates for the same treatment (Sumitomo, Coastal Singapore). Worth rolling them in for Q3.",
    dataSources: ["IRAS GST rejection log", "Tax coding rules", "Vendor invoice patterns"],
    relevantPersonas: ["ap-manager", "controller"],
    impact: { value: "-2.1pp", label: "rejection rate", tone: "positive" },
    chatPrompt: "Walk me through the Sumitomo and Coastal Singapore patterns and the rule updates I'd ship.",
  },

  // ───────────────────────────────────────────────────────────────
  // CPO-anchored insights
  // ───────────────────────────────────────────────────────────────
  {
    id: "insight-cpo-westpoint-maverick",
    category: "vendor-strategy",
    headline: "Westpoint is $340K in unapproved category spend with 3 contracts up for renewal",
    analysis:
      "Westpoint's spend grew 80% YoY into a category that isn't on their MSA. The renewal of their 3 active contracts in the next 60 days is the negotiation moment — they'll want continuity, you have leverage to fold the maverick spend into a formal category SKU at better pricing.",
    dataSources: ["Westpoint invoice history", "MSA category coverage", "Contract renewal calendar"],
    relevantPersonas: ["cpo"],
    impact: { value: "$340K", label: "maverick spend", tone: "negative" },
    chatPrompt: "Draft the Westpoint renewal strategy — what's the opening ask and what's the walk-away?",
  },
  {
    id: "insight-cpo-contract-leakage",
    category: "vendor-strategy",
    headline: "4 MSAs with auto-renewal in 60 days are 30%+ underused — let one or more lapse",
    analysis:
      "Four contracts auto-renew in the next 60 days: AcmeIT, ProSyncSolutions, Bridgewater Print, Vantage Office. All 4 are running at <70% of committed volume. Letting one or two lapse would save $180K/yr with no operational impact (volume can absorb across the others).",
    dataSources: ["Contract renewal calendar", "Commit vs. actual volume", "Service-level performance"],
    relevantPersonas: ["cpo"],
    impact: { value: "$180K/yr", label: "lapsable spend", tone: "positive" },
    chatPrompt: "Tell me which 1–2 should lapse and what the team conversation looks like with the supplier owners.",
  },
  {
    id: "insight-cpo-it-category-benchmark",
    category: "cost-reduction",
    headline: "IT spend is 14% above industry P50 — software seats are the biggest gap",
    analysis:
      "Benchmark vs. industry P50 (companies your size and vertical): total IT spend is 14% above median. The biggest line-item gap is software seats — you're at $4,200/seat/yr vs. P50 of $3,100. Underutilization analysis suggests ~20% of seats are inactive. A seat-rationalisation pass would close most of the gap.",
    dataSources: ["IT category spend", "Industry benchmarks (vendor)", "SaaS usage logs"],
    relevantPersonas: ["cpo", "cfo"],
    impact: { value: "+14%", label: "vs. P50 spend", tone: "negative" },
    chatPrompt: "List the top 5 SaaS contracts where seat reduction is highest-impact and what we'd cancel first.",
  },
  {
    id: "insight-cpo-supply-risk-emea",
    category: "risk",
    headline: "2 EMEA sole-source suppliers were flagged on Q2 financial filings",
    analysis:
      "Two suppliers in the EMEA mix — both sole-source — showed material deterioration in their Q2 filings: working-capital squeeze, debt covenant pressure. If either disrupts in the next 6 months, you have no qualified alternate ready. Worth running a backup-qualification cycle this quarter.",
    dataSources: ["Supplier financial filings", "Sole-source registry", "Qualified alternate inventory"],
    relevantPersonas: ["cpo"],
    impact: { value: "2", label: "single-source at risk", tone: "negative" },
    chatPrompt: "Tell me which 2 suppliers and what the backup-qualification timeline would look like.",
  },
  {
    id: "insight-cpo-diversity-tracking",
    category: "compliance",
    headline: "Q2 spend with MBE/WBE vendors is at 7.2% — 1.8pp short of target",
    analysis:
      "Diversity-spend tracking through May: 7.2% of total addressable spend went to MBE/WBE vendors against a 9% goal. Three sourcing events in Q3 are big enough to close the gap if you actively include 1–2 certified vendors per RFP. The pipeline is there.",
    dataSources: ["Spend by vendor classification", "MBE/WBE registry", "Q3 sourcing pipeline"],
    relevantPersonas: ["cpo"],
    impact: { value: "-1.8pp", label: "off target", tone: "negative" },
    chatPrompt: "Identify the 3 Q3 sourcing events and the certified vendors I should invite to each RFP.",
  },
  {
    id: "insight-cpo-rfp-candidates",
    category: "vendor-strategy",
    headline: "3 categories have 1+ year of spend and have never been RFP'd",
    analysis:
      "Vendor lifecycle audit: 3 categories have $400K+ annual spend and haven't been through a competitive RFP in 24+ months — Print/Mail, Office Cleaning, and Legal Process Outsourcing. Industry pricing has moved 8–15% in all three over that window. Worth slating for Q3 RFP cycle.",
    dataSources: ["Sourcing event log", "Category spend", "Industry pricing benchmarks"],
    relevantPersonas: ["cpo"],
    impact: { value: "$1.2M", label: "category spend", tone: "neutral" },
    chatPrompt: "For each of the 3, what does the RFP timeline + savings target look like?",
  },
  {
    id: "insight-cpo-pricing-variance",
    category: "cost-reduction",
    headline: "Acme office-supplies pricing is 23% above 3 quoted alternates",
    analysis:
      "Routine market check across office supplies — pulled three quotes from qualified alternates (Coastal, Westside, Vantage). All three came in 18–28% below Acme's current pricing on the same SKU basket. Acme's contract is up in September; the alternates are the negotiation lever.",
    dataSources: ["Acme contract pricing", "Alternate quotes (3)", "SKU basket match"],
    relevantPersonas: ["cpo"],
    impact: { value: "23%", label: "above market", tone: "negative" },
    chatPrompt: "Draft the Acme renewal opener — I want to anchor on the 23% gap without burning the relationship.",
  },
  {
    id: "insight-cpo-vendor-relationship-health",
    category: "vendor-strategy",
    headline: "5 strategic vendors are showing relationship deterioration signals",
    analysis:
      "Across our top 30 strategic vendors, 5 show 2+ signals of relationship deterioration over the last 90 days: slower email response (>48h), increased dispute openings, missed quarterly business reviews. Pre-emptive QBR refreshes would re-anchor them before the issues compound.",
    dataSources: ["Vendor communication logs", "QBR calendar", "Dispute openings"],
    relevantPersonas: ["cpo"],
    impact: { value: "5", label: "vendors", tone: "negative" },
    chatPrompt: "Tell me which 5, what the deterioration signals are, and draft the QBR refresh agenda.",
  },

  // ───────────────────────────────────────────────────────────────
  // Treasurer-anchored insights
  // ───────────────────────────────────────────────────────────────
  {
    id: "insight-treasurer-bank-fee-tier",
    category: "cost-reduction",
    headline: "JPM bank-fee tier restructure would save $34K/yr",
    analysis:
      "Current JPM relationship sits at tier 3 (standard wire fees, no fee waivers). Volume + deposit balance from last 4 quarters qualifies for tier 1: half-price wires, free ACH, lockbox waiver. The RM hasn't proactively offered the tier upgrade. Annualised, the tier difference is $34K.",
    dataSources: ["JPM fee statements", "Volume + balance history", "JPM tier schedule"],
    relevantPersonas: ["treasurer"],
    impact: { value: "$34K/yr", label: "fee savings", tone: "positive" },
    chatPrompt: "Draft the email to the JPM RM requesting the tier upgrade — what's our negotiating posture?",
  },
  {
    id: "insight-treasurer-working-capital-release",
    category: "working-capital",
    headline: "$1.8M is releasable from working capital without disrupting top 12 vendor relationships",
    analysis:
      "Concentration + relationship-risk model identified 12 vendors that can absorb a DPO 38→42 stretch. Risk scores are all green; payment history is clean. The $1.8M cash release would land 60-90 days after the policy change and recur. Worth sequencing this quarter.",
    dataSources: ["Vendor relationship-risk model", "Payment history", "DPO scenario model"],
    relevantPersonas: ["treasurer", "cfo", "cpo"],
    impact: { value: "$1.8M", label: "releasable", tone: "positive" },
    chatPrompt: "Sequence the 12 vendors into 3 waves and show me the cash-release timeline.",
  },
  {
    id: "insight-treasurer-fx-natural-hedge",
    category: "risk",
    headline: "Singapore + AU FX exposure is naturally hedged for 90 days, then drifts",
    analysis:
      "Walk-forward FX position model: SGD and AUD revenue flows are matched against operating spend in the same currencies for the next 90 days — naturally hedged. Beyond 90 days, the exposure opens to $4.2M of unhedged delta. A 90-day forward strip would close the drift cheaply.",
    dataSources: ["Entity revenue + spend flows", "FX forward curve", "Hedge accounting policy"],
    relevantPersonas: ["treasurer", "cfo"],
    impact: { value: "$4.2M", label: "90-day drift", tone: "neutral" },
    chatPrompt: "Model the cost of a 90-day forward strip vs. doing nothing — what's the risk-adjusted recommendation?",
  },
  {
    id: "insight-treasurer-cash-flow-accuracy",
    category: "strategic",
    headline: "Cash-flow forecast accuracy holding at 3% over 14 weeks — model is well-calibrated",
    analysis:
      "14-week rolling forecast vs. actuals: tracking within 3% mean absolute error since the model recalibration in February. That's tight enough to support more aggressive working-capital decisions (DPO stretch, factoring decisions). Worth flagging the calibration win to CFO.",
    dataSources: ["14-week forecast", "Actual cash positions", "Forecast accuracy log"],
    relevantPersonas: ["treasurer"],
    impact: { value: "3%", label: "MAPE, 14wk", tone: "positive" },
    chatPrompt: "Write the one-paragraph note to CFO on the forecast accuracy and what decisions it unlocks.",
  },
  {
    id: "insight-treasurer-idle-balance",
    category: "cost-reduction",
    headline: "Average $2.4M overnight in operating account — sweep opportunity",
    analysis:
      "Operating account is averaging $2.4M overnight uninvested. At current overnight money-market rates (5.1%), a sweep to the existing MMA would generate $122K/yr in yield with zero operational impact. The sweep facility is already set up; just needs the threshold reset from $5M to $1M.",
    dataSources: ["Daily balance history", "MMA rate sheet", "Sweep facility config"],
    relevantPersonas: ["treasurer"],
    impact: { value: "$122K/yr", label: "yield uplift", tone: "positive" },
    chatPrompt: "Walk me through the sweep threshold change — what gets configured, what's the operational risk?",
  },
  {
    id: "insight-treasurer-counterparty-risk",
    category: "risk",
    headline: "2 bank counterparties were downgraded by Moody's last week — review concentration",
    analysis:
      "Moody's published downgrades affecting 2 of our 6 bank counterparties last Wednesday. Combined exposure to the 2: 31% of total cash. Still well inside policy thresholds, but worth a proactive review to confirm we'd be inside policy if the downgrade widens.",
    dataSources: ["Moody's update", "Bank counterparty exposure", "Concentration policy"],
    relevantPersonas: ["treasurer"],
    impact: { value: "31%", label: "of cash", tone: "negative" },
    chatPrompt: "Tell me the 2 banks and what a rebalancing of 5%, 10%, or 15% would look like.",
  },
  {
    id: "insight-treasurer-covenant-cushion",
    category: "compliance",
    headline: "Closest debt covenant has 18% cushion — trending in the right direction",
    analysis:
      "Quarterly covenant compliance check: closest covenant (interest coverage) sits at 4.2x against a 3.5x minimum — 18% cushion. The cushion has widened 3pp over the last 2 quarters as cash position has strengthened. Comfortably away from any near-term covenant pressure.",
    dataSources: ["Debt agreement", "Interest coverage calc", "Quarterly cushion trend"],
    relevantPersonas: ["treasurer", "cfo"],
    impact: { value: "18%", label: "cushion", tone: "positive" },
    chatPrompt: "Build the covenant cushion chart for the next CFO review and call out the trajectory.",
  },
  {
    id: "insight-treasurer-receivables-financing",
    category: "working-capital",
    headline: "Top 10 customers are all factor-eligible if you need to tighten working capital fast",
    analysis:
      "Counterparty-rating sweep across our top 10 customers (representing 71% of receivables): all 10 meet factor-eligibility criteria with our standing facility (investment grade or close, no payment defaults in 24 months). If working capital tightens unexpectedly, you have a fast lever.",
    dataSources: ["Customer credit ratings", "Factor facility terms", "Receivables concentration"],
    relevantPersonas: ["treasurer", "cfo"],
    impact: { value: "71%", label: "factor-eligible AR", tone: "positive" },
    chatPrompt: "Lay out the staged factoring playbook — at what trigger would I tap each tier?",
  },
]

/**
 * Filter insights by active persona. Items tagged "all" appear for
 * every persona; otherwise only items tagged with the persona surface.
 */
export function filterInsightsByPersona(
  insights: Insight[],
  persona: PersonaId,
): Insight[] {
  if (persona === "all") return insights
  return insights.filter(
    (it) =>
      it.relevantPersonas.includes("all") ||
      it.relevantPersonas.includes(persona),
  )
}
