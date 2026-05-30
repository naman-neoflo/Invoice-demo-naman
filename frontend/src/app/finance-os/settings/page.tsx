// app/neoflo-workspace/settings/page.tsx
//
// Consolidated Settings hub. Stacked layout:
//   1. Role editor card (top, collapsible, defaults to active user's role)
//   2. Users table (below, full-width)
//
// The previous standalone /settings/users + /settings/roles routes are
// removed — this hub is the only Settings surface.
//
// Page chrome (padding/width/heading) mirrors /neoflo-workspace/integrations
// — the closest config-surface analog — so this page reads as part of the
// neoflo-workspace family rather than the design-library era.

"use client"

import * as React from "react"
import { Plus } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { RoleEditorCard } from "@/components/neoflo-os/users/role-editor-card"
import { UsersTable } from "@/components/neoflo-os/users/users-table"
import { useGuardedSurface } from "@/lib/neoflo-os/users/permissions"
import { useHydratedUserStore } from "@/lib/neoflo-os/users/user-store"

export default function SettingsHubPage() {
  const allowed = useGuardedSurface("settings:users")
  const users = useHydratedUserStore((s) => s.users)
  const [addOpen, setAddOpen] = React.useState(false)

  if (!allowed) return null

  return (
    <div className="px-10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Page header — inline pattern matching /integrations + every
            other neoflo-workspace page. */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Settings
            </h1>
          </div>
        </div>

        {/* Role — top, collapsed by default. Reads like a context-
            selector header for the page. */}
        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-base font-semibold tracking-tight">
            Role
          </h2>
          <RoleEditorCard />
        </section>

        {/* Users — below. Add-user button sits in this section's header
            so it's contextually attached to the table it affects. */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-foreground text-base font-semibold tracking-tight">
                Users
              </h2>
              <span className="text-muted-foreground text-xs">
                {users.length} active
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={14} weight="bold" />
              Add user
            </Button>
          </div>
          <UsersTable addOpen={addOpen} onAddOpenChange={setAddOpen} />
        </section>
      </div>
    </div>
  )
}
