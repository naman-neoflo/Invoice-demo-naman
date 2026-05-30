// components/invoice-processing/invoice-processing-tabs.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { usePathname } from "next/navigation"
import { ChartLineUp, Lightning, ShieldCheck, Tray, Warning } from "@phosphor-icons/react"

import {
  getExceptionItems,
  getInboxItems,
  getInvoiceKpiSnapshot,
} from "@/lib/neoflo-os/invoice-processing/derive"
import { useHydratedInvoiceProcessingStore } from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"
import { useCanSee } from "@/lib/neoflo-os/users/permissions"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

type TabKey = "dashboard" | "inbox" | "exceptions" | "insights" | "audit"

interface TabDef {
  key: TabKey
  icon: React.ElementType
  label: string
  href: string
  count?: number
  isActive: (pathname: string) => boolean
}

function buildTabs(base: string): TabDef[] {
  const kpis = getInvoiceKpiSnapshot()
  const inboxCount = getInboxItems().length
  const exceptionsCount = getExceptionItems().length

  return [
    {
      key: "dashboard",
      icon: Lightning,
      label: "Dashboard",
      href: `${base}/invoice-processing`,
      count: kpis.needsEyesCount,
      isActive: (p) => p === `${base}/invoice-processing`,
    },
    {
      key: "inbox",
      icon: Tray,
      label: "Inbox",
      href: `${base}/invoice-processing/inbox`,
      count: inboxCount,
      isActive: (p) =>
        p.startsWith(`${base}/invoice-processing/inbox`) ||
        p.startsWith(`${base}/invoice-processing/match`),
    },
    {
      key: "exceptions",
      icon: Warning,
      label: "Exceptions",
      href: `${base}/invoice-processing/exceptions`,
      count: exceptionsCount,
      isActive: (p) => p.startsWith(`${base}/invoice-processing/exceptions`),
    },
    {
      key: "insights",
      icon: ChartLineUp,
      label: "Insights",
      href: `${base}/invoice-processing/insights`,
      isActive: (p) => p.startsWith(`${base}/invoice-processing/insights`),
    },
    {
      key: "audit",
      icon: ShieldCheck,
      label: "Audit",
      // Deep-link to the hero application so the audit tab lands on real
      // content (mirrors cash-app's tab wiring).
      href: `${base}/invoice-processing/audit/app-acme-may-2026`,
      isActive: (p) => p.startsWith(`${base}/invoice-processing/audit`),
    },
  ]
}

export function InvoiceProcessingTabs() {
  const pathname = usePathname() ?? ""
  const base = useBasePath()
  // Subscribe to the store so any user-action-driven count changes re-render
  // the tab bar — Phase 1 counts are seed-derived constants today, but the
  // subscription mirrors cash-app and keeps the door open for P2.
  useHydratedInvoiceProcessingStore((s) => s.applications)
  const tabs = React.useMemo(() => buildTabs(base), [base])

  const canDashboard = useCanSee("invoice-processing:dashboard")
  const canInbox = useCanSee("invoice-processing:inbox")
  const canExceptions = useCanSee("invoice-processing:exceptions")
  const canInsights = useCanSee("invoice-processing:insights")
  const canAudit = useCanSee("invoice-processing:audit")

  const allowed: Record<string, boolean> = {
    dashboard: canDashboard,
    inbox: canInbox,
    exceptions: canExceptions,
    insights: canInsights,
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
