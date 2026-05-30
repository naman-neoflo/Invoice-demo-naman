// components/neoflo-workspace/persona-switcher.tsx
//
// Compact persona chip + dropdown for the /neoflo-workspace top chrome.
// Lives in the WorkspaceHeader area so the active persona is always
// visible. Clicking opens a list of all personas — switching updates
// the persona store, which the briefing + all-work pages subscribe to.
"use client"

import * as React from "react"
import { CaretDown, Check, User } from "@phosphor-icons/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"
import {
  PERSONAS,
  type PersonaId,
} from "@/lib/neoflo-os/neoflo-workspace/personas"
import { useHydratedPersona, usePersonaStore } from "@/lib/neoflo-os/neoflo-workspace/persona-store"
import { cn } from "@/lib/neoflo-os/utils"

interface PersonaSwitcherProps {
  className?: string
}

export function PersonaSwitcher({ className }: PersonaSwitcherProps) {
  const activeId = useHydratedPersona((s) => s.activePersona)
  const setPersona = usePersonaStore((s) => s.setPersona)
  const active = PERSONAS.find((p) => p.id === activeId) ?? PERSONAS[0]
  const isOverride = activeId === "all"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            isOverride
              ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
              : "border-border bg-card text-foreground hover:bg-muted",
            className,
          )}
        >
          <span
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
              isOverride
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {active.initials}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span>{active.name}</span>
            <span
              className={cn(
                "text-[10px] font-normal",
                isOverride ? "text-primary/70" : "text-muted-foreground",
              )}
            >
              {active.title}
            </span>
          </span>
          <CaretDown
            size={12}
            weight="bold"
            className={
              isOverride ? "text-primary/70" : "text-muted-foreground"
            }
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <User size={12} weight="bold" />
          View as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PERSONAS.map((p) => {
          const isActive = p.id === activeId
          const isAllOverride = p.id === "all"
          return (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => setPersona(p.id)}
              className={cn(
                "flex items-center gap-3 py-2",
                isAllOverride && "border-b border-dashed",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {p.initials}
              </span>
              <div className="flex flex-1 flex-col leading-tight">
                <span className="text-sm font-medium text-foreground">
                  {p.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {p.title}
                </span>
              </div>
              {isActive ? (
                <Check size={14} weight="bold" className="text-primary" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
