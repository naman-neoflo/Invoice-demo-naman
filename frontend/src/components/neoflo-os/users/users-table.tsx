// components/users/users-table.tsx
//
// Self-contained users table — list of all users with their role,
// status, edit/delete actions, and the Add/Edit/Delete dialogs. Lifted
// out of /settings/users/page.tsx so the consolidated /settings hub can
// render it inline alongside the role editor.

"use client"

import * as React from "react"
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import { Button } from "@/components/neoflo-os/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { DeleteUserDialog } from "@/components/neoflo-os/users/delete-user-dialog"
import { UserFormDialog } from "@/components/neoflo-os/users/user-form-dialog"
import { useHydratedRoleStore } from "@/lib/neoflo-os/users/role-store"
import { useHydratedUserStore } from "@/lib/neoflo-os/users/user-store"
import type { AvatarTone, User } from "@/lib/neoflo-os/users/types"
import { cn } from "@/lib/neoflo-os/utils"

const TONE_CLASS: Record<AvatarTone, string> = {
  amber: "bg-amber-100 text-amber-900",
  violet: "bg-violet-100 text-violet-900",
  emerald: "bg-emerald-100 text-emerald-900",
  sky: "bg-sky-100 text-sky-900",
  rose: "bg-rose-100 text-rose-900",
  slate: "bg-slate-100 text-slate-900",
  indigo: "bg-indigo-100 text-indigo-900",
}

export function UsersTable({
  addOpen,
  onAddOpenChange,
}: {
  // Add-dialog state is owned by the parent page so the "+ Add user"
  // button can live in the PageHeader, not inside this component.
  addOpen: boolean
  onAddOpenChange: (open: boolean) => void
}) {
  const users = useHydratedUserStore((s) => s.users)
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const roles = useHydratedRoleStore((s) => s.roles)

  const [editUser, setEditUser] = React.useState<User | null>(null)
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null)

  return (
    <>
      <div className="bg-card overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const role = roles.find((r) => r.id === u.roleId)
              const isActive = u.id === activeUserId
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            TONE_CLASS[u.avatarTone],
                          )}
                        >
                          {u.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">
                          {u.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {u.title}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role?.name ?? u.roleId}
                  </TableCell>
                  <TableCell>
                    {isActive ? (
                      <span className="text-primary text-xs font-medium">
                        Active session
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditUser(u)}
                        aria-label="Edit user"
                      >
                        <PencilSimple size={14} weight="regular" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteUser(u)}
                        aria-label="Delete user"
                        disabled={isActive}
                      >
                        <Trash size={14} weight="regular" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={addOpen}
        onOpenChange={onAddOpenChange}
        mode="add"
      />
      <UserFormDialog
        open={!!editUser}
        onOpenChange={(o) => !o && setEditUser(null)}
        mode="edit"
        existingUser={editUser}
      />
      <DeleteUserDialog
        open={!!deleteUser}
        onOpenChange={(o) => !o && setDeleteUser(null)}
        user={deleteUser}
      />
    </>
  )
}

// Tiny convenience — for parents that want a header button without
// owning the open-state themselves. (Currently unused but cheap.)
export function AddUserButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus size={14} weight="bold" />
      Add user
    </Button>
  )
}
