// components/users/role-surface-tree.tsx
//
// Grouped checkbox tree for role visibleSurfaces config. Workspace-home
// is always-on (the landing page). Each workflow group has an All/None
// toggle; individual checkboxes drive granular control.

"use client"

import * as React from "react"

import { Checkbox } from "@/components/neoflo-os/ui/checkbox"
import { Label } from "@/components/neoflo-os/ui/label"
import type { SurfaceId } from "@/lib/neoflo-os/users/types"
import { cn } from "@/lib/neoflo-os/utils"

type Group = {
  key: string
  label: string
  surfaces: { id: SurfaceId; label: string }[]
}

const GROUPS: Group[] = [
  {
    key: "helpdesk",
    label: "Helpdesk",
    surfaces: [
      { id: "helpdesk:dashboard", label: "Dashboard" },
      { id: "helpdesk:inbox", label: "Inbox" },
      { id: "helpdesk:audit", label: "Audit" },
      { id: "helpdesk:integrations", label: "Integrations" },
    ],
  },
  {
    key: "invoice-processing",
    label: "Invoice processing",
    surfaces: [
      { id: "invoice-processing:dashboard", label: "Dashboard" },
      { id: "invoice-processing:inbox", label: "Inbox" },
      { id: "invoice-processing:exceptions", label: "Exceptions" },
      { id: "invoice-processing:insights", label: "Insights" },
      { id: "invoice-processing:audit", label: "Audit" },
      { id: "invoice-processing:integrations", label: "Integrations" },
    ],
  },
  {
    key: "cash-app",
    label: "Cash app",
    surfaces: [
      { id: "cash-app:dashboard", label: "Dashboard" },
      { id: "cash-app:inbox", label: "Inbox" },
      { id: "cash-app:unapplied", label: "Unapplied" },
      { id: "cash-app:audit", label: "Audit" },
      { id: "cash-app:integrations", label: "Integrations" },
    ],
  },
  {
    key: "collections",
    label: "Collections",
    surfaces: [
      { id: "collections:dashboard", label: "Dashboard" },
      { id: "collections:worklist", label: "Worklist" },
      { id: "collections:audit", label: "Audit" },
      { id: "collections:integrations", label: "Integrations" },
    ],
  },
  {
    key: "spend-analytics",
    label: "Spend analytics",
    surfaces: [
      { id: "spend-analytics:dashboard", label: "Dashboard" },
      { id: "spend-analytics:cashflow", label: "Cashflow" },
      { id: "spend-analytics:explorer", label: "Explorer" },
      { id: "spend-analytics:maverick", label: "Maverick" },
      { id: "spend-analytics:audit", label: "Audit" },
      { id: "spend-analytics:integrations", label: "Integrations" },
    ],
  },
  {
    key: "strategic",
    label: "Strategic",
    surfaces: [
      { id: "insights", label: "Insights" },
      { id: "knowledge", label: "Knowledge sources" },
      { id: "cognitive-ledger", label: "Cognitive ledger" },
    ],
  },
  {
    key: "system",
    label: "System",
    surfaces: [
      { id: "integrations", label: "Integrations" },
      { id: "settings:users", label: "Settings · Users" },
      { id: "settings:roles", label: "Settings · Roles" },
    ],
  },
]

export function RoleSurfaceTree({
  value,
  onChange,
}: {
  value: SurfaceId[]
  onChange: (next: SurfaceId[]) => void
}) {
  const visibleSet = React.useMemo(() => new Set(value), [value])

  function toggle(id: SurfaceId) {
    if (visibleSet.has(id)) {
      onChange(value.filter((s) => s !== id))
    } else {
      onChange([...value, id])
    }
  }

  function setAll(group: Group, on: boolean) {
    const groupIds = group.surfaces.map((s) => s.id)
    const without = value.filter((s) => !groupIds.includes(s))
    onChange(on ? [...without, ...groupIds] : without)
  }

  function groupState(group: Group): "all" | "none" | "some" {
    const count = group.surfaces.filter((s) => visibleSet.has(s.id)).length
    if (count === 0) return "none"
    if (count === group.surfaces.length) return "all"
    return "some"
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Workspace home — always on, disabled */}
      <div className="flex items-center gap-2">
        <Checkbox id="surface-workspace-home" checked disabled />
        <Label
          htmlFor="surface-workspace-home"
          className="text-muted-foreground text-sm"
        >
          Workspace home <span className="text-[10px] uppercase">(always visible)</span>
        </Label>
      </div>

      {GROUPS.map((g) => {
        const state = groupState(g)
        return (
          <div key={g.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground text-sm font-semibold">{g.label}</h4>
              <div className="flex gap-1">
                {/* Inline structural toggles — documented carve-out from the
                    "no raw button outside sidebar" rule (matches the table-
                    header pattern in invoice-processing/inbox/page.tsx). */}
                <button
                  type="button"
                  onClick={() => setAll(g, true)}
                  className={cn(
                    "text-[11px] font-medium hover:underline",
                    state === "all" ? "text-muted-foreground" : "text-primary",
                  )}
                >
                  All
                </button>
                <span className="text-muted-foreground/40 text-[11px]">·</span>
                <button
                  type="button"
                  onClick={() => setAll(g, false)}
                  className={cn(
                    "text-[11px] font-medium hover:underline",
                    state === "none" ? "text-muted-foreground" : "text-primary",
                  )}
                >
                  None
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-1">
              {g.surfaces.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`surface-${s.id}`}
                    checked={visibleSet.has(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                  />
                  <Label
                    htmlFor={`surface-${s.id}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
