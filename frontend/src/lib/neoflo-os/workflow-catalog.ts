// Single source of truth for every workflow in the multi-workflow demo platform.
// Powers the dashboard tiles, the per-workflow stub detail pages, and the persistent
// workflow header.
//
// IMPORTANT: This file is imported by both server and client components. To avoid
// transitively pulling phosphor icons into server bundles (the package calls
// createContext at module load), workflow icons are referenced by string key here
// and resolved to React components in the client-only ./workflow-icons.ts module.

export type WorkflowDomain = "P2P" | "O2C" | "R2R"
export type WorkflowIconKey =
  | "ChatCircleText"
  | "FileMagnifyingGlass"
  | "ChartLineUp"
  | "Bank"
  | "HandCoins"
  | "Calculator"
  | "ChartPieSlice"
  | "Receipt"
  | "ClipboardText"
  | "ChartBar"
  | "UserCirclePlus"
  | "ShoppingCart"
  | "Airplane"
  | "ShieldCheck"
  | "Calendar"
  | "Stack"
  | "Newspaper"
export type WorkflowPriority = "P0" | "P1" | "P2"
export type WorkflowStatus = {
  // Renders inside <StatusBadge>; "live" maps to success tone, "coming" to neutral.
  kind: "live" | "coming"
  label: string
}

export type WorkflowAccent = {
  // Tile band background (light tint for the colored strip at the top of the tile)
  band: string
  // Workflow page header band (slightly stronger tint for the persistent header strip)
  header: string
  // Icon chip background
  chipBg: string
  // Icon chip text color
  chipText: string
}

export type Workflow = {
  slug: string
  name: string
  domain: WorkflowDomain
  persona: string
  priority: WorkflowPriority
  status: WorkflowStatus
  accent: WorkflowAccent
  iconKey: WorkflowIconKey
  // 1-line value prop shown on the dashboard tile and at the top of the stub detail page.
  valueProp: string
  // Long-form persona statement on the stub page hero card.
  heroStatement: string
  // Bullets straight from the priority doc — rendered as the "What's in scope" checklist.
  scope: string[]
  // Whether the tile shows on the dashboard. P2 stubs are reachable by URL but hidden from the grid.
  isVisibleOnDashboard: boolean
  // For the helpdesk only — overrides the workflow's home route to its existing console.
  homeRoute?: string
}

// Accent palettes — kept in semantic-token style (Tailwind utility class strings, same as the
// existing avatar-tone allowance in the design system).
const ACCENTS = {
  emerald: {
    band: "bg-emerald-500",
    header: "bg-emerald-50 border-emerald-200",
    chipBg: "bg-emerald-100",
    chipText: "text-emerald-700",
  },
  cyan: {
    band: "bg-cyan-500",
    header: "bg-cyan-50 border-cyan-200",
    chipBg: "bg-cyan-100",
    chipText: "text-cyan-700",
  },
  violet: {
    band: "bg-violet-500",
    header: "bg-violet-50 border-violet-200",
    chipBg: "bg-violet-100",
    chipText: "text-violet-700",
  },
  amber: {
    band: "bg-amber-500",
    header: "bg-amber-50 border-amber-200",
    chipBg: "bg-amber-100",
    chipText: "text-amber-700",
  },
  rose: {
    band: "bg-rose-500",
    header: "bg-rose-50 border-rose-200",
    chipBg: "bg-rose-100",
    chipText: "text-rose-700",
  },
  blue: {
    band: "bg-blue-500",
    header: "bg-blue-50 border-blue-200",
    chipBg: "bg-blue-100",
    chipText: "text-blue-700",
  },
  indigo: {
    band: "bg-indigo-500",
    header: "bg-indigo-50 border-indigo-200",
    chipBg: "bg-indigo-100",
    chipText: "text-indigo-700",
  },
  fuchsia: {
    band: "bg-fuchsia-500",
    header: "bg-fuchsia-50 border-fuchsia-200",
    chipBg: "bg-fuchsia-100",
    chipText: "text-fuchsia-700",
  },
  teal: {
    band: "bg-teal-500",
    header: "bg-teal-50 border-teal-200",
    chipBg: "bg-teal-100",
    chipText: "text-teal-700",
  },
  orange: {
    band: "bg-orange-500",
    header: "bg-orange-50 border-orange-200",
    chipBg: "bg-orange-100",
    chipText: "text-orange-700",
  },
  sky: {
    band: "bg-sky-500",
    header: "bg-sky-50 border-sky-200",
    chipBg: "bg-sky-100",
    chipText: "text-sky-700",
  },
  lime: {
    band: "bg-lime-500",
    header: "bg-lime-50 border-lime-200",
    chipBg: "bg-lime-100",
    chipText: "text-lime-700",
  },
  pink: {
    band: "bg-pink-500",
    header: "bg-pink-50 border-pink-200",
    chipBg: "bg-pink-100",
    chipText: "text-pink-700",
  },
  zinc: {
    band: "bg-zinc-700",
    header: "bg-zinc-50 border-zinc-200",
    chipBg: "bg-zinc-200",
    chipText: "text-zinc-700",
  },
} satisfies Record<string, WorkflowAccent>

