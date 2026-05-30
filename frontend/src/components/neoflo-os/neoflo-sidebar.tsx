"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowsClockwise,
  CaretDoubleLeft,
  CaretDoubleRight,
  Calculator,
  ChartLineUp,
  ChatCircleText,
  FileMagnifyingGlass,
  Gear,
  HandCoins,
  House,
  Books,
  Brain,
  Lightbulb,
  Plug,
  SignOut,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import { Separator } from "@/components/neoflo-os/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/neoflo-os/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/neoflo-os/ui/alert-dialog"
import { useCashAppStore } from "@/lib/neoflo-os/cash-app/cash-app-store"
import { useCollectionsStore } from "@/lib/neoflo-os/collections/collections-store"
import { useInvoiceProcessingStore } from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"
import { useSpendAnalyticsStore } from "@/lib/neoflo-os/spend-analytics/spend-analytics-store"
import { useDemoStore } from "@/lib/neoflo-os/demo-store"
import { useWorkspaceStore } from "@/lib/neoflo-os/workspace/workspace-store"
import { useCognitiveLedgerStore } from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger-store"
import { useCanManageUsers, useCanSeeAny } from "@/lib/neoflo-os/users/permissions"
import { useRoleStore } from "@/lib/neoflo-os/users/role-store"
import type { AvatarTone, SurfaceId } from "@/lib/neoflo-os/users/types"
import { useHydratedUserStore, useUserStore } from "@/lib/neoflo-os/users/user-store"
import { SidebarThemeToggle } from "@/components/neoflo-os/sidebar-theme-toggle"
import { cn } from "@/lib/neoflo-os/utils"

export type SidebarNavItem = {
  key: string
  icon: PhosphorIcon
  label: string
  href: string
  matchPrefix: string
}

const COLLAPSE_KEY = "neoflo-sidebar-v2-collapsed-v1"

const TONE_CLASS: Record<AvatarTone, string> = {
  amber: "bg-amber-300 text-amber-950",
  violet: "bg-violet-300 text-violet-950",
  emerald: "bg-emerald-300 text-emerald-950",
  sky: "bg-sky-300 text-sky-950",
  rose: "bg-rose-300 text-rose-950",
  slate: "bg-slate-300 text-slate-950",
  indigo: "bg-indigo-300 text-indigo-950",
}

const WORKFLOW_NAV: SidebarNavItem[] = [
  {
    key: "workspace",
    icon: House,
    label: "Workspace",
    href: "/neoflo-workspace",
    matchPrefix: "/neoflo-workspace/all-work",
  },
  {
    key: "helpdesk",
    icon: ChatCircleText,
    label: "Helpdesk",
    href: "/neoflo-workspace/helpdesk",
    matchPrefix: "/neoflo-workspace/helpdesk",
  },
  {
    key: "cash-app",
    icon: Calculator,
    label: "Cash app",
    href: "/neoflo-workspace/cash-app",
    matchPrefix: "/neoflo-workspace/cash-app",
  },
  {
    key: "invoice-processing",
    icon: FileMagnifyingGlass,
    label: "Invoice processing",
    href: "/neoflo-workspace/invoice-processing",
    matchPrefix: "/neoflo-workspace/invoice-processing",
  },
  {
    key: "collections",
    icon: HandCoins,
    label: "Collections",
    href: "/neoflo-workspace/collections",
    matchPrefix: "/neoflo-workspace/collections",
  },
  {
    key: "spend-analytics",
    icon: ChartLineUp,
    label: "Spend analytics",
    href: "/neoflo-workspace/spend-analytics",
    matchPrefix: "/neoflo-workspace/spend-analytics",
  },
  {
    key: "insights",
    icon: Lightbulb,
    label: "Insights",
    href: "/neoflo-workspace/insights",
    matchPrefix: "/neoflo-workspace/insights",
  },
]

