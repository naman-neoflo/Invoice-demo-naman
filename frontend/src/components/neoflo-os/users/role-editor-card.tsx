// components/users/role-editor-card.tsx
//
// Collapsible role editor used on the consolidated /settings hub.
// Header row carries the role dropdown + summary + chevron. Collapsed
// by default; clicking the header (anywhere outside the dropdown
// trigger) expands. Switching the dropdown to a different role does
// NOT auto-expand — intentional, so the user can preview before
// committing to edit.

"use client"

import * as React from "react"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/neoflo-os/ui/collapsible"
import { Label } from "@/components/neoflo-os/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/neoflo-os/ui/select"
import { Switch } from "@/components/neoflo-os/ui/switch"
import { Textarea } from "@/components/neoflo-os/ui/textarea"
import { RoleSurfaceTree } from "@/components/neoflo-os/users/role-surface-tree"
import {
  useHydratedRoleStore,
  useRoleStore,
} from "@/lib/neoflo-os/users/role-store"
import { useHydratedUserStore } from "@/lib/neoflo-os/users/user-store"
import type { RoleId, SurfaceId } from "@/lib/neoflo-os/users/types"
import { cn } from "@/lib/neoflo-os/utils"

export function RoleEditorCard() {
  const roles = useHydratedRoleStore((s) => s.roles)
  const users = useHydratedUserStore((s) => s.users)
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)

  // Default selected role = active user's role (Admin when signed in as Vibs)
  const activeUser = users.find((u) => u.id === activeUserId)
  const defaultRoleId: RoleId = activeUser?.roleId ?? roles[0]?.id ?? "admin"

  const [selectedRoleId, setSelectedRoleId] = React.useState<RoleId>(defaultRoleId)
  const [open, setOpen] = React.useState(false)

  // When the active user changes after mount, follow the role.
  // (Switching personas in the header chip retargets the editor.)
  React.useEffect(() => {
    if (activeUser?.roleId) {
      setSelectedRoleId(activeUser.roleId)
    }
  }, [activeUser?.roleId])

  const selectedRole = roles.find((r) => r.id === selectedRoleId)
  const userCount = users.filter((u) => u.roleId === selectedRoleId).length

  if (!selectedRole) return null

  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Header — dropdown + summary + chevron. The whole row is the
            collapsible trigger; the dropdown lives in the same row but
            stops propagation so clicking it doesn't toggle the card. */}
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="role-select"
              className="text-muted-foreground text-xs font-medium uppercase tracking-wider"
            >
              Role
            </Label>
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                value={selectedRoleId}
                onValueChange={(v) => setSelectedRoleId(v as RoleId)}
              >
                <SelectTrigger id="role-select" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground text-xs">
              {userCount} {userCount === 1 ? "user" : "users"} ·{" "}
              {selectedRole.permissions.visibleSurfaces.length} surfaces
            </span>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              aria-label={open ? "Collapse role editor" : "Expand role editor"}
            >
              {open ? "Hide" : "Configure"}
              {open ? (
                <CaretUp size={12} weight="bold" />
              ) : (
                <CaretDown size={12} weight="bold" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="border-t">
            {/* Re-mount the body when the role changes so local draft
                state resets to the new role's values. */}
            <RoleEditorBody key={selectedRole.id} role={selectedRole} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function RoleEditorBody({
  role,
}: {
  role: ReturnType<typeof useRoleStore.getState>["roles"][number]
}) {
  const [description, setDescription] = React.useState(role.description)
  const [canManageUsers, setCanManageUsers] = React.useState(
    role.permissions.canManageUsers,
  )
  const [visibleSurfaces, setVisibleSurfaces] = React.useState<SurfaceId[]>(
    role.permissions.visibleSurfaces,
  )

  const dirty =
    description !== role.description ||
    canManageUsers !== role.permissions.canManageUsers ||
    JSON.stringify([...visibleSurfaces].sort()) !==
      JSON.stringify([...role.permissions.visibleSurfaces].sort())

  function save() {
    useRoleStore.getState().updateRole(role.id, {
      description,
      permissions: {
        canManageUsers,
        visibleSurfaces,
      },
    })
    toast.success(`Saved ${role.name}.`)
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role-description">Description</Label>
          <Textarea
            id="role-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex items-center justify-between border-y py-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="role-can-manage" className="cursor-pointer">
              Can manage users
            </Label>
            <span className="text-muted-foreground text-xs">
              Grants access to the Settings hub for users with this role.
            </span>
          </div>
          <Switch
            id="role-can-manage"
            checked={canManageUsers}
            onCheckedChange={setCanManageUsers}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-sm font-semibold">
          Visible surfaces
        </h3>
        <p className="text-muted-foreground text-xs">
          Check the workflows + per-workflow tabs this role should see. Sidebar
          items hide when none of a workflow&apos;s surfaces are visible.
        </p>
      </div>

      <RoleSurfaceTree
        value={visibleSurfaces}
        onChange={setVisibleSurfaces}
      />

      <div className={cn("flex items-center justify-end gap-2 border-t pt-4")}>
        <Button onClick={save} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
