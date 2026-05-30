// components/sidebar-theme-toggle.tsx
//
// Light/dark toggle styled to match the sidebar's ResetButton — same
// hit area, same hover treatment, same icon-only collapsed mode. Sits
// just above the Reset Demo button in both global-sidebar.tsx and
// neoflo-sidebar.tsx.
"use client"

import * as React from "react"
import { Moon, Sun } from "@phosphor-icons/react"
import { useTheme } from "next-themes"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/neoflo-os/ui/tooltip"
import { cn } from "@/lib/neoflo-os/utils"

interface SidebarThemeToggleProps {
  collapsed: boolean
}

export function SidebarThemeToggle({ collapsed }: SidebarThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"
  const Icon = isDark ? Sun : Moon
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"
  // Match ResetButton's row text — "Reset demo" — with our equivalent.
  const rowLabel = mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"

  const button = (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      className={cn(
        "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center gap-3 rounded-md transition-colors",
        collapsed ? "size-9 justify-center" : "h-9 w-full px-2.5",
      )}
    >
      <Icon size={18} weight="regular" className="shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-medium">{rowLabel}</span>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }
  return button
}
