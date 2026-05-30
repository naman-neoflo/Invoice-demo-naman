// components/collections/collections-tabs.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { usePathname } from "next/navigation"
import {
  ClipboardText,
  Lightning,
  Shield,
  ShieldWarning,
} from "@phosphor-icons/react"

import {
  getCollectionsKpiSnapshot,
} from "@/lib/neoflo-os/collections/derive"
import { SEED_CASES } from "@/lib/neoflo-os/collections/seed-cases"
import { SEED_DISPUTES } from "@/lib/neoflo-os/collections/seed-disputes"
import { useHydratedCollectionsStore } from "@/lib/neoflo-os/collections/collections-store"
import { useCanSee } from "@/lib/neoflo-os/users/permissions"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

type TabKey = "dashboard" | "worklist" | "disputes" | "audit"

interface TabDef {
  key: TabKey
  icon: React.ElementType
  label: string
  href: string
  count?: number
  isActive: (pathname: string) => boolean
}

function buildTabs(base: string): TabDef[] {
  const kpis = getCollectionsKpiSnapshot()
  // All seed cases are considered "active" in Phase 1 (40 total).
  const worklistCount = SEED_CASES.length
  // Disputes still requiring action — not yet resolved/refused/paid.
  const openDisputesCount = SEED_DISPUTES.filter(
    (d) =>
      d.status === "evidence-pulled" ||
      d.status === "investigating" ||
      d.status === "credit-memo-proposed",
  ).length

  return [
    {
      key: "dashboard",
      icon: Lightning,
      label: "Dashboard",
      href: `${base}/collections`,
      count: kpis.needsEyesCount,
      isActive: (p) => p === `${base}/collections`,
    },
    {
      key: "worklist",
      icon: ClipboardText,
      label: "Worklist",
      href: `${base}/collections/worklist`,
      count: worklistCount,
      isActive: (p) =>
        p.startsWith(`${base}/collections/worklist`) ||
        p.startsWith(`${base}/collections/customer`),
    },
    {
      key: "disputes",
      icon: ShieldWarning,
      label: "Disputes",
      href: `${base}/collections/disputes`,
      count: openDisputesCount,
      isActive: (p) =>
        p.startsWith(`${base}/collections/disputes`) ||
        p.startsWith(`${base}/collections/dispute`),
    },
    {
      key: "audit",
      icon: Shield,
      label: "Audit",
      // Deep-link to the hero application so the tab always lands on real
      // content (mirrors invoice-processing's tab wiring).
      href: `${base}/collections/audit/app-westpoint-2206-may-tier1-sent`,
      isActive: (p) => p.startsWith(`${base}/collections/audit`),
    },
  ]
}

export function CollectionsTabs() {
  const pathname = usePathname() ?? ""
  const base = useBasePath()
  // Subscribe to the store so any user-action-driven count changes re-render
  // the tab bar — Phase 1 counts are seed-derived constants today, but the
  // subscription mirrors invoice-processing and keeps the door open for P2.
  useHydratedCollectionsStore((s) => s.caseActions)
  const tabs = React.useMemo(() => buildTabs(base), [base])

  const canDashboard = useCanSee("collections:dashboard")
  const canWorklist = useCanSee("collections:worklist")
  const canAudit = useCanSee("collections:audit")

  // Note: "disputes" has no matching SurfaceId in lib/users/types.ts, so we
  // intentionally omit it from `allowed`. The `?? true` fallback in the filter
  // keeps it visible for every role until a dedicated surface is added.
  const allowed: Record<string, boolean> = {
    dashboard: canDashboard,
    worklist: canWorklist,
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
