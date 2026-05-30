// lib/neoflo-workspace/knowledge.ts
//
// Knowledge Sources — the data substrate behind every Neoflo prediction.
// Split into two top-level groups:
//
//   1. INTERNAL (your sources): contracts, SOPs, vendor/customer master,
//      approval matrices, GL rules. Free with the platform; Neoflo just
//      needs read access.
//
//   2. NEOFLO LIBRARY (curated by Neoflo): four named packs that map to
//      pricing tiers — Compliance Core (included), Benchmark Suite (Pro),
//      Risk Intelligence (Premium), Playbook Library (Pro).
//
// Sources are persona-aware in the same way as insights: a CFO sees the
// benchmarks pack first, an AP Manager sees the AP SOPs first, etc.

import type { PersonaId } from "./personas"

export type KnowledgeKind = "internal" | "library"
export type KnowledgePack =
  | "Compliance Core"
  | "Benchmark Suite"
  | "Risk Intelligence"
  | "Playbook Library"
export type KnowledgeStatus =
  | "active" // internal source connected + indexed
  | "included" // library pack included in current plan
  | "available" // library pack the user could upgrade to
export type KnowledgeTier = "core" | "pro" | "premium"

export const PACK_META: Record<
  KnowledgePack,
  { tier: KnowledgeTier; tagline: string; pillBg: string; pillText: string }
> = {
  "Compliance Core": {
    tier: "core",
    tagline:
      "Tax + e-invoicing mandates, sanctions screening, SOX controls. Always current.",
    pillBg: "bg-emerald-100",
    pillText: "text-emerald-700",
  },
  "Benchmark Suite": {
    tier: "pro",
    tagline:
      "DPO / DSO / STP and category spend benchmarks. Industry, size, geography.",
    pillBg: "bg-sky-100",
    pillText: "text-sky-700",
  },
  "Risk Intelligence": {
    tier: "premium",
    tagline:
      "Fraud signatures, supplier distress, customer credit signals. Network-aggregated.",
    pillBg: "bg-rose-100",
    pillText: "text-rose-700",
  },
  "Playbook Library": {
    tier: "pro",
    tagline:
      "Contract templates, dunning playbooks, pre-trained classifiers. Drop-in.",
    pillBg: "bg-violet-100",
    pillText: "text-violet-700",
  },
}

export const TIER_LABEL: Record<KnowledgeTier, string> = {
  core: "Included",
  pro: "Pro",
  premium: "Premium",
}

export type WorkflowKey =
  | "helpdesk"
  | "cash-app"
  | "invoice-processing"
  | "collections"
  | "spend-analytics"
  | "insights"
  | "close"

export const WORKFLOW_LABEL: Record<WorkflowKey, string> = {
  helpdesk: "Helpdesk",
  "cash-app": "Cash app",
  "invoice-processing": "Invoice processing",
  collections: "Collections",
  "spend-analytics": "Spend analytics",
  insights: "Insights",
  close: "Close",
}

export interface KnowledgeSource {
  /** Stable id — used in URL query params and to link from insights */
  id: string
  kind: KnowledgeKind
  name: string
  /** One-line tagline */
  description: string
  /** Coverage stat for the card — "47 contracts", "50 states", "12 countries" */
  coverage: string
  /** Human-friendly last-updated label */
  lastUpdated: string
  /** Workflows this source powers */
  powers: WorkflowKey[]
  /** Personas that get the most value (drives persona-aware ordering) */
  relevantPersonas: PersonaId[]
  status: KnowledgeStatus
  /** Pack name for library items; undefined for internal */
  pack?: KnowledgePack
  /** Icon key — resolved by the page */
  icon:
    | "FileText"
    | "Books"
    | "Database"
    | "Receipt"
    | "ShieldWarning"
    | "ChartBar"
    | "Users"
    | "Bank"
    | "Globe"
    | "Calendar"
    | "FileCode"
    | "Lightning"
    | "Scales"
    | "Buildings"
    | "Briefcase"
  /** Tailwind logo background — semantic-ish, status-color allowance */
  logoBg: string
  /** Two-letter initials shown on tile */
  initials: string
  /** Long-form description shown in the detail dialog */
  detailBody: string
  /** Concrete items inside this source (5-8 bullets) */
  contents: string[]
  /** Example signals Neoflo extracts ("…so Neo can answer X") (4-6 bullets) */
  sampleSignals: string[]
}

// ─────────────────────────────────────────────────────────────────────────
// INTERNAL — AcmeCo company sources
// ─────────────────────────────────────────────────────────────────────────

