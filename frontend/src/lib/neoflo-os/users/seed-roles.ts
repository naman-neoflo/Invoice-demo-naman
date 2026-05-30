// lib/users/seed-roles.ts
//
// 9 seeded roles per the design doc. Editable at runtime (toggle
// visibleSurfaces), restored on Reset Demo. Add/delete roles is NOT
// supported in V1 to prevent lock-out scenarios.

import type { Role } from "./types"

// Helper to keep the seed concise + reduce risk of typos in the visible-
// surfaces list. Spreads a small set of always-on surfaces.
const ALWAYS = ["workspace-home" as const]

export const SEED_ROLES: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access; can manage users + roles.",
    permissions: {
      canManageUsers: true,
      // Admin sees everything. List every SurfaceId to be explicit.
      visibleSurfaces: [
        ...ALWAYS,
        "helpdesk:dashboard", "helpdesk:inbox", "helpdesk:audit", "helpdesk:integrations",
        "invoice-processing:dashboard", "invoice-processing:inbox", "invoice-processing:exceptions",
        "invoice-processing:insights", "invoice-processing:audit", "invoice-processing:integrations",
        "cash-app:dashboard", "cash-app:inbox", "cash-app:unapplied", "cash-app:audit", "cash-app:integrations",
        "collections:dashboard", "collections:worklist", "collections:audit", "collections:integrations",
        "spend-analytics:dashboard", "spend-analytics:cashflow", "spend-analytics:explorer",
        "spend-analytics:maverick", "spend-analytics:audit", "spend-analytics:integrations",
        "insights",
        "knowledge",
        "cognitive-ledger",
        "integrations",
        "settings:users",
        "settings:roles",
      ],
    },
  },
  {
    id: "cfo",
    name: "CFO",
    description: "Strategic — working capital + close + insights.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "helpdesk:dashboard",
        "invoice-processing:dashboard", "invoice-processing:insights",
        "cash-app:dashboard",
        "collections:dashboard",
        "spend-analytics:dashboard", "spend-analytics:cashflow", "spend-analytics:explorer",
        "spend-analytics:maverick", "spend-analytics:audit",
        "insights", "knowledge", "cognitive-ledger",
        "integrations",
      ],
    },
  },
  {
    id: "controller",
    name: "Controller",
    description: "Owns close + audit. Sees almost everything.",
    permissions: {
      canManageUsers: false,
      // Everything except settings:*
      visibleSurfaces: [
        ...ALWAYS,
        "helpdesk:dashboard", "helpdesk:inbox", "helpdesk:audit", "helpdesk:integrations",
        "invoice-processing:dashboard", "invoice-processing:inbox", "invoice-processing:exceptions",
        "invoice-processing:insights", "invoice-processing:audit", "invoice-processing:integrations",
        "cash-app:dashboard", "cash-app:inbox", "cash-app:unapplied", "cash-app:audit", "cash-app:integrations",
        "collections:dashboard", "collections:worklist", "collections:audit", "collections:integrations",
        "spend-analytics:dashboard", "spend-analytics:cashflow", "spend-analytics:explorer",
        "spend-analytics:maverick", "spend-analytics:audit", "spend-analytics:integrations",
        "insights", "knowledge", "cognitive-ledger",
        "integrations",
      ],
    },
  },
  {
    id: "ar-manager",
    name: "AR Manager",
    description: "Owns AR side — cash + collections.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "cash-app:dashboard", "cash-app:inbox", "cash-app:unapplied", "cash-app:audit", "cash-app:integrations",
        "collections:dashboard", "collections:worklist", "collections:audit", "collections:integrations",
        "insights",
        "spend-analytics:dashboard",
        "integrations",
      ],
    },
  },
  {
    id: "ap-manager",
    name: "AP Manager",
    description: "Owns AP side — helpdesk + invoice processing.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "helpdesk:dashboard", "helpdesk:inbox", "helpdesk:audit", "helpdesk:integrations",
        "invoice-processing:dashboard", "invoice-processing:inbox", "invoice-processing:exceptions",
        "invoice-processing:insights", "invoice-processing:audit", "invoice-processing:integrations",
        "insights",
        "spend-analytics:dashboard",
        "integrations",
      ],
    },
  },
  {
    id: "ar-clerk",
    name: "AR Clerk",
    description: "Cash + collections — no dashboards.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "cash-app:inbox", "cash-app:unapplied", "cash-app:audit",
        "collections:worklist", "collections:audit",
      ],
    },
  },
  {
    id: "ap-clerk",
    name: "AP Clerk",
    description: "Helpdesk + invoice processing — no dashboards.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "helpdesk:inbox", "helpdesk:audit",
        "invoice-processing:inbox", "invoice-processing:exceptions", "invoice-processing:audit",
      ],
    },
  },
  {
    id: "cpo",
    name: "CPO",
    description: "Spend + maverick + knowledge.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "spend-analytics:dashboard", "spend-analytics:maverick", "spend-analytics:explorer",
        "knowledge", "insights",
      ],
    },
  },
  {
    id: "treasurer",
    name: "Treasurer",
    description: "Cashflow + liquidity.",
    permissions: {
      canManageUsers: false,
      visibleSurfaces: [
        ...ALWAYS,
        "spend-analytics:dashboard", "spend-analytics:cashflow",
      ],
    },
  },
]

export function getRole(id: string): Role | undefined {
  return SEED_ROLES.find((r) => r.id === id)
}
