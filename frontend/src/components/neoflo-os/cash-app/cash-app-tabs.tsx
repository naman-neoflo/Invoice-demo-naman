// components/cash-app/cash-app-tabs.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { usePathname } from "next/navigation"
import { Lightning, ShieldCheck, Tray, Warning } from "@phosphor-icons/react"

import { getKpiSnapshot, getUnappliedItems } from "@/lib/neoflo-os/cash-app/derive"
import { getPaymentsByDate } from "@/lib/neoflo-os/cash-app/seed-payments"
import { useCanSee } from "@/lib/neoflo-os/users/permissions"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

// "Today" anchor for inbox count — matches DEMO_TODAY in lib/cash-app/derive.ts.
const DEMO_TODAY = "2026-05-15"

type TabKey = "dashboard" | "inbox" | "unapplied" | "audit"

interface TabDef {
  key: TabKey
  icon: React.ElementType
  label: string
  href: string
  count?: number
  isActive: (pathname: string) => boolean
}

function buildTabs(base: string): TabDef[] {
  const kpis = getKpiSnapshot()
  const inboxCount = getPaymentsByDate(DEMO_TODAY).length
  const unappliedCount = getUnappliedItems().length

  return [
    {
      key: "dashboard",
      icon: Lightning,
      label: "Dashboard",
      href: `${base}/cash-app`,
      count: kpis.needsEyes,
      isActive: (p) => p === `${base}/cash-app`,
    },
    {
      key: "inbox",
      icon: Tray,
      label: "Inbox",
      href: `${base}/cash-app/inbox`,
      count: inboxCount,
      isActive: (p) =>
        p.startsWith(`${base}/cash-app/inbox`) ||
        p.startsWith(`${base}/cash-app/match`),
    },
    {
      key: "unapplied",
      icon: Warning,
      label: "Unapplied",
      href: `${base}/cash-app/unapplied`,
      count: unappliedCount,
      isActive: (p) => p.startsWith(`${base}/cash-app/unapplied`),
    },
    {
      key: "audit",
      icon: ShieldCheck,
      label: "Audit log",
      // Deep-link to the hero application so the audit tab lands on real content.
      href: `${base}/cash-app/audit/app-3392`,
      isActive: (p) => p.startsWith(`${base}/cash-app/audit`),
    },
  ]
}

export function CashAppTabs() {
  const pathname = usePathname() ?? ""
  const base = useBasePath()
  const tabs = React.useMemo(() => buildTabs(base), [base])

  const canDashboard = useCanSee("cash-app:dashboard")
  const canInbox = useCanSee("cash-app:inbox")
  const canUnapplied = useCanSee("cash-app:unapplied")
  const canAudit = useCanSee("cash-app:audit")

  const allowed: Record<string, boolean> = {
    dashboard: canDashboard,
    inbox: canInbox,
    unapplied: canUnapplied,
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