const INTERNAL_SOURCES: KnowledgeSource[] = [
  {
    id: "src-vendor-msa",
    kind: "internal",
    name: "Vendor MSA library",
    description:
      "Master service agreements for every active vendor — terms, freight clauses, renewal calendars.",
    coverage: "47 contracts · 312 amendments",
    lastUpdated: "synced 2 hours ago",
    powers: ["invoice-processing", "helpdesk", "spend-analytics", "insights"],
    relevantPersonas: ["cpo", "ap-manager", "controller", "cfo"],
    status: "active",
    icon: "FileText",
    logoBg: "bg-indigo-600",
    initials: "MS",
    detailBody:
      "Connected to your contract repository (DocuSign + SharePoint). Every active vendor MSA + amendment is parsed for payment terms, freight clauses, dispute paths, early-pay discounts, and renewal dates. The classifier in the helpdesk and the duplicate detector in invoice processing both cite this source when they justify a recommendation.",
    contents: [
      "Active MSAs for every vendor in the master (47 in scope)",
      "Amendments tracked by effective date — supersedes captured",
      "Payment terms extracted (net-X, discount terms, late-fee schedule)",
      "Freight + delivery clauses (the Q2 margin recovery insight uses these)",
      "Renewal calendar with 30/60/90-day windows",
      "Dispute-resolution paths and notice requirements",
    ],
    sampleSignals: [
      '"Acme MSA-2024 includes net-30 2% prompt-pay — currently capturing 0 of 12 monthly invoices"',
      '"Westpoint contract auto-renews June 14 — 3 active POs above MSA category"',
      '"Pacific Logistics freight rebillable on 6 May shipments — $186K recoverable"',
      '"Sumitomo amendment effective Apr 1 changed late-fee from 1.5% to 1.0% — payment logic auto-updated"',
    ],
  },
  {
    id: "src-customer-msa",
    kind: "internal",
    name: "Customer MSA library",
    description:
      "Active customer contracts — payment terms, dispute paths, credit memos, freight clauses.",
    coverage: "28 contracts",
    lastUpdated: "synced 4 hours ago",
    powers: ["collections", "cash-app", "insights"],
    relevantPersonas: ["ar-manager", "controller", "cfo"],
    status: "active",
    icon: "FileText",
    logoBg: "bg-emerald-600",
    initials: "CM",
    detailBody:
      "Connected to your CRM (Salesforce) + contract repository. Every active customer contract is parsed so dunning, dispute classification, and short-pay matching cite the right clause when they act.",
    contents: [
      "28 active customer MSAs",
      "Payment terms by customer (net-30, net-45, net-60)",
      "Dispute-resolution paths + auto-credit-memo thresholds",
      "Freight + chargeback clauses",
      "Discount terms for early-pay incentives",
      "Termination + change-of-control clauses (referenced by Risk Intelligence)",
    ],
    sampleSignals: [
      '"Atlantic Industrial — net-30 with 2/10 net-30 discount. Currently paying day 34 on average."',
      '"Pacific Distribution MSA allows account hold after 90 days unresponsive — 95 today."',
      '"Sales rep #4 deals default to net-60; 41% of overdue traces to this rep."',
    ],
  },
  {
    id: "src-ap-playbook",
    kind: "internal",
    name: "AP playbook",
    description:
      "Your internal SOPs for AP — banking-change verification, duplicate handling, tax coding, three-way match.",
    coverage: "14 SOPs · v3.2 (May 2026)",
    lastUpdated: "edited 11 days ago",
    powers: ["helpdesk", "invoice-processing"],
    relevantPersonas: ["ap-manager", "controller"],
    status: "active",
    icon: "Books",
    logoBg: "bg-amber-600",
    initials: "AP",
    detailBody:
      "Your AP team's playbook. Neoflo reads it so its recommendations sound like your team, not a generic AI. The 'banking change verification protocol' the helpdesk cites on every banking-change inquiry comes straight from this document.",
    contents: [
      "Banking-change verification protocol (3-step out-of-band callback)",
      "Duplicate-handling workflow (auto-block, vendor email template, audit trail)",
      "Three-way match exception handling",
      "Tax coding decision tree (incl. Singapore GST, EU VAT)",
      "Vendor onboarding (W-9, OFAC, payment terms setup)",
      "Month-end accruals + cutoff procedure",
      "Payment scheduling rules (early-pay capture, ACH-vs-wire defaults)",
      "Escalation matrix (when to involve Controller / CFO)",
    ],
    sampleSignals: [
      '"For banking changes, your protocol requires phone verification at the number on file — surfaced verbatim in the helpdesk reply"',
      '"Duplicate handling step 4 says vendor-email-with-evidence — Neoflo drafts that email when a duplicate is confirmed"',
      '"Tax coding rules cite specific Singapore GST chapters — feeds into IRAS rejection-rate work"',
    ],
  },
  {
    id: "src-ar-playbook",
    kind: "internal",
    name: "Collections playbook",
    description:
      "Your dunning tone matrix, escalation paths, and dispute-resolution flow.",
    coverage: "9 SOPs · v2.4 (Apr 2026)",
    lastUpdated: "edited 23 days ago",
    powers: ["collections", "cash-app"],
    relevantPersonas: ["ar-manager", "controller"],
    status: "active",
    icon: "Books",
    logoBg: "bg-rose-600",
    initials: "AR",
    detailBody:
      "Your collections team's playbook. Defines tone by aging bucket, escalation triggers, dispute classification, and when to recommend account hold.",
    contents: [
      "Tone matrix (empathetic / firm / urgent) by aging bucket",
      "Escalation triggers (>60d, broken promise, ignored 3+)",
      "Dispute classification and auto-credit-memo thresholds",
      "Account-hold recommendation criteria",
      "Promise-to-pay tracking workflow",
      "Sales-rep notification thresholds",
    ],
    sampleSignals: [
      '"Under 60 days uses the empathetic tone — A/B confirmed 14% faster collection"',
      '"Three ignored outreach attempts triggers escalation — Pacific Distribution at threshold today"',
      '"Auto-credit-memo allowed under $500 freight discrepancy"',
    ],
  },
  {
    id: "src-approval-matrix",
    kind: "internal",
    name: "Approval matrix",
    description:
      "Delegation-of-authority — who can approve what, by amount, GL, and entity.",
    coverage: "182 rules · 12 approvers",
    lastUpdated: "edited 6 days ago",
    powers: ["invoice-processing", "spend-analytics", "close"],
    relevantPersonas: ["controller", "cfo", "ap-manager"],
    status: "active",
    icon: "Scales",
    logoBg: "bg-blue-600",
    initials: "AM",
    detailBody:
      "Defines who can approve what, at what threshold. Neoflo routes invoices, payment runs, and journal entries through this matrix automatically — no manual ping-pong.",
    contents: [
      "Approval thresholds by dollar amount + GL combination",
      "Entity-specific delegation (US vs Singapore vs AU subs)",
      "Out-of-office routing (Sarah covers Lena, etc.)",
      "Dual-control thresholds (>$50K requires two approvers)",
      "Emergency override paths",
    ],
    sampleSignals: [
      '"Invoices > $25K + capex GL route to Controller — auto-applied"',
      '"Lena out Thursday — banking changes route to Sarah automatically"',
      '"Payment run > $500K requires CFO co-sign — flagged before send"',
    ],
  },
  {
    id: "src-gl-rules",
    kind: "internal",
    name: "Chart of accounts + GL rules",
    description:
      "Your GL structure and the 47 auto-coding rules Neoflo uses to hit your STP target.",
    coverage: "312 sub-accounts · 47 auto-coding rules",
    lastUpdated: "edited 4 days ago",
    powers: ["invoice-processing", "close", "spend-analytics"],
    relevantPersonas: ["controller", "ap-manager"],
    status: "active",
    icon: "Database",
    logoBg: "bg-cyan-600",
    initials: "GL",
    detailBody:
      "Your chart of accounts + the auto-coding rule set Neoflo uses to assign GL on every invoice. Re-trained weekly on the manual-override log so the STP rate keeps climbing.",
    contents: [
      "Active chart of accounts (312 sub-accounts across 7 segments)",
      "Auto-coding rules — 47 active, 6 added this month for new sub-accounts",
      "Override learning loop (the controller insight 'fix 6 vendors' uses this)",
      "Inter-company elimination rules",
      "Capex vs opex classification rules",
    ],
    sampleSignals: [
      '"New GL chart added 18 sub-accounts in April — 3 still without auto-coding rules"',
      '"Atlantic Industrial driving 12% of GL overrides — rule candidate"',
      '"Inter-company rule auto-eliminates parent / sub journal pairs"',
    ],
  },
  {
    id: "src-vendor-master",
    kind: "internal",
    name: "Vendor master",
    description:
      "The golden record — 800 active vendors with EINs, W-9s, payment terms, banking, OFAC status.",
    coverage: "800 vendors · 14 stale W-9s",
    lastUpdated: "synced 1 hour ago",
    powers: ["invoice-processing", "helpdesk", "spend-analytics", "insights"],
    relevantPersonas: ["ap-manager", "controller", "cpo"],
    status: "active",
    icon: "Users",
    logoBg: "bg-purple-600",
    initials: "VM",
    detailBody:
      "Single golden record per vendor. Deduplication, OFAC screening, W-9 expiry, and parent-company graph all live here. The 'Acme Cleaning vs Acme Cleaning Services Inc share an EIN' insight surfaces from this record.",
    contents: [
      "800 active vendors with EINs",
      "W-9 expiry tracking (14 stale, surfacing in compliance insight)",
      "OFAC + SDN screening (3 new matches in May update)",
      "Parent-company graph (Acme Cleaning ↔ Acme Cleaning Services Inc)",
      "Banking details with audit trail of changes",
      "Diversity classification (MBE/WBE/VBE)",
    ],
    sampleSignals: [
      '"Acme Cleaning + Acme Cleaning Services Inc share EIN 12-3456789 — merge candidate"',
      '"14 W-9s expired more than 36 months ago — quarterly hygiene queue"',
      '"3 vendors added to OFAC SDN in May update — Q3 screening flags"',
    ],
  },
  {
    id: "src-customer-master",
    kind: "internal",
    name: "Customer master",
    description:
      "Golden record for 240 active customers — terms, credit limits, dispute history, payment patterns.",
    coverage: "240 customers · 6 trending red",
    lastUpdated: "synced 1 hour ago",
    powers: ["collections", "cash-app", "insights"],
    relevantPersonas: ["ar-manager", "controller", "cfo"],
    status: "active",
    icon: "Users",
    logoBg: "bg-teal-600",
    initials: "CG",
    detailBody:
      "Single golden record per customer. Composite health score combines aging, dispute volume, PO velocity, and email sentiment. The 'Pacific Distribution matches 3 prior default patterns' insight reads from this history.",
    contents: [
      "240 active customers with credit limits",
      "Payment-pattern history (24 months rolling)",
      "Composite health score (5 trending orange today)",
      "Dispute volume + classification per customer",
      "Sales-rep origination tracking",
      "Customer geo for outreach time-of-day optimization",
    ],
    sampleSignals: [
      '"Pacific Distribution silent 95 days + 3 ignored — matches 3 historical defaults"',
      '"Customer geo data lets Neo schedule outreach at 9–11am customer-local (2.3x reply rate)"',
      '"Acme moved from 28d to 34d avg payment — first slip since onboarding"',
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────
// NEOFLO LIBRARY — curated packs
// ─────────────────────────────────────────────────────────────────────────

const LIBRARY_SOURCES: KnowledgeSource[] = [
  // ─── Compliance Core (Included) ──────────────────────────────────────
  {
    id: "pack-tax",
    kind: "library",
    pack: "Compliance Core",
    name: "Global tax & e-invoicing",
    description:
      "US sales tax, VAT/GST in 47 jurisdictions, e-invoicing mandates in 12 countries. Always current.",
    coverage: "50 states · 47 jurisdictions · 12 e-invoicing mandates",
    lastUpdated: "rule update May 14",
    powers: ["invoice-processing", "close", "insights"],
    relevantPersonas: ["controller", "ap-manager", "cfo"],
    status: "included",
    icon: "Globe",
    logoBg: "bg-emerald-500",
    initials: "TX",
    detailBody:
      "Neoflo's compliance team maintains tax rules and e-invoicing mandates across every jurisdiction your subs operate in. When India changes its GST e-invoicing thresholds or Italy updates SDI, your invoice processing rules auto-update — no engineering ticket.",
    contents: [
      "US sales tax — 50 states + 11,000+ local jurisdictions",
      "Global VAT/GST — 47 jurisdictions covered",
      "E-invoicing mandates — Italy SDI, India GST, Mexico CFDI, Brazil NF-e, France Chorus Pro, Saudi ZATCA, Egypt, Germany, Singapore IRAS, Peru, Poland KSeF, Colombia DIAN",
      "Withholding tax + reverse charge rules",
      "Cross-border tax treatment + transfer pricing flags",
      "Effective-date tracking (rules apply only after their effective date)",
    ],
    sampleSignals: [
      '"Singapore GST input tax claim timing changed Apr 1 — your accrual model flagged for re-baseline"',
      '"India GST e-invoicing threshold dropped to ₹5cr — 3 vendors now in scope"',
      '"Italy SDI rejected 2 invoices in Q2 — pattern is missing reverse-charge clause"',
    ],
  },
  {
    id: "pack-sanctions",
    kind: "library",
    pack: "Compliance Core",
    name: "Sanctions + watchlist screening",
    description:
      "OFAC SDN, UK HMT, EU consolidated, UN, PEP lists. Daily refresh.",
    coverage: "12 lists · daily refresh",
    lastUpdated: "refreshed today 6:00 UTC",
    powers: ["invoice-processing", "helpdesk", "close"],
    relevantPersonas: ["controller", "ap-manager"],
    status: "included",
    icon: "ShieldWarning",
    logoBg: "bg-emerald-500",
    initials: "SC",
    detailBody:
      "Continuous screening of your vendor + customer master against OFAC SDN, UK HMT, EU consolidated, UN, and politically-exposed-persons (PEP) lists. Hits surface as compliance insights with the source list and effective date cited.",
    contents: [
      "OFAC SDN + Consolidated Sanctions List",
      "UK HMT consolidated list",
      "EU consolidated financial sanctions list",
      "UN Security Council sanctions",
      "BIS Denied Persons List",
      "Politically-exposed-persons (PEP) lists, global",
      "Adverse media screening (Premium add-on)",
    ],
    sampleSignals: [
      '"3 vendors added to OFAC SDN on May 12 — 2 have active POs"',
      '"PEP match: contact at Customer X became a state minister Q1 — review required"',
      '"Sanctions update propagated across all 4 entities within 60 minutes"',
    ],
  },
  {
    id: "pack-sox",
    kind: "library",
    pack: "Compliance Core",
    name: "SOX controls + evidence templates",
    description:
      "Maintained control library + audit-ready evidence packages for every SOX-relevant workflow.",
    coverage: "21 controls · 4 audit firms supported",
    lastUpdated: "control update May 8",
    powers: ["invoice-processing", "close", "insights"],
    relevantPersonas: ["controller", "cfo"],
    status: "included",
    icon: "Scales",
    logoBg: "bg-emerald-500",
    initials: "SX",
    detailBody:
      "If you're public or pre-IPO, the SOX controls in scope for finance ops are pre-mapped. Evidence packages auto-assemble from Neoflo's audit trail — Big-4-audit-firm-formatted by default.",
    contents: [
      "21 controls in scope for finance ops (P2P, O2C, R2R)",
      "Evidence templates for each control (workflow trace, dual-control proof, segregation of duties)",
      "Audit-firm-formatted packages (PwC, Deloitte, EY, KPMG)",
      "Quarterly self-attestation workflow",
      "Control deficiency remediation tracker",
    ],
    sampleSignals: [
      '"18 of 21 controls have audit-ready evidence packages — 3 SOD gaps remaining (per insight)"',
      '"Q1 self-attestation submitted with zero exceptions — pre-formatted for PwC"',
      '"Banking-change control evidence includes phone verification audit trail"',
    ],
  },
  {
    id: "pack-bowner",
    kind: "library",
    pack: "Compliance Core",
    name: "Beneficial ownership (CTA / BOI)",
    description:
      "US Corporate Transparency Act + global beneficial-ownership filings tracked per entity.",
    coverage: "4 entities · 14 reportable persons",
    lastUpdated: "filing window opens Jun 1",
    powers: ["close", "insights"],
    relevantPersonas: ["controller", "cfo"],
    status: "included",
    icon: "Buildings",
    logoBg: "bg-emerald-500",
    initials: "BO",
    detailBody:
      "CTA + global BOI reporting pre-mapped for every entity in your structure. Filings auto-draft from the entity master; you sign off.",
    contents: [
      "US Corporate Transparency Act (CTA) reporting",
      "EU UBO register requirements",
      "UK PSC register",
      "Singapore BO register",
      "Annual + change-of-ownership filings",
      "Penalty avoidance reminders (CTA fines start $500/day)",
    ],
    sampleSignals: [
      '"4 entities subject to CTA — next filing window opens Jun 1"',
      '"14 reportable persons across all entities — auto-rolled from cap table"',
      '"Ownership change Q1 triggered re-file for 2 entities — drafted, awaiting sign-off"',
    ],
  },

  // ─── Benchmark Suite (Pro) ──────────────────────────────────────────
  {
    id: "pack-finops-bench",
    kind: "library",
    pack: "Benchmark Suite",
    name: "FinOps benchmarks",
    description:
      "DPO / DSO / STP / CCC by industry, size, geography. Refreshed quarterly across 1,400+ companies.",
    coverage: "12 industries · 4 size bands · 6 regions",
    lastUpdated: "Q1 2026 refresh",
    powers: ["spend-analytics", "collections", "insights"],
    relevantPersonas: ["cfo", "treasurer", "controller"],
    status: "included",
    icon: "ChartBar",
    logoBg: "bg-sky-500",
    initials: "FB",
    detailBody:
      "Quarterly-refreshed benchmarks across the Neoflo customer network and supplemented with public-company data. Anchors every comparative insight you've seen ('IT spend 14% above P50', 'DPO trending toward target 42').",
    contents: [
      "DPO + DSO + cash conversion cycle by industry/size/geo",
      "STP (straight-through-processing) benchmarks",
      "Auto-resolved-inquiry-rate benchmarks (helpdesk performance)",
      "Discount-capture rate benchmarks",
      "Bad-debt write-off benchmarks",
      "Vendor concentration benchmarks (Top-5, Top-10)",
    ],
    sampleSignals: [
      '"Your DSO at 41 days sits at P55 for SaaS companies your size"',
      '"Helpdesk auto-resolve rate of 73% is P80 — keep going"',
      '"Discount capture at 67% — P50 is 82%, opportunity quantified at $84K/yr"',
    ],
  },
  {
    id: "pack-category-bench",
    kind: "library",
    pack: "Benchmark Suite",
    name: "Category spend benchmarks",
    description:
      "Industry-median pricing for IT/SaaS, freight, professional services, office, travel, marketing.",
    coverage: "6 categories · ~$840B aggregated spend",
    lastUpdated: "Q1 2026 refresh",
    powers: ["spend-analytics", "insights"],
    relevantPersonas: ["cpo", "cfo"],
    status: "included",
    icon: "Briefcase",
    logoBg: "bg-sky-500",
    initials: "CB",
    detailBody:
      "Median pricing benchmarks across 6 major spend categories, aggregated from the Neoflo network + curated industry data sources. Drives the 'IT spend 14% above P50' and 'Acme office supplies 23% above 3 quoted alternates' insights.",
    contents: [
      "IT + SaaS (per-seat, per-feature, by vendor)",
      "Freight + logistics (per lane, per weight bracket)",
      "Professional services (per hour, by tier)",
      "Office supplies + facilities",
      "Travel + entertainment",
      "Marketing + creative",
    ],
    sampleSignals: [
      '"IT spend 14% above industry P50 — software seats biggest gap at $4,200/seat vs P50 $3,100"',
      '"Acme office supplies pricing 23% above 3 quoted alternates"',
      '"Freight rates on West Coast lanes 8% below median — renew confidently"',
    ],
  },
  {
    id: "pack-bank-bench",
    kind: "library",
    pack: "Benchmark Suite",
    name: "Banking fee benchmarks",
    description:
      "Tier-1/2/3 fee schedules across BoA, JPM, Citi, Wells, Goldman. Negotiation-ready.",
    coverage: "5 major banks · ~120 fee SKUs",
    lastUpdated: "rate sheet refresh Apr 30",
    powers: ["spend-analytics", "insights"],
    relevantPersonas: ["treasurer", "cfo"],
    status: "available",
    icon: "Bank",
    logoBg: "bg-sky-500",
    initials: "BB",
    detailBody:
      "Wire / ACH / lockbox / FX / overdraft fee schedules across the major US banks at each relationship tier. Powers the 'JPM tier upgrade saves $34K/yr' insight.",
    contents: [
      "Wire fees by tier + currency",
      "ACH + RTP pricing",
      "Lockbox + cash-management fees",
      "FX spread benchmarks",
      "Overdraft + earnings-credit-rate (ECR) benchmarks",
      "Tier qualification thresholds (volume + balance)",
    ],
    sampleSignals: [
      '"JPM tier 1 qualification: $25M deposits + 200 wires/mo — you qualify with $30M + 240"',
      '"Wire fee at tier 3 ($45) vs tier 1 ($22) — $34K annual delta"',
      '"FX spread on JPY conversion is 0.6% wider than industry median"',
    ],
  },

  // ─── Risk Intelligence (Premium) ────────────────────────────────────
  {
    id: "pack-fraud-net",
    kind: "library",
    pack: "Risk Intelligence",
    name: "Vendor fraud signatures",
    description:
      "Network-aggregated fraud patterns from 1,400+ Neoflo customers. Detects what individual companies can't see.",
    coverage: "47 active signatures · 2.3M screened invoices",
    lastUpdated: "signature added May 13",
    powers: ["invoice-processing", "helpdesk", "insights"],
    relevantPersonas: ["controller", "ap-manager"],
    status: "available",
    icon: "ShieldWarning",
    logoBg: "bg-rose-500",
    initials: "FN",
    detailBody:
      "The network-effect moat. Neoflo sees fraud patterns across every customer — secondary-domain invoice submission, banking-change-then-vanish, OCR-evasion patterns. A single customer literally cannot build this; you have to be in the network.",
    contents: [
      "Secondary-domain invoice submission pattern (the Acme Cleaning duplicate)",
      "Banking-change-then-disappear (the Pacific banking change hero)",
      "OCR-evasion patterns (invoice + duplicate via different formats)",
      "Vendor-impersonation patterns (similar EINs, similar names)",
      "Insider-collusion signals (cross-PO patterns)",
      "Geographic-arbitrage patterns",
    ],
    sampleSignals: [
      '"7 vendors fit the Acme Cleaning duplicate fraud profile — pre-emptive vendor-master review"',
      '"Pacific Distribution banking-change request hits 4 of 6 fraud signals — high risk"',
      '"$42,800 saved this month from duplicate-detection signature — network ROI"',
    ],
  },
  {
    id: "pack-customer-credit",
    kind: "library",
    pack: "Risk Intelligence",
    name: "Customer credit + payment patterns",
    description:
      "Composite credit + payment-pattern signals across the Neoflo network. Catches deterioration early.",
    coverage: "~2.1M companies tracked",
    lastUpdated: "real-time",
    powers: ["collections", "cash-app", "insights"],
    relevantPersonas: ["ar-manager", "cfo"],
    status: "available",
    icon: "ChartBar",
    logoBg: "bg-rose-500",
    initials: "CC",
    detailBody:
      "Neoflo correlates your customers' payment behavior with the same companies' payment behavior across the network — Pacific paying you slowly + Pacific paying 5 other Neoflo customers slowly = high-confidence distress signal weeks before D&B would catch it.",
    contents: [
      "Cross-network payment-pattern correlation",
      "Composite health score (aging + dispute + PO velocity + sentiment)",
      "Default-pattern matching (the Pacific 95-day insight)",
      "Sales-rep concentration risk",
      "Sentiment shifts in customer email",
      "Bankruptcy filings + Chapter 11 watch",
    ],
    sampleSignals: [
      '"5 customers trending orange — composite health score moved >2 std dev in 30 days"',
      '"Pacific 95-day silence matches 3 historical defaults — $94K avg loss"',
      '"Customer X paying 4 other Neoflo customers 14 days slower than 90 days ago"',
    ],
  },
  {
    id: "pack-supplier-distress",
    kind: "library",
    pack: "Risk Intelligence",
    name: "Supplier financial distress",
    description:
      "Q-filing parsers, ratings overlay, debt-covenant pressure flags. Catches supplier distress before disruption.",
    coverage: "~85K public + private monitored",
    lastUpdated: "rolling daily",
    powers: ["spend-analytics", "insights"],
    relevantPersonas: ["cpo", "controller", "cfo"],
    status: "available",
    icon: "Briefcase",
    logoBg: "bg-rose-500",
    initials: "SD",
    detailBody:
      "Continuous parsing of supplier Q-filings, ratings updates (Moody's, S&P, Fitch), debt-covenant headroom, and litigation. Drives the '2 EMEA sole-source suppliers flagged' insight.",
    contents: [
      "Q-filing financial-deterioration parser",
      "Ratings agency overlay (Moody's, S&P, Fitch)",
      "Debt-covenant headroom estimation",
      "Litigation tracker",
      "Sole-source dependency mapping",
      "Bankruptcy + restructuring watch",
    ],
    sampleSignals: [
      '"2 EMEA sole-source suppliers flagged on Q2 filings — backup-qualification cycle this quarter"',
      '"Supplier X working-capital squeeze + debt covenant pressure — backup plan ready"',
      '"Moody\'s downgraded 2 bank counterparties last Wed — 31% of cash at risk"',
    ],
  },

  // ─── Playbook Library (Pro) ─────────────────────────────────────────
  {
    id: "pack-contracts",
    kind: "library",
    pack: "Playbook Library",
    name: "Contract templates",
    description:
      "Industry-standard vendor + customer MSA templates with negotiation playbooks. Updated quarterly by Neoflo legal.",
    coverage: "32 templates · 14 industries",
    lastUpdated: "Q1 2026 update",
    powers: ["spend-analytics", "insights"],
    relevantPersonas: ["cpo", "cfo", "controller"],
    status: "included",
    icon: "FileText",
    logoBg: "bg-violet-500",
    initials: "CT",
    detailBody:
      "Drop-in MSA templates with industry-standard clauses and negotiation guidance. Sourced from Neoflo's legal team + Big-Law-firm partnerships. Saves you the contract review cycle on routine vendors.",
    contents: [
      "Vendor MSAs (IT/SaaS, freight, professional services, office, marketing)",
      "Customer MSAs (B2B SaaS, B2B services, B2B physical goods)",
      "NDAs + DPAs",
      "Termination + force-majeure clauses",
      "FX + late-fee + dispute-resolution clauses with sample language",
      "Negotiation playbook (what's market, what's giveaway, what's deal-breaker)",
    ],
    sampleSignals: [
      '"Westpoint MSA missing the standard freight-rebill clause — Neoflo drafted the amendment"',
      '"Customer X dispute-resolution clause is non-market — counter-language attached"',
      '"DPA template auto-includes the new GDPR Schrems II provisions"',
    ],
  },
  {
    id: "pack-dunning",
    kind: "library",
    pack: "Playbook Library",
    name: "Dunning playbooks",
    description:
      "Tone-tuned by segment, geography, aging. A/B-tested across the Neoflo network. Drop-in.",
    coverage: "18 segments · 8 languages",
    lastUpdated: "tone refresh Apr 22",
    powers: ["collections", "insights"],
    relevantPersonas: ["ar-manager"],
    status: "included",
    icon: "Books",
    logoBg: "bg-violet-500",
    initials: "DP",
    detailBody:
      "Dunning playbooks segmented by aging × geography × customer-size. Tone language A/B-tested across the network — Neoflo knows the 14% lift on empathetic-under-60d isn't your data, it's the network's.",
    contents: [
      "Tone matrix: empathetic / firm / urgent × aging bucket",
      "Language localized for 8 geographies (cultural tone matters in JP, IN, BR)",
      "Promise-to-pay tracking with follow-up cadence",
      "Escalation language (when to invoke MSA dispute path)",
      "Account-hold notice templates (legal-reviewed by jurisdiction)",
      "Internal sales-rep notification templates",
    ],
    sampleSignals: [
      '"Empathetic-under-60d lifts collection speed 14% — applied to all your <60d cases"',
      '"Monday-due promises slip 3x more than Thursday-due — anchor toward Thursday"',
      '"Japanese tone library handles the cultural escalation hierarchy correctly"',
    ],
  },
  {
    id: "pack-classifiers",
    kind: "library",
    pack: "Playbook Library",
    name: "Pre-trained classifiers",
    description:
      "Intent, GL coding, tax coding, dispute classification. Network-trained — re-trained on your overrides.",
    coverage: "6 classifiers · 73% baseline auto-resolve",
    lastUpdated: "model refresh May 10",
    powers: ["helpdesk", "invoice-processing", "collections", "cash-app"],
    relevantPersonas: ["ap-manager", "ar-manager", "controller"],
    status: "available",
    icon: "Lightning",
    logoBg: "bg-violet-500",
    initials: "ML",
    detailBody:
      "Pre-trained classification models that bootstrap Neoflo's intelligence on day 1. Re-trained continuously on your overrides (the helpdesk classifier picker feeds back into this loop).",
    contents: [
      "Helpdesk inquiry classifier (14 intents + 'not actionable')",
      "GL auto-coding classifier (312 sub-account discriminator)",
      "Tax-coding classifier (multi-jurisdiction)",
      "Dispute-type classifier (pricing / freight / quality / duplicate / other)",
      "Cash-app remittance matcher",
      "Tone + sentiment classifier (for customer email analysis)",
    ],
    sampleSignals: [
      '"Network-trained helpdesk classifier gets you to 73% auto-resolve from day 1"',
      '"GL classifier re-trained on your 217 Q2 overrides — STP +3pp expected"',
      '"Sentiment classifier surfaces 5 customers trending unhappy before they file disputes"',
    ],
  },
]

export const ALL_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  ...INTERNAL_SOURCES,
  ...LIBRARY_SOURCES,
]

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

export function getInternalSources(): KnowledgeSource[] {
  return ALL_KNOWLEDGE_SOURCES.filter((s) => s.kind === "internal")
}

export function getLibrarySourcesByPack(): Record<
  KnowledgePack,
  KnowledgeSource[]
> {
  const result: Record<KnowledgePack, KnowledgeSource[]> = {
    "Compliance Core": [],
    "Benchmark Suite": [],
    "Risk Intelligence": [],
    "Playbook Library": [],
  }
  for (const s of ALL_KNOWLEDGE_SOURCES) {
    if (s.kind === "library" && s.pack) {
      result[s.pack].push(s)
    }
  }
  return result
}

export function filterSourcesByPersona(
  sources: KnowledgeSource[],
  persona: PersonaId,
): KnowledgeSource[] {
  if (persona === "all") return sources
  return sources.filter(
    (s) =>
      s.relevantPersonas.includes("all") ||
      s.relevantPersonas.includes(persona),
  )
}

export function getSourceById(id: string): KnowledgeSource | undefined {
  return ALL_KNOWLEDGE_SOURCES.find((s) => s.id === id)
}

/**
 * Resolve a dataSources string (e.g. "Vendor master", "NetSuite AP") used in
 * insights / briefings to a KnowledgeSource id when one matches, so the chip
 * can deep-link to the knowledge page filtered to that source. Falls back to
 * undefined when no match — chip stays as a text-only label.
 */
export function resolveDataSourceToId(label: string): string | undefined {
  const normalized = label.trim().toLowerCase()
  // Hand-curated mappings of the most common data-source strings used in
  // existing seeds. Keep small; integrations-as-data-sources (NetSuite,
  // JPM bank feed, etc.) don't map to knowledge — they map to integrations.
  const map: Record<string, string> = {
    "vendor master": "src-vendor-master",
    "customer master": "src-customer-master",
    "vendor msas": "src-vendor-msa",
    "vendor msas (freight clauses)": "src-vendor-msa",
    "msa terms": "src-vendor-msa",
    "vendor mass": "src-vendor-msa",
    "customer msas": "src-customer-msa",
    "customer payment history": "src-customer-master",
    "ap sop": "src-ap-playbook",
    "ap playbook": "src-ap-playbook",
    "collections playbook": "src-ar-playbook",
    "approval matrix": "src-approval-matrix",
    "gl coding rules": "src-gl-rules",
    "auto-coding rule set": "src-gl-rules",
    "industry benchmarks": "pack-category-bench",
    "industry benchmarks (vendor)": "pack-category-bench",
    "category benchmark": "pack-category-bench",
    "category spend": "pack-category-bench",
    "industry pricing benchmarks": "pack-category-bench",
    "industry-standard clauses": "pack-contracts",
    "jpm fee statements": "pack-bank-bench",
    "jpm tier schedule": "pack-bank-bench",
    "ofac sdn list (may update)": "pack-sanctions",
    "ofac sdn": "pack-sanctions",
    "sox control matrix": "pack-sox",
    "default patterns": "pack-customer-credit",
    "supplier financial filings": "pack-supplier-distress",
    "moody's update": "pack-supplier-distress",
    "duplicate detection log": "pack-fraud-net",
    "invoice submission metadata": "pack-fraud-net",
  }
  return map[normalized]
}
