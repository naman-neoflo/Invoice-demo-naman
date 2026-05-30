// lib/neoflo-workspace/persona-store.ts
//
// Tiny zustand store for the active persona on /neoflo-workspace/*.
// Persisted in sessionStorage so the persona survives navigations within
// the demo session but resets each new tab — mirrors workspace-store's
// storage strategy.

"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { useHydratedUserStore } from "@/lib/neoflo-os/users/user-store"
import type { RoleId } from "@/lib/neoflo-os/users/types"

import { DEFAULT_PERSONA, type PersonaId } from "./personas"

interface PersonaState {
  activePersona: PersonaId
  setPersona: (id: PersonaId) => void
}

//
// ROLE → PERSONA MAPPER
//
// The 7 original personas have a 1:1 role. The 2 new clerk roles map to
// their respective managers so the briefing + insights + knowledge
// filtering doesn't get confused by an unknown persona. Admin maps to
// "all" (the founder/all-visible lens).
const ROLE_TO_PERSONA: Record<RoleId, PersonaId> = {
  admin: "all",
  cfo: "cfo",
  controller: "controller",
  "ar-manager": "ar-manager",
  "ap-manager": "ap-manager",
  "ar-clerk": "ar-manager",
  "ap-clerk": "ap-manager",
  cpo: "cpo",
  treasurer: "treasurer",
}

export function roleToPersona(roleId: RoleId): PersonaId {
  return ROLE_TO_PERSONA[roleId] ?? "all"
}

/**
 * Active persona, derived from the active user's role. This is the V2 read
 * path that all surfaces should use going forward. The persona store's own
 * activePersona field is kept as a fallback for legacy code; do not write
 * to it from new code.
 */
export function useActivePersona(): PersonaId {
  const activeUserId = useHydratedUserStore((s) => s.activeUserId)
  const users = useHydratedUserStore((s) => s.users)
  const user = users.find((u) => u.id === activeUserId)
  if (!user) return "all"
  return roleToPersona(user.roleId)
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      activePersona: DEFAULT_PERSONA,
      setPersona: (id) => set({ activePersona: id }),
    }),
    {
      name: "neoflo-persona-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : window.sessionStorage,
      ),
    },
  ),
)

/**
 * SSR-safe selector — returns the default persona on the server and the
 * persisted persona after hydration. Without this, the UI flickers on
 * first paint because sessionStorage isn't available during SSR.
 */
export function useHydratedPersona<T>(selector: (s: PersonaState) => T): T {
  const value = usePersonaStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted)
    return selector({
      activePersona: DEFAULT_PERSONA,
      setPersona: () => {},
    })
  return value
}
