// lib/workspace/use-base-path.ts
//
// Three parallel workspace route trees coexist:
//   - /workspace/*           → the classic ("frozen") demo
//   - /neoflo-workspace/*    → the new persona-aware demo (original handoff path)
//   - /finance-os/*          → the merged Finance OS section inside invoice-demo
//
// Shared chrome components (tab strips, action cards, post-action redirects)
// need to construct hrefs that stay within the current tree. This hook reads
// the current pathname and returns the active base path so links land in the
// same tree the user is browsing.

"use client"

import { usePathname } from "next/navigation"

export const WORKSPACE_BASE = "/workspace"
export const NEOFLO_WORKSPACE_BASE = "/neoflo-workspace"
export const FINANCE_OS_BASE = "/finance-os"

export type WorkspaceBase = typeof WORKSPACE_BASE | typeof NEOFLO_WORKSPACE_BASE | typeof FINANCE_OS_BASE

export function useBasePath(): WorkspaceBase {
  const pathname = usePathname() ?? ""
  if (pathname.startsWith(FINANCE_OS_BASE)) return FINANCE_OS_BASE
  if (pathname.startsWith(NEOFLO_WORKSPACE_BASE)) return NEOFLO_WORKSPACE_BASE
  return WORKSPACE_BASE
}

/**
 * Rewrite an href whose canonical form is "/workspace/..." into the active
 * tree's base path. No-op when active base is /workspace (preserves the
 * classic demo's behavior exactly).
 */
export function useRewriteHref(): (href: string) => string {
  const base = useBasePath()
  return (href: string) => {
    if (base === WORKSPACE_BASE) return href
    if (href === WORKSPACE_BASE) return base
    if (href.startsWith(WORKSPACE_BASE + "/")) {
      return base + href.slice(WORKSPACE_BASE.length)
    }
    return href
  }
}