// Company-level nav rendered below the workflow group, separated by a divider.
// Knowledge sits above Integrations — both are "data plumbing" rather than
// per-workflow surfaces.
const COMPANY_NAV: SidebarNavItem[] = [
  {
    key: "knowledge",
    icon: Books,
    label: "Knowledge",
    href: "/neoflo-workspace/knowledge",
    matchPrefix: "/neoflo-workspace/knowledge",
  },
  {
    key: "cognitive-ledger",
    icon: Brain,
    label: "Cognitive Ledger",
    href: "/neoflo-workspace/cognitive-ledger",
    matchPrefix: "/neoflo-workspace/cognitive-ledger",
  },
  {
    key: "integrations",
    icon: Plug,
    label: "Integrations",
    href: "/neoflo-workspace/integrations",
    matchPrefix: "/neoflo-workspace/integrations",
  },
  {
    key: "settings",
    icon: Gear,
    label: "Settings",
    href: "/neoflo-workspace/settings",
    matchPrefix: "/neoflo-workspace/settings",
  },
]

function isActive(pathname: string, item: SidebarNavItem): boolean {
  // Workspace home is only active on /workspace exactly (or /neoflo-workspace/all-work).
  // All other workflows match by prefix.
  if (item.key === "workspace") {
    return pathname === "/neoflo-workspace" || pathname.startsWith("/neoflo-workspace/all-work")
  }
  return pathname === item.href || pathname.startsWith(item.matchPrefix + "/") || pathname === item.matchPrefix
}

function NavRow({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}: {
  icon: PhosphorIcon
  label: string
  href: string
  active?: boolean
  collapsed: boolean
}) {
  const row = (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md transition-colors",
        collapsed ? "size-9 justify-center" : "h-9 px-2.5",
        active
          ? "bg-primary/20 text-white"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon size={18} weight="regular" className="shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-medium">{label}</span>
      )}
    </Link>
  )

  if (!collapsed) return row
  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function ResetButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  function handleReset() {
    useDemoStore.getState().reset()
    useWorkspaceStore.getState().reset()
    useCashAppStore.getState().reset()
    useInvoiceProcessingStore.getState().reset()
    useCollectionsStore.getState().reset()
    useSpendAnalyticsStore.getState().reset()
    useCognitiveLedgerStore.getState().reset()
    useUserStore.getState().reset()
    useRoleStore.getState().reset()
    setOpen(false)
    router.replace("/neoflo-workspace")
  }

  const trigger = (
    <AlertDialogTrigger asChild>
      <button
        type="button"
        aria-label="Reset demo"
        className={cn(
          "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center gap-3 rounded-md transition-colors",
          collapsed ? "size-9 justify-center" : "h-9 w-full px-2.5"
        )}
      >
        <ArrowsClockwise size={18} weight="regular" className="shrink-0" />
        {!collapsed && (
          <span className="truncate text-sm font-medium">Reset demo</span>
        )}
      </button>
    </AlertDialogTrigger>
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">Reset demo</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset to a clean state?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears any actions taken and returns the workspace + helpdesk
            + cash-app + invoice-processing + collections + spend-analytics to a
            clean state. Users and roles are also restored to the seeded
            defaults, and the active user resets to Admin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            Reset demo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  async function handleLogout() {
    setSubmitting(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Cookie still clears server-side on next response; even if the fetch
      // failed (offline, etc.), pushing to /login is the right next step.
    }
    router.replace("/login")
    router.refresh()
  }

  const button = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={submitting}
      aria-label="Sign out"
      className={cn(
        "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center gap-3 rounded-md transition-colors disabled:opacity-50",
        collapsed ? "size-9 justify-center" : "h-9 w-full px-2.5"
      )}
    >
      <SignOut size={18} weight="regular" className="shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-medium">Sign out</span>
      )}
    </button>
  )

  if (!collapsed) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">Sign out</TooltipContent>
    </Tooltip>
  )
}

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const Icon = collapsed ? CaretDoubleRight : CaretDoubleLeft
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar"
  const button = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={!collapsed}
      className={cn(
        "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center gap-3 rounded-md transition-colors",
        collapsed ? "size-9 justify-center" : "h-9 w-full px-2.5"
      )}
    >
      <Icon size={16} weight="bold" className="shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-medium">Collapse</span>
      )}
    </button>
  )
  if (!collapsed) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function NeoflowFooter({ collapsed }: { collapsed: boolean }) {
  const link = (
    <a
      href="https://neoflo.ai"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Neoflo · opens neoflo.ai in a new tab"
      className={cn(
        "group text-sidebar-foreground/80 hover:text-sidebar-foreground flex items-center gap-2.5 rounded-md transition-colors",
        collapsed ? "size-9 justify-center" : "h-9 px-2"
      )}
    >
      <span className="bg-white/95 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/neoflo-logo.png"
          alt=""
          className="size-5 object-contain"
        />
      </span>
      {!collapsed && (
        <span
          // Instrument Sans · medium 500 · matches the wordmark on neoflo.ai
          // text-sidebar-foreground (light) — text-foreground resolves to near-black,
          // which is invisible against the dark sidebar bg.
          className="font-brand text-sidebar-foreground text-[15px] font-medium leading-none tracking-tight"
        >
          Neoflo
        </span>
      )}
    </a>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">Neoflo · neoflo.ai</TooltipContent>
    </Tooltip>
  )
}

