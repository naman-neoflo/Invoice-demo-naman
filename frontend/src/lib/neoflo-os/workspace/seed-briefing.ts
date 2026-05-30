// lib/workspace/seed-briefing.ts
//
// Canned briefing content shown on the /workspace landing page. Pure data —
// references icons by string key (PhosphorIconKey) so this file remains
// JSON-serializable and can be imported by server components.

import type { PhosphorIconKey } from "@/lib/neoflo-os/workspace/workflow-icons"

export type BriefingActionItem = {
  /** Stable id, used in URL & analytics */
  id: string
  /** See workflow-icons map */
  icon: PhosphorIconKey
  /** Tailwind class for icon background */
  iconBg: string
  /** Tailwind class for icon text color */
  iconText: string
  /** Headline, e.g. "Pacific Distribution · banking change" */
  title: string
  /** Sub-line under the title */
  meta: string
  /** Button label, e.g. "Review" */
  cta: string
  ctaTone: "primary" | "neutral"
  /** Navigation target */
  href: string
}

export type BriefingHandledItem = {
  /** Single line of prose. May contain `**bold**` markdown tokens. */
  text: string
}

export type BriefingJumpChip = {
  icon: PhosphorIconKey
  /** Chip label, e.g. "Helpdesk" */
  label: string
  /** Tailwind text class for the icon */
  iconText: string
  href: string
}

export type BriefingDocument = {
  /** First name shown in greeting */
  greetingName: string
  /** Time range Neo references, e.g. "Friday 4:18 PM → now · 64h offline" */
  timeRange: string
  /** The prose paragraph. Plain text with no markdown. */
  prose: string
  /** 3 items needing attention */
  actionItems: BriefingActionItem[]
  /** 3-4 things Neo handled while user was away */
  handled: BriefingHandledItem[]
  /** Bottom CTA card text — "{moreCount} more items also need attention" */
  moreCount: number
  /** Typically "/workspace/all-work" */
  moreHref: string
  /** Quick-jump chips */
  jumps: BriefingJumpChip[]
}

export const SEED_BRIEFING: BriefingDocument = {
  greetingName: "Vibs",
  timeRange: "Friday 4:18 PM → now · 64h offline",
  prose: `Since you logged off Friday, I handled 73 supplier inquiries, applied $2.4M of cash, and started day-3 close tasks across both entities. A few things need your eyes — the Pacific Distribution banking change is highest risk. Want to start there?`,
  actionItems: [
    {
      id: "pacific-banking-change",
      icon: "ShieldWarning",
      iconBg: "bg-rose-100",
      iconText: "text-rose-700",
      title: "Pacific Distribution · banking change",
      meta: "HIGH RISK · domain mismatch flagged · pre-built verification protocol attached",
      cta: "Review",
      ctaTone: "primary",
      href: "/workspace/helpdesk/inbox/bank-change-pacific",
    },
    {
      id: "cash-app-short-pays",
      icon: "HandCoins",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      title: "6 payments need your eyes",
      meta: "Cash app · auto-coded but want a second look · ~6 min total",
      cta: "Open",
      ctaTone: "neutral",
      href: "/workspace/cash-app",
    },
    {
      id: "close-day-3-blocked",
      icon: "Calendar",
      iconBg: "bg-cyan-100",
      iconText: "text-cyan-700",
      title: "Day-3 close · 2 tasks blocked",
      meta: "Bank rec waiting on JPMorgan feed · payroll waiting on Lena",
      cta: "Unblock",
      ctaTone: "neutral",
      href: "/workspace/close",
    },
    {
      id: "invoice-duplicate-acme",
      icon: "ShieldWarning",
      iconBg: "bg-rose-100",
      iconText: "text-rose-700",
      title: "1 likely duplicate worth $42,800 — Acme Cleaning Services",
      meta: "INV-998123-B identical to invoice paid Apr 18. Stop the payment before the next run.",
      cta: "Review",
      ctaTone: "primary",
      href: "/workspace/invoice-processing/match/inv-998123-b",
    },
    {
      id: "invoice-exceptions-queue",
      icon: "FileMagnifyingGlass",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      title: "5 invoices need your eyes",
      meta: "Price variances, missing GRNs, GL ambiguity, GST review.",
      cta: "Open",
      ctaTone: "neutral",
      href: "/workspace/invoice-processing/exceptions",
    },
    {
      id: "invoice-early-pay",
      icon: "HandCoins",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-700",
      title: "2 early-pay discounts available · $1,840",
      meta: "Atlantic Industrial + Pacific Distribution — 6 days left.",
      cta: "View",
      ctaTone: "neutral",
      href: "/workspace/invoice-processing",
    },
    {
      id: "collections-at-risk",
      icon: "HandCoins",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      title: "$480K at risk · 4 cases need your eyes",
      meta: "Drafted dunning batch, broken promise, dispute resolved, account-hold rec.",
      cta: "Open",
      ctaTone: "primary",
      href: "/workspace/collections",
    },
    {
      id: "collections-broken-promise",
      icon: "ShieldWarning",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      title: "Broken promise — Atlantic Logistics $48K",
      meta: "Promised May 9, today's 4 days late. Tone-shifted follow-up drafted.",
      cta: "Review",
      ctaTone: "neutral",
      href: "/workspace/collections/customer/cust-atlantic-logistics",
    },
    {
      id: "collections-account-hold",
      icon: "ShieldWarning",
      iconBg: "bg-rose-100",
      iconText: "text-rose-700",
      title: "Account hold recommended — Pacific Distribution $120K",
      meta: "95 days, 3 ignored emails. Last 6mo orders: $340K.",
      cta: "Review",
      ctaTone: "primary",
      href: "/workspace/collections/customer/cust-pacific-distribution",
    },
    {
      id: "spend-analytics-working-capital",
      icon: "ChartLineUp",
      iconBg: "bg-violet-100",
      iconText: "text-violet-700",
      title: "$1.8M working capital trapped",
      meta: "12 vendors absorb DPO 38→42 stretch · no relationship risk per concentration analysis",
      cta: "Review",
      ctaTone: "primary",
      href: "/workspace/spend-analytics",
    },
  ],
  handled: [
    { text: `Auto-resolved **73 supplier inquiries** (helpdesk) — full audit trail at request` },
    { text: `Applied **$2.4M** of cash across 312 invoices · 4 unmatched, queued` },
    { text: `Posted **24 invoices** straight-through (invoice processing) · caught **$42,800 duplicate** from Acme Cleaning` },
    { text: `Drafted **18 collections emails** for Monday-morning sequence · awaiting your batch approval` },
  ],
  moreCount: 12,
  moreHref: "/workspace/all-work",
  jumps: [
    { icon: "ChatCircleText", label: "Helpdesk", iconText: "text-emerald-600", href: "/workspace/helpdesk" },
    { icon: "Calculator", label: "Cash app", iconText: "text-blue-600", href: "/workspace/cash-app" },
    { icon: "FileMagnifyingGlass", label: "Invoice processing", iconText: "text-cyan-600", href: "/workspace/invoice-processing" },
    { icon: "HandCoins", label: "Collections", iconText: "text-rose-600", href: "/workspace/collections" },
    { icon: "ChartLineUp", label: "Spend analytics", iconText: "text-violet-600", href: "/workspace/spend-analytics" },
    { icon: "Calendar", label: "Close board", iconText: "text-fuchsia-600", href: "/workspace/close" },
  ],
}