const COMING_Q3 = { kind: "coming", label: "Coming Q3 2026" } satisfies WorkflowStatus
const COMING_Q4 = { kind: "coming", label: "Coming Q4 2026" } satisfies WorkflowStatus
const COMING_2027 = { kind: "coming", label: "Roadmap 2027" } satisfies WorkflowStatus

export const WORKFLOWS: Workflow[] = [
  // ============ P2P ============
  {
    slug: "helpdesk",
    name: "Vendor Query & Self-Service Portal",
    domain: "P2P",
    persona: "AP Team",
    priority: "P1",
    status: { kind: "live", label: "Live" },
    accent: ACCENTS.emerald,
    iconKey: "ChatCircleText",
    valueProp: "Auto-resolve 70%+ of supplier inquiries with AI grounded in your AP system.",
    heroStatement:
      "Built for AP teams drowning in invoice-status, payment-status, and statement-reconciliation emails. Neoflo classifies every supplier inquiry, pulls the answer from your AP system, payments and bank, and either auto-responds or queues with full context for the AP Director.",
    scope: [
      "Invoice status inquiry: submitted, under review, approved, scheduled for payment",
      "Payment date and remittance advice download",
      "Dispute filing on invoice: short payment, deduction, PO mismatch",
      "Supplier statement upload with automated reconciliation against AP ledger",
      "PO acknowledgement and delivery confirmation",
      "Document re-submission for rejected invoices",
      "AI chatbot to resolve routine queries without AP team intervention",
    ],
    isVisibleOnDashboard: true,
    homeRoute: "/demo/helpdesk",
  },
  {
    slug: "invoice-processing",
    name: "Invoice Processing & STP",
    domain: "P2P",
    persona: "AP Manager / Controller",
    priority: "P0",
    status: { kind: "live", label: "Live" },
    homeRoute: "/workspace/invoice-processing",
    accent: ACCENTS.cyan,
    iconKey: "FileMagnifyingGlass",
    valueProp: "Touchless invoice posting with multi-channel ingestion, AI extraction, and 3-way match.",
    heroStatement:
      "Built for AP Managers and Controllers who want to push 80%+ of invoices to ERP without a human touch. Multi-channel ingestion, AI-graded extraction, 2-way and 3-way matching, duplicate detection, and posting straight to NetSuite / Sage / QuickBooks / MS BC / Acumatica.",
    scope: [
      "Multi-channel ingestion: email, supplier portal, EDI, scanned PDF",
      "AI-based OCR + field extraction (header, line items, tax, totals)",
      "2-way match (PO vs invoice) and 3-way match (PO, GRN, invoice)",
      "Duplicate invoice detection across invoice number, amount, vendor, date",
      "AI-suggested GL coding and cost center allocation",
      "Tax coding & input tax credit eligibility check (GST / VAT)",
      "Early payment discount identification and flagging for treasury",
      "Exception queue with reason codes and workflow for resolution",
      "ERP invoice posting on approval",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "spend-analytics",
    name: "Spend Analytics & Working Capital",
    domain: "P2P",
    persona: "CFO / Controller / CPO",
    priority: "P0",
    status: { kind: "live", label: "Live" },
    homeRoute: "/workspace/spend-analytics",
    accent: ACCENTS.violet,
    iconKey: "ChartLineUp",
    valueProp: "Real-time visibility into spend, supplier risk, DPO, and working-capital optimization.",
    heroStatement:
      "Built for CFOs, Controllers and CPOs running spend strategy. See spend by every dimension, spot maverick purchases, score supplier concentration, and optimize DPO without sacrificing supplier relationships.",
    scope: [
      "Spend by vendor, category, cost center, entity and time period",
      "Maverick spend detection (off-contract or non-preferred vendor purchases)",
      "Supplier concentration risk scoring",
      "DPO (Days Payable Outstanding) tracking and optimization",
      "Payment timing analysis: early vs on-time vs late payment trends",
      "Cash flow forecast from AP commitments and payment schedules",
      "Working capital metrics: cash conversion cycle, AP aging analysis",
      "Budget vs actuals with drill-down to invoice level",
      "Policy compliance violations dashboard",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "payment-run",
    name: "Payment Run Automation & Scheduling",
    domain: "P2P",
    persona: "Treasury / AP Manager",
    priority: "P1",
    status: COMING_Q4,
    accent: ACCENTS.indigo,
    iconKey: "Bank",
    valueProp: "Schedule, generate, approve, and dispatch payments across banks with dual-control.",
    heroStatement:
      "Built for treasury and AP teams running daily payment cycles. Generate the payment proposal from approved invoices, pick the right rail per vendor, generate bank files, route through dual approval, and track to settlement.",
    scope: [
      "Payment proposal generation from approved invoices by due date & discount window",
      "Payment method selection (ACH, SWIFT, NEFT/RTGS, cheque) by vendor config",
      "Bank file generation in required format per bank",
      "Dual-approval workflow before payment release",
      "Real-time payment status tracking & failure handling",
      "Remittance advice auto-dispatch to vendors",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "vendor-onboarding",
    name: "Vendor Onboarding & Master Data",
    domain: "P2P",
    persona: "Procurement / AP Manager",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.teal,
    iconKey: "UserCirclePlus",
    valueProp: "Self-service vendor onboarding with KYC, dedup, and ERP master data sync.",
    heroStatement:
      "Built for procurement and AP teams onboarding new vendors. Collect KYC documents, run penny-drop bank verification, dedup against existing master data, and create the vendor in ERP after configurable approvals.",
    scope: [
      "Vendor registration form with KYC document collection (PAN, GST, bank details)",
      "Duplicate vendor detection before creation",
      "Bank account verification (penny drop / API-based)",
      "Configurable approval workflow by vendor category or spend threshold",
      "ERP vendor master creation on approval",
      "Periodic re-validation & document expiry alerts",
    ],
    isVisibleOnDashboard: false,
  },
  {
    slug: "req-to-po",
    name: "Requisition to PO Automation",
    domain: "P2P",
    persona: "Procurement Manager",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.amber,
    iconKey: "ShoppingCart",
    valueProp: "PR-to-PO with budget checks, vendor suggestions, and ERP write-back.",
    heroStatement:
      "Built for procurement teams that want to compress requisition-to-PO cycle time. Suggest vendor + price from history, check budget, route by configurable matrix, and auto-generate the PO on approval.",
    scope: [
      "PR creation against approved budgets with line-level GL coding",
      "Vendor & price suggestion from historical spend",
      "Budget availability check before approval routing",
      "Configurable approval matrix (value, category, department)",
      "Auto-PO generation on final approval with ERP write-back",
    ],
    isVisibleOnDashboard: false,
  },
  {
    slug: "te-automation",
    name: "Travel & Expense Automation",
    domain: "P2P",
    persona: "Finance Team / Employees",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.orange,
    iconKey: "Airplane",
    valueProp: "Mobile receipt capture, policy enforcement, and ERP-integrated reimbursement.",
    heroStatement:
      "Built for employees submitting expenses and finance teams managing the back-end. Capture receipts on mobile with OCR, enforce policy at submission time, route through approval chains, and post to GL.",
    scope: [
      "Mobile receipt capture with OCR extraction",
      "Policy compliance check: per diem limits, category restrictions, receipt thresholds",
      "Multi-level approval routing based on amount and department",
      "ERP GL posting and employee reimbursement processing",
      "Expense analytics: policy violations, top spenders, category trends",
    ],
    isVisibleOnDashboard: false,
  },
  // ============ O2C ============
  {
    slug: "collections",
    name: "Collections, Dunning & Dispute",
    domain: "O2C",
    persona: "AR Manager / Collections",
    priority: "P0",
    status: { kind: "live", label: "Live" },
    homeRoute: "/workspace/collections",
    accent: ACCENTS.rose,
    iconKey: "HandCoins",
    valueProp: "AI-prioritized worklist, automated dunning, and end-to-end dispute resolution.",
    heroStatement:
      "Built for AR Managers and collections teams driving DSO down. Rank the worklist by risk + value, run dunning sequences automatically, manage promises-to-pay, and resolve disputes with PO + delivery context already attached.",
    scope: [
      "AI-prioritized collector worklist: ranked by overdue amount, risk score, payment history",
      "Automated dunning sequences: email & SMS by aging bucket (30/60/90 days)",
      "Promise-to-pay recording, tracking and auto follow-up on breach",
      "Auto-escalation rules: legal flag, collections agency handover, account hold trigger",
      "Deduction management: auto-coding by reason (pricing error, short shipment, damage, returns)",
      "Proof of delivery and PO matching for deduction validation",
      "Credit memo generation and approval workflow for valid deductions",
      "Dispute aging tracker: open disputes by customer, reason, value and resolution SLA",
      "Customer self-service portal: invoice download, payment status, dispute filing",
      "AI chatbot for routine AR query resolution without team intervention",
      "Collections effectiveness dashboard: DSO impact, resolution rate, dispute aging",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "cash-application",
    name: "Cash Application & Payment Matching",
    domain: "O2C",
    persona: "AR Manager / Controller",
    priority: "P0",
    status: { kind: "live", label: "Live" },
    homeRoute: "/workspace/cash-app",
    accent: ACCENTS.blue,
    iconKey: "Calculator",
    valueProp: "Auto-match remittances to invoices across 1:1, 1:many, and many:1 scenarios.",
    heroStatement:
      "Built for AR teams chasing unapplied cash. Ingest remittances from email, portal, EDI, and bank statements, match to invoices with AI, code short-pays and overpayments, and post straight to ERP.",
    scope: [
      "Remittance advice ingestion: email, portal, EDI, bank statement parsing",
      "AI-based auto-matching: 1:1, 1:many, many:1 payment-to-invoice scenarios",
      "Short-pay and overpayment identification with reason coding",
      "Unapplied cash investigation queue with aging",
      "Bank reconciliation trigger on successful application",
      "Straight-through posting to ERP AR ledger for matched items",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "ar-analytics",
    name: "AR Analytics & Working Capital",
    domain: "O2C",
    persona: "CFO / Controller",
    priority: "P0",
    status: COMING_Q3,
    accent: ACCENTS.fuchsia,
    iconKey: "ChartPieSlice",
    valueProp: "DSO, aging, customer risk, and cash flow forecast — all live, all attributable.",
    heroStatement:
      "Built for CFOs and Controllers managing AR working capital. Track DSO against target, age receivables by every dimension, score customers on payment behavior, and forecast cash from the AR pipeline with risk weighting.",
    scope: [
      "DSO (Days Sales Outstanding) tracking: actual vs target vs prior period",
      "AR aging by customer, region, business unit, entity",
      "Customer payment behavior scoring and credit risk flags",
      "Cash flow forecast from AR pipeline: committed, at-risk, overdue buckets",
      "Bad debt provision modeling based on aging and risk tier",
      "DIO (Days Inventory Outstanding) and cash conversion cycle metrics",
      "Collections team performance: calls made, promises kept, amount collected",
      "Working capital trend analysis and improvement opportunity identification",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "billing",
    name: "Billing & Invoice Generation",
    domain: "O2C",
    persona: "AR Manager / Controller",
    priority: "P1",
    status: COMING_Q3,
    accent: ACCENTS.sky,
    iconKey: "Receipt",
    valueProp: "Multi-currency, multi-channel billing with e-invoicing across India, UAE, EU, SG.",
    heroStatement:
      "Built for AR teams managing complex billing scenarios. Capture orders from any channel, validate completeness and pricing, run contract-based billing for milestone / subscription / usage, and dispatch e-invoices compliant with local tax regimes.",
    scope: [
      "Order capture: multi-channel ingestion (email, EDI, portal) with completeness & pricing validation",
      "Duplicate order detection before billing",
      "Contract-based billing: milestone, subscription, time & material, usage-based",
      "e-Invoicing with tax compliance: GST (India), VAT (UAE/EU), Peppol (Singapore)",
      "Multi-currency and multi-entity invoice generation",
      "Credit note and billing adjustment processing",
      "Bulk invoice generation with scheduled dispatch",
      "ERP AR ledger posting on invoice creation",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "credit-risk",
    name: "Credit Risk Assessment & Limits",
    domain: "O2C",
    persona: "Credit Manager / CFO",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.pink,
    iconKey: "ShieldCheck",
    valueProp: "Credit scoring, dynamic limit setting, and order-hold / release workflow.",
    heroStatement:
      "Built for Credit Managers and CFOs setting and monitoring customer credit exposure. Score new customers using bureau data, financials, and internal payment history; review limits dynamically; and hold or release orders on breach.",
    scope: [
      "New customer credit scoring using bureau data, financials and internal payment history",
      "Dynamic credit limit setting with periodic review triggers",
      "Order hold and release workflow on limit breach",
      "Customer credit exposure reporting by segment and region",
    ],
    isVisibleOnDashboard: false,
  },
  {
    slug: "revenue-recognition",
    name: "Revenue Recognition & Deferred Rev",
    domain: "O2C",
    persona: "Controller / CFO",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.lime,
    iconKey: "ClipboardText",
    valueProp: "ASC 606 / Ind AS 115 compliance with performance-obligation tracking and JE generation.",
    heroStatement:
      "Built for Controllers and CFOs running ASC 606 / Ind AS 115 compliance. Identify performance obligations, allocate the transaction price, track satisfaction, and post deferred-revenue waterfalls to ERP.",
    scope: [
      "ASC 606 / Ind AS 115 compliance engine: 5-step model implementation",
      "Performance obligation identification, allocation and satisfaction tracking",
      "Deferred revenue waterfall and period-wise roll-forward schedule",
      "Contract modification and variable consideration handling",
      "Revenue recognition JE generation and ERP posting",
      "Revenue recognition audit trail and disclosure support",
    ],
    isVisibleOnDashboard: false,
  },
  // ============ R2R ============
  {
    slug: "close-management",
    name: "Financial Close Management",
    domain: "R2R",
    persona: "Controller / Finance Team",
    priority: "P0",
    status: COMING_Q3,
    accent: ACCENTS.indigo,
    iconKey: "Calendar",
    valueProp: "Close-day tracker, JE automation, recs, and review with full audit trail.",
    heroStatement:
      "Built for Controllers and Finance teams that want a faster, cleaner close. Orchestrate close tasks with dependencies, automate accruals + amortization JEs, run sub-ledger reconciliations, and route review with sign-off.",
    scope: [
      "Close task creation, assignment and dependency mapping",
      "Real-time close status dashboard: % complete by phase, owner, entity",
      "Automated escalation on missed deadlines with configurable SLA thresholds",
      "Role-based sign-off: preparer → reviewer → controller → CFO approval chain",
      "Pre-close: AR / AP cutoff, GRNI accruals, payroll, intercompany, fixed assets, inventory",
      "Journal entries: accruals, prepaid amortization, deferred revenue, ROU/lease, FX revaluation, MTM, provisions, deferred tax",
      "Reconciliations: bank, credit card, AR/AP sub-ledger to GL, FA, inventory, intercompany",
      "Review: trial balance variance flagging, flux analysis with AI commentary, balance sheet sign-off",
      "Historical close benchmarking: actual vs target close day by period",
      "Audit trail of every task: who did it, when, what was attached",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "kpi-reporting",
    name: "Management Reporting & KPI Dashboards",
    domain: "R2R",
    persona: "CFO / FP&A",
    priority: "P1",
    status: COMING_Q4,
    accent: ACCENTS.violet,
    iconKey: "ChartBar",
    valueProp: "Real-time KPI scorecards, AI-generated flux commentary, and stakeholder distribution.",
    heroStatement:
      "Built for CFOs and FP&A leads that want operational and financial KPIs the moment close completes. Auto-explain variances, drill into transaction-level detail, and distribute scorecards to the right stakeholders on a schedule.",
    scope: [
      "Real-time operational and financial KPIs by entity, BU and cost center",
      "Department and business unit scorecards with actuals vs budget vs prior year",
      "Budget vs actuals variance by P&L line with drill-down to transaction level",
      "AI-generated flux commentary: auto-explains variances above configurable thresholds",
      "Prior period comparison: MoM, QoQ, YoY",
      "Custom report builder for finance team: drag-and-drop dimensions and metrics",
      "Scheduled distribution to stakeholders on close completion",
    ],
    isVisibleOnDashboard: true,
  },
  {
    slug: "consolidation",
    name: "Multi-Entity Consolidation",
    domain: "R2R",
    persona: "Group Controller / CFO",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.zinc,
    iconKey: "Stack",
    valueProp: "Intercompany elimination, currency translation, and consolidated statement generation.",
    heroStatement:
      "Built for group Controllers and CFOs running multi-entity consolidations. Match and eliminate intercompany, translate currencies at applicable rates, calculate minority interest, and generate consolidated P&L / BS / CF.",
    scope: [
      "Intercompany transaction matching and elimination across entity pairs",
      "Currency translation and restatement at applicable rates",
      "Minority interest calculation and equity pickup entries",
      "Consolidated P&L, Balance Sheet and Cash Flow generation",
      "Elimination audit trail by entity pair and transaction type",
      "Variance analysis: consolidated vs standalone entity movements",
    ],
    isVisibleOnDashboard: false,
  },
  {
    slug: "board-pack",
    name: "Financial Reporting & Board Pack",
    domain: "R2R",
    persona: "CFO / Controller",
    priority: "P2",
    status: COMING_2027,
    accent: ACCENTS.amber,
    iconKey: "Newspaper",
    valueProp: "Standardized templates, AI commentary, board pack assembly with version control.",
    heroStatement:
      "Built for CFOs and Controllers producing board packs and statutory filings. Standardize templates with comparatives, generate management commentary with AI, assemble the deck with charts, and route through versioned distribution.",
    scope: [
      "Standardized P&L, Balance Sheet and Cash Flow templates with comparative periods",
      "AI-generated management commentary: key movements, drivers, risks",
      "Board pack assembly with charts, waterfall analysis and executive summary",
      "Version control and distribution workflow with access permissions",
      "Scheduled auto-publish triggered on close sign-off",
      "Regulatory and statutory reporting templates (Companies Act, SEBI, GAAP/IFRS)",
    ],
    isVisibleOnDashboard: false,
  },
]

export function getWorkflow(slug: string): Workflow | undefined {
  return WORKFLOWS.find((w) => w.slug === slug)
}

export function getDashboardWorkflows(): Workflow[] {
  return WORKFLOWS.filter((w) => w.isVisibleOnDashboard)
}

export function getDashboardWorkflowsByDomain(): Record<WorkflowDomain, Workflow[]> {
  const map: Record<WorkflowDomain, Workflow[]> = { P2P: [], O2C: [], R2R: [] }
  for (const w of getDashboardWorkflows()) map[w.domain].push(w)
  return map
}

export function getWorkflowHomeRoute(workflow: Workflow): string {
  return workflow.homeRoute ?? `/demo/${workflow.slug}`
}

// View Transitions API name shared between the dashboard tile and the workflow header.
// Browser auto-morphs the band/colored chrome between the two when this string matches.
export function getWorkflowTransitionName(slug: string): string {
  return `workflow-${slug}`
}

export const DOMAIN_LABEL: Record<WorkflowDomain, string> = {
  P2P: "Procure-to-Pay",
  O2C: "Order-to-Cash",
  R2R: "Record-to-Report",
}

export const DOMAIN_SUBTITLE: Record<WorkflowDomain, string> = {
  P2P: "Onboarding · Procurement · Invoicing · Payments · Spend",
  O2C: "Billing · Collections · Cash · Analytics · Credit",
  R2R: "Close · Consolidation · Reporting · Insights",
}