/**
 * AcmeCo-branded sidebar shared across the workspace, the helpdesk console, and every workflow page.
 * Expandable (icon-only ↔ icon + label). Preference persisted in localStorage.
 * Always renders the 4 live workflows; sub-layouts can pass `navItems` to slot in workflow-specific
 * deep links (e.g. helpdesk's Inbox / Audit / Integrations) below the primary nav.
 */
export function NeofloSidebar({
  navItems = [],
}: {
  navItems?: SidebarNavItem[]
}) {
  const pathname = usePathname() ?? ""
  const [collapsed, setCollapsed] = React.useState(true)
  const [hydrated, setHydrated] = React.useState(false)

  // Workflow visibility — workspace is always visible (it's the landing page).
  const helpdeskVisible = useCanSeeAny([
    "helpdesk:dashboard",
    "helpdesk:inbox",
    "helpdesk:audit",
    "helpdesk:integrations",
  ] satisfies SurfaceId[])
  const cashAppVisible = useCanSeeAny([
    "cash-app:dashboard",
    "cash-app:inbox",
    "cash-app:unapplied",
    "cash-app:audit",
    "cash-app:integrations",
  ] satisfies SurfaceId[])
  const invoiceProcessingVisible = useCanSeeAny([
    "invoice-processing:dashboard",
    "invoice-processing:inbox",
    "invoice-processing:exceptions",
    "invoice-processing:insights",
    "invoice-processing:audit",
    "invoice-processing:integrations",
  ] satisfies SurfaceId[])
  const collectionsVisible = useCanSeeAny([
    "collections:dashboard",
    "collections:worklist",
    "collections:audit",
    "collections:integrations",
  ] satisfies SurfaceId[])
  const spendVisible = useCanSeeAny([
    "spend-analytics:dashboard",
    "spend-analytics:cashflow",
    "spend-analytics:explorer",
    "spend-analytics:maverick",
    "spend-analytics:audit",
    "spend-analytics:integrations",
  ] satisfies SurfaceId[])
  const insightsVisible = useCanSeeAny(["insights"] satisfies SurfaceId[])
  const knowledgeVisible = useCanSeeAny(["knowledge"] satisfies SurfaceId[])
  const cognitiveLedgerVisible = useCanSeeAny(["cognitive-ledger"] satisfies SurfaceId[])
  const integrationsVisible = useCanSeeAny(["integrations"] satisfies SurfaceId[])
  const canManageUsers = useCanManageUsers()

  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const users = useHydratedUserStore((s) => s.users)
  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0]

  const navVisibility: Record<string, boolean> = {
    workspace: true, // always visible
    helpdesk: helpdeskVisible,
    "cash-app": cashAppVisible,
    "invoice-processing": invoiceProcessingVisible,
    collections: collectionsVisible,
    "spend-analytics": spendVisible,
    insights: insightsVisible,
    knowledge: knowledgeVisible,
    "cognitive-ledger": cognitiveLedgerVisible,
    integrations: integrationsVisible,
    settings: canManageUsers,
  }

  const visibleWorkflowNav = WORKFLOW_NAV.filter((item) => navVisibility[item.key] ?? true)
  const visibleCompanyNav = COMPANY_NAV.filter((item) => navVisibility[item.key] ?? true)

  React.useEffect(() => {
    setHydrated(true)
    try {
      const saved = window.localStorage.getItem(COLLAPSE_KEY)
      if (saved === "false") setCollapsed(false)
      else if (saved === "true") setCollapsed(true)
    } catch {
      // localStorage unavailable; stay collapsed
    }
  }, [])

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(COLLAPSE_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Until hydration finishes we render the SSR-collapsed shell to avoid flash.
  const isCollapsed = !hydrated ? true : collapsed

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground sticky top-0 flex h-svh shrink-0 flex-col py-3 transition-[width] duration-200",
        isCollapsed ? "w-14 items-center" : "w-56 px-3"
      )}
      data-collapsed={isCollapsed}
    >
      {/* Top: brand chip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/neoflo-workspace"
            aria-label="AcmeCo workspace"
            className={cn(
              "bg-primary/20 text-primary-foreground flex items-center gap-2.5 rounded-md text-sm font-semibold",
              isCollapsed ? "size-9 justify-center" : "h-9 px-2.5 w-full"
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded text-xs font-semibold">
              Ac
            </span>
            {!isCollapsed && (
              <span className="text-sidebar-foreground truncate">AcmeCo</span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">AcmeCo · Finance OS</TooltipContent>
      </Tooltip>

      <Separator
        className={cn("bg-sidebar-border/60 my-2", isCollapsed ? "w-7" : "w-full")}
      />

      {/* Primary nav: collapse toggle first, then workspace + live workflows */}
      <nav className={cn("flex flex-col gap-1", isCollapsed ? "items-center" : "w-full")}>
        <CollapseToggle collapsed={isCollapsed} onToggle={toggle} />
        {visibleWorkflowNav.map((item) => (
          <NavRow
            key={item.key}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={isActive(pathname, item)}
            collapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Company-level nav (Integrations etc.), separated from the workflow group */}
      <Separator
        className={cn("bg-sidebar-border/60 my-2", isCollapsed ? "w-7" : "w-full")}
      />
      <nav className={cn("flex flex-col gap-1", isCollapsed ? "items-center" : "w-full")}>
        {visibleCompanyNav.map((item) => (
          <NavRow
            key={item.key}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={isActive(pathname, item)}
            collapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Sub-layout-provided nav (e.g. helpdesk's Inbox / Audit) */}
      {navItems.length > 0 && (
        <>
          <Separator
            className={cn(
              "bg-sidebar-border/60 my-2",
              isCollapsed ? "w-7" : "w-full"
            )}
          />
          <nav
            className={cn(
              "flex flex-col gap-1",
              isCollapsed ? "items-center" : "w-full"
            )}
          >
            {navItems.map((item) => (
              <NavRow
                key={item.key}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isActive(pathname, item)}
                collapsed={isCollapsed}
              />
            ))}
          </nav>
        </>
      )}

      {/* Bottom: collapse toggle, reset, avatar, Neoflo */}
      <div className="flex-1" />
      <div
        className={cn(
          "flex flex-col gap-1.5",
          isCollapsed ? "items-center" : "w-full"
        )}
      >
        <SidebarThemeToggle collapsed={isCollapsed} />
        <ResetButton collapsed={isCollapsed} />
        <LogoutButton collapsed={isCollapsed} />
        <Separator
          className={cn(
            "bg-sidebar-border/60 my-1",
            isCollapsed ? "w-7" : "w-full"
          )}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2.5",
                isCollapsed ? "justify-center" : "px-2"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold",
                    activeUser
                      ? TONE_CLASS[activeUser.avatarTone]
                      : "bg-amber-300 text-amber-950",
                  )}
                >
                  {activeUser?.initials ?? "??"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <span className="text-sidebar-foreground truncate text-sm font-medium">
                  {activeUser?.name ?? "—"}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{activeUser?.name ?? "—"} · AcmeCo</TooltipContent>
        </Tooltip>
        <Separator
          className={cn(
            "bg-sidebar-border/60 my-1",
            isCollapsed ? "w-7" : "w-full"
          )}
        />
        <NeoflowFooter collapsed={isCollapsed} />
      </div>
    </aside>
  )
}
