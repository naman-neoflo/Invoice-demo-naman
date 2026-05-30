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
  HandCoins,
  House,
  Plug,
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
import { SidebarThemeToggle } from "@/components/neoflo-os/sidebar-theme-toggle"
import { cn } from "@/lib/neoflo-os/utils"

export type SidebarNavItem = {
  key: string
  icon: PhosphorIcon
  label: string
  href: string
  matchPrefix: string
}

const COLLAPSE_KEY = "neoflo-sidebar-collapsed-v1"

const WORKFLOW_NAV: SidebarNavItem[] = [
  {
    key: "workspace",
    icon: House,
    label: "Workspace",
    href: "/workspace",
    matchPrefix: "/workspace/all-work",
  },
  {
    key: "helpdesk",
    icon: ChatCircleText,
    label: "Helpdesk",
    href: "/workspace/helpdesk",
    matchPrefix: "/workspace/helpdesk",
  },
  {
    key: "cash-app",
    icon: Calculator,
    label: "Cash app",
    href: "/workspace/cash-app",
    matchPrefix: "/workspace/cash-app",
  },
  {
    key: "invoice-processing",
    icon: FileMagnifyingGlass,
    label: "Invoice processing",
    href: "/workspace/invoice-processing",
    matchPrefix: "/workspace/invoice-processing",
  },
  {
    key: "collections",
    icon: HandCoins,
    label: "Collections",
    href: "/workspace/collections",
    matchPrefix: "/workspace/collections",
  },
  {
    key: "spend-analytics",
    icon: ChartLineUp,
    label: "Spend analytics",
    href: "/workspace/spend-analytics",
    matchPrefix: "/workspace/spend-analytics",
  },
]

// Company-level nav rendered below the workflow group, separated by a divider.
const COMPANY_NAV: SidebarNavItem[] = [
  {
    key: "integrations",
    icon: Plug,
    label: "Integrations",
    href: "/workspace/integrations",
    matchPrefix: "/workspace/integrations",
  },
]

function isActive(pathname: string, item: SidebarNavItem): boolean {
  // Workspace home is only active on /workspace exactly (or /workspace/all-work).
  // All other workflows match by prefix.
  if (item.key === "workspace") {
    return pathname === "/workspace" || pathname.startsWith("/workspace/all-work")
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
    setOpen(false)
    router.replace("/workspace")
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
            clean state.
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
export function GlobalSidebar({
  navItems = [],
}: {
  navItems?: SidebarNavItem[]
}) {
  const pathname = usePathname() ?? ""
  const [collapsed, setCollapsed] = React.useState(true)
  const [hydrated, setHydrated] = React.useState(false)

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
            href="/workspace"
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
        {WORKFLOW_NAV.map((item) => (
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
        {COMPANY_NAV.map((item) => (
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
                <AvatarFallback className="bg-amber-300 text-xs font-semibold text-amber-950">
                  JD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <span className="text-sidebar-foreground truncate text-sm font-medium">
                  Jamie Doe
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">Jamie Doe · AcmeCo</TooltipContent>
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
