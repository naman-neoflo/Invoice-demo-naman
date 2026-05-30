// components/spend-analytics/spend-analytics-tabs.tsx
//
// Tab strip for the spend-analytics workflow surfaces. Mirrors
// components/collections/collections-tabs.tsx exactly — same chip
// shape, same active-state styling, same count-badge treatment.
//
// Source of truth: docs/handoff/spend-analytics/03-screen-specs.md
//   § Surface 1 → "tab bar" + per-surface route deep-links.
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { usePathname } from "next/navigation"
import {
  ChartBar,
  CurrencyDollar,
  Lightning,
  Shield,
  Warning,
} from "@phosphor-icons/react"

import { getNeedsEyesCards } from "@/lib/neoflo-os/spend-analytics/derive"
import { SEED_MAVERICK } from "@/lib/neoflo-os/spend-analytics/seed-maverick"
import { useHydratedSpendAnalyticsStore } from "@/lib/neoflo-os/spend-analytics/spend-analytics-store"
import { useCanSee } from "@/lib/neoflo-os/users/permissions"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

type TabKey =
  | "dashboard"
  | "explorer"
  | "maverick"
  | "cashflow"
  | "audit"

interface TabDef {
  key: TabKey
  icon: React.ElementType
  label: string
  href: string
  count?: number
  isActive: (pathname: string) => boolean
}

function buildTabs(base: string): TabDef[] {
  // Dashboard count = "needs your eyes" cards (4 in Phase 1).
  const needsEyesCount = getNeedsEyesCards().length
  // Maverick count = all seeded events for Phase 1 — none are
  // dismissable through user actions in this build, so the seed length
  // matches what the maverick list renders.
  const maverickCount = SEED_MAVERICK.length

  return [
    {
      key: "dashboard",
      icon: Lightning,
      label: "Dashboard",
      href: `${base}/spend-analytics`,
      count: needsEyesCount,
      isActive: (p) => p === `${base}/spend-analytics`,
    },
    {
      key: "explorer",
      icon: ChartBar,
      label: "Spend explorer",
      href: `${base}/spend-analytics/explorer`,
      isActive: (p) => p.startsWith(`${base}/spend-analytics/explorer`),
    },
    {
      key: "maverick",
      icon: Warning,
      label: "Maverick",
      href: `${base}/spend-analytics/maverick`,
      count: maverickCount,
      isActive: (p) => p.startsWith(`${base}/spend-analytics/maverick`),
    },
    {
      key: "cashflow",
      icon: CurrencyDollar,
      label: "Cash flow",
      href: `${base}/spend-analytics/cashflow`,
      isActive: (p) => p.startsWith(`${base}/spend-analytics/cashflow`),
    },
    {
      key: "audit",
      icon: Shield,
      label: "Audit",
      // Deep-link to the hero application so the tab always lands on real
      // content (mirrors collections + invoice-processing tab wiring).
      href: `${base}/spend-analytics/audit/app-deferral-may16-batch-1`,
      isActive: (p) => p.startsWith(`${base}/spend-analytics/audit`),
    },
  ]
}

export function SpendAnalyticsTabs() {
  const pathname = usePathname() ?? ""
  const base = useBasePath()
  // Subscribe to the store so any user-action-driven count changes re-render
  // the tab bar — Phase 1 counts are seed-derived constants today, but the
  // subscription mirrors collections + invoice-processing and keeps the door
  // open for P2.
  useHydratedSpendAnalyticsStore((s) => s.maverickFlagged)
  const tabs = React.useMemo(() => buildTabs(base), [base])

  const canDashboard = useCanSee("spend-analytics:dashboard")
  const canExplorer = useCanSee("spend-analytics:explorer")
  const canMaverick = useCanSee("spend-analytics:maverick")
  const canCashflow = useCanSee("spend-analytics:cashflow")
  const canAudit = useCanSee("spend-analytics:audit")

  const allowed: Record<string, boolean> = {
    dashboard: canDashboard,
    explorer: canExplorer,
    maverick: canMaverick,
    cashflow: canCashflow,
    audit: canAudit,
  }

  const visibleTabs = tabs.filter((t) => allowed[t.key] ?? true)

  return (
    <div className="bg-background border-b px-6">
      <nav className="-mb-px flex items-center gap-1 pt-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.isActive(pathname)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={14} weight="regular" />
              {tab.label}
              {typeof tab.count === "number" ? (
                <span
                  className={cn(
                    "ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
