// lib/users/user-store.ts
//
// Active user + users CRUD. SessionStorage-persisted; reset() restores
// SEED_USERS and resets activeUserId to DEFAULT_ACTIVE_USER_ID.

"use client"

import * as React from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { DEFAULT_ACTIVE_USER_ID, SEED_USERS } from "./seed-users"
import type { User, UserId } from "./types"

export interface UserState {
  activeUserId: UserId
  users: User[]
  setActiveUser: (id: UserId) => void
  addUser: (u: User) => void
  updateUser: (id: UserId, patch: Partial<Omit<User, "id">>) => void
  deleteUser: (id: UserId) => void
  reset: () => void
  getActiveUser: () => User
  getUserById: (id: UserId) => User | undefined
}

const initialState = {
  activeUserId: DEFAULT_ACTIVE_USER_ID,
  users: SEED_USERS,
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setActiveUser: (id) => set({ activeUserId: id }),
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      deleteUser: (id) =>
        set((s) => {
          // Guard: can't delete the active user
          if (s.activeUserId === id) return s
          // Guard: can't delete the only admin
          const remaining = s.users.filter((u) => u.id !== id)
          const adminsLeft = remaining.filter((u) => u.roleId === "admin").length
          if (adminsLeft === 0) return s
          return { users: remaining }
        }),
      reset: () => set({ ...initialState }),
      getActiveUser: () => {
        const s = get()
        return (
          s.users.find((u) => u.id === s.activeUserId) ??
          s.users[0] ??
          SEED_USERS[0]
        )
      },
      getUserById: (id) => get().users.find((u) => u.id === id),
    }),
    {
      name: "neoflo-users-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : window.sessionStorage,
      ),
    },
  ),
)

// SSR-safe hook — same pattern as useHydratedInvoiceProcessingStore.
export function useHydratedUserStore<T>(selector: (s: UserState) => T): T {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => setHydrated(true), [])
  const value = useUserStore(selector)
  if (!hydrated) {
    // Synthesise pre-mount state with the SAME shape so consumers don't NPE.
    const synthetic: UserState = {
      ...initialState,
      setActiveUser: () => {},
      addUser: () => {},
      updateUser: () => {},
      deleteUser: () => {},
      reset: () => {},
      getActiveUser: () => SEED_USERS[0],
      getUserById: () => undefined,
    }
    return selector(synthetic)
  }
  return value
}
