// lib/users/types.ts
//
// User + role + surface-id types. SurfaceId is the single source of truth
// for nav gating — both the sidebar and per-workflow tab strips check
// against the active user's role's visibleSurfaces list.

export type RoleId =
  | "admin"
  | "cfo"
  | "controller"
  | "ar-manager"
  | "ap-manager"
  | "ar-clerk"
  | "ap-clerk"
  | "cpo"
  | "treasurer"

export type UserId = string  // "user-vibs" | "user-aaron-liu" | ...

export type SurfaceId =
  // System
  | "workspace-home"
  // Helpdesk
  | "helpdesk:dashboard"
  | "helpdesk:inbox"
  | "helpdesk:audit"
  | "helpdesk:integrations"
  // Invoice processing
  | "invoice-processing:dashboard"
  | "invoice-processing:inbox"
  | "invoice-processing:exceptions"
  | "invoice-processing:insights"
  | "invoice-processing:audit"
  | "invoice-processing:integrations"
  // Cash app
  | "cash-app:dashboard"
  | "cash-app:inbox"
  | "cash-app:unapplied"
  | "cash-app:audit"
  | "cash-app:integrations"
  // Collections
  | "collections:dashboard"
  | "collections:worklist"
  | "collections:audit"
  | "collections:integrations"
  // Spend analytics
  | "spend-analytics:dashboard"
  | "spend-analytics:cashflow"
  | "spend-analytics:explorer"
  | "spend-analytics:maverick"
  | "spend-analytics:audit"
  | "spend-analytics:integrations"
  // Strategic
  | "insights"
  | "knowledge"
  | "cognitive-ledger"
  // System
  | "integrations"
  | "settings:users"
  | "settings:roles"

export type AvatarTone =
  | "amber"
  | "violet"
  | "emerald"
  | "sky"
  | "rose"
  | "slate"
  | "indigo"

export type Role = {
  id: RoleId
  name: string
  description: string
  permissions: {
    canManageUsers: boolean
    visibleSurfaces: SurfaceId[]
  }
}

export type User = {
  id: UserId
  name: string
  initials: string
  title: string
  roleId: RoleId
  avatarTone: AvatarTone
}
