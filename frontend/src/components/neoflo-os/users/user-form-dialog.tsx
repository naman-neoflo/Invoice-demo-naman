// components/users/user-form-dialog.tsx
//
// Shared Add + Edit dialog for users. The mode prop distinguishes —
// Add starts blank; Edit pre-fills. Auto-derives initials + id from name.

"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Input } from "@/components/neoflo-os/ui/input"
import { Label } from "@/components/neoflo-os/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/neoflo-os/ui/select"
import { useHydratedRoleStore } from "@/lib/neoflo-os/users/role-store"
import { useUserStore } from "@/lib/neoflo-os/users/user-store"
import type { AvatarTone, RoleId, User, UserId } from "@/lib/neoflo-os/users/types"

const TONE_BY_ROLE: Record<RoleId, AvatarTone> = {
  admin: "indigo",
  cfo: "sky",
  controller: "emerald",
  "ar-manager": "rose",
  "ap-manager": "violet",
  "ar-clerk": "rose",
  "ap-clerk": "violet",
  cpo: "amber",
  treasurer: "slate",
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + (parts[parts.length - 1][0] ?? "")).toUpperCase()
}

function deriveId(name: string): UserId {
  return (
    "user-" +
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  )
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  existingUser,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  existingUser?: User | null
}) {
  const roles = useHydratedRoleStore((s) => s.roles)

  const [name, setName] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [roleId, setRoleId] = React.useState<RoleId>("ap-clerk")

  // Pre-fill when editing.
  React.useEffect(() => {
    if (mode === "edit" && existingUser) {
      setName(existingUser.name)
      setTitle(existingUser.title)
      setRoleId(existingUser.roleId)
    } else if (mode === "add") {
      setName("")
      setTitle("")
      setRoleId("ap-clerk")
    }
  }, [mode, existingUser, open])

  function save() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Name is required.")
      return
    }
    const id = mode === "edit" && existingUser ? existingUser.id : deriveId(trimmedName)

    if (mode === "add") {
      // Duplicate-id guard.
      if (useUserStore.getState().users.some((u) => u.id === id)) {
        toast.error(`A user with name ${trimmedName} already exists.`)
        return
      }
      useUserStore.getState().addUser({
        id,
        name: trimmedName,
        initials: deriveInitials(trimmedName),
        title: title.trim() || "—",
        roleId,
        avatarTone: TONE_BY_ROLE[roleId] ?? "slate",
      })
      toast.success(`Added ${trimmedName}.`)
    } else {
      useUserStore.getState().updateUser(id, {
        name: trimmedName,
        title: title.trim() || "—",
        roleId,
        avatarTone: TONE_BY_ROLE[roleId] ?? "slate",
        initials: deriveInitials(trimmedName),
      })
      toast.success(`Updated ${trimmedName}.`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add user" : "Edit user"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new person to the finance team. Their role determines what they can see."
              : "Update name, title, or role."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aaron Liu"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-title">Title</Label>
            <Input
              id="user-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AP Specialist"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-role">Role</Label>
            <Select value={roleId} onValueChange={(v) => setRoleId(v as RoleId)}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Pick a role" />
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{mode === "add" ? "Add user" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
