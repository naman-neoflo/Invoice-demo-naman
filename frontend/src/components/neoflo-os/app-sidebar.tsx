"use client"

import * as React from "react"
import {
  SquaresFour,
  Gear,
  FlowArrow,
  ChartLine,
  SidebarSimple,
  BookOpen,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import { Separator } from "@/components/neoflo-os/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/neoflo-os/ui/tooltip"
import { cn } from "@/lib/neoflo-os/utils"

export type NavKey =
  | "workspace"
  | "settings"
  | "workflows"
  | "analytics"
  | "library"

const NAV_ITEMS: {
  key: NavKey
  icon: React.ElementType
  label: string
}[] = [
  { key: "workspace", icon: SquaresFour, label: "Workspace" },
  { key: "settings", icon: Gear, label: "Settings" },
  { key: "workflows", icon: FlowArrow, label: "Workflows" },
  { key: "analytics", icon: ChartLine, label: "Analytics" },
  { key: "library", icon: BookOpen, label: "Library" },
]

function SidebarNavButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors",
            active
              ? "bg-primary/20 text-white"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Icon size={18} weight="regular" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar({ active }: { active?: NavKey }) {
  return (
    <aside className="bg-sidebar text-sidebar-foreground flex w-14 shrink-0 flex-col items-center justify-between py-3">
      <div className="flex flex-col items-center gap-1">
        <SidebarNavButton icon={SidebarSimple} label="Toggle sidebar" />
        <Separator className="bg-sidebar-border/60 my-1.5 w-7" />
        {NAV_ITEMS.map((item) => (
          <SidebarNavButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={active === item.key}
          />
        ))}
      </div>
      <Avatar className="size-8">
        <AvatarFallback className="bg-amber-300 text-xs font-semibold text-amber-950">
          JD
        </AvatarFallback>
      </Avatar>
    </aside>
  )
}
