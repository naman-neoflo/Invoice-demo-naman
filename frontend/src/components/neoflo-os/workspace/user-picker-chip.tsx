// components/workspace/user-picker-chip.tsx
//
// Top-right active-user chip. Replaces the persona chip (which only
// surfaced 7 hardcoded lenses) with a real user picker grouped by role.
// Selecting a user updates useUserStore.activeUserId; sidebar + tab
// strips + briefing all re-render against the new role's visibility.

"use client"

import * as React from "react"
import { CaretDown } from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import { Button } from "@/components/neoflo-os/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"
import { useHydratedRoleStore } from "@/lib/neoflo-os/users/role-store"
import {
  useHydratedUserStore,
  useUserStore,
} from "@/lib/neoflo-os/users/user-store"
import type { AvatarTone, User } from "@/lib/neoflo-os/users/types"
import { cn } from "@/lib/neoflo-os/utils"

const TONE_CLASS: Record<AvatarTone, string> = {
  amber: "bg-amber-200 text-amber-950",
  violet: "bg-violet-200 text-violet-950",
  emerald: "bg-emerald-200 text-emerald-950",
  sky: "bg-sky-200 text-sky-950",
  rose: "bg-rose-200 text-rose-950",
  slate: "bg-slate-200 text-slate-950",
  indigo: "bg-indigo-200 text-indigo-950",
}

export function UserPickerChip() {
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const users = useHydratedUserStore((s) => s.users)
  const roles = useHydratedRoleStore((s) => s.roles)
  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0]
  const activeRole = roles.find((r) => r.id === activeUser?.roleId)

  // Group users by role for the dropdown.
  const usersByRole = React.useMemo(() => {
    const map = new Map<string, User[]>()
    for (const role of roles) {
      const us = users.filter((u) => u.roleId === role.id)
      if (us.length > 0) map.set(role.id, us)
    }
    return map
  }, [users, roles])

  if (!activeUser) return null

  function pick(id: string) {
    useUserStore.getState().setActiveUser(id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback
              className={cn("text-xs font-semibold", TONE_CLASS[activeUser.avatarTone])}
            >
              {activeUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start gap-0 leading-tight sm:flex">
            <span className="text-foreground text-xs font-medium">
              {activeUser.name}
            </span>
            <span className="text-muted-foreground text-[10px]">
              {activeRole?.name ?? activeUser.title}
            </span>
          </div>
          <CaretDown size={12} weight="bold" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {roles.map((role) => {
          const roleUsers = usersByRole.get(role.id)
          if (!roleUsers || roleUsers.length === 0) return null
          return (
            <DropdownMenuGroup key={role.id}>
              <DropdownMenuLabel className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                {role.name}
              </DropdownMenuLabel>
              {roleUsers.map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onSelect={() => pick(u.id)}
                  className="gap-2.5"
                >
                  <Avatar className="size-6">
                    <AvatarFallback
                      className={cn(
                        "text-[10px] font-semibold",
                        TONE_CLASS[u.avatarTone],
                      )}
                    >
                      {u.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start gap-0 leading-tight">
                    <span className="text-foreground text-xs font-medium">
                      {u.name}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {u.title}
                    </span>
                  </div>
                  {u.id === activeUserId ? (
                    <span className="text-primary text-[10px] font-medium">
                      Active
                    </span>
                  ) : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
