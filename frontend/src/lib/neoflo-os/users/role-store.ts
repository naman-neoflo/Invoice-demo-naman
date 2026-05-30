// lib/users/role-store.ts
//
// Roles — edit-only. No add/delete in V1 (prevents lock-out scenarios).
// SessionStorage-persisted; reset() restores SEED_ROLES.

"use client"

import * as React from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { SEED_ROLES } from "./seed-roles"
import type { Role, RoleId } from "./types"

export interface RoleState {
  roles: Role[]
  updateRole: (id: RoleId, patch: Partial<Omit<Role, "id">>) => void
  reset: () => void
  getRole: (id: RoleId) => Role | undefined
}

const initialState = { roles: SEED_ROLES }

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      ...initialState,
      updateRole: (id, patch) =>
        set((s) => ({
          roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      reset: () => set({ ...initialState }),
      getRole: (id) => get().roles.find((r) => r.id === id),
    }),
    {
      name: "neoflo-roles-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : window.sessionStorage,
      ),
    },
  ),
)

export function useHydratedRoleStore<T>(selector: (s: RoleState) => T): T {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => setHydrated(true), [])
  const value = useRoleStore(selector)
  if (!hydrated) {
    const synthetic: RoleState = {
      ...initialState,
      updateRole: () => {},
      reset: () => {},
      getRole: (id) => SEED_ROLES.find((r) => r.id === id),
    }
    return selector(synthetic)
  }
  return value
}
