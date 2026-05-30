"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ChatRole = "user" | "neo"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  streaming?: boolean
  errored?: boolean
}

export type WorkspaceState = {
  chatMessages: ChatMessage[]
  recentPrompts: string[]
  completedActionItemIds: string[]
  completedFeedItemIds: string[]

  appendUserMessage: (content: string) => string
  appendNeoMessageDraft: () => string
  appendNeoChunk: (id: string, chunk: string) => void
  finalizeNeoMessage: (id: string, opts?: { error?: boolean }) => void
  markActionItemDone: (id: string) => void
  markFeedItemDone: (id: string) => void
  reset: () => void
}

const initialState = {
  chatMessages: [],
  recentPrompts: [],
  completedActionItemIds: [],
  completedFeedItemIds: [],
}

function uid(): string {
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ...initialState,
      appendUserMessage: (content) => {
        const id = uid()
        const message: ChatMessage = {
          id,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
        }
        const recent = [content, ...get().recentPrompts.filter((p) => p !== content)].slice(0, 10)
        set((s) => ({
          chatMessages: [...s.chatMessages, message],
          recentPrompts: recent,
        }))
        return id
      },
      appendNeoMessageDraft: () => {
        const id = uid()
        const message: ChatMessage = {
          id,
          role: "neo",
          content: "",
          createdAt: new Date().toISOString(),
          streaming: true,
        }
        set((s) => ({ chatMessages: [...s.chatMessages, message] }))
        return id
      },
      appendNeoChunk: (id, chunk) => {
        set((s) => ({
          chatMessages: s.chatMessages.map((m) =>
            m.id === id ? { ...m, content: m.content + chunk } : m
          ),
        }))
      },
      finalizeNeoMessage: (id, opts) => {
        set((s) => ({
          chatMessages: s.chatMessages.map((m) =>
            m.id === id ? { ...m, streaming: false, errored: opts?.error ?? false } : m
          ),
        }))
      },
      markActionItemDone: (id) => {
        set((s) => ({
          completedActionItemIds: Array.from(new Set([...s.completedActionItemIds, id])),
        }))
      },
      markFeedItemDone: (id) => {
        set((s) => ({
          completedFeedItemIds: Array.from(new Set([...s.completedFeedItemIds, id])),
        }))
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: "neoflo-workspace-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.sessionStorage
      ),
    }
  )
)

export function useHydratedWorkspaceStore<T>(selector: (s: WorkspaceState) => T): T {
  const value = useWorkspaceStore(selector)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted)
    return selector({
      ...initialState,
      appendUserMessage: () => "",
      appendNeoMessageDraft: () => "",
      appendNeoChunk: () => {},
      finalizeNeoMessage: () => {},
      markActionItemDone: () => {},
      markFeedItemDone: () => {},
      reset: () => {},
    })
  return value
}
