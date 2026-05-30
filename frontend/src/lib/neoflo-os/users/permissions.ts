// lib/users/permissions.ts
//
// Helpers for checking what the active user's role can see. Used by the
// sidebar (workflow-level visibility), per-workflow tab strips (per-tab
// visibility), and page guards (direct-URL access).

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useHydratedRoleStore, useRoleStore } from "./role-store"
import { useHydratedUserStore, useUserStore } from "./user-store"
import type { SurfaceId } from "./types"

// Imperative read — for non-React contexts. Use the hook in components.
export function canSee(surfaceId: SurfaceId): boolean {
  const user = useUserStore.getState().getActiveUser()
  const role = useRoleStore.getState().getRole(user.roleId)
  if (!role) return false
  return role.permissions.visibleSurfaces.includes(surfaceId)
}

// Subscribing hook — components re-render when the active user or any role
// config changes.
export function useCanSee(surfaceId: SurfaceId): boolean {
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const users = useHydratedUserStore((s) => s.users)
  const roles = useHydratedRoleStore((s) => s.roles)
  const user = users.find((u) => u.id === activeUserId)
  if (!user) return false
  const role = roles.find((r) => r.id === user.roleId)
  if (!role) return false
  return role.permissions.visibleSurfaces.includes(surfaceId)
}

// Useful when a parent needs to know if a whole workflow is visible
// (i.e., at least one of its surfaces is reachable).
export function useCanSeeAny(surfaceIds: SurfaceId[]): boolean {
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const users = useHydratedUserStore((s) => s.users)
  const roles = useHydratedRoleStore((s) => s.roles)
  const user = users.find((u) => u.id === activeUserId)
  if (!user) return false
  const role = roles.find((r) => r.id === user.roleId)
  if (!role) return false
  return surfaceIds.some((sid) => role.permissions.visibleSurfaces.includes(sid))
}

// Useful for the Settings sidebar item gating.
export function useCanManageUsers(): boolean {
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const users = useHydratedUserStore((s) => s.users)
  const roles = useHydratedRoleStore((s) => s.roles)
  const user = users.find((u) => u.id === activeUserId)
  if (!user) return false
  const role = roles.find((r) => r.id === user.roleId)
  return !!role?.permissions.canManageUsers
}

// Page-level guard. Renders the protected page when the active user CAN
// see the surface; otherwise redirects to `fallbackHref`. Wire on each
// workflow's primary page so direct URLs to non-visible surfaces redirect.
export function useGuardedSurface(
  surfaceId: SurfaceId,
  fallbackHref: string = "/neoflo-workspace",
): boolean {
  const allowed = useCanSee(surfaceId)
  const router = useRouter()
  React.useEffect(() => {
    if (!allowed) router.replace(fallbackHref)
  }, [allowed, router, fallbackHref])
  return allowed
}
